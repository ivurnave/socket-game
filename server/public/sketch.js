const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;

// let player = {
//     color: '#fae',
//     x : 30,
//     y: 50,
//     vx: 0,
//     vy: 0,
//     hp: 100
// }

// let players = [];
let players = {};
let player = {};
let socket;

function setup() {
    createCanvas(800, 800);
    frameRate(60);

    socket = io();

    socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach( (id) => {
            if (players[id].playerId === socket.id) {
                addPlayer(players[id]);
            } else {
                addOtherPlayers(players[id]);
            }
        });
    });

    socket.on('newPlayer', (playerInfo) => {
        console.log('adding a new player -- ' + playerInfo.playerId);
        addOtherPlayers(playerInfo);
    })

    socket.on('playerDisconnect', (playerId) => {
        Object.keys(players).forEach( (otherPlayer) => {
            debugger;
            if (playerId === otherPlayer) {
                // otherPlayer = null
                // players[otherPlayer] = null;
                delete players[otherPlayer];
            }
        })
    });

    socket.on('playerMoved', (playerInfo) => {
        Object.keys(players).forEach( (playerId) => {
            if (playerInfo.playerId === playerId) {
                console.log(' a different player moved -- ' + playerInfo.playerId);
                // debugger;
                players[playerId] = playerInfo;
            }
        })
    })
}

function draw() {
    setBackground();

    background(255, 204, 0);
    noStroke();
    
    fill(255);

    if (keyIsPressed) {
        handleKeyPress();
    }

    Object.keys(players).forEach((playerId) => {
        // debugger;
        drawPlayer(players[playerId]);
    })
}

function addPlayer(playerInfo) {
    player = playerInfo;
    // debugger;
    // players.push(player);
    players[playerInfo.playerId] = playerInfo;
}

function addOtherPlayers(playerInfo) {
    // players.push(playerInfo);
    players[playerInfo.playerId] = playerInfo;
}

function setBackground() {
    clear();
    background(255, 204, 0);
    noStroke();
}

function drawPlayer(player) {
    strokeWeight(4);
    stroke(51);
    fill(player.color);
    square(player.x, player.y, PLAYER_SIZE);
}

function mouseClicked() {
    // player.x = mouseX - (PLAYER_SIZE/2);
    // player.y = mouseY - (PLAYER_SIZE/2);
}

function handleKeyPress() {
    const oldPos = [player.x, player.y];
    if (keyIsDown(DOWN_ARROW)) {
        player.y += PLAYER_SPEED;
    }
    
    if (keyIsDown(UP_ARROW)) {
        player.y -= PLAYER_SPEED;
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
        player.x += PLAYER_SPEED;
    }

    if (keyIsDown(LEFT_ARROW)) {
        player.x -= PLAYER_SPEED;
    }

    if (oldPos[0] !== player.x || oldPos[1] !== player.y) {
        socket.emit('playerMovement', {
            x: player.x,
            y: player.y
        })
    }
}