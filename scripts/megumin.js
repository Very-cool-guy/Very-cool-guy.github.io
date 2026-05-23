let meguminFlag = false;
let meguminCreate = false;
let lastMousePos = { x: 0, y: 0 };
let meguminInterval;

function meguminToggle() {
    const meguminFollow = document.getElementById('meguminFollow');
    const meguminButton = document.getElementById('meguminButton');
    meguminFlag = !meguminFlag;
    meguminButton.textContent = meguminFlag ? 'Megumin Mode: On' : 'Megumin Mode: Off'
    meguminFollow.style.display = meguminFlag ? 'block' : 'none';

    if (!meguminInterval) {
        meguminInterval = setInterval(() => {
            const img = document.createElement('img');
            img.src = 'resources/megumin_explosion.gif';
            img.className = 'meguminExplosion';
            img.style.position = "absolute";
            img.style.left = lastMousePos.x + 'px';
            img.style.top = lastMousePos.y + 'px';
            document.getElementsByTagName("body")[0].appendChild(img);
        }, 100);
    } else {
        clearInterval(meguminInterval);
        meguminInterval = null;
    }
}
document.addEventListener('mousemove', (e) => {
    const meguminFollow = document.getElementById('meguminFollow');
    if (!meguminFlag) return;
    lastMousePos.x = e.pageX;
    lastMousePos.y = e.pageY;

    meguminFollow.style.left = e.pageX + 'px';
    meguminFollow.style.top = e.pageY + 'px';
    // meguminFollow.style.opacity = (((e.pageX + e.pageY) % 200) / 200) * 0.5 + 0.5
});

function clearMegumin() {
    document.querySelectorAll(".meguminExplosion").forEach(el => el.remove());
}