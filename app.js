var express = require("express");
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var nickNames = [];

app.get('/', function(req, res){
	res.sendFile('/index.html', {'root' : __dirname});
});

//socket functionality
io.sockets.on("connection", function(socket){

	socket.on("new_user", function(data, callback){
		if(nickNames.indexOf(data) != -1){
			console.log("Got same username: " + data);
			callback(false);
		}else{
			socket.nickname = data;
			nickNames.push(socket.nickname);
			updateNicknames();

			callback(true);
		}
	});

	//handle disconnection
	socket.on("disconnect", function(data){
		if(!socket.nickname) return;

		nickNames.splice(nickNames.indexOf(socket.nickname), 1);

		updateNicknames();
	});

	function updateNicknames(){
		io.sockets.emit("usernames", nickNames);		
	}

	socket.on("send_message", function(data){
		io.sockets.emit('new_message', {msg: data, nick: socket.nickname});
	});
});

server.listen("8080", function(){
	console.log("Server ready at 8080");
});