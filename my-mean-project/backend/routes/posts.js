const express = require("express");

const router = express.Router();

const Post = require("../models/post")

const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'
}

const storage =  multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid){
      error = null
    }
    cb(error,'backend/images');
  },
  filename: (req,file,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null,name + '-' + Date.now() + '.' + ext);
  },
})

router.post('', multer(storage).single('image'), (req,res,next)=>{
  const url = req.protocol + "://" +req.get("host")
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename
    })
    post.save().then((result)=>{
      res.status(201).json({
        message : "post added sucessfully",
        post: {
          ...createdPost,
          id: createdPost._id,
        }
      })
    });
    // const post = req.body // body added by bodyParser Middleware
    console.log(post);
  })
  
  router.get('',(req,res,next)=>{
    Post.find().then(((documents)=>{
      console.log(documents);
      res.status(200).json({
        message: "posts are successfully fetched",
        posts: documents
      })
    }));
  })
  
  router.put('/:id',(req,res,next)=>{
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content
    })
  
    Post.updateOne({_id:req.params.id},post).then(()=>{
      res.status(200).json({
        message:"Successfully Updated"
      })
    })
  })
  
  router.delete("/:id",(req,res,next)=>{
    Post.deleteOne({_id: req.params.id}).then(()=>{
      res.status(200).json({
        message: "Deleted Successfully"
      })
    })
  })
  
  router.get("/:id",(req,res,next)=>{
    Post.findById(req.params.id).then((post)=>{
      if(post){
        res.status(200).json(post);
      }
      else{
        res.status(404).json({messsage:"Post is not available"})
      }
    })
  })

  module.exports = router;