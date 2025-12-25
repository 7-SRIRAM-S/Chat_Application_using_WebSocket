const clientSocket = io();

const userName = document.getElementById("user-name");
const chatBtn = document.getElementById("sent-chat-btn");
const groupName = document.getElementById("group-name");
const joinBtn = document.getElementById("join-group-btn");
const quitBtn = document.getElementById("exit-btn");
const messages = document.getElementById("messages");
const message = document.getElementById("message");
const sentBtn = document.getElementById("sent-btn");
const clearBtn = document.getElementById("clr-btn");
const errorPanel = document.getElementById("error-msg");
let statusShower = document.createElement("p");

let chatMode="";
let username;


joinBtn.addEventListener("click", () => {
     const groupname = groupName.value.trim();
     username=userName.value.trim();
     if (!groupname) {
          errorPanel.innerText = "Enter group name to join";
          return;
     }
     if (!username.trim()) {
          errorPanel.innerText = "Enter username";
          return;
     }
     chatMode = "Group";
     clientSocket.emit("join-group",{groupname,username});
     errorPanel.innerText = "";
});


document.addEventListener("keydown",(event)=>{
     if(event.key==='Enter'){
          event.preventDefault();
          sentBtn.click();
     }
})

clearBtn.addEventListener("click",()=>{
     clearAll();
})

quitBtn.addEventListener("click",()=>{
     userName.value="";
     groupName.value="";
     message.innerText="";
     errorPanel.innerText="";
     clearAll();
})

chatBtn.addEventListener("click",()=>{
     if(chatMode==="Group"){
          clearAll();
     }
     const username=userName.value;
     if(username==" "||username.trim().length==0){
          errorPanel.innerText="Enter username to continue chat";
          return;
     }
     else{
          chatMode="Personal";
          errorPanel.innerText="";
     }
})

message.addEventListener("input",()=>{
     sentBtn.style.display="block";
     const username = userName.value;
     if(username==" "||username.trim().length==0){
          return;
     }
     clientSocket.emit("update-status",{username,status:"Typing..."});
})

clientSocket.on("show-status",({username,status})=>{   
     if(status){
          statusShower.innerText=`${username} is ${status}`;
     }
     else{
          statusShower.innerText="";
     }
     messages.appendChild(statusShower);
})

sentBtn.addEventListener("click", () => {
     const msg = message.value;
     username = userName.value;
     const time = getTime();
     if(chatMode==="Personal"){
          personalChat(msg,username,time);
     }
     else if(chatMode==="Group"){
          groupChat(msg,username,time);
     }
     message.value = "";
     sentBtn.style.display="none";
     
})

function personalChat(msg,username,time){
     if(username==" "||username.length==0){
         errorPanel.innerText="Enter username to continue chat";
         return;
     } 
     else if(msg==" "||msg.trim().length==0){
          errorPanel.innerText="Enter any message continue chat";
          return;
     }
     else{
          clientSocket.emit("sent-msg", { msg, username, time });
          clientSocket.emit("update-status", {username,status:""});
          const p = document.createElement("p");
          p.innerText = `${username} : ${msg}`;
          p.classList.add("sender");
          const span=document.createElement("span");
          span.innerText=time;
          p.appendChild(span);
          messages.appendChild(p);
          errorPanel.innerText="";
     }
}

function groupChat(msg, username, time) {
     const groupname = groupName.value.trim();

     if (!msg.trim()) {
          errorPanel.innerText = "Enter a message";
          return;
     }

     clientSocket.emit("group-msg", {
          msg,
          username,
          time,
          groupname
     });
     clientSocket.emit("update-status", {username,status:""});


     const p = document.createElement("p");
     p.classList.add("sender");
     p.innerText = `${username} : ${msg}`;
     const span = document.createElement("span");
     span.innerText = time;
     p.appendChild(span);
     messages.appendChild(p);
     errorPanel.innerText="";

}


function clearAll(){
     messages.innerHTML="";
}
clientSocket.on("put-msg", ({ msg, username, time }) => {
     const p = document.createElement("p");
     p.innerText = `${username} : ${msg}`;
     const span=document.createElement("span");
     span.innerText=time;
     p.appendChild(span);
     messages.appendChild(p);
})

clientSocket.on("sent-group-msg", ({ msg, username, time }) => {
     const p = document.createElement("p");
     // console.log(msg);
     if(!time){
          p.innerText = `Hello all ${username} ${msg}`;

     }
     else{
          p.innerText = `${username} : ${msg}`;
          const span = document.createElement("span");
          span.innerText = time;
          p.appendChild(span);
     }
     messages.appendChild(p);
});



function getTime() {

     const now = new Date();

     let hours = now.getHours();
     const minutes = now.getMinutes();

     const ampm = hours >= 12 ? 'PM' : 'AM';

     hours = hours % 12;
     if (hours == 0) {
          hours = 12;
     }

     const minutesStr = minutes < 10 ? '0' + minutes : minutes;

     const time = `${hours}:${minutesStr} ${ampm}`;

     return time;

}

