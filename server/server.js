var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.listen(server);

var port = process.env.PORT;
if (port == null || port == "") {
	port = 5000;
}

var PLAYER_LIST = {};
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) {
  	console.log('a user connected');

	// create a new player and add it to our players object
	PLAYER_LIST[socket.id] = {
		playerId: socket.id,
		color: '#' + Math.floor(Math.random()*16777215).toString(16),
		x: Math.floor(Math.random() * 700) + 50,
		y: Math.floor(Math.random() * 700) + 50,
		vx: 0,
		vy: 0,
		hp: 100
	};

	// send the players object to the new player
	socket.emit('currentPlayers', PLAYER_LIST);
	
	// update all other players of the new player
	io.emit('newPlayer', PLAYER_LIST[socket.id]);

	// when a player moves, update the player data
	socket.on('playerMovement', (movementData) => {
		PLAYER_LIST[socket.id].x += movementData.x;
		PLAYER_LIST[socket.id].y += movementData.y;

		keepInBounds(PLAYER_LIST[socket.id]);

		// response is the update player info along with the original request number
		var res = {
			playerInfo: PLAYER_LIST[socket.id],
			requestNumber: movementData.requestNumber
		}

		// emit a message to all players about the player that moved
		io.emit('playerMoved', res);
	});

	socket.on('chatMsg', (msg) => {
		io.emit('newChatMsg', {
			msg: msg,
			color: PLAYER_LIST[socket.id].color
		})
	});

	socket.on('disconnect', function () {
		console.log('user disconnected');

		// send disconnect chat
		io.emit('newChatMsg', {
			msg: 'user left the room',
			color: PLAYER_LIST[socket.id].color
		})

		// remove this player from our players object
		delete PLAYER_LIST[socket.id];

		// emit a message to all players to remove this player
		io.emit('playerDisconnect', socket.id);
	});

});

server.listen(port, function () {
  	console.log(`Listening on ${server.address().port}`);
});

function keepInBounds(player) {
	const PLAYER_SIZE = 20
	const WINDOW_HEIGHT = 800;
	const WINDOW_WIDTH = 800;

    if (player.x > WINDOW_WIDTH - (PLAYER_SIZE / 2)) {
        player.x = WINDOW_WIDTH - (PLAYER_SIZE / 2);
    }
    if (player.x < 0 - (PLAYER_SIZE / 2)) {
        player.x = 0 - (PLAYER_SIZE / 2);
    }
    if (player.y > WINDOW_HEIGHT - (PLAYER_SIZE / 2)) {
        player.y = WINDOW_HEIGHT - (PLAYER_SIZE / 2);
    }
    if (player.y < 0 - (PLAYER_SIZE / 2)) {
        player.y = 0 - (PLAYER_SIZE / 2);
    }
}