const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const PLAYER_SPRINT_MOD = 2;
const WINDOW_HEIGHT = 800;
const WINDOW_WIDTH = 800;

// let players = [];
let players = {};
let player = {};
let socket;

socket = io();

socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach( (id) => {
        addPlayer(players[id]);
    });
});

socket.on('newPlayer', (playerInfo) => {
    addPlayer(playerInfo);
})

socket.on('playerDisconnect', (playerId) => {
    Object.keys(players).forEach( (otherPlayer) => {
        if (playerId === otherPlayer) {
            delete players[otherPlayer];
        }
    })
});

socket.on('playerMoved', (playerInfo) => {
    players[playerInfo.playerId] = playerInfo;
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
        // debugger;
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
    let movementData = {x: 0, y: 0}; 
    let playerSpeed = PLAYER_SPEED;

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
        socket.emit('playerMovement', movementData)
    }
    
}

function sendChat(event) {
    event.preventDefault();
    let msg = document.getElementById('chatBox').value;
    document.getElementById('chatBox').value = "";

    socket.emit('chatMsg', msg);
}

function handleNewMsg(msgInfo) {
    let messageListElem = document.getElementById('chatMsgs');
    // let newMessageElem = '<div class="chat-title mx-3 my-2">' + msgInfo.msg + '</div>'
    let newMessageElem = document.createElement('div');
    newMessageElem.className = "chat-title mx-3 my-2";
    newMessageElem.innerText = msgInfo.msg;
    messageListElem.appendChild(newMessageElem);
}