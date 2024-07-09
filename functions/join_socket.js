const form = document.querySelector('form');
const input = document.getElementsByClassName('input-field')[0];
const button = document.querySelector('button');


localStorage.clear();

form.addEventListener('submit', (e) => {  
    const socket = io();
    const username = input.value;
    // socket.emit('join', username);
    localStorage.setItem('username', username);
    input.value = '';
});