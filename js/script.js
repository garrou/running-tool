const SECONDS_IN_MIN = 60;
const MINS_IN_HOUR = 60;
const METERS_IN_KM = 1000;
const SECONDS_IN_HOUR = 3600;
const KM_HOUR = 3.6;
const KM_IN_MILE = 0.621371192;
const ERROR_MESSAGE = "Bad values";

// v = d / t
// d = v * t
// t = d / v

document.getElementById("btnTtVma").addEventListener("click", () => {
    const ttVma = document.getElementById("ttVma");
    const ttVmaResult = document.getElementById("ttVmaResult");

    const vma = new Value(toNum(ttVma.value), 0, 30);

    if (!isValidLimits(vma)) {
        const entry = document.createElement('li');
        entry.appendChild(document.createTextNode(ERROR_MESSAGE));
        ttVmaResult.appendChild(entry);
        return;
    }
    ttVmaResult.replaceChildren()
    const results = theoreticalTimeByVma(vma.value);

    results.forEach((c) => {
        const entry = document.createElement('li');
        entry.appendChild(document.createTextNode(c));
        ttVmaResult.appendChild(entry);
    });
});   

document.getElementById("btnMk").addEventListener("click", () => {
    const mkMeters = document.getElementById("mkMeters");
    const mkResult = document.getElementById("mkResult");

    const meters = new Value(toNum(mkMeters.value), 0, Number.MAX_SAFE_INTEGER);

    mkResult.textContent = isValidLimits(meters) 
        ? kilometersAndMiles(meters.value)
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

    tkResult.textContent = isValidLimits(meters, minutes, seconds) 
        ? timeByDistanceAndMinKm(meters.value, minutes.value, seconds.value) 
        : ERROR_MESSAGE;
});     

document.getElementById("btnDk").addEventListener("click", () => {
    const dkMeters = document.getElementById("dkMeters");
    const kmHours = document.getElementById("kmHours");
    const dkResult = document.getElementById("dkResult");

    const meters = new Value(toNum(dkMeters.value), 0, Number.MAX_SAFE_INTEGER);
    const kmH = new Value(toNum(kmHours.value, true), 0, Number.MAX_SAFE_INTEGER);

    dkResult.textContent = isValidLimits(meters, kmH) 
        ? timeByDistanceAndKmH(meters.value, kmH.value)
        : ERROR_MESSAGE;
});     

document.getElementById("btnDtS").addEventListener("click", () => {
    const tsTimeMins = document.getElementById("tsTimeMins");
    const tsTimeSecs = document.getElementById("tsTimeSecs");
    const tsMins = document.getElementById("tsMins");
    const tsSecs = document.getElementById("tsSecs");
    const dTsResult = document.getElementById("dTsResult");

    const timeMins = new Value(toNum(tsTimeMins.value), 0, Number.MAX_SAFE_INTEGER);
    const timeSecs = new Value(toNum(tsTimeSecs.value), 0, 59);
    const mins = new Value(toNum(tsMins.value), 0, Number.MAX_SAFE_INTEGER);
    const secs = new Value(toNum(tsSecs.value), 0, 59);

    dTsResult.textContent = isValidLimits(timeMins, timeSecs, mins, secs) 
        ? distanceByTimeAndSpeed(timeMins.value, timeSecs.value, mins.value, secs.value)
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
 * @param  {...Value} values 
 * @returns Boolean
 */
function isValidLimits(...values) {
    return !values.find((val) => val.value < val.min || val.value > val.max);
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
 * @param {number} meters 
 * @param {number} minutes 
 * @param {number} seconds 
 * @returns number
 */
function convertInSeconds(meters, minutes, seconds) {
    return (minutes * SECONDS_IN_MIN + seconds) * (meters / METERS_IN_KM);
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
 * @param {number} minutes
 * @param {number} seconds
 * @returns string 
 */
function timeByDistanceAndMinKm(meters, minutes, seconds) {
    const timeInSecs = convertInSeconds(meters, minutes, seconds);
    const h = Math.floor(timeInSecs / SECONDS_IN_HOUR);
    const m = Math.floor(timeInSecs % SECONDS_IN_HOUR / MINS_IN_HOUR);
    const s = Math.floor(timeInSecs % SECONDS_IN_MIN);
    const speed = kilometersPerHours(meters, h, m, s);
    return `${h} h ${m} mins ${s} s - ${speed}`;
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
    const result = `${speed.toFixed(3)} km/h`;
    return result + (displayMinKm ? ` - ${kmhToMinKm(speed)}` : ""); 
}

/**
 * @param {number} kmH 
 * @returns string
 */
function kmhToMinKm(kmH) {
    const time = MINS_IN_HOUR / kmH;
    const seconds = Math.floor(getAfterFloatingPoint(time) * SECONDS_IN_MIN);
    const min = Math.floor(time);
    return `${min}:${seconds < 10 ? "0" : ""}${seconds} /km`;
}

/**
 * @param {number} meters 
 * @param {number} kmH 
 * @returns string
 */
function timeByDistanceAndKmH(meters, kmH) {
    const speedMeterSec = kmH * METERS_IN_KM / SECONDS_IN_HOUR;
    const time = Math.ceil(meters / speedMeterSec);
    const h = Math.floor(time / SECONDS_IN_HOUR);
    const m = Math.floor(time % SECONDS_IN_HOUR / MINS_IN_HOUR);
    const s = Math.floor(time % SECONDS_IN_MIN);
    const minKm = kmhToMinKm(kmH);
    return `${h} h ${m} mins ${s} s - ${minKm}`;
}

/**
 * @param {number} meters 
 * @returns string
 */
function kilometersAndMiles(meters) {
    const km = meters / METERS_IN_KM;
    const miles = (km * KM_IN_MILE).toFixed(3);
    return `${km} km / ${miles} miles`;
}

/**
 * @param {number} mins
 * @param {number} secs 
 * @param {number} minsKm 
 * @param {number} secsKm
 * @returns string
 */
function distanceByTimeAndSpeed(mins, secs, minsKm, secsKm) {
    const timeInSecs = mins * SECONDS_IN_MIN + secs;
    const kmPerSec = minsKm * SECONDS_IN_MIN + secsKm;
    const speedMeterBySec = METERS_IN_KM / kmPerSec;
    const distance = (timeInSecs * speedMeterBySec).toFixed(3);
    return distance > METERS_IN_KM 
        ? `${(distance / METERS_IN_KM).toFixed(3)} km` 
        : `${distance} m`;
}

/**
 * @param {number} vma 
 * @returns Array<string>
 */
function theoreticalTimeByVma(vma) {
    const km3 = timeByDistanceAndKmH(3000, vma * 0.95);
    const km5 = timeByDistanceAndKmH(5000, vma * 0.92);
    const km10 = timeByDistanceAndKmH(10000, vma * 0.9);
    const km21 = timeByDistanceAndKmH(21100, vma * 0.85);
    const km42 = timeByDistanceAndKmH(42195, vma * 0.8);
    return [
        `3km : ${km3}`,
        `5km : ${km5}`,
        `10km : ${km10}`,
        `HM : ${km21}`,
        `M : ${km42}`,
    ]; 
}