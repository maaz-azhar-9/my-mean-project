const path = require("path");
const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const PostRoutes = require('./routes/posts');
const UserRoutes = require('./routes/user');
const LikeRoutes = require('./routes/likes');

const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://maazazhar9:"+ process.env.MONOGO_ATLAS_PW +"@cluster0.rimhz.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
  console.log('Conntected to database');
}).catch(()=>{
  console.log("Some error occured")
})
//CFQAduiXaN8hQqTr
const Post = require('./models/post')

app.use(bodyParser.json()); // This is a middleware
app.use(bodyParser.urlencoded({ extended: false}))
app.use("/images", express.static(path.join("backend/images")))

app.use((req,res,next)=>{
console.log("Middleware");
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Headers',
"Origin, X-Requested-with, Content-Type, Accept,Authorization"
);
res.setHeader("Access-Control-Allow-Methods",
"GET, POST, PATCH, PUT, DELETE, OPTIONS"
)
next();
})

app.use('/api/posts', PostRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/like', LikeRoutes)

module.exports = app;