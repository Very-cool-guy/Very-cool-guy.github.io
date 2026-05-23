(function () {
    var STORAGE_KEY = "stupidcat_state";

    var defaultState = {
        score: 0,
        perClick: 1,
        upgrades: {
            "upgrade-claw": 0,
            "upgrade-paw": 0,
            "upgrade-stupid": 0,
            "upgrade-cheater": 0
        }
    };

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return JSON.parse(JSON.stringify(defaultState));
            var parsed = JSON.parse(raw);
            return Object.assign({}, defaultState, parsed, {
                upgrades: Object.assign({}, defaultState.upgrades, parsed.upgrades || {})
            });
        } catch (e) {
            return JSON.parse(JSON.stringify(defaultState));
        }
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    var state = loadState();

    var scoreEl = document.getElementById("score");
    var perClickEl = document.getElementById("per-click-value");
    var cat = document.getElementById("stupidcat");
    var resetBtn = document.getElementById("reset");
    var upgradeButtons = document.querySelectorAll(".upgrade");

    function costFor(btn) {
        var base = parseInt(btn.dataset.baseCost, 10);
        var owned = state.upgrades[btn.id] || 0;
        return Math.floor(base * Math.pow(1.5, owned));
    }

    function render() {
        scoreEl.textContent = state.score;
        perClickEl.textContent = state.perClick;
        upgradeButtons.forEach(function (btn) {
            var cost = costFor(btn);
            btn.querySelector(".cost-value").textContent = cost;
            btn.querySelector(".owned").textContent = state.upgrades[btn.id] || 0;
            btn.disabled = state.score < cost;
        });
    }

    function spawnFloater(x, y, amount) {
        var el = document.createElement("span");
        el.className = "float-point";
        el.textContent = "+" + amount;
        el.style.left = (x + window.scrollX) + "px";
        el.style.top = (y + window.scrollY) + "px";
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 900);
    }

    cat.addEventListener("click", function (ev) {
        state.score += state.perClick;
        spawnFloater(ev.clientX, ev.clientY, state.perClick);
        saveState(state);
        render();
    });

    upgradeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var cost = costFor(btn);
            if (state.score < cost) return;
            state.score -= cost;
            state.upgrades[btn.id] = (state.upgrades[btn.id] || 0) + 1;
            state.perClick += parseInt(btn.dataset.power, 10);
            saveState(state);
            render();
        });
    });

    resetBtn.addEventListener("click", function () {
        if (!confirm("Naprawdę zresetować? Stracisz wszystkie głupie punkty.")) return;
        state = JSON.parse(JSON.stringify(defaultState));
        saveState(state);
        render();
    });

    render();
})();
