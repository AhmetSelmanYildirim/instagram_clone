const socket = io();

const form =document.getElementById("message-form")

const sender = $('#myUsername').attr("username")
let receiver = ""

socket.emit("user_connected", sender)

socket.on("user_connected",(username)=>{
    // console.log(username)
})

function onUserSelected(username){
    document.getElementById('message-container').innerHTML=""
    receiver = username
    //DATABASE'DEN Gelen mesajlari yazdir
    $.ajax({
       url: "http://localhost:4000/get_messages",
       method: "POST",
       data:{
           sender,
           receiver
       },
       success: (response)=>{

           let messages = JSON.parse(response)

           let html =""

           for(let b = 0; b < messages.length; b++){

               if(messages[b].sender === sender){
                   html += ` <div><p style=" font-size: 15px; color:red; text-align: right;">${messages[b].sender}</p> <p style="text-align: right; font-size: 20px;">${messages[b].message}</p></div> `
               }else{
                   html += ` <div><p style=" font-size: 15px; color:blue; text-align: left;">${messages[b].sender}</p> <p style="text-align: left; font-size: 20px;">${messages[b].message}</p></div> `
               }

           }
           document.getElementById("message-container").innerHTML += html

       }
    });
}

form.addEventListener("submit", e =>{
    e.preventDefault()

    let message = document.getElementById("message-input").value

    socket.emit("send_message",{
        sender,
        receiver,
        message
    });
    console.log(`sender: ${sender}, receiver: ${receiver}, message: ${message}`)

    const div = document.createElement("div")
    div.innerHTML = ` <p style=" font-size: 1.3vh; color:red; text-align: right;">${sender}</p> <p style="text-align: right;">${message}</p> `
    document.getElementById("message-container").append(div)

    document.getElementById("message-input").value = "";
    message.focus();

})

socket.on("new_message",(data)=>{
    const div = document.createElement("div")
    div.innerHTML = ` <p style=" font-size: 1.3vh; color:blue; text-align: left;">${data.sender}</p> <p style="text-align: left;">${data.message}</p>`
    document.getElementById("message-container").append(div)
})






/** const socket = io();

 const joinRoomButton = document.getElementById("room-button")
 const messageInput = document.getElementById("message-input")
 const roomInput = document.getElementById("room-input")
 const form =document.getElementById("message-form")




 form.addEventListener("submit", e =>{
    e.preventDefault()
    const message = messageInput.value
    // const room = roomInput.value

    if(message === "") return
    displayMessage(message)

    messageInput.value = ""

})

 // joinRoomButton.addEventListener("click", ()=>{
//     const room = roomInput.value
// })

 function displayMessage(message){
    const div = document.createElement("div")
    div.textContent = message
    document.getElementById("message-container").append(div)
}
 */