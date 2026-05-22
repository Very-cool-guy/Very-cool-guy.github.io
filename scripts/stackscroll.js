(function () {
  const EXCLUDED_ANCESTORS = [
    "marquee",
    "details",
    "header",
    "#niko-canvas",
    "#chat-widget",
    ".modal",
    ".image-container",
  ];

  const STEP = 40;
  const MAX_STACK_INDEX = 6;

  function isExcluded(el) {
    return EXCLUDED_ANCESTORS.some((sel) => el.closest(sel));
  }

  function hasFixedPositioning(el) {
    const inline = el.getAttribute("style") || "";
    return /position\s*:\s*(fixed|absolute|sticky)/i.test(inline);
  }

  const items = [];

  function collect() {
    const els = document.querySelectorAll("body img, body video");
    let idx = 0;
    els.forEach((el) => {
      if (isExcluded(el)) return;
      if (hasFixedPositioning(el)) return;
      const stackIdx = Math.min(idx, MAX_STACK_INDEX);
      const placeholder = document.createElement("span");
      placeholder.className = "stack-placeholder";
      placeholder.style.display = "inline-block";
      placeholder.style.verticalAlign = "top";
      items.push({
        el,
        stackIdx,
        placeholder,
        stuck: false,
        documentTop: 0,
      });
      idx++;
    });
  }

  function measure() {
    items.forEach((item) => {
      if (item.stuck) {
        const r = item.placeholder.getBoundingClientRect();
        item.documentTop = window.scrollY + r.top;
        item.width = r.width;
        item.height = r.height;
        item.left = r.left;
      } else {
        const r = item.el.getBoundingClientRect();
        item.documentTop = window.scrollY + r.top;
        item.width = r.width;
        item.height = r.height;
        item.left = r.left;
      }
    });
  }

  function stick(item) {
    item.placeholder.style.width = item.width + "px";
    item.placeholder.style.height = item.height + "px";
    item.el.parentNode.insertBefore(item.placeholder, item.el);

    const scale = Math.max(0.55, 1 - item.stackIdx * 0.08);
    item.el.style.position = "fixed";
    item.el.style.top = item.stackIdx * STEP + "px";
    item.el.style.left = item.left + "px";
    item.el.style.width = item.width + "px";
    item.el.style.height = item.height + "px";
    item.el.style.zIndex = String(100 + item.stackIdx);
    item.el.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.45)";
    item.el.style.transformOrigin = "top left";
    item.el.style.transform = `scale(${scale})`;
    item.el.style.transition = "top 0.15s ease-out, transform 0.15s ease-out";
    item.stuck = true;
  }

  function unstick(item) {
    item.el.style.position = "";
    item.el.style.top = "";
    item.el.style.left = "";
    item.el.style.width = "";
    item.el.style.height = "";
    item.el.style.zIndex = "";
    item.el.style.boxShadow = "";
    item.el.style.transform = "";
    item.el.style.transformOrigin = "";
    item.el.style.transition = "";
    if (item.placeholder.parentNode) {
      item.placeholder.parentNode.removeChild(item.placeholder);
    }
    item.stuck = false;
  }

  let ticking = false;
  function update() {
    ticking = false;
    const scrollY = window.scrollY;
    items.forEach((item) => {
      const stickyAt = scrollY + item.stackIdx * STEP;
      if (item.documentTop <= stickyAt) {
        if (!item.stuck) stick(item);
      } else {
        if (item.stuck) unstick(item);
      }
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function fullReset() {
    items.forEach((item) => {
      if (item.stuck) unstick(item);
    });
    measure();
    update();
  }

  function init() {
    collect();
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", fullReset, { passive: true });
    window.addEventListener("load", fullReset);
    document.querySelectorAll("body img").forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", fullReset, { once: true });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
