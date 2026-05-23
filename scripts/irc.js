const chatMessages = document.getElementById("chatMessages");
chatMessages.scrollTop = chatMessages.scrollHeight;


const rightPanel = document.getElementById('rightPanel');

const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');

sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if(message !== '') {
    rightPanel.style.display = 'block';

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.innerHTML = `<span class="user">You</span> ${message}`;
    chatMessages.appendChild(msgDiv);
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

messageInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendButton.click();
});