(function () {
  const STORAGE_KEY = "barrelRollDisabled";
  const CLIPPY_THRESHOLD = 5;
  const CLIPPY_DISMISSED_KEY = "barrelRollClippyDismissed";

  const isMobile =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  let disabled =
    isMobile || localStorage.getItem(STORAGE_KEY) === "1";
  let rolling = false;
  let rollCount = 0;

  function isBackgroundTarget(target) {
    if (!target) return false;
    if (target === document.body) return true;
    if (target === document.documentElement) return true;
    const id = target.id;
    if (id === "CAN" || id === "niko-canvas") return true;
    return false;
  }

  function roll() {
    if (disabled || rolling) return;
    rolling = true;
    document.body.classList.add("barrel-roll");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("barrel-roll");
      });
    });
    setTimeout(() => {
      rolling = false;
    }, 1100);

    rollCount++;
    if (
      rollCount >= CLIPPY_THRESHOLD &&
      localStorage.getItem(CLIPPY_DISMISSED_KEY) !== "1"
    ) {
      showClippy();
    }
  }

  function buildToggle() {
    const label = document.createElement("label");
    label.id = "barrel-roll-toggle";
    label.innerHTML =
      '<input type="checkbox"> disable barrel roll';
    const cb = label.querySelector("input");
    cb.checked = disabled;
    cb.addEventListener("change", () => {
      disabled = cb.checked;
      localStorage.setItem(STORAGE_KEY, disabled ? "1" : "0");
    });
    if (isMobile) {
      cb.disabled = true;
      label.title = "disabled on mobile";
    }
    document.body.appendChild(label);
  }

  let clippyEl = null;
  function showClippy() {
    if (clippyEl) return;
    clippyEl = document.createElement("div");
    clippyEl.id = "barrel-roll-clippy";
    clippyEl.innerHTML = `
      <div class="clippy-bubble">
        <p>It looks like you're rolling a lot.<br>Want to disable barrel roll?</p>
        <button class="clippy-yes">yes please</button>
        <button class="clippy-no">no, keep rolling</button>
      </div>
      <div class="clippy-face">📎</div>
    `;
    document.body.appendChild(clippyEl);
    clippyEl.querySelector(".clippy-yes").addEventListener("click", () => {
      disabled = true;
      localStorage.setItem(STORAGE_KEY, "1");
      const cb = document.querySelector("#barrel-roll-toggle input");
      if (cb) cb.checked = true;
      dismissClippy();
    });
    clippyEl.querySelector(".clippy-no").addEventListener("click", () => {
      localStorage.setItem(CLIPPY_DISMISSED_KEY, "1");
      dismissClippy();
    });
  }

  function dismissClippy() {
    if (!clippyEl) return;
    clippyEl.remove();
    clippyEl = null;
  }

  function init() {
    buildToggle();
    document.addEventListener("click", (e) => {
      if (isBackgroundTarget(e.target)) roll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
