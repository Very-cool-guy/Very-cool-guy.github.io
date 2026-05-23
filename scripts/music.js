/* hii, if you wanna add songs upload them to resources/music and add the route here :) */

const songs = [
    "resources/menuloop.mp3",
    "resources/music/2-X. All The Times - Rhythm Doctor.mp3",
    "resources/music/EMPTY DIARY - UNBEATABLE.mp3",
    "resources/music/No Devil Lived On (8-2) - ULTRAKILL.ogg",
    "resources/music/ChickenSuitPony - Field of Love and Cringe.mp3",
    "resources/music/Oopsie Go Wrong - Zaki.mp3",
    "resources/music/Plizzanet - Yo! Noid 2 OST.mp3",
    "resources/music/Erasing Me Erasing You.mp3",
    "resources/music/Dongrang Who Denies All.mp3"
];

let currentSong = 0;
let shuffle = false;

const audio = new Audio();
audio.src = songs[currentSong];
audio.volume = 0.8;

const boombox = document.getElementById("boombox");
const toggle = document.getElementById("boom-toggle");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const shuffleBtn = document.getElementById("shuffle");

const seekbar = document.getElementById("seekbar");
const volume = document.getElementById("volume");

const songName = document.getElementById("song-name");

const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");

const playlist = document.getElementById("playlist");

toggle.onclick = () => {
    boombox.classList.toggle("closed");
};

function loadSong(index) {

    currentSong = index;

    audio.src = songs[index];

    songName.textContent =
        songs[index]
        .split("/")
        .pop();

    updatePlaylist();

    audio.play();
}

function updatePlaylist() {

    playlist.innerHTML = "";

    songs.forEach((song, index) => {

        const div = document.createElement("div");

        div.className = "song";

        if(index === currentSong) {
            div.classList.add("active");
        }

        div.textContent =
            song
            .split("/")
            .pop();

        div.onclick = () => {
            loadSong(index);
        };

        playlist.appendChild(div);
    });
}

playBtn.onclick = () => {

    if(audio.paused) {
        audio.play();
    }
    else {
        audio.pause();
    }
};

nextBtn.onclick = () => {

    if(shuffle) {

        currentSong =
            Math.floor(
                Math.random() * songs.length
            );
    }
    else {

        currentSong++;

        if(currentSong >= songs.length) {
            currentSong = 0;
        }
    }

    loadSong(currentSong);
};

prevBtn.onclick = () => {

    currentSong--;

    if(currentSong < 0) {
        currentSong = songs.length - 1;
    }

    loadSong(currentSong);
};

shuffleBtn.onclick = () => {

    shuffle = !shuffle;

    shuffleBtn.style.background =
        shuffle
        ? "#ff4da6"
        : "#222";
};

audio.addEventListener("timeupdate", () => {

    seekbar.max = audio.duration;

    seekbar.value = audio.currentTime;

    currentTimeText.textContent =
        formatTime(audio.currentTime);

    durationText.textContent =
        formatTime(audio.duration);
});

seekbar.addEventListener("input", () => {
    audio.currentTime = seekbar.value;
});

volume.addEventListener("input", () => {
    audio.volume = volume.value;
});

volume.value = 0.8;

audio.addEventListener("ended", () => {
    nextBtn.onclick();
});

function formatTime(time) {

    if(isNaN(time)) {
        return "0:00";
    }

    const minutes =
        Math.floor(time / 60);

    const seconds =
        Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
}

loadSong(0);
updatePlaylist();
