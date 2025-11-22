const socket = io("http://localhost:3000")
// const user = localStorage.getItem("telepathy_user")
// const username = localStorage.getItem("telepathy_user")
const user = localStorage.getItem("telepathy_user");

if (!user) {
    window.location.href = "login.html"; 
}
const msgInput = document.getElementById("msg-input");

msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("send-btn").click(); 
    }
});
socket.on("chat-history", (messages) => {
    const chatArea = document.getElementById("messages-area");

    chatArea.innerHTML = "";
    messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("msg-bubble");
        div.innerText = `${msg.user}: ${msg.text}`;
        chatArea.appendChild(div);
    });
});


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
// sendEl.addEventListener("click",()=>{
//     let message=document.getElementById("msg-input").value.trim()
//     let chatArea=document.getElementById("messages-area")
//     let divEl=document.createElement("div")
//     divEl.classList.add("msg-bubble", "msg-self")
//     divEl.innerText=user+" : "+ message
//     chatArea.append(divEl)
//     document.getElementById("msg-input").value=""
// })
sendEl.addEventListener("click", () => {
    let text = msgInput.value.trim();
    if (!text) return;

    const msgObj = {
        user: user,
        text: text,
        time: Date.now()
    };

    socket.emit("send-message", msgObj);

    msgInput.value = "";
});
socket.on("new-message", (msg) => {
    const chatArea = document.getElementById("messages-area");

    const div = document.createElement("div");
    div.classList.add("msg-bubble");

    if (msg.user === user) {
        div.classList.add("msg-self");
    }

    div.innerText = `${msg.user}: ${msg.text}`;
    chatArea.appendChild(div);

    chatArea.scrollTop = chatArea.scrollHeight;
});


socket.on("online-users",(users)=>{
    const divEl=document.getElementById("users-list")
    divEl.innerHTML=""
    for (let id in users) {
    const li = document.createElement("div");
    li.className="user-item"
    li.textContent = users[id];
    li.addEventListener("click",()=>{
        
    })
    divEl.appendChild(li);
  }
})

