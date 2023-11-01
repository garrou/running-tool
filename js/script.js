const SECONDS_IN_MIN = 60;
const SECONDS_IN_HOUR = 360;
const METER_KM = 1000
const KM_HOUR = 3600 / METER_KM;

document.getElementsByName("btnSk")[0].addEventListener("click", () => {
    const skMeters = document.getElementsByName("skMeters")[0];
    const skHours = document.getElementsByName("skHours")[0];
    const skMinutes = document.getElementsByName("skMinutes")[0];
    const skSeconds = document.getElementsByName("skSeconds")[0];
    const skResult = document.getElementById("skResult");

    const meter = skMeters.value === "" ? 0 : parseInt(skMeters.value);
    const hours = skHours.value === "" ? 0 : parseInt(skHours.value);
    const minutes = skMinutes.value === "" ? 0 : parseInt(skMinutes.value);
    const seconds = skSeconds.value === "" ? 0 : parseInt(skSeconds.value);
    const div = hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MIN + seconds
    const speed = meter / (isFinite(div) ? div : 1) * KM_HOUR

    skResult.textContent = `${speed.toFixed(2)} km/h`;
});

document.getElementsByName("btnTk")[0].addEventListener("click", () => {
    const tkMeters = document.getElementsByName("tkMeters")[0];
    const tkMinutes = document.getElementsByName("tkMinutes")[0];
    const tkSeconds = document.getElementsByName("tkSeconds")[0];
    const tkResult = document.getElementById("tkResult");

    const meter = tkMeters.value === "" ? 0 : parseInt(tkMeters.value);
    const minutes = tkMinutes.value === "" ? 0 : parseInt(tkMinutes.value);
    const seconds = tkSeconds.value === "" ? 0 : parseInt(tkSeconds.value);

    const km = meter / METER_KM;
    const s = km * seconds;
    const m = parseInt(km * minutes) + parseInt(s / SECONDS_IN_MIN);
    const h = parseInt(m / SECONDS_IN_HOUR);
    const time = `${h} h ${m} mins ${parseInt(s % SECONDS_IN_MIN)} s`

    tkResult.textContent = time;
});     