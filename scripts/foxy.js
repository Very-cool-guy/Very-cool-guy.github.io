// 1% chance for a FNAF 2 foxy jumpscare every time someone clicks for the first time after loading the site
document.addEventListener("click", () => {
  // wait 200ms until barrel roll is done
  setTimeout(() => {
      if (Math.random() < 0.1) {
          jumpscare();
      }
  }, 200);
}, { once: true });

function jumpscare() {
    const overlay = document.createElement("div");
    overlay.id = "foxy-overlay";

    const video = document.createElement("video");
    video.id = "foxy-video";

    video.src = "resources/foxy.mp4";

    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.muted = false;
    video.preload = "auto";

    overlay.appendChild(video);
    document.body.appendChild(overlay);

    video.play().catch(err => {
        console.error("no foxy :( Err:", err);
        overlay.remove();
    });

    video.addEventListener("ended", () => {
        overlay.remove();
    });

    video.addEventListener("error", (e) => {
        console.error("Foxy doesnt load :(((", e);
        overlay.remove();
    });
}
