const SECONDS_IN_MIN = 60;
const MINS_IN_HOUR = 60;
const METERS_IN_KM = 1000;
const SECONDS_IN_HOUR = 3600;
const KM_HOUR = 3.6;
const ERROR_MESSAGE = "Bad values";

// v = d / t
// d = v * t
// t = d / v

document.getElementsByName("btnSk")[0].addEventListener("click", () => {
    const skMeters = document.getElementsByName("skMeters")[0];
    const skHours = document.getElementsByName("skHours")[0];
    const skMinutes = document.getElementsByName("skMinutes")[0];
    const skSeconds = document.getElementsByName("skSeconds")[0];
    const skResult = document.getElementById("skResult");

    const meters = new Value(skMeters.value === "" ? 0 : parseInt(skMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const hours = new Value(skHours.value === "" ? 0 : parseInt(skHours.value), 0, 23);
    const minutes = new Value(skMinutes.value === "" ? 0 : parseInt(skMinutes.value), 0, 59);
    const seconds = new Value(skSeconds.value === "" ? 0 : parseInt(skSeconds.value), 0, 59);
    
    skResult.textContent = isValidLimits(meters, hours, minutes, seconds)
        ? kilometersPerHours(meters, hours, minutes, seconds)
        : ERROR_MESSAGE;
});

document.getElementsByName("btnTk")[0].addEventListener("click", () => {
    const tkMeters = document.getElementsByName("tkMeters")[0];
    const tkMinutes = document.getElementsByName("tkMinutes")[0];
    const tkSeconds = document.getElementsByName("tkSeconds")[0];
    const tkResult = document.getElementById("tkResult");

    const meters = new Value(tkMeters.value === "" ? 0 : parseInt(tkMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const minutes = new Value(tkMinutes.value === "" ? 0 : parseInt(tkMinutes.value), 0, 59);
    const seconds = new Value(tkSeconds.value === "" ? 0 : parseInt(tkSeconds.value), 0, 59);
    const timeInSecs = convertInSeconds(meters, minutes, seconds);

    tkResult.textContent = isValidLimits(meters, minutes, seconds) 
        ? secondsToHMS(timeInSecs) 
        : ERROR_MESSAGE;
});     

document.getElementsByName("btnDk")[0].addEventListener("click", () => {
    const dkMeters = document.getElementsByName("dkMeters")[0];
    const kmHeures = document.getElementsByName("kmHeures")[0];
    const dkResult = document.getElementById("dkResult");

    const meters = new Value(dkMeters.value === "" ? 0 : parseInt(dkMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const kmH = new Value(kmHeures.value === "" ? 0 : parseFloat(kmHeures.value.replaceAll(",", ".")), 0, Number.MAX_SAFE_INTEGER);

    dkResult.textContent = isValidLimits(meters, kmH) 
        ? timeByDistanceAndSpeed(meters, kmH)
        : ERROR_MESSAGE;
});     

class Value {

    constructor(value, min, max) {
        this.value = value;
        this.min = min;
        this.max = max;
    }
}

/**
 * @param {Value} meters 
 * @param {Value} minutes 
 * @param {Value} seconds 
 * @returns Number
 */
function convertInSeconds(meters, minutes, seconds) {
    return (minutes.value * SECONDS_IN_MIN + seconds.value) / METERS_IN_KM * meters.value;
}

/**
 * @param  {...Value} values 
 * @returns Boolean
 */
function isValidLimits(...values) {
    return !values.find((val) => val.value < val.min || val.value > val.max);
}

/**
 * @param {Number} n 
 * @returns Number
 */
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
 * @param {Value} meters 
 * @param {Value} hours 
 * @param {Value} minutes 
 * @param {Value} seconds 
 * @returns String
 */
function kilometersPerHours(meters, hours, minutes, seconds) {
    const divide = hours.value * SECONDS_IN_HOUR + minutes.value * SECONDS_IN_MIN + seconds.value;
    const speed = meters.value / (isFinite(divide) ? divide : 1) * KM_HOUR;
    return `${speed.toFixed(2)} km/h`;
}

/**
 * @param {Value} meters 
 * @param {Value} kmH 
 * @returns String
 */
function timeByDistanceAndSpeed(meters, kmH) {
    const time = meters.value / METERS_IN_KM / kmH.value;
    const afp = getAfterFloatingPoint(time);
    const h = Math.floor(time);
    const m = parseInt(afp * MINS_IN_HOUR);
    return `${h} h ${m} mins`;
}
