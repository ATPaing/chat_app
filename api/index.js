const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const {Server} = require('socket.io');  


const path = require('path');

const port = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'))

app.use('/functions', express.static(path.join(__dirname, '../functions')));

// send chat.html file to the client
app.post('/chat', (req, res) => {
    res.sendFile(path.join(__dirname , '../public/web_pages/chat.html'));
});

// send index.html file to the client
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , '../public/web_pages/index.html'));
});



// socket.io

io.on('connection', (socket) => {

    const numConnectedSockets = io.engine.clientsCount;

    socket.on('join', (username) => {
        console.log(`${username} joined the chat`);
        socket.username = username;
    });

    socket.on('set username', (username) => {
        socket.username = username;
        io.emit('connected_users', numConnectedSockets);
    });

    socket.on('chat message', (msg) => {

        const messageData = {
            username: socket.username,
            message: msg   
        }

        io.emit('chat message', messageData);
    })


    socket.on('disconnect', () => {
        console.log('user disconnected');
        const numConnectedSockets = io.engine.clientsCount;
        io.emit('disconnected', numConnectedSockets);
    })
})

server.listen(port, () => {    
    console.log(`Server is running on port ${port}`);
});