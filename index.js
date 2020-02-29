const express = require('express');
const socket = require('socket.io');
const jwt = require('jsonwebtoken');

//app setup
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

// user-model
var User = require("./models/user-model");

// connect to mongoDB database 
mongoose.connect("mongodb://localhost:27017/video-chat",{useNewUrlParser:true, useUnifiedTopology:true});

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(
  require("express-session")({
    secret: "video chat app",
    resave: false,
    saveUninitialized: false
  })
);


// initializing passport 
app.use(passport.initialize());
app.use(passport.session());
// serialize and deserialize data from the session using the methods provided by passport 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// put the loggedIn user info inside res.locals, so that it can be used by all the routes 
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

//static files
// app.use(express.static('public'));
// var server = app.listen(4001, function() {
// 	console.log('server listening at port 4001');
// });

var server = app.listen(3000,function(req,res){
  console.log("Server Started Successfully......");
}); 

//socket.io setup
var io = socket(server);
//check when a client is connected to the socket
io.on('connection', function(socket) {
	console.log('socket connected');

	//listen for the message
	socket.on('chat', function(data) {
		//now give the data to all socket(s)
		//io.sockets.emit('chat',data);
		socket.broadcast.emit('chat', data);
	});

	//listen for typing
	socket.on('typing', function(data) {
		//now broadcast the data to all socket(s)
		socket.broadcast.emit('typing', data);
		//In broadcast the data is given to all the other sockets excluding own socket.
	});
});

//JSON web token (ongoing for authentication)
app.get('/api', (req, res) => {
	res.json({ msg: 'The get route is working..' });
});

app.post('/api/authWork', verifyToken, (req, res) => {
	jwt.verify(req.token, 'secretkey', (err, authData) => {
		if (err) {
			res.sendStatus(403);
		} else {
			res.json({
				msg: 'you are an authorized user',
				authData
			});
		}
	});
});

app.post('/api/login', verifyToken, (req, res) => {
	//test user
	const user = {
		id: 1,
		username: 'himanshu',
		email: 'emailhaimera@gmal.com'
	};

	jwt.sign({ user: user }, 'secretkey', { expiresIn: '600s' }, (err, token) => {
		res.json({ token });
	});
});

//verify toke
function verifyToken(req, res, next) {
	//get the auth header value
	const bearerHeader = req.headers['authorization'];
	//check if bearer is undifines
	if (typeof bearerHeader !== undefined) {
		// split at the space as the access toke is after a space
		const bearer = bearerHeader.split(' ');
		//get toke from the array bearer
		const bearerToken = bearer[1];
		// set the token
		req.token = bearerToken;

		next();
	} else {
		//forbidden
		res.sendStatus(403);
	}
}

//To DO: COmplete the authentication process [Firebase oAuth or passport.js]

/*using webRTC
var getUserMedia = require('getusermedia');

getUserMedia({ video: true, audio: true }, function (err, stream) {
  if (err) return console.error(err)

  var Peer = require('simple-peer')
  var peer = new Peer({
    initiator: location.hash === '#init',
    trickle: false,
    stream: stream
  })

  peer.on('signal', function (data) {
        //client's ID
        document.getElementById('yourId').value = JSON.stringify(data)
  })

  document.getElementById('connect').addEventListener('click', function () {
        //Friend's ID
        var otherId = JSON.parse(document.getElementById('otherId').value)
        peer.signal(otherId)
  })

  document.getElementById('send').addEventListener('click', function () {
    var yourMessage = document.getElementById('yourMessage').value
    peer.send(yourMessage)
  })

  peer.on('data', function (data) {
    document.getElementById('messages').textContent += data + '\n'
  })

  peer.on('stream', function (stream) {
    var video = document.createElement('video')
    document.body.appendChild(video)

    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
})
*/