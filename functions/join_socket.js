const form = document.querySelector('form');
const input = document.getElementsByClassName('input-field')[0];
const button = document.querySelector('button');


const socket = io();

localStorage.clear();

form.addEventListener('submit', (e) => {   
    const username = input.value;
    localStorage.setItem('username', username);
    input.value = '';
});