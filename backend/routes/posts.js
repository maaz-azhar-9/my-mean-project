const express = require("express");

const router = express.Router();

const Post = require("../models/post")

const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

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

router.post('',checkAuth , multer({storage : storage}).single('image'), (req,res,next)=>{
  console.log("file")
  console.log(req.userData)
  const url = req.protocol + "://" +req.get("host")
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    })
    post.save().then((createdPost)=>{
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
  
router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.countDocuments();
  }).then(count => {
    res.status(200).json({
      message: "posts are successfully fetched",
      posts: fetchedPosts,
      maxPosts: count
    })
  });
})
  
  router.put('/:id', checkAuth, multer({storage : storage}).single('image'),(req,res,next)=>{
    let imagePath = req.body.imagePath;
    if(req.file){
      const url = req.protocol + "://" +req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    })

    console.log(post)
    Post.updateOne({_id:req.params.id},post).then(()=>{
      res.status(200).json({
        message:"Successfully Updated"
      })
    })
  })
  
  router.delete("/:id", checkAuth, (req,res,next)=>{
    Post.deleteOne({_id: req.params.id}).then(()=>{
      res.status(200).json({
        message: "Deleted Successfully"
      })
    })
  })
  
  router.get("/:id", checkAuth, (req,res,next)=>{
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