const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const PostRoutes = require('./routes/posts');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log('Conntected to database');
}).catch(()=>{
  console.log("Some error occured")
})
//CFQAduiXaN8hQqTr
const Post = require('./models/post')

app.use(bodyParser.json()); // This is a middleware
app.use(bodyParser.urlencoded({ extended: false}))

app.use((req,res,next)=>{
console.log("Middleware");
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Headers',
"Origin, X-Requested-with, Content-Type, Accept"
);
res.setHeader("Access-Control-Allow-Methods",
"GET, POST, PATCH, PUT, DELETE, OPTIONS"
)
next();
})

app.use('/api/posts', PostRoutes)

module.exports = app;