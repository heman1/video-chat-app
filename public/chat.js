// we can use variable io here to connect with server.
const socketForClient = io.connect('http://localhost:4001', function(data, err) {
    if(err) console.log(err);
    console.log(data);
});

//query DOM
var message = document.getElementById('message');
var btn = document.getElementById('send');
var output = document.getElementById('paint');
var freindStatus = document.getElementById('status');
var userName = document.getElementById('user-name');
var paint = document.getElementById('paint');
var name ;

//emit events

var openServer = true;

function sendMessage() {
    output.innerHTML += '<p class="me"><span class="tail"></span><u>'+ name + '</u>: ' + message.value+ '</p>'
    items = document.querySelectorAll(".me");
    last = items[items.length-1];
    last.scrollIntoView();

    socketForClient.emit('chat', {
        message: message.value,
        handle: name
    });
    message.value="";
}
btn.addEventListener('click', function() {
    console.log("sending from client....");
    if(message.value.length > 0)
        sendMessage();
    return;
    
});

message.addEventListener('keypress', function(e) {
    if(e.keyCode == 13 && message.value.length > 0) {
        sendMessage();
        return;
    }
    socketForClient.emit('typing', name);
});

//listen for the message emitted by server
socketForClient.on('chat', function(data) {
    freindStatus.innerHTML="";
    output.innerHTML += '<p class="others"><span class="tail-other"></span><u>'+ data.handle + '</u>: ' + data.message+ '</p>'
    items = document.querySelectorAll(".others");
    last = items[items.length-1];
    last.scrollIntoView();
});
//listen for typing emitted by server

socketForClient.on('typing', function(data) {
    freindStatus.innerHTML = '<p>'+data+' is typing...'+'</p>';
});

//client side events
function getName() {
    name = prompt("enter your name.");
    console.log("Welcome "+name);
    userName.innerHTML = name;
}

//To Do: Add module with webRTC for P2P video chat

