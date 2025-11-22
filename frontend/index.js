const socket = io("http://localhost:3000")
// const user = localStorage.getItem("telepathy_user")
// const username = localStorage.getItem("telepathy_user")
const user = localStorage.getItem("telepathy_user");

if (!user) {
    window.location.href = "login.html"; // forces login
}

// const socket = io();
socket.emit("register", user);
// socket.emit("register", user);
console.log(user)
let disConnectBtnEl=document.querySelector("#disconnect-btn")
disConnectBtnEl.addEventListener("click",()=>{
            localStorage.removeItem("telepathy_user");

    window.location.href="login.html";
})

let sendEl=document.getElementById("send-btn")
sendEl.addEventListener("click",()=>{
    let message=document.getElementById("msg-input").value.trim()
    let chatArea=document.getElementById("messages-area")
    let divEl=document.createElement("div")
    divEl.classList.add("msg-bubble", "msg-self")
    divEl.innerText=user+" : "+ message
    chatArea.append(divEl)
    document.getElementById("msg-input").value=""
})
// let 
socket.on("online-users",(users)=>{
    const divEl=document.getElementById("users-list")
    divEl.innerHTML=""
    for (let id in users) {
    const li = document.createElement("div");
    li.className="user-item"
    li.textContent = users[id];
    divEl.appendChild(li);
  }
})

