const I18n = (() => {
    const DICT = {
        en: {
            appTitle: "Running tool",
            calcTitle: "Time, distance & pace",
            calcHelp: "Choose what to compute and fill in the other fields.",
            modeTime: "Time",
            modeDistance: "Distance",
            modePace: "Pace / speed",
            distance: "Distance (km)",
            time: "Time",
            hours: "h",
            minutes: "min",
            seconds: "s",
            pace: "Pace (min/km)",
            speed: "Speed (km/h)",
            splitsTitle: "Splits at even pace",
            kmCol: "Km",
            splitCol: "Split",
            totalCol: "Total",
            predTitle: "Race prediction by formula",
            predHelp: "Enter a recent performance to estimate other distances.",
            vmaTitle: "VMA (MAS)",
            vmaLabel: "VMA (km/h)",
            vmaRaces: "Theoretical race times",
            vmaZones: "Training zones",
            hrTitle: "Heart rate zones",
            hrLabel: "Max heart rate (bpm)",
            convTitle: "Distance converter",
            value: "Value",
            invalid: "Please check the values.",
            halfMarathon: "Half marathon",
            marathon: "Marathon",
            race: "Race",
            zone: "Zone",
            range: "Range",
            recovery: "Recovery",
            endurance: "Endurance",
            threshold: "Threshold",
            vmaZone: "VMA",
            z1: "Z1 Very light",
            z2: "Z2 Light",
            z3: "Z3 Moderate",
            z4: "Z4 Hard",
            z5: "Z5 Maximum",
            indicative: "Indicative values only.",
            toLight: "Switch to light theme",
            toDark: "Switch to dark theme",
            riegelNote: "Predictions far from the reference distance are less reliable.",
            implausible: "Enter a realistic performance (1–100 km, 2:00–12:00 /km).",
            unit: "Unit",
            aboutFormulas: "About the formulas",
            vdotDesc: "Performance index from the oxygen cost of the speed and the share of VO₂max sustainable for that duration; the same VDOT is assumed on every distance.",
        },
        fr: {
            appTitle: "Outil de course",
            calcTitle: "Temps, distance et allure",
            calcHelp: "Choisissez ce qu'il faut calculer et remplissez les autres champs.",
            modeTime: "Temps",
            modeDistance: "Distance",
            modePace: "Allure / vitesse",
            distance: "Distance (km)",
            time: "Temps",
            hours: "h",
            minutes: "min",
            seconds: "s",
            pace: "Allure (min/km)",
            speed: "Vitesse (km/h)",
            splitsTitle: "Passages à allure constante",
            kmCol: "Km",
            splitCol: "Split",
            totalCol: "Total",
            predTitle: "Prédiction de temps par formule",
            predHelp: "Saisissez une performance récente pour estimer d'autres distances.",
            vmaTitle: "VMA",
            vmaLabel: "VMA (km/h)",
            vmaRaces: "Temps théoriques",
            vmaZones: "Zones d'entraînement",
            hrTitle: "Zones de fréquence cardiaque",
            hrLabel: "FC max (bpm)",
            convTitle: "Convertisseur de distance",
            value: "Valeur",
            invalid: "Vérifiez les valeurs saisies.",
            halfMarathon: "Semi-marathon",
            marathon: "Marathon",
            race: "Course",
            zone: "Zone",
            range: "Plage",
            recovery: "Récupération",
            endurance: "Endurance",
            threshold: "Seuil",
            vmaZone: "VMA",
            z1: "Z1 Très facile",
            z2: "Z2 Facile",
            z3: "Z3 Modéré",
            z4: "Z4 Difficile",
            z5: "Z5 Maximum",
            indicative: "Valeurs indicatives uniquement.",
            toLight: "Passer au thème clair",
            toDark: "Passer au thème sombre",
            riegelNote: "Les prédictions très éloignées de la distance de référence sont moins fiables.",
            implausible: "Saisissez une performance réaliste (1 à 100 km, 2:00 à 12:00 /km).",
            unit: "Unité",
            aboutFormulas: "À propos des formules",
            vdotDesc: "Indice de performance calculé à partir du coût en oxygène de la vitesse et de la part de VO₂max tenable pour cette durée ; le même VDOT est supposé sur toutes les distances.",
        },
    };

    let lang = "en";

    const getLang = () => lang;

    function t(key) {
        return DICT[lang][key] ?? DICT.en[key] ?? key;
    }

    /** Picks the stored language, else the browser's, and applies it to the DOM. */
    function initLang(stored) {
        const browser = (navigator.language || "en").slice(0, 2);
        const known = (code) => Object.prototype.hasOwnProperty.call(DICT, code);
        setLang(known(stored) ? stored : known(browser) ? browser : "en");
    }

    function toggleLang() {
        setLang(lang === "en" ? "fr" : "en");
        return lang;
    }

    function setLang(next) {
        lang = next;
        document.documentElement.lang = lang;
        document.title = t("appTitle");
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = t(el.dataset.i18n);
        });
    }

    return { t, getLang, initLang, toggleLang };
})();
