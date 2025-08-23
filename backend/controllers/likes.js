const Like = require('../models/likes');

const Post = require('../models/post')

exports.like = (req,res,next) => {
    const postId = req?.params?.postId;
    const userId = req?.params?.userId;
    const like = new Like({
        postId: postId,
        userId: userId
    });

    like.save().then(()=>{
        Post.updateOne({_id:postId},{$inc:{likeCount:1}}).then((response)=>{
            response.modifiedCount ? res.json({message:"Liked"}) : res.json({message:"Post not found."})
        })
    }).catch(() => {
        res.status(500).json({
            message:"Unkown error"
        })
    })
}

exports.removeLike = (req,res,next) =>{
    const postId = req?.params?.postId;
    const userId = req?.params?.userId;
    Post.updateOne({_id: postId, likeCount: { $gt: 0 }},{$inc:{likeCount:-1}}).then((response)=>{
        if(response.modifiedCount){
        Like.deleteOne({postId: postId, userId: userId}).then(()=>{
            res.status(200).json({
                message: "Unliked"
            });
        }).catch(() => {
            res.status(500).json({
                message: "Unknown error"
            });
        })
    }
    else{
        res.json({message:"No post found to unlike"});
    }
    })
}