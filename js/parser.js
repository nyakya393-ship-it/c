/* =========================================================
   InkBoard
   js/parser.js
   ========================================================= */

(function () {

    "use strict";


    /* =======================================================
       UTILITY
    ======================================================= */

    function valueOf(value, fallback) {

        if (
            value === undefined ||
            value === null
        ) {
            return fallback;
        }

        return value;

    }


    function stringValue(value, fallback) {

        if (
            value === undefined ||
            value === null
        ) {
            return fallback || "";
        }

        return String(value);

    }


    function numberValue(value, fallback) {

        const number =
            Number(value);

        if (Number.isFinite(number)) {
            return number;
        }

        return valueOf(fallback, 0);

    }


    function booleanValue(value) {

        return value === true;

    }


    function firstDefined() {

        for (
            let i = 0;
            i < arguments.length;
            i++
        ) {

            const value =
                arguments[i];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return value;

            }

        }

        return null;

    }


    function cloneRaw(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return null;
        }

        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return value;

        }

    }


    /* =======================================================
       IMAGE
    ======================================================= */

    function parseImage(value) {

        if (!value) {
            return null;
        }


        if (typeof value === "string") {
            return value;
        }


        if (typeof value === "object") {

            return firstDefined(
                value.url,
                value.src,
                value.imageUrl,
                value.uri
            );

        }


        return null;

    }


    /* =======================================================
       WEAPON
    ======================================================= */

    function parseWeapon(weapon) {

        if (!weapon) {

            return {

                id: null,

                name: "",

                image: null,

                image3d: null,

                image2d: null,

                thumbnail: null,

                subWeapon: null,

                specialWeapon: null,

                raw: null

            };

        }


        const subWeapon =
            weapon.subWeapon || null;


        const specialWeapon =
            weapon.specialWeapon || null;


        return {

            id:
                firstDefined(
                    weapon.id,
                    weapon.weaponId
                ),

            name:
                stringValue(
                    weapon.name,
                    ""
                ),

            image:
                parseImage(
                    weapon.image
                ),

            image3d:
                parseImage(
                    weapon.image3d
                ),

            image2d:
                parseImage(
                    weapon.image2d
                ),

            thumbnail:
                parseImage(
                    firstDefined(
                        weapon.thumbnail,
                        weapon.imageThumbnail
                    )
                ),

            subWeapon: {

                id:
                    subWeapon
                        ? firstDefined(
                            subWeapon.id,
                            subWeapon.weaponId
                        )
                        : null,

                name:
                    subWeapon
                        ? stringValue(
                            subWeapon.name,
                            ""
                        )
                        : "",

                image:
                    subWeapon
                        ? parseImage(
                            subWeapon.image
                        )
                        : null

            },

            specialWeapon: {

                id:
                    specialWeapon
                        ? firstDefined(
                            specialWeapon.id,
                            specialWeapon.weaponId
                        )
                        : null,

                name:
                    specialWeapon
                        ? stringValue(
                            specialWeapon.name,
                            ""
                        )
                        : "",

                image:
                    specialWeapon
                        ? parseImage(
                            specialWeapon.image
                        )
                        : null

            },

            raw:
                cloneRaw(weapon)

        };

    }


    /* =======================================================
       PLAYER RESULT
    ======================================================= */

    function parsePlayerResult(result) {

        result =
            result || {};


        return {

            kill:
                numberValue(
                    result.kill,
                    0
                ),

            death:
                numberValue(
                    result.death,
                    0
                ),

            assist:
                numberValue(
                    result.assist,
                    0
                ),

            special:
                numberValue(
                    result.special,
                    0
                ),

            noroshiTry:
                numberValue(
                    result.noroshiTry,
                    0
                )

        };

    }


    /* =======================================================
       GEAR
    ======================================================= */

    function parseGear(gear) {

        if (!gear) {
            return null;
        }


        if (typeof gear === "string") {

            return {

                id: null,

                name: gear,

                image: null,

                raw: gear

            };

        }


        return {

            id:
                firstDefined(
                    gear.id,
                    gear.gearId
                ),

            name:
                stringValue(
                    firstDefined(
                        gear.name,
                        gear.gearName
                    ),
                    ""
                ),

            image:
                parseImage(
                    firstDefined(
                        gear.image,
                        gear.imageUrl,
                        gear.image2d,
                        gear.thumbnail
                    )
                ),

            raw:
                cloneRaw(gear)

        };

    }


    /* =======================================================
       NAMEPLATE
    ======================================================= */

    function parseNameplate(nameplate) {

        if (!nameplate) {
            return null;
        }


        if (typeof nameplate === "string") {

            return {

                id: null,

                image: nameplate,

                raw: nameplate

            };

        }


        return {

            id:
                firstDefined(
                    nameplate.id,
                    nameplate.nameplateId
                ),

            image:
                parseImage(
                    firstDefined(
                        nameplate.image,
                        nameplate.imageUrl,
                        nameplate.background,
                        nameplate.backgroundImage,
                        nameplate.thumbnail
                    )
                ),

            raw:
                cloneRaw(nameplate)

        };

    }


    /* =======================================================
       PLAYER
    ======================================================= */

    function parsePlayer(player) {

        player =
            player || {};


        const result =
            parsePlayerResult(
                player.result
            );


        return {

            id:
                firstDefined(
                    player.id,
                    player.playerId,
                    player.nameId
                ),

            name:
                stringValue(
                    player.name,
                    ""
                ),

            callSign:
                stringValue(
                    player.callSign,
                    ""
                ),

            byname:
                stringValue(
                    player.byname,
                    ""
                ),

            isMyself:
                booleanValue(
                    player.isMyself
                ),

            species:
                stringValue(
                    player.species,
                    ""
                ),

            nameId:
                stringValue(
                    player.nameId,
                    ""
                ),

            nameplate:
                parseNameplate(
                    player.nameplate
                ),

            weapon:
                parseWeapon(
                    player.weapon
                ),

            paint:
                numberValue(
                    player.paint,
                    0
                ),

            result: result,

            crown:
                valueOf(
                    player.crown,
                    null
                ),

            festDragonCert:
                valueOf(
                    player.festDragonCert,
                    null
                ),

            headGear:
                parseGear(
                    player.headGear
                ),

            clothingGear:
                parseGear(
                    player.clothingGear
                ),

            shoesGear:
                parseGear(
                    player.shoesGear
                ),

            raw:
                cloneRaw(player)

        };

    }


    /* =======================================================
       TEAM RESULT
    ======================================================= */

    function parseTeamResult(result) {

        result =
            result || {};


        return {

            paintRatio:
                numberValue(
                    result.paintRatio,
                    0
                ),

            score:
                numberValue(
                    result.score,
                    0
                ),

            noroshi:
                numberValue(
                    result.noroshi,
                    0
                ),

            raw:
                cloneRaw(result)

        };

    }


    /* =======================================================
       TEAM
    ======================================================= */

    function parseTeam(team) {

        team =
            team || {};


        const players =
            Array.isArray(team.players)
                ? team.players.map(
                    parsePlayer
                )
                : [];


        return {

            color:
                cloneRaw(
                    team.color
                ),

            result:
                parseTeamResult(
                    team.result
                ),

            tricolorRole:
                stringValue(
                    team.tricolorRole,
                    ""
                ),

            festTeamName:
                stringValue(
                    team.festTeamName,
                    ""
                ),

            festUniformBonusRate:
                numberValue(
                    team.festUniformBonusRate,
                    0
                ),

            judgement:
                stringValue(
                    team.judgement,
                    ""
                ),

            players:
                players,

            order:
                numberValue(
                    team.order,
                    0
                ),

            festStreakWinCount:
                numberValue(
                    team.festStreakWinCount,
                    0
                ),

            festUniformName:
                stringValue(
                    team.festUniformName,
                    ""
                ),

            raw:
                cloneRaw(team)

        };

    }


    /* =======================================================
       STAGE
    ======================================================= */

    function parseStage(stage) {

        stage =
            stage || {};


        return {

            id:
                firstDefined(
                    stage.id,
                    stage.stageId
                ),

            name:
                stringValue(
                    stage.name,
                    ""
                ),

            image:
                parseImage(
                    stage.image
                ),

            raw:
                cloneRaw(stage)

        };

    }


    /* =======================================================
       RULE
    ======================================================= */

    function parseRule(rule) {

        rule =
            rule || {};


        const code =
            firstDefined(
                rule.rule,
                rule.code,
                rule.ruleCode
            );


        return {

            id:
                firstDefined(
                    rule.id,
                    null
                ),

            name:
                stringValue(
                    rule.name,
                    ""
                ),

            code:
                stringValue(
                    code,
                    ""
                ),

            raw:
                cloneRaw(rule)

        };

    }


    /* =======================================================
       MODE
    ======================================================= */

    function parseMode(mode) {

        mode =
            mode || {};


        const value =
            firstDefined(
                mode.mode,
                mode.code,
                mode.modeCode
            );


        let name = "";


        switch (
            String(value || "").toUpperCase()
        ) {

            case "REGULAR":
                name = "レギュラーマッチ";
                break;

            case "BANKARA":
                name = "バンカラマッチ";
                break;

            case "X":
                name = "Xマッチ";
                break;

            case "LEAGUE":
                name = "リーグマッチ";
                break;

            case "FEST":
                name = "フェスマッチ";
                break;

            default:
                name =
                    stringValue(
                        mode.name,
                        stringValue(
                            value,
                            ""
                        )
                    );

        }


        return {

            id:
                firstDefined(
                    mode.id,
                    null
                ),

            code:
                stringValue(
                    value,
                    ""
                ),

            name:
                name,

            raw:
                cloneRaw(mode)

        };

    }


    /* =======================================================
       FEST MATCH
    ======================================================= */

    function parseFestMatch(festMatch) {

        if (!festMatch) {
            return null;
        }


        return {

            conchShell:
                numberValue(
                    festMatch.conchShell,
                    0
                ),

            dragonMatchType:
                stringValue(
                    festMatch.dragonMatchType,
                    ""
                ),

            contribution:
                numberValue(
                    festMatch.contribution,
                    0
                ),

            jewel:
                numberValue(
                    festMatch.jewel,
                    0
                ),

            myFestPower:
                numberValue(
                    festMatch.myFestPower,
                    0
                ),

            raw:
                cloneRaw(festMatch)

        };

    }


    /* =======================================================
       TRICOLOR DETECTION
    ======================================================= */

    function detectTricolor(
        root,
        myTeam,
        otherTeams
    ) {

        root =
            root || {};

        myTeam =
            myTeam || {};

        otherTeams =
            Array.isArray(otherTeams)
                ? otherTeams
                : [];


        const rule =
            root.vsRule || {};


        const ruleCode =
            String(
                firstDefined(
                    rule.rule,
                    rule.code,
                    ""
                )
            ).toUpperCase();


        const ruleName =
            String(
                rule.name || ""
            );


        if (
            ruleCode === "TRI_COLOR" ||
            ruleCode === "TRICOLOR" ||
            ruleCode === "TRI_COLOR_BATTLE"
        ) {

            return true;

        }


        if (
            ruleName.includes("トリカラ")
        ) {

            return true;

        }


        if (
            otherTeams.length >= 2
        ) {

            return true;

        }


        if (
            myTeam.tricolorRole
        ) {

            return true;

        }


        for (
            let i = 0;
            i < otherTeams.length;
            i++
        ) {

            if (
                otherTeams[i] &&
                otherTeams[i].tricolorRole
            ) {

                return true;

            }

        }


        return false;

    }


    /* =======================================================
       BATTLE
    ======================================================= */

    function parseBattle(detail) {

        if (!detail) {
            return null;
        }


        /*
         * Horagai Bayでは
         * vsHistoryDetail が1件のバトル本体。
         */

        const root =
            detail.vsHistoryDetail ||
            detail;


        if (!root || typeof root !== "object") {
            return null;
        }


        const myTeam =
            parseTeam(
                root.myTeam
            );


        const otherTeams =
            Array.isArray(root.otherTeams)
                ? root.otherTeams.map(
                    parseTeam
                )
                : [];


        const tricolor =
            detectTricolor(
                root,
                myTeam,
                otherTeams
            );


        const teams =
            [
                myTeam,
                ...otherTeams
            ].filter(function (team) {

                return (
                    team &&
                    (
                        team.players.length > 0 ||
                        team.festTeamName ||
                        team.tricolorRole ||
                        team.result
                    )
                );

            });


        /*Number(festMatch.myFestPower),

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
