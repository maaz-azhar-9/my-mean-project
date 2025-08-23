const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {type:mongoose.Schema.Types.ObjectId, ref:"Post", required: true},
    userId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required: true}
})

likeSchema.index({ postId: 1, userId: 1 }, { unique: true }); //ensure unique combination of postId and userId

module.exports = mongoose.model('Like', likeSchema);