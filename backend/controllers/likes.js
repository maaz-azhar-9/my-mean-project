const { mongoose } = require('mongoose');
const Like = require('../models/likes');

const Post = require('../models/post')

exports.like = (req, res, next) => {
    const { postId, userId } = req.params;
    const like = new Like({ postId, userId });
  
    mongoose.startSession()
      .then((session) => {
        session.startTransaction();
  
        return like.save({ session })
          .then(() => {
            return Post.updateOne(
              { _id: postId },
              { $inc: { likeCount: 1 } },
              { session }
            );
          })
          .then((response) => {
            if (!response.modifiedCount) {
              throw new Error("Post not found");
            }
            return session.commitTransaction().then(() => {
              res.json({ message: "Liked" });
            });
          })
          .catch((err) => {
            return session.abortTransaction().then(() => {
              res.status(500).json({ message: err.message || "Unknown error" });
            });
          })
          .finally(() => {
            session.endSession();
          });
      });
  };
  

  exports.removeLike = (req, res, next) => {
    const { postId, userId } = req.params;
  
    mongoose.startSession()
      .then((session) => {
        session.startTransaction();
  
        return Post.updateOne(
          { _id: postId, likeCount: { $gt: 0 } },
          { $inc: { likeCount: -1 } },
          { session }
        )
        .then((response) => {
          if (!response.modifiedCount) {
            throw new Error("No post found to unlike");
          }
          
          return Like.deleteOne({ postId, userId }, { session });
        })
        .then((deleteResponse) => {
          if (!deleteResponse.deletedCount) {
            throw new Error("Like record not found");
          }
  
          return session.commitTransaction().then(() => {
            res.status(200).json({ message: "Unliked" });
          });
        })
        .catch((err) => {
          return session.abortTransaction().then(() => {
            res.status(500).json({ message: err.message || "Unknown error" });
          });
        })
        .finally(() => {
          session.endSession();
        });
      });
  };
  