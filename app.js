require('dotenv').config();
const mongoose=require('mongoose');
const express=require('express');

const app=express();
const http=require('http').Server(app);

// app.set('view-engine','ejs');

// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(express.static('./public'));


const userRoute=require('./routes/userRoute');

app.use('/',userRoute);

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');


http.listen(3000,()=>{
    console.log("Listening to port 3000");
})