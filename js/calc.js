// Pure calculation helpers: no DOM, no side effects (easy to test with node).
const C = (() => {

    const SECONDS_IN_MIN = 60;
    const SECONDS_IN_HOUR = 3600;
    const KM_IN_MILE = 1.609344;
    const RIEGEL_EXPONENT = 1.06;

    const RACES = [
        { id: "3k", km: 3 },
        { id: "5k", km: 5 },
        { id: "10k", km: 10 },
        { id: "hm", km: 21.0975 },
        { id: "m", km: 42.195 },
    ];

    // Share of VMA sustainable over each race distance.
    const VMA_RACE_RATIO = { "3k": 0.95, "5k": 0.92, "10k": 0.88, hm: 0.85, m: 0.80 };

    const VMA_ZONES = [
        { id: "recovery", from: 0.60, to: 0.70 },
        { id: "endurance", from: 0.70, to: 0.80 },
        { id: "threshold", from: 0.80, to: 0.90 },
        { id: "vma", from: 0.90, to: 1.00 },
    ];

    const HR_ZONES = [
        { id: "z1", from: 0.50, to: 0.60 },
        { id: "z2", from: 0.60, to: 0.70 },
        { id: "z3", from: 0.70, to: 0.80 },
        { id: "z4", from: 0.80, to: 0.90 },
        { id: "z5", from: 0.90, to: 1.00 },
    ];

    /**
     * Parses a user-typed number, accepting "," as decimal separator.
     * @param {string} str
     * @returns {number} NaN when blank or invalid
     */
    function parseNum(str) {
        const s = String(str ?? "").trim().replace(",", ".");
        if (s === "") return NaN;
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
    }

    /** Like parseNum but a blank field counts as 0 (invalid text stays NaN). */
    function parseNumOrZero(str) {
        return String(str ?? "").trim() === "" ? 0 : parseNum(str);
    }

    /** @returns {number} total seconds, NaN if any part is invalid or negative */
    function toSeconds(h, m, s) {
        const parts = [h, m, s];
        if (parts.some((p) => !Number.isFinite(p) || p < 0)) return NaN;
        return h * SECONDS_IN_HOUR + m * SECONDS_IN_MIN + s;
    }

    /** Splits seconds (rounded to the nearest second) into h / m / s. */
    function splitHms(totalSeconds) {
        const total = Math.round(totalSeconds);
        return {
            h: Math.floor(total / SECONDS_IN_HOUR),
            m: Math.floor((total % SECONDS_IN_HOUR) / SECONDS_IN_MIN),
            s: total % SECONDS_IN_MIN,
        };
    }

    const pad2 = (n) => String(n).padStart(2, "0");

    /** "h:mm:ss", or "m:ss" under an hour. */
    function formatDuration(totalSeconds) {
        const { h, m, s } = splitHms(totalSeconds);
        return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
    }

    /** Pace in seconds/km to "m:ss". */
    function formatPace(secPerKm) {
        const { h, m, s } = splitHms(secPerKm);
        return `${h * 60 + m}:${pad2(s)}`;
    }

    const paceToSpeed = (secPerKm) => SECONDS_IN_HOUR / secPerKm;
    const speedToPace = (kmh) => SECONDS_IN_HOUR / kmh;

    // v = d / t   |   d = v * t   |   t = d / v
    const timeFor = (km, secPerKm) => km * secPerKm;
    const distanceFor = (seconds, secPerKm) => seconds / secPerKm;
    const paceFor = (km, seconds) => seconds / km;

    const kmToMiles = (km) => km / KM_IN_MILE;
    const milesToKm = (miles) => miles * KM_IN_MILE;

    /** Riegel's formula: time over `km2` from a time `t1` over `km1`. */
    function riegel(km1, t1, km2) {
        return t1 * Math.pow(km2 / km1, RIEGEL_EXPONENT);
    }

    /** Theoretical race times from a VMA (km/h). */
    function vmaPredictions(vma) {
        return RACES.map(({ id, km }) => {
            const speed = vma * VMA_RACE_RATIO[id];
            return { id, km, speed, pace: speedToPace(speed), time: (km / speed) * SECONDS_IN_HOUR };
        });
    }

    /** Pace / speed ranges for each training zone (slow end first). */
    function vmaZones(vma) {
        return VMA_ZONES.map(({ id, from, to }) => ({
            id, from, to,
            speedFrom: vma * from, speedTo: vma * to,
            paceFrom: speedToPace(vma * from), paceTo: speedToPace(vma * to),
        }));
    }

    function hrZones(maxHr) {
        return HR_ZONES.map(({ id, from, to }) => ({
            id, from, to, bpmFrom: Math.round(maxHr * from), bpmTo: Math.round(maxHr * to),
        }));
    }

    /**
     * Even-pace splits: one entry per full km plus the remaining distance.
     * @returns {{km: number, split: number, total: number}[]}
     */
    function splits(distanceKm, secPerKm) {
        const rows = [];
        const full = Math.floor(distanceKm + 1e-9);
        for (let i = 1; i <= full; i++) {
            rows.push({ km: i, split: secPerKm, total: i * secPerKm });
        }
        const rest = distanceKm - full;
        if (rest > 1e-6) {
            rows.push({ km: distanceKm, split: rest * secPerKm, total: distanceKm * secPerKm });
        }
        return rows;
    }

    return { SECONDS_IN_MIN, SECONDS_IN_HOUR, KM_IN_MILE, RIEGEL_EXPONENT, RACES, VMA_RACE_RATIO, VMA_ZONES, HR_ZONES, parseNum, parseNumOrZero, toSeconds, splitHms, formatDuration, formatPace, paceToSpeed, speedToPace, timeFor, distanceFor, paceFor, kmToMiles, milesToKm, riegel, vmaPredictions, vmaZones, hrZones, splits };
})();
