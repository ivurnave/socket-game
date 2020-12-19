const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const PLAYER_SPRINT_MOD = 2;
const WINDOW_HEIGHT = 800;
const WINDOW_WIDTH = 800;

let players = {}; // should represent all players in the lobby
let socket = io();

let requestNumber = 0;
let previousRequests = {};

socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach( (id) => {
        addPlayer(players[id]);
    });
});

socket.on('newPlayer', (playerInfo) => {
    addPlayer(playerInfo);
})

socket.on('playerDisconnect', (playerId) => {
    delete players[playerId];
});

socket.on('playerMoved', (res) => {
    if (res.playerInfo.playerId === socket.id) {
        // perform reconcilliation
        reconcilePosition(res);
    } else {
        players[res.playerInfo.playerId] = res.playerInfo;
    }
});

socket.on('newChatMsg', (msgInfo) => {
    handleNewMsg(msgInfo);
});

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    frameRate(60);
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
        drawPlayer(players[playerId]);
    })
}

function addPlayer(playerInfo, isCurrentPlayer = false) {
    players[playerInfo.playerId] = playerInfo;
}

function setBackground() {
    clear();
    background(255, 204, 0);
    noStroke();
}

function drawPlayer(player) {
    if (player.playerId === socket.id) {
        strokeWeight(6);
    } else {
        strokeWeight(4);
    }
    stroke(51);
    fill(player.color);
    square(player.x, player.y, PLAYER_SIZE);
}

function handleKeyPress() {
    let movementData = {x: 0, y: 0}; 
    let playerSpeed = PLAYER_SPEED;

    if (keyIsDown(ENTER)) {
        this.document.getElementById('chatBox').focus();
    }

    if (keyIsDown(SHIFT)) {
        playerSpeed *= PLAYER_SPRINT_MOD;
    }

    if (keyIsDown(DOWN_ARROW)) {
        movementData.y += playerSpeed;
    }
    
    if (keyIsDown(UP_ARROW)) {
        movementData.y -= playerSpeed;
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
        movementData.x += playerSpeed;
    }

    if (keyIsDown(LEFT_ARROW)) {
        movementData.x -= playerSpeed;
    }

    if (movementData.x !== 0 || movementData.y !== 0) {
        movementData.requestNumber = requestNumber;
        previousRequests[requestNumber] = movementData;
        requestNumber++;
        socket.emit('playerMovement', movementData)

        // update the player position, reconcile later if need be
        players[socket.id].x += movementData.x;
        players[socket.id].y += movementData.y;
    }
    
}

// reconcile the position of the player based on the last authoritive state from the server
// res = {playerInfo, requestNumber}
function reconcilePosition(res) {
    delete previousRequests[res.requestNumber];
    players[socket.id] = res.playerInfo;
    Object.keys(previousRequests).forEach( (reqNum) => {
        let movementData = previousRequests[reqNum];
        players[socket.id].x += movementData.x;
        players[socket.id].y += movementData.y;
    })
}

function sendChat(event = null) {
    event.preventDefault(); // prevent page reload
    const msg = document.getElementById('chatBox').value.trim();
    document.getElementById('chatBox').value = "";
    if (msg) {
        socket.emit('chatMsg', msg);
    }
}

function handleNewMsg(msgInfo) {
    let messageListElem = document.getElementById('chatMsgs');
    let newMessageElem = document.createElement('div');
    let iconElem = document.createElement('span');
    iconElem.className = "chat-icon mr-3";
    iconElem.style.backgroundColor = msgInfo.color;
    newMessageElem.className = "chat-message mx-3 my-2 d-flex align-items-center";
    newMessageElem.appendChild(iconElem);
    newMessageElem.append(msgInfo.msg);
    messageListElem.appendChild(newMessageElem);
}