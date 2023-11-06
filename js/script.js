const SECONDS_IN_MIN = 60;
const SECONDS_IN_HOUR = 3600;
const MINS_IN_HOUR = 60;
const METERS_IN_KM = 1000
const KM_HOUR = 3600 / METERS_IN_KM;

// v = d / t
// d = v * t
// t = d / v

document.getElementsByName("btnSk")[0].addEventListener("click", () => {
    const skMeters = document.getElementsByName("skMeters")[0];
    const skHours = document.getElementsByName("skHours")[0];
    const skMinutes = document.getElementsByName("skMinutes")[0];
    const skSeconds = document.getElementsByName("skSeconds")[0];
    const skResult = document.getElementById("skResult");

    const meters = skMeters.value === "" ? 0 : parseInt(skMeters.value);
    const hours = skHours.value === "" ? 0 : parseInt(skHours.value);
    const minutes = skMinutes.value === "" ? 0 : parseInt(skMinutes.value);
    const seconds = skSeconds.value === "" ? 0 : parseInt(skSeconds.value);
    const div = hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MIN + seconds;
    const speed = meters / (isFinite(div) ? div : 1) * KM_HOUR;

    skResult.textContent = `${speed.toFixed(2)} km/h`;
});

document.getElementsByName("btnTk")[0].addEventListener("click", () => {
    const tkMeters = document.getElementsByName("tkMeters")[0];
    const tkMinutes = document.getElementsByName("tkMinutes")[0];
    const tkSeconds = document.getElementsByName("tkSeconds")[0];
    const tkResult = document.getElementById("tkResult");

    const meters = tkMeters.value === "" ? 0 : parseInt(tkMeters.value);
    const minutes = tkMinutes.value === "" ? 0 : parseInt(tkMinutes.value);
    const seconds = tkSeconds.value === "" ? 0 : parseInt(tkSeconds.value);

    const km = meters / METERS_IN_KM;
    const s = km * seconds;
    const m = km * minutes + s / SECONDS_IN_MIN;
    const h = parseInt(m / MINS_IN_HOUR);

    tkResult.textContent = `${h} h ${parseInt(m % SECONDS_IN_MIN)} mins ${parseInt(s % SECONDS_IN_MIN)} s`;
});     

document.getElementsByName("btnDk")[0].addEventListener("click", () => {
    const dkMeters = document.getElementsByName("dkMeters")[0];
    const kmHeures = document.getElementsByName("kmHeures")[0];
    const dkResult = document.getElementById("dkResult");

    const meter = dkMeters.value === "" ? 0 : parseInt(dkMeters.value);
    const kmH = kmHeures.value === "" ? 0 : parseFloat(kmHeures.value);
    const time = meter / METERS_IN_KM / kmH;
    
    const afp = getAfterFloatingPoint(time);
    const h = parseInt(time);
    const m = parseInt(afp * MINS_IN_HOUR);

    dkResult.textContent = `${h} h ${m} mins`;
});     

function getAfterFloatingPoint(n) {
    return n - Math.floor(n);
}
