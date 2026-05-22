//TODO add upgrades

document.addEventListener("click", (ev) => {
    var clicks = localStorage.getItem("clicks");
    if (clicks == null) {
        clicks = 0;
    }
    clicks++;
    addClick(ev.x + window.scrollX, ev.y + window.scrollY, clicks)
    createClick(ev.x + window.scrollX, ev.y + window.scrollY, clicks);
});

function createClick(x, y, clicks) {
    var counter = document.createElement("span");
    counter.innerHTML = clicks + " (ノω<。)ノ))☆.。";
    counter.style.position = "absolute";

    counter.style.top = y + "px";
    counter.style.left = x + "px";
    counter.style.color = "white";
    counter.style.fontSize = "20px";
    counter.style.pointerEvents = "none";

    document.getElementsByTagName("body")[0].appendChild(counter);
}

function addClick(x, y, click) {
    localStorage.setItem("clicks", click);
    localStorage.setItem("clicks_at", JSON.stringify([ ...JSON.parse(localStorage.getItem("clicks_at") || "[]"), {
        x,
        y,
        click
    } ]));

}

function startUp() {
    var clicksAt = localStorage.getItem("clicks_at");
    if (clicksAt == null) {
        clicksAt = [];
    } else {
        clicksAt = JSON.parse(clicksAt);
    }
    for (var i = 0; i < clicksAt.length; i++) {
        createClick(clicksAt[i].x, clicksAt[i].y, clicksAt[i].click)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    startUp();
})
