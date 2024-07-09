const form = document.querySelector('form');
const text_input = document.getElementsByClassName('text_input')[0];
const image_input = document.getElementsByClassName('image_input')[0];
const message_wrapper = document.getElementsByClassName('messages_wrapper')[0];
const online_counts = document.getElementsByClassName('online_counts')[0];

const image_preview = document.getElementsByClassName('image_preview')[0];
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
// const closeModal = document.getElementById('closeModal');

const socket = io();

const reader = new FileReader();

// Retrieve username from localStorage
const username = localStorage.getItem('username');
if (username) {
    socket.emit('set username', username);
}

image_input.addEventListener('change', (e) => {
    const file = image_input.files[0];
    console.log(file)
    reader.readAsDataURL(file);
    console.log(reader)
    console.log(reader.result)
    reader.onload = () => {
        image_preview.innerHTML = ` 
        <div class="img_preview__wrapper">
            <div class="img__preview__close--bg">
                <p class="img__preview__close">X</p>
            </div>
            <img src="${reader.result}" alt="Image Preview" class="image_preview__img">
        </div>
        `;

        const close = document.getElementsByClassName('img__preview__close')[0];
        close.addEventListener('click', () => {
            image_preview.innerHTML = '';
            image_input.value = '';
        })
    }
    
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = image_input.files[0];
    const message = text_input.value;
    if (message || file) {

        if (file) {
            
            reader.readAsDataURL(file);
            reader.onload = () => {
                const imgData = reader.result;
                
                const emitMessage = {
                    message: message,
                    image: imgData
                }
                socket.emit('chat message', emitMessage);
            }
            
        } else {
            const emitMessage = {
                message: message,
            }
            socket.emit('chat message', emitMessage);
        }

        text_input.value = '';  
        image_input.value = '';
        image_preview.innerHTML = '';
    }
})


socket.on('connected_users', (numConnectedSockets) => {
    online_counts.innerHTML = ` ${numConnectedSockets}`;
})

socket.on('disconnected', (numConnectedSockets) => {    
    online_counts.innerHTML = ` ${numConnectedSockets}`;
})

socket.on('chat message', (msg) => {   

    console.log(msg)


    const username = msg.username
    
    const message = msg.message.message

    const image = msg.message.image


    let messageHTML = `
        <div class="message">
            <div>
                <p class="user_name">${username}</p>
            </div>
            <div class="message__content">
                <p class="user_msg">${message}</p>
            
    `;

    if (image) {
        messageHTML += `
            <div>
                <img src="${image}" alt="User Image" class="user_image">
            </div>
        `;
    }

    messageHTML += `</div> </div>`;

    message_wrapper.innerHTML += messageHTML;
    message_wrapper.scrollTo(0, message_wrapper.scrollHeight);

    const newImage = document.getElementsByClassName('user_image');

    for (const image of newImage) {
        image.addEventListener('click', () => {
            modal.showModal();
            modalImage.src = image.src;
        });
    }

})

// closeModal.addEventListener('click', () => {
//     modal.close();
// });

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.close();
    }
});