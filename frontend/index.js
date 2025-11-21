const user = localStorage.getItem("telepathy_user")
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
