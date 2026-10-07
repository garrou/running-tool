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
            predTitle: "Race prediction (Riegel)",
            predHelp: "Enter a recent performance to estimate other distances.",
            recentRace: "Recent performance",
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
            predTitle: "Prédiction de temps (Riegel)",
            predHelp: "Saisissez une performance récente pour estimer d'autres distances.",
            recentRace: "Performance récente",
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
        setLang(stored in DICT ? stored : browser in DICT ? browser : "en");
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
