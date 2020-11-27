const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const PLAYER_SPRINT_MOD = 2;
const WINDOW_HEIGHT = 800;
const WINDOW_WIDTH = 800;

// let players = [];
let players = {};
let player = {};
let socket;

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    frameRate(60);

    socket = io();

    socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach( (id) => {
            addPlayer(players[id]);
            // if (players[id].playerId === socket.id) {
            //     addPlayer(players[id], true);
            // } else {
            //     addPlayer(players[id]);
            // }
        });
    });

    socket.on('newPlayer', (playerInfo) => {
        // console.log('adding a new player -- ' + playerInfo.playerId);
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
        // Object.keys(players).forEach( (playerId) => {
        //     if (playerInfo.playerId === playerId) {
        //         // console.log(' a different player moved -- ' + playerInfo.playerId);
        //         players[playerId] = playerInfo;
        //     }
        // })
        console.log('playerMoved ', playerInfo);
        players[playerInfo.playerId] = playerInfo;
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

function addPlayer(playerInfo, isCurrentPlayer = false) {
    // if (isCurrentPlayer) {
    //     player = playerInfo;
    // }
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

// function handleKeyPress() {
//     const oldPos = [player.x, player.y];
//     let playerSpeed = PLAYER_SPEED;    

//     if (keyIsDown(SHIFT)) {
//         playerSpeed *= PLAYER_SPRINT_MOD;
//     }

//     if (keyIsDown(DOWN_ARROW)) {
//         player.y += playerSpeed;
//     }
    
//     if (keyIsDown(UP_ARROW)) {
//         player.y -= playerSpeed;
//     }
    
//     if (keyIsDown(RIGHT_ARROW)) {
//         player.x += playerSpeed;
//     }

//     if (keyIsDown(LEFT_ARROW)) {
//         player.x -= playerSpeed;
//     }

//     keepInBounds();

//     if (oldPos[0] !== player.x || oldPos[1] !== player.y) {
//         socket.emit('playerMovement', {
//             x: player.x,
//             y: player.y
//         })
//     }
// }

function handleKeyPress() {
    const oldPos = [player.x, player.y];
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

    // keepInBounds();

    if (movementData.x !== 0 || movementData.y !== 0) {
        socket.emit('playerMovement', movementData)
    }
    
}

function keepInBounds() {
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