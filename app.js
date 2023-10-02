require('dotenv').config();
const mongoose=require('mongoose');
const express=require('express');
const User=require('./models/userModel');
const Chat=require('./models/chatModel');

const app=express();
const http=require('http').Server(app);

const io=require('socket.io')(http);

// app.set('view-engine','ejs');

// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(express.static('./public'));


const userRoute=require('./routes/userRoute');

app.use('/',userRoute);

let unsp=io.of('/user-namespace');

unsp.on('connection',async (socket)=>{
    // console.log('user connected');

    let uid=socket.handshake.auth.token;

    await User.findByIdAndUpdate({_id:uid},{$set:{isOnline:'1'}});

    // broadcast
    socket.broadcast.emit('getOnlineUser',{user_id:uid});
    
    socket.on('disconnect',async ()=>{
        // console.log('user disconnected');
        let uid=socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id:uid},{$set:{isOnline:'0'}});

        // offline broadcast
        socket.broadcast.emit('getOflineUser',{user_id:uid});

    })

    // chat send broadcast

    socket.on('newChat',(data)=>{
        // console.log(data);
        socket.broadcast.emit('loadNewChat',data);
    })

    // load old chats

    socket.on('existsChat',async (data)=>{
        let chats=await Chat.find({$or:[
            {sender_id:data.sender_id,receiver_id:data.receiver_id},
            {sender_id:data.receiver_id,receiver_id:data.sender_id}
        ]});
        socket.emit('loadChats',{chats:chats});
    })


})

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');




http.listen(3000,()=>{
    console.log("Listening to port 3000");
})