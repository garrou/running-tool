const SECONDS_IN_MIN = 60;
const MINS_IN_HOUR = 60;
const METERS_IN_KM = 1000;
const SECONDS_IN_HOUR = 3600;
const KM_HOUR = 3.6;
const KM_IN_MILE = 0.621371;
const ERROR_MESSAGE = "Bad values";

// v = d / t
// d = v * t
// t = d / v

document.getElementById("btnMk").addEventListener("click", () => {
    const mkMeters = document.getElementById("mkMeters");
    const mkResult = document.getElementById("mkResult");

    const meters = new Value(toNum(mkMeters.value), 0, Number.MAX_SAFE_INTEGER);

    mkResult.textContent = isValidLimits(meters) 
        ? kilometersAndMiles(meters)
        : ERROR_MESSAGE;
});     

document.getElementById("btnSk").addEventListener("click", () => {
    const skMeters = document.getElementById("skMeters");
    const skHours = document.getElementById("skHours");
    const skMinutes = document.getElementById("skMinutes");
    const skSeconds = document.getElementById("skSeconds");
    const skResult = document.getElementById("skResult");

    const meters = new Value(toNum(skMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const hours = new Value(toNum(skHours.value), 0, Number.MAX_SAFE_INTEGER);
    const minutes = new Value(toNum(skMinutes.value), 0, 59);
    const seconds = new Value(toNum(skSeconds.value), 0, 59);

    skResult.textContent = isValidLimits(meters, hours, minutes, seconds)
        ? kilometersPerHours(meters.value, hours.value, minutes.value, seconds.value, true)
        : ERROR_MESSAGE;
});

document.getElementById("btnTk").addEventListener("click", () => {
    const tkMeters = document.getElementById("tkMeters");
    const tkMinutes = document.getElementById("tkMinutes");
    const tkSeconds = document.getElementById("tkSeconds");
    const tkResult = document.getElementById("tkResult");

    const meters = new Value(toNum(tkMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const minutes = new Value(toNum(tkMinutes.value), 0, 59);
    const seconds = new Value(toNum(tkSeconds.value), 0, 59);
    const timeInSecs = convertInSeconds(meters, minutes, seconds);

    tkResult.textContent = isValidLimits(meters, minutes, seconds) 
        ? secondsToHMS(meters.value, timeInSecs) 
        : ERROR_MESSAGE;
});     

document.getElementById("btnDk").addEventListener("click", () => {
    const dkMeters = document.getElementById("dkMeters");
    const kmHours = document.getElementById("kmHours");
    const dkResult = document.getElementById("dkResult");

    const meters = new Value(toNum(dkMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const kmH = new Value(toNum(kmHours.value, true), 0, Number.MAX_SAFE_INTEGER);

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
 * @param {string} val
 * @param {boolean} float
 */
function toNum(val, float = false) {
    return val === "" || isNaN(val) 
        ? 0
        : float ? parseFloat(val.replaceAll(",", ".")) : parseInt(val);
}

/**
 * @param {Value} meters 
 * @param {Value} minutes 
 * @param {Value} seconds 
 * @returns number
 */
function convertInSeconds(meters, minutes, seconds) {
    return (minutes.value * SECONDS_IN_MIN + seconds.value) * (meters.value / METERS_IN_KM);
}

/**
 * @param  {...Value} values 
 * @returns Boolean
 */
function isValidLimits(...values) {
    return !values.find((val) => val.value < val.min || val.value > val.max);
}

/**
 * @param {number} n 
 * @returns number
 */
function getAfterFloatingPoint(n) {
    return n - Math.floor(n);
}

/**
 * @param {number} meters
 * @param {number} seconds
 * @returns string 
 */
function secondsToHMS(meters, seconds) {
    if (seconds < 0) {
        throw new Error("Seconds must be positive");
    }
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    const temp = (seconds % SECONDS_IN_HOUR) / MINS_IN_HOUR;
    const minutes = Math.floor(temp);
    const remainingSeconds = Math.ceil(getAfterFloatingPoint(temp) * 100);
    const speed = kilometersPerHours(meters, hours, minutes, remainingSeconds);
    return `${hours} h ${minutes} mins ${remainingSeconds} s - ${speed}`;
}

/**
 * @param {number} meters
 * @param {number} hours 
 * @param {number} minutes 
 * @param {number} seconds 
 * @param {boolean} displayMinKm
 * @returns string
 */
function kilometersPerHours(meters, hours, minutes, seconds, displayMinKm = false) {
    const divide = hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MIN + seconds;
    const speed = meters / (isFinite(divide) ? divide : 1) * KM_HOUR;
    const result = `${speed.toFixed(2)} km/h`;
    return result + (displayMinKm ? ` - ${kmhToMinKm(speed)}` : ""); 
}

/**
 * @param {number} kmH 
 * @returns string
 */
function kmhToMinKm(kmH) {
    const time = MINS_IN_HOUR / kmH;
    const seconds = Math.floor(getAfterFloatingPoint(time) * SECONDS_IN_MIN);
    const secFormat = seconds < 10 ? "0" : "";
    const min = Math.floor(time);
    return `${min}:${secFormat}${seconds} /km`;
}

/**
 * @param {Value} meters 
 * @param {Value} kmH 
 * @returns string
 */
function timeByDistanceAndSpeed(meters, kmH) {
    const time = meters.value / METERS_IN_KM / kmH.value;
    const h = Math.floor(time);
    const temp = getAfterFloatingPoint(time) * MINS_IN_HOUR;
    const s = parseInt(getAfterFloatingPoint(temp) * SECONDS_IN_MIN);
    const m = parseInt(temp);
    const minKm = kmhToMinKm(kmH.value);
    return `${h} h ${m} mins ${s} s - ${minKm}`;
}

/**
 * @param {Value} meters 
 * @returns string
 */
function kilometersAndMiles(meters) {
    const km = meters.value / METERS_IN_KM;
    const miles = (km * KM_IN_MILE).toFixed(3);
    return `${km} km / ${miles} miles`;
}