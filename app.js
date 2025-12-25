const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const fs=require("fs");
const path=require("path");

const app=express();
app.use(express.static(path.join(__dirname,"public")));

const server=http.createServer(app);

const io=new Server(server);


app.get("/",(req,res)=>{
     res.sendFile(path.join(__dirname,"index.html"));
})

io.on("connection",(socket)=>{
     socket.on("sent-msg",({msg,username, time})=>{
          socket.broadcast.emit("put-msg",{msg,username, time});
     })

     socket.on("update-status",({username,status})=>{
          socket.broadcast.emit("show-status",{username,status});
     })

     socket.on("join-group", ({groupname,username}) => {
          socket.join(groupname);
          socket.broadcast.to(groupname).emit(
               "sent-group-msg",
               { msg: "joined the "+groupname+" group",username:username}
          );
     });

     socket.on("group-msg", ({ msg, username, time, groupname }) => {
          socket.broadcast.to(groupname).emit(
               "sent-group-msg",
               { msg, username, time }
          );
     });
})

server.listen(3028,(err)=>{
     if(err){
          console.log(err);
     }
     else{
          console.log("Port is running in http://localhost:3028/");
     }
})