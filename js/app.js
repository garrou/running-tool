const { t, getLang, initLang, toggleLang } = I18n;

const $ = (id) => document.getElementById(id);
const STORE_KEY = "running-tool";
const MAX_SPLITS_KM = 100;
const MIN_DISTANCE_KM = 0.001;
// Riegel gets unreliable when the target is this many times farther/shorter than the reference.
const RIEGEL_MAX_RATIO = 5;

const CALC_TIME = ["cH", "cM", "cS"];
const CALC_PACE = ["cPM", "cPS", "cSpeed"];
const CALC_FIELDS = ["cDist", ...CALC_TIME, ...CALC_PACE];
// Fields that are outputs (read-only) for each mode, and inputs required by it.
const CALC_OUTPUTS = { time: CALC_TIME, distance: ["cDist"], pace: CALC_PACE };
const CALC_INPUTS = {
    time: ["cDist", ...CALC_PACE],
    distance: [...CALC_TIME, ...CALC_PACE],
    pace: ["cDist", ...CALC_TIME],
};

// Exact pace (s/km) behind the pace and speed fields, which only show it rounded.
let paceSec = NaN;

// ---------- storage ----------

function loadStore() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
    } catch {
        return {};
    }
}

function saveStore(patch) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ ...loadStore(), ...patch }));
    } catch { /* storage unavailable: the app still works */ }
}

// ---------- helpers ----------

const fmt = (n, max = 2) =>
    n.toLocaleString(getLang(), { maximumFractionDigits: max, useGrouping: false });

const isPositive = (n) => Number.isFinite(n) && n > 0;
const isDistance = (n) => Number.isFinite(n) && n >= MIN_DISTANCE_KM;
const num = (id) => C.parseNum($(id).value);
const timeOf = (ids) => C.toSeconds(...ids.map((id) => C.parseNumOrZero($(id).value)));
const clear = (ids) => ids.forEach((id) => ($(id).value = ""));

function setTime(ids, seconds) {
    const { h, m, s } = C.splitHms(seconds);
    [h, m, s].forEach((v, i) => ($(ids[i]).value = v));
}

function hasBadInput(ids) {
    return ids.some((id) => {
        const v = $(id).value.trim();
        return v !== "" && !(C.parseNum(v) >= 0);
    });
}

function renderTable(table, headers, rows) {
    table.replaceChildren();
    if (!rows.length) return;
    const tr = (cells, tag) => {
        const row = document.createElement("tr");
        cells.forEach((text) => {
            const cell = document.createElement(tag);
            cell.textContent = text;
            row.append(cell);
        });
        return row;
    };
    table.append(tr(headers, "th"), ...rows.map((cells) => tr(cells, "td")));
}

const raceLabel = (id) =>
    ({ "3k": "3 km", "5k": "5 km", "10k": "10 km", hm: t("halfMarathon"), m: t("marathon") })[id];

const percentRange = (z) => `${Math.round(z.from * 100)}–${Math.round(z.to * 100)} %`;

// ---------- time / distance / pace ----------

const mode = () => document.querySelector('input[name="mode"]:checked').value;

function setPaceFields(sec) {
    if (!isPositive(sec)) return clear(["cPM", "cPS"]);
    const { h, m, s } = C.splitHms(sec);
    $("cPM").value = h * 60 + m;
    $("cPS").value = s;
}

function setSpeedField(sec) {
    $("cSpeed").value = isPositive(sec) ? fmt(C.paceToSpeed(sec)) : "";
}

function readPace() {
    const total = C.toSeconds(0, C.parseNumOrZero($("cPM").value), C.parseNumOrZero($("cPS").value));
    return isPositive(total) ? total : NaN;
}

function applyMode() {
    const outputs = CALC_OUTPUTS[mode()];
    CALC_FIELDS.forEach((id) => ($(id).readOnly = outputs.includes(id)));
    document.querySelectorAll('[data-target="cDist"]').forEach((b) => {
        b.disabled = mode() === "distance";
    });
}

function renderSplits(distance, pace) {
    const box = $("cSplitsBox");
    const show = distance <= MAX_SPLITS_KM;
    box.hidden = !show;
    renderTable(
        $("cSplits"),
        [t("kmCol"), t("splitCol"), t("totalCol")],
        show
            ? C.splits(distance, pace).map((r) => [
                fmt(r.km, 3), C.formatDuration(r.split), C.formatDuration(r.total),
            ])
            : [],
    );
}

function calc() {
    const m = mode();
    let distance = num("cDist");
    let time = timeOf(CALC_TIME);
    let pace = paceSec;

    if (m === "time") {
        time = isDistance(distance) && isPositive(pace) ? C.timeFor(distance, pace) : NaN;
        isPositive(time) ? setTime(CALC_TIME, time) : clear(CALC_TIME);
    } else if (m === "distance") {
        distance = isPositive(time) && isPositive(pace) ? C.distanceFor(time, pace) : NaN;
        $("cDist").value = isDistance(distance) ? fmt(distance, 3) : "";
    } else {
        pace = isDistance(distance) && isPositive(time) ? C.paceFor(distance, time) : NaN;
        paceSec = pace;
        setPaceFields(pace);
        setSpeedField(pace);
    }

    const summary = $("cSummary");
    if (isDistance(distance) && isPositive(time) && isPositive(pace)) {
        summary.textContent = [
            `${fmt(distance, 3)} km`,
            C.formatDuration(time),
            `${C.formatPace(pace)} /km`,
            `${fmt(C.paceToSpeed(pace))} km/h`,
        ].join(" · ");
        renderSplits(distance, pace);
    } else {
        summary.textContent = hasBadInput(CALC_INPUTS[m]) ? t("invalid") : "";
        $("cSplitsBox").hidden = true;
        $("cSplits").replaceChildren();
    }
}

function onCalcInput(target) {
    if (target.name === "mode") {
        applyMode();
    } else if (target.id === "cPM" || target.id === "cPS") {
        paceSec = readPace();
        setSpeedField(paceSec);
    } else if (target.id === "cSpeed") {
        const speed = num("cSpeed");
        paceSec = isPositive(speed) ? C.speedToPace(speed) : NaN;
        setPaceFields(paceSec);
    }
    calc();
}

// ---------- race prediction (Riegel) ----------

function predict() {
    const distance = num("pDist");
    const time = timeOf(["pH", "pM", "pS"]);
    const valid = isDistance(distance) && isPositive(time);
    const rows = valid
        ? C.RACES.map(({ id, km }) => {
            const predicted = C.riegel(distance, time, km);
            return [raceLabel(id), C.formatDuration(predicted), C.formatPace(predicted / km)];
        })
        : [];
    renderTable($("pResult"), [t("race"), t("time"), "min/km"], rows);
    $("pNote").hidden = !(valid && C.RACES.some(({ km }) => {
        const ratio = km / distance;
        return ratio > RIEGEL_MAX_RATIO || ratio < 1 / RIEGEL_MAX_RATIO;
    }));
}

// ---------- VMA ----------

function vmaView() {
    const vma = num("vma");
    const valid = vma >= 1 && vma <= 30;

    const races = valid
        ? C.vmaPredictions(vma).map((r) => [
            raceLabel(r.id), C.formatDuration(r.time), C.formatPace(r.pace), fmt(r.speed, 1),
        ])
        : [];
    renderTable($("vmaRaces"), [t("race"), t("time"), "min/km", "km/h"], races);

    const zones = valid
        ? C.vmaZones(vma).map((z) => [
            z.id === "vma" ? t("vmaZone") : t(z.id),
            percentRange(z),
            `${C.formatPace(z.paceFrom)}–${C.formatPace(z.paceTo)}`,
            `${fmt(z.speedFrom, 1)}–${fmt(z.speedTo, 1)}`,
        ])
        : [];
    renderTable($("vmaZones"), [t("zone"), "% VMA", "min/km", "km/h"], zones);
}

// ---------- heart rate ----------

function hrView() {
    const maxHr = num("hr");
    const rows = maxHr >= 100 && maxHr <= 230
        ? C.hrZones(maxHr).map((z) => [t(z.id), percentRange(z), `${z.bpmFrom}–${z.bpmTo} bpm`])
        : [];
    renderTable($("hrZones"), [t("zone"), "% max", t("range")], rows);
}

// ---------- converter ----------

function convert() {
    const value = num("convValue");
    const unit = $("convUnit").value;
    const out = $("convResult");
    if (!(value >= 0)) {
        out.textContent = $("convValue").value.trim() === "" ? "" : t("invalid");
        return;
    }
    const km = unit === "km" ? value : unit === "m" ? value / 1000 : C.milesToKm(value);
    out.textContent = [
        ["km", km],
        ["m", km * 1000],
        ["mi", C.kmToMiles(km)],
    ]
        .filter(([key]) => key !== unit)
        .map(([key, v]) => `${fmt(v, 3)} ${key}`)
        .join(" · ");
}

// ---------- wiring ----------

const VIEWS = { calc, pred: predict, vmaCard: vmaView, hrCard: hrView, conv: convert };

function refreshAll() {
    Object.values(VIEWS).forEach((view) => view());
}

// Saves every field of the card, computed outputs included, so a reload restores what was shown.
function saveCard(card) {
    const values = {};
    card.querySelectorAll("input[type=text], select").forEach((el) => (values[el.id] = el.value));
    saveStore(values);
}

document.addEventListener("input", ({ target }) => {
    const card = target.closest("section");
    if (!card) return;
    if (target.name === "mode") saveStore({ mode: target.value });

    if (card.id === "calc") onCalcInput(target);
    else VIEWS[card.id]();
    saveCard(card);
});

document.addEventListener("click", (e) => {
    const preset = e.target.closest("[data-km]");
    if (!preset) return;
    $(preset.dataset.target).value = fmt(Number(preset.dataset.km), 4);
    $(preset.dataset.target).dispatchEvent(new Event("input", { bubbles: true }));
});

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const currentTheme = () =>
    document.documentElement.dataset.theme || (prefersDark.matches ? "dark" : "light");

function showTheme() {
    const dark = currentTheme() === "dark";
    $("themeBtn").textContent = dark ? "☀" : "☾";
    $("themeBtn").setAttribute("aria-label", t(dark ? "toLight" : "toDark"));
}

prefersDark.addEventListener("change", showTheme);

$("themeBtn").addEventListener("click", () => {
    const theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    saveStore({ theme });
    showTheme();
});

$("langBtn").addEventListener("click", () => {
    const lang = toggleLang();
    $("langBtn").textContent = lang === "en" ? "FR" : "EN";
    saveStore({ lang });
    showTheme();
    refreshAll();
});

function init() {
    const store = loadStore();
    initLang(store.lang);
    $("langBtn").textContent = getLang() === "en" ? "FR" : "EN";

    if (store.theme === "light" || store.theme === "dark") {
        document.documentElement.dataset.theme = store.theme;
    }
    showTheme();

    document.querySelectorAll("input[type=text], select").forEach((el) => {
        if (typeof store[el.id] === "string") el.value = store[el.id];
    });
    const radio = document.querySelector(`input[name="mode"][value="${store.mode}"]`);
    if (radio) radio.checked = true;

    paceSec = readPace();
    if (!isPositive(paceSec) && isPositive(num("cSpeed"))) {
        paceSec = C.speedToPace(num("cSpeed"));
        setPaceFields(paceSec);
    }
    applyMode();
    refreshAll();
}

init();
