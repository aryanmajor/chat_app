const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const {messageGen} = require('./utils/messageGen');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const port=process.env.PORT || 3000;

var app=express();
var server = http.createServer(app);
var io = socketIO(server);
var users= new Users()

app.use(express.static(path.join(__dirname,'../public')));

io.on('connection',(socket)=>{
  console.log('New User Connected');

  socket.on('join',(params,callback)=>{
    // validation
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Incorrect Name and Room');
    }

    socket.join(params.room);
    users.removeUser(socket.id);// remove user from previous room
    users.addUser(socket.id, params.name, params.room);// add user to new room

    io.to(params.room).emit('userList', users.getUserList(params.room));
    socket.emit('newMsg', messageGen('Admin','Welcome to Chat App'));
    socket.broadcast.to(params.room).emit('newMsg', messageGen('Admin', `${params.name} has joined the conversation.`));
    callback();
  });

  // on listens to events
  socket.on('disconnect',()=>{
    console.log('Client disconnect');
    var user=users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('userList', users.getUserList(user.room));
      io.to(user.room).emit('newMsg', messageGen('Admin', `${user.name} has left.`));
    }
  });

  socket.on('createMsg',(message, callback)=>{
    // broadcast
    var user=users.getUser(socket.id);

    if(user && isRealString(message.text)){
        io.to(user.room).emit('newMsg',messageGen(user.name,message.text));
    }

    callback();
  });

});

server.listen(port);
