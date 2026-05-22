var isDoomLoaded = false;
console.doom = function() {
  if (isDoomLoaded) return;
  isDoomLoaded = true;
  var script = document.createElement("script");
  script.src = "https://console-doom.netlify.app/main.js";
  document.head.appendChild(script);
};
