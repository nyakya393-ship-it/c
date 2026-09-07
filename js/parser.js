// =========================
// Parser
// Horagai Bay / Battle Data
// =========================

(function () {

    "use strict";


    // ========================================
    // Utility
    // ========================================

    function isObject(value) {
        return value !== null &&
            typeof value === "object" &&
            !Array.isArray(value);
    }


    function isArray(value) {
        return Array.isArray(value);
    }


    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function safeString(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value);
    }


    function clone(value) {

        if (value === null || value === undefined) {
            return value;
        }

        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return value;
        }
    }


    // ========================================
    // Weapon
    // ========================================

    function parseWeapon(weapon) {

        if (!isObject(weapon)) {
            return {
                id: "",
                name: "",
                image: "",
                image3d: "",
                image2d: "",
                thumbnail: "",
                subWeapon: null,
                specialWeapon: null,
                raw: weapon || null
            };
        }


        const special = isObject(weapon.specialWeapon)
            ? {
                id: safeString(weapon.specialWeapon.id),
                name: safeString(weapon.specialWeapon.name),
                image: weapon.specialWeapon.image
                    ? safeString(weapon.specialWeapon.image.url)
                    : "",
                raw: clone(weapon.specialWeapon)
            }
            : null;


        const sub = isObject(weapon.subWeapon)
            ? {
                id: safeString(weapon.subWeapon.id),
                name: safeString(weapon.subWeapon.name),
                image: weapon.subWeapon.image
                    ? safeString(weapon.subWeapon.image.url)
                    : "",
                raw: clone(weapon.subWeapon)
            }
            : null;


        return {

            id: safeString(weapon.id),

            name: safeString(weapon.name),

            image: weapon.image
                ? safeString(weapon.image.url)
                : "",

            image3d: weapon.image3d
                ? safeString(weapon.image3d.url)
                : "",

            image2d: weapon.image2d
                ? safeString(weapon.image2d.url)
                : "",

            thumbnail: weapon.thumbnail
                ? safeString(weapon.thumbnail.url)
                : "",

            subWeapon: sub,

            specialWeapon: special,

            raw: clone(weapon)
        };
    }


    // ========================================
    // Player
    // ========================================

    function parsePlayer(player) {

        if (!isObject(player)) {
            return {
                id: "",
                name: "",
                callSign: "",
                byname: "",
                isMyself: false,
                species: "",
                weapon: parseWeapon(null),
                paint: 0,
                result: {
                    kill: 0,
                    death: 0,
                    assist: 0,
                    special: 0,
                    noroshiTry: 0
                },
                crown: null,
                festDragonCert: null,
                nameId: "",
                nameplate: null,
                gear: {
                    headGear: null,
                    clothingGear: null,
                    shoesGear: null
                },
                raw: player || null
            };
        }


        const result = isObject(player.result)
            ? player.result
            : {};


        return {

            id: safeString(player.id),

            name: safeString(player.name),

            callSign: safeString(player.callSign),

            byname: safeString(player.byname),

            isMyself: player.isMyself === true,

            species: safeString(player.species),

            nameId: safeString(player.nameId),

            nameplate: clone(player.nameplate),

            weapon: parseWeapon(player.weapon),

            paint: safeNumber(player.paint),

            result: {

                kill: safeNumber(result.kill),

                death: safeNumber(result.death),

                assist: safeNumber(result.assist),

                special: safeNumber(result.special),

                noroshiTry: safeNumber(result.noroshiTry)
            },

            crown: clone(player.crown),

            festDragonCert: clone(player.festDragonCert),

            gear: {

                headGear: clone(player.headGear),

                clothingGear: clone(player.clothingGear),

                shoesGear: clone(player.shoesGear)
            },

            raw: clone(player)
        };
    }


    // ========================================
    // Team Result
    // ========================================

    function parseTeamResult(result) {

        if (!isObject(result)) {
            return {
                paintRatio: 0,
                score: 0,
                noroshi: 0,
                raw: result || null
            };
        }


        return {

            paintRatio: safeNumber(result.paintRatio),

            score: safeNumber(result.score),

            noroshi: safeNumber(result.noroshi),

            raw: clone(result)
        };
    }


    // ========================================
    // Team
    // ========================================

    function parseTeam(team) {

        if (!isObject(team)) {
            return {
                color: null,
                result: parseTeamResult(null),
                tricolorRole: "",
                festTeamName: "",
                festUniformBonusRate: 0,
                judgement: "",
                players: [],
                order: 0,
                festStreakWinCount: 0,
                festUniformName: "",
                raw: team || null
            };
        }


        const players = isArray(team.players)
            ? team.players.map(parsePlayer)
            : [];


        return {

            color: clone(team.color),

            result: parseTeamResult(team.result),

            tricolorRole: safeString(team.tricolorRole),

            festTeamName: safeString(team.festTeamName),

            festUniformBonusRate:
                safeNumber(team.festUniformBonusRate),

            judgement: safeString(team.judgement),

            players: players,

            order: safeNumber(team.order),

            festStreakWinCount:
                safeNumber(team.festStreakWinCount),

            festUniformName:
                safeString(team.festUniformName),

            raw: clone(team)
        };
    }


    // ========================================
    // Stage
    // ========================================

    function parseStage(stage) {

        if (!isObject(stage)) {
            return {
                id: "",
                name: "",
                image: "",
                raw: stage || null
            };
        }


        return {

            id: safeString(stage.id),

            name: safeString(stage.name),

            image: stage.image
                ? safeString(stage.image.url)
                : "",

            raw: clone(stage)
        };
    }


    // ========================================
    // Rule
    // ========================================

    function parseRule(rule) {

        if (!isObject(rule)) {
            return {
                id: "",
                name: "",
                code: "",
                raw: rule || null
            };
        }


        return {

            id: safeString(rule.id),

            name: safeString(rule.name),

            code: safeString(rule.rule),

            raw: clone(rule)
        };
    }


    // ========================================
    // Mode
    // ========================================

    function parseMode(mode) {

        if (!isObject(mode)) {
            return {
                id: "",
                mode: "",
                name: "",
                raw: mode || null
            };
        }


        const modeCode = safeString(mode.mode);


        const modeNames = {

            "REGULAR":
                "ナワバリバトル",

            "BANKARA":
                "バンカラマッチ",

            "X":
                "Xマッチ",

            "LEAGUE":
                "イベントマッチ",

            "FEST":
                "フェスマッチ"
        };


        return {

            id: safeString(mode.id),

            mode: modeCode,

            name: modeNames[modeCode] || modeCode,

            raw: clone(mode)
        };
    }


    // ========================================
    // Awards
    // ========================================

    function parseAwards(awards) {

        if (!isArray(awards)) {
            return [];
        }

        return clone(awards);
    }


    // ========================================
    // Fest Match
    // ========================================

    function parseFestMatch(festMatch) {

        if (!isObject(festMatch)) {
            return null;
        }


        return {

            conchShell:
                safeNumber(festMatch.conchShell),

            dragonMatchType:
                safeString(festMatch.dragonMatchType),

            contribution:
                safeNumber(festMatch.contribution),

            jewel:
                safeNumber(festMatch.jewel),

            myFestPower:
                safeNumber(festMatch.myFestPower),

            raw: clone(festMatch)
        };
    }


    // ========================================
    // Detect Tricolor
    // ========================================

    function detectTricolor(data) {

        if (!isObject(data)) {
            return false;
        }


        const rule = data.vsRule || {};

        const ruleCode = safeString(rule.rule);

        const ruleName = safeString(rule.name);

        const otherTeams =
            isArray(data.otherTeams)
                ? data.otherTeams
                : [];


        if (ruleCode === "TRI_COLOR") {
            return true;
        }


        if (ruleName === "トリカラバトル") {
            return true;
        }


        if (otherTeams.length >= 2) {
            return true;
        }


        const myTeam = data.myTeam || {};

        if (safeString(myTeam.tricolorRole) !== "") {
            return true;
        }


        return false;
    }


    // ========================================
    // Parse Battle
    // ========================================

    function parseBattle(source) {

        if (!isObject(source)) {
            throw new Error("バトルデータがオブジェクトではありません。");
        }


        const data =
            isObject(source.vsHistoryDetail)
                ? source.vsHistoryDetail
                : source;


        if (!isObject(data)) {
            throw new Error("vsHistoryDetailを読み込めませんでした。");
        }


        const myTeam =
            parseTeam(data.myTeam);


        const otherTeams =
            isArray(data.otherTeams)
                ? data.otherTeams.map(parseTeam)
                : [];


        const tricolor =
            detectTricolor(data);


        const player =
            parsePlayer(data.player);


        const rule =
            parseRule(data.vsRule);


        const mode =
            parseMode(data.vsMode);


        const stage =
            parseStage(data.vsStage);


        return {

            // --------------------------------
            // Basic
            // --------------------------------

            id:
                safeString(data.id),

            playedTime:
                safeString(data.playedTime),

            duration:
                safeNumber(data.duration),

            judgement:
                safeString(data.judgement),

            knockout:
                safeString(data.knockout),

            // --------------------------------
            // Match type
            // --------------------------------

            rule: rule,

            mode: mode,

            isTricolor: tricolor,

            // --------------------------------
            // Player
            // --------------------------------

            player: player,

            // --------------------------------
            // Stage
            // --------------------------------

            stage: stage,

            // --------------------------------
            // Teams
            // --------------------------------

            myTeam: myTeam,

            otherTeams: otherTeams,

            teams: [
                myTeam,
                ...otherTeams
            ],

            // --------------------------------
            // Festival
            // --------------------------------

            festMatch:
                parseFestMatch(data.festMatch),

            // --------------------------------
            // Other match information
            // --------------------------------

            bankaraMatch:
                clone(data.bankaraMatch),

            leagueMatch:
                clone(data.leagueMatch),

            xMatch:
                clone(data.xMatch),

            awards:
                parseAwards(data.awards),

            // --------------------------------
            // Navigation
            // --------------------------------

            nextHistoryDetail:
                isObject(data.nextHistoryDetail)
                    ? {
                        id: safeString(
                            data.nextHistoryDetail.id
                        )
                    }
                    : null,

            previousHistoryDetail:
                isObject(data.previousHistoryDetail)
                    ? {
                        id: safeString(
                            data.previousHistoryDetail.id
                        )
                    }
                    : null,

            // --------------------------------
            // Original data
            // --------------------------------

            raw:
                clone(data)
        };
    }


    // ========================================
    // Collect Battle Objects
    // ========================================

    function collectBattles(data, output) {

        if (!output) {
            output = [];
        }


        if (data === null || data === undefined) {
            return output;
        }


        // --------------------------------
        // Array
        // --------------------------------

        if (isArray(data)) {

            data.forEach(function (item) {

                collectBattles(item, output);

            });

            return output;
        }


        if (!isObject(data)) {
            return output;
        }


        // --------------------------------
        // Direct battle object
        // --------------------------------

        if (isObject(data.vsHistoryDetail)) {

            output.push(data);

            return output;
        }


        // --------------------------------
        // Object that itself looks like
        // vsHistoryDetail
        // --------------------------------

        if (
            data.id !== undefined &&
            (
                data.vsRule ||
                data.vsStage ||
                data.myTeam
            )
        ) {

            output.push(data);

            return output;
        }


        // --------------------------------
        // Possible collection
        // --------------------------------

        const collectionKeys = [

            "vsHistoryDetails",

            "historyDetails",

            "battles",

            "records",

            "data"
        ];


        for (let i = 0; i < collectionKeys.length; i++) {

            const key =
                collectionKeys[i];


            if (data[key] !== undefined) {

                collectBattles(
                    data[key],
                    output
                );

            }

        }


        return output;
    }


    // ========================================
    // Parse JSON
    // ========================================

    function parseJSON(json) {

        let data;


        if (typeof json === "string") {

            try {

                data = JSON.parse(json);

            } catch (error) {

                throw new Error(
                    "JSONの解析に失敗しました。"
                );

            }

        } else {

            data = json;
        }


        const sources =
            collectBattles(data);


        if (sources.length === 0) {

            throw new Error(
                "バトルデータが見つかりませんでした。"
            );

        }


        const records = [];


        sources.forEach(function (source) {

            try {

                const battle =
                    parseBattle(source);


                if (battle.id !== "") {

                    records.push(battle);

                }

            } catch (error) {

                console.warn(
                    "バトルデータをスキップしました。",
                    error
                );

            }

        });


        if (records.length === 0) {

            throw new Error(
                "有効なバトルデータがありません。"
            );

        }


        return records;
    }


    // ========================================
    // JSZip Loader
    // ========================================

    function loadJSZip() {

        return new Promise(function (resolve, reject) {

            if (window.JSZip) {

                resolve(window.JSZip);

                return;
            }


            const existing =
                document.querySelector(
                    'script[data-parser-jszip="true"]'
                );


            if (existing) {

                existing.addEventListener(
                    "load",
                    function () {

                        if (window.JSZip) {
                            resolve(window.JSZip);
                        } else {
                            reject(
                                new Error(
                                    "ZIPライブラリの読み込みに失敗しました。"
                                )
                            );
                        }

                    }
                );


                existing.addEventListener(
                    "error",
                    function () {

                        reject(
                            new Error(
                                "ZIPライブラリを読み込めませんでした。"
                            )
                        );

                    }
                );


                return;
            }


            const script =
                document.createElement("script");


            script.src =
                "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";


            script.async = true;

            script.dataset.parserJszip =
                "true";


            script.onload =
                function () {

                    if (window.JSZip) {

                        resolve(window.JSZip);

                    } else {

                        reject(
                            new Error(
                                "ZIPライブラリが利用できません。"
                            )
                        );

                    }

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "ZIPライブラリの読み込みに失敗しました。"
                        )
                    );

                };


            document.head.appendChild(script);

        });
    }


    // ========================================
    // Parse ZIP
    // ========================================

    async function parseZIP(buffer) {

        if (!buffer) {

            throw new Error(
                "ZIPデータがありません。"
            );

        }


        const JSZip =
            await loadJSZip();


        const zip =
            await JSZip.loadAsync(buffer);


        const records = [];


        const files =
            Object.values(zip.files);


        for (let i = 0; i < files.length; i++) {

            const file =
                files[i];


            if (file.dir) {
                continue;
            }


            const fileName =
                safeString(file.name);


            if (
                !fileName
                    .toLowerCase()
                    .endsWith(".json")
            ) {

                continue;
            }


            try {

                const text =
                    await file.async("text");


                const parsed =
                    parseJSON(text);


                parsed.forEach(function (record) {

                    records.push(record);

                });

            } catch (error) {

                console.warn(
                    "ZIP内JSONをスキップしました:",
                    fileName,
                    error
                );

            }

        }


        if (records.length === 0) {

            throw new Error(
                "ZIP内に有効なバトルJSONが見つかりませんでした。"
            );

        }


        return records;
    }


    // ========================================
    // Parse Import
    // ========================================

    async function parseImport(importedFile) {

        if (!isObject(importedFile)) {

            throw new Error(
                "インポートデータがありません。"
            );

        }


        const type =
            safeString(importedFile.type)
                .toLowerCase();


        let records = [];


        // --------------------------------
        // JSON
        // --------------------------------

        if (type === "json") {

            records =
                parseJSON(importedFile.data);

        }


        // --------------------------------
        // ZIP
        // --------------------------------

        else if (type === "zip") {

            records =
                await parseZIP(
                    importedFile.buffer
                );

        }


        // --------------------------------
        // Unknown
        // --------------------------------

        else {

            throw new Error(
                "対応していないファイル形式です。"
            );

        }


        // --------------------------------
        // Remove invalid IDs
        // --------------------------------

        records =
            records.filter(function (record) {

                return record &&
                    record.id;

            });


        // --------------------------------
        // Deduplicate inside import
        // --------------------------------

        const unique =
            new Map();


        records.forEach(function (record) {

            unique.set(
                record.id,
                record
            );

        });


        records =
            Array.from(unique.values());


        // --------------------------------
        // Sort
        // Newest first
        // --------------------------------

        records.sort(function (a, b) {

            const timeA =
                new Date(a.playedTime).getTime();

            const timeB =
                new Date(b.playedTime).getTime();


            if (
                Number.isFinite(timeA) &&
                Number.isFinite(timeB)
            ) {

                return timeB - timeA;

            }


            return 0;

        });


        return {

            records: records,

            sourceType: type,

            fileName:
                safeString(importedFile.fileName),

            importedAt:
                new Date().toISOString(),

            count:
                records.length
        };
    }


    // ========================================
    // Public API
    // ========================================

    window.Parser = {

        parseBattle:
            parseBattle,

        parseJSON:
            parseJSON,

        parseZIP:
            parseZIP,

        parseImport:
            parseImport,

        detectTricolor:
            detectTricolor,

        parsePlayer:
            parsePlayer,

        parseTeam:
            parseTeam,

        parseWeapon:
            parseWeapon,

        parseStage:
            parseStage
    };


})();
