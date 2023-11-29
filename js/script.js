const SECONDS_IN_MIN = 60;
const MINS_IN_HOUR = 60;
const METERS_IN_KM = 1000;
const SECONDS_IN_HOUR = 3600;
const KM_HOUR = 3.6;

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
    
    skResult.textContent = kilometersPerHours(meters, hours, minutes, seconds);
});

document.getElementsByName("btnTk")[0].addEventListener("click", () => {
    const tkMeters = document.getElementsByName("tkMeters")[0];
    const tkMinutes = document.getElementsByName("tkMinutes")[0];
    const tkSeconds = document.getElementsByName("tkSeconds")[0];
    const tkResult = document.getElementById("tkResult");

    const meters = tkMeters.value === "" ? 0 : parseInt(tkMeters.value);
    const minutes = tkMinutes.value === "" ? 0 : parseInt(tkMinutes.value);
    const seconds = tkSeconds.value === "" ? 0 : parseInt(tkSeconds.value);
    const timeInSecs = (minutes * SECONDS_IN_MIN + seconds) / METERS_IN_KM * meters;

    tkResult.textContent = secondsToHMS(timeInSecs);
});     

document.getElementsByName("btnDk")[0].addEventListener("click", () => {
    const dkMeters = document.getElementsByName("dkMeters")[0];
    const kmHeures = document.getElementsByName("kmHeures")[0];
    const dkResult = document.getElementById("dkResult");

    const meters = dkMeters.value === "" ? 0 : parseInt(dkMeters.value);
    const kmH = kmHeures.value === "" ? 0 : parseFloat(kmHeures.value);

    dkResult.textContent = timeByDistanceAndSpeed(meters, kmH)
});     

function getAfterFloatingPoint(n) {
    return n - Math.floor(n);
}

/**
 * @param {Number} seconds
 * @returns String 
 */
function secondsToHMS(seconds) {
    if (seconds < 0) {
        throw new Error("Seconds must be positive");
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours} h ${minutes} mins ${remainingSeconds} s`;
}

/**
 * @param {Number} meters 
 * @param {Number} hours 
 * @param {Number} minutes 
 * @param {Number} seconds 
 * @returns String
 */
function kilometersPerHours(meters, hours, minutes, seconds) {
    const divide = hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MIN + seconds;
    const speed = meters / (isFinite(divide) ? divide : 1) * KM_HOUR;
    return `${speed.toFixed(2)} km/h`;
}

/**
 * @param {Number} meters 
 * @param {Number} kmH 
 * @returns String
 */
function timeByDistanceAndSpeed(meters, kmH) {
    const time = meters / METERS_IN_KM / kmH;
    const afp = getAfterFloatingPoint(time);
    const h = Math.floor(time);
    const m = parseInt(afp * MINS_IN_HOUR);
    return `${h} h ${m} mins`;
}
