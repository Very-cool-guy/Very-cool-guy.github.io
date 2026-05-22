document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("chat-button");
  const widget = document.getElementById("chat-widget");
  const send = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  let open = false;

  button.addEventListener("click", () => {
    open = !open;
    widget.classList.toggle("open", open);
  });

  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.textContent = text;

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  send.addEventListener("click", () => {
    addMessage("Starting Live Chat...", "user");

    setTimeout(() => {
      addMessage(
        "All human representatives are currently unavailable. Artix is booted, pacman is happy, and the penguin has claimed the throne. Please meow at your screen and try again in 2-3 minutes.",
        "bot"
      );
    }, 250);
  });
});
