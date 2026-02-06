const Post = require("../models/post");
const Like = require("../models/likes");
const axios = require('axios')
const mongoose = require('mongoose')
const aiPostSuggestionApiConfig = require("../configs/ai-post-suggestion-config");

const aiPostSuggestionApiClient = axios.create({
    baseURL: aiPostSuggestionApiConfig.app2.baseUrl,
    timeout: aiPostSuggestionApiConfig.app2.timeout,
});

exports.creatPost = (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: req.file?.path,
        likeCount: 0,
        creator: req.userData.userId
    });

    let createdPostRef = null;

    mongoose.startSession()
        .then(session => {
            session.startTransaction();

            return post.save({ session })
                .then(createdPost => {
                    createdPostRef = createdPost;
                    return session.commitTransaction()
                        .then(() => {
                            session.endSession();
                            return createdPost;
                        });
                })
                .catch(err => {
                    return session.abortTransaction()
                        .then(() => {
                            session.endSession();
                            throw err;
                        });
                });
        })
        .then(createdPost => {
            return aiPostSuggestionApiClient.post('/api/add', {
                postTitle: createdPost.title,
                postContent: createdPost.content,
                postId: createdPost._id,
                userId: createdPost.creator
            })
                .then(() => {
                    res.status(201).json({
                        message: "Post created successfully",
                        post: createdPost
                    });
                })
                .catch(() => {
                    return Post.findByIdAndDelete(createdPost._id)
                        .then(() => {
                            res.status(500).json({
                                message: "Vector DB failed, MongoDB insert rolled back"
                            });
                        });
                });
        })
        .catch(err => {
            res.status(500).json({
                message: "Post creation failed",
                error: err.message
            });
        });
};


exports.getPosts = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const search = req.query.search;
    let postQuery;
    let fetchedPosts;
    let postCount;

    let query = search.length ? {
        deleted: { $ne: true },
        $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ]
    } : {
        deleted: { $ne: true }
    };

    postQuery = Post.find(query);

    if (pageSize && currentPage) {
        postQuery
            .sort({ _id: -1 })
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize)
    }

    postQuery.then(documents => {
        fetchedPosts = documents;
        return Post.countDocuments(query);
    }).then(count => {
        postCount = count;
        return req?.query.userId !== "null" ? Promise.all(fetchedPosts.map((post) => {
            return Like.find({ postId: post._id, userId: req?.query.userId }).then((response) => {
                post = { ...post._doc, isLiked: (response.length > 0) ? true : false };
                return post;
            })
        })) : fetchedPosts;
    }).then((finalPosts) => {
        res.status(200).json({
            message: "posts are successfully fetched",
            posts: finalPosts,
            maxPosts: postCount
        })
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Fetching post failed"
        })
    });
}

exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }

    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, {
        $set: {
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath: imagePath
        }
    }).then((result) => {
        if (result.matchedCount > 0) {
            res.status(200).json({
                message: "Successfully Updated"
            })
        }
        else {
            res.status(401).json({
                message: "Not Authorized"
            })
        }
    }).catch(error => {
        res.status(500).json({
            message: "Couldn't update post"
        })
    })
}

exports.deletePost = async (req, res, next) => {

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            {
                _id: req.params.id,
                creator: req.userData.userId
            },
            { $set: { deleted: true } },
            { new: true }
        );
        if (!updatedPost) {
            res.status(404).json({
                message: "Post you are trying to delete does not exist"
            })
        }
        deleteVectorWithRetries(req.params.id)
        res.status(200).json({
            message: "Post deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            message: `Error: ${error}`
        })
    }
}

exports.getPost = (req, res, next) => {
    if (req.userData) {
        Like.find({ postId: req.params.id, userId: req.userData.userId }).then((like) => {
            let isLiked = like.length ? true : false;
            Post.findById(req.params.id).then((post) => {
                if (post) {
                    res.status(200).json({ ...post._doc, isLiked: isLiked });
                }
                else {
                    res.status(404).json({ messsage: "Post is not available" })
                }
            }).catch(error => {
                res.status(500).json({
                    message: "Fetching post failed"
                })
            })
        });
    }
    else {
        Post.findById(req.params.id).then((post) => {
            if (post) {
                res.status(200).json({ ...post._doc });
            }
            else {
                res.status(404).json({ messsage: "Post is not available" })
            }
        })
    }
}

exports.semanticSearch = (req, res, next) => {
    try {
        const searchText = req.body.searchText
        if (!searchText || typeof searchText !== "string" || searchText.trim().length === 0) {
            return res.status(400).json({
                message: "search text is missing or invalid",
            })
        }
        const payload = { semanticSearchText: searchText };

        aiPostSuggestionApiClient.post('/api/getPosts', payload).then((result) => {
            return res.status(200).json({
                result: result.data.response
            })
        })
    }
    catch (error) {
        res.status(500).json({
            message: `Internal server error: ${error}`,
        })
    }

}


/**
 * Deletes a post vector via the AI microservice with a retry mechanism.
 * @param {string} postId - The ID of the post to be removed from Qdrant.
 * @param {number} maxRetries - How many times to try before giving up.
 */
const deleteVectorWithRetries = async (postId, maxRetries = 3) => {
    console.log("I tried")
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await aiPostSuggestionApiClient.delete(`/api/deletePost/${postId}`);
            return response.data;

        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
                throw error;
            }

            // Exponential backoff: Wait 1s, then 2s, then 4s...
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};