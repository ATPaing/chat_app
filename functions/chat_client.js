const form = document.querySelector('form');
const input = document.querySelector('input');
const message_wrapper = document.getElementsByClassName('messages_wrapper')[0];
const online_counts = document.getElementsByClassName('online_counts')[0];

const socket = io();

// Retrieve username from localStorage
const username = localStorage.getItem('username');
if (username) {
    socket.emit('set username', username);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(input.value) {
        socket.emit('chat message', input.value);
        input.value = '';   
    }
})


socket.on('connected', (numConnectedSockets) => {
    online_counts.innerHTML = ` ${numConnectedSockets}`;
})

socket.on('disconnected', (numConnectedSockets) => {    
    online_counts.innerHTML = ` ${numConnectedSockets}`;
})

socket.on('chat message', (msg) => {   

    message_wrapper.innerHTML += `
        <div class="message">
            <div>
                <p class="user_name">${msg.username}</p>
            </div>
            <div>
                <p class="user_msg">${msg.message}</p>
            </div>
        </div>
    `;
    window.scrollTo(0, document.body.scrollHeight);
})