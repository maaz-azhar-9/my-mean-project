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
    let query = {
        $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ]
    }

    if (search?.length) {
        postQuery = Post.find(query);
    }
    else {
        postQuery = Post.find();
    }

    if (pageSize && currentPage) {
        postQuery
            .sort({_id:-1})
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize)
    }

    postQuery.then(documents => {
        fetchedPosts = documents;
        return search?.length ? Post.countDocuments(query) : Post.countDocuments();
    }).then(count => {
        postCount = count;
        return req?.query.userId !=="null" ? Promise.all(fetchedPosts.map((post) => {
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

exports.deletePost = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then((result) => {
        if (result.deletedCount > 0) {
            res.status(200).json({
                message: "Deleted Successfully"
            })
        }
        else {
            res.status(401).json({
                message: "Not Authorized"
            })
        }
    })
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