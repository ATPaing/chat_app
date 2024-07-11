const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const {Server} = require('socket.io');  

const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const admin = require("firebase-admin");

const path = require('path');

const serviceAccount = require("../chat_app_credentials.json");
const firebaseApp = initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "chatapp-78dab.appspot.com",
});

const bucket = getStorage(firebaseApp).bucket();

const port = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc@123',
    database: 'chat_app'
});

database.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to mysql_express database');
});

app.use(express.json());

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

    //get the number of connected sockets
    const numConnectedSockets = io.engine.clientsCount;

    //emit the data if exist in database
    const query = `select * from chats`
    database.query(query, (err, res) => {
        if (err) {
            throw err
        }
        console.log('query successfully completed')

        console.log(res)
    
        socket.emit('data in database', res)
    })
    
    // set socket's username
    socket.on('set username', (username) => {
        socket.username = username;
        io.emit('connected_users', numConnectedSockets);
    });

    // get the message from the client and store it in the database
    socket.on('chat message', async (msg,img_name) => {

        const query = `insert into chats (username,message,image_data) values (?, ?, ?)`

        if (msg.image) {

            const imagePath = await saveImageToFirestore(msg.image, img_name);

            console.log('Image saved to Firestore:', imagePath);

            database.query(query, [socket.username, msg.message, imagePath], (err, res) => {
                if (err) {
                    throw err
                }
                console.log('query successfully completed with image')
            })
            
        } else if (!msg.image) {
            database.query(query, [socket.username, msg.message, null], (err, res) => {
                if (err) {
                    throw err
                }
                console.log('query successfully completed without image')
            })
        }

        const messageData = {
            username: socket.username,
            message: msg   
        }

        io.emit('chat message', messageData);
    })

    // for when user disconnected
    socket.on('disconnect', () => {
        console.log('user disconnected');
        const numConnectedSockets = io.engine.clientsCount;
        io.emit('disconnected', numConnectedSockets);
    })
})

// Function to save image to Firestore Storage
async function saveImageToFirestore(base64String, imageName) {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a unique filename
    const fileName = `${imageName}`;

    // Create a file reference in Firestore Storage
    const file = bucket.file(fileName);

    // Save the file to Firestore Storage
    await file.save(buffer, {
        metadata: { contentType: 'image/png' } // Adjust contentType as needed
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Return the public URL
    return file.publicUrl();
}

server.listen(port, () => {    
    console.log(`Server is running on port ${port}`);
});