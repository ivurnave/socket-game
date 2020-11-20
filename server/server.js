var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.listen(server);

var port = process.env.PORT;
if (port == null || port == "") {
	port = 8082;
}

var players = {};
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) {
  	console.log('a user connected');

	// create a new player and add it to our players object
	players[socket.id] = {
		playerId: socket.id,
		color: '#fae',
		x: Math.floor(Math.random() * 800) + 50,
		y: Math.floor(Math.random() * 800) + 50,
		vx: 0,
		vy: 0,
		hp: 100
	};

	// send the players object to the new player
	socket.emit('currentPlayers', players);
	
	// update all other players of the new player
	socket.broadcast.emit('newPlayer', players[socket.id]);

	socket.on('disconnect', function () {
		console.log('user disconnected');

		// remove this player from our players object
		delete players[socket.id];

		// emit a message to all players to remove this player
		io.emit('playerDisconnect', socket.id);
	});

	// when a player moves, update the player data
	socket.on('playerMovement', (movementData) => {
		console.log('a player moved', movementData);
		players[socket.id].x = movementData.x;
		players[socket.id].y = movementData.y;

		// emit a message to all players about the player that moved
		socket.broadcast.emit('playerMoved', players[socket.id]);
	})
});

server.listen(port, function () {
  	console.log(`Listening on ${server.address().port}`);
});