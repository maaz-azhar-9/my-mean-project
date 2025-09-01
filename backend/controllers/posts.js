const Post = require("../models/post");
const Like = require("../models/likes");

exports.creatPost = (req, res, next) => {
    const post = new Post({
        title: req?.body.title,
        content: req?.body.content,
        imagePath: req?.file.path,
        likeCount: 0,
        creator: req?.userData.userId
    })
    post.save().then((createdPost) => {
        res.status(201).json({
            message: "post added sucessfully",
            post: {
                ...createdPost,
                id: createdPost._id,
            }
        })
    }).catch(error => {
        res.status(500).json({
            message: "Creating a post failed"
        })
    });
}

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
    Post.findById(req.params.id).then((post) => {
        if (post) {
            res.status(200).json(post);
        }
        else {
            res.status(404).json({ messsage: "Post is not available" })
        }
    }).catch(error => {
        res.status(500).json({
            message: "Fetching post failed"
        })
    }).catch(error => {
        res.status(500).json({
            message: "Couldn't delete."
        })
    })
}