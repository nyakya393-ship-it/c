/* =========================================================
   InkBoard
   js/analyzer.js
   ========================================================= */

(function () {

    "use strict";


    /* =======================================================
       UTILITY
    ======================================================= */

    function arrayValue(value) {

        return Array.isArray(value)
            ? value
            : [];

    }


    function numberValue(value) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : 0;

    }


    function safeString(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }

        return String(value);

    }


    function percent(
        value,
        total
    ) {

        if (
            !total
        ) {

            return 0;

        }

        return (
            value / total
        ) * 100;

    }


    function average(
        value,
        count
    ) {

        if (
            !count
        ) {

            return 0;

        }

        return value / count;

    }


    function getPlayers(
        battle
    ) {

        const teams =
            arrayValue(
                battle &&
                battle.teams
            );


        const players = [];


        teams.forEach(
            function (team) {

                arrayValue(
                    team.players
                ).forEach(
                    function (player) {

                        players.push(
                            player
                        );

                    }
                );

            }
        );


        return players;

    }


    function getMyPlayer(
        battle
    ) {

        if (
            battle &&
            battle.player &&
            (
                battle.player.isMyself ||
                battle.player.weapon
            )
        ) {

            return battle.player;

        }


        const players =
            getPlayers(
                battle
            );


        for (
            let i = 0;
            i < players.length;
            i++
        ) {

            if (
                players[i].isMyself
            ) {

                return players[i];

            }

        }


        return null;

    }


    function getResult(
        battle
    ) {

        return safeString(
            battle &&
            battle.judgement
        )
            .toUpperCase();

    }


    function isWin(
        battle
    ) {

        return (
            getResult(battle) === "WIN"
        );

    }


    function isLose(
        battle
    ) {

        const result =
            getResult(
                battle
            );


        return (
            result === "LOSE" ||
            result === "LOSS" ||
            result === "DEFEAT"
        );

    }


    /* =======================================================
       BASIC SUMMARY
    ======================================================= */

    function summarize(
        battles
    ) {

        battles =
            arrayValue(
                battles
            );


        let wins = 0;

        let loses = 0;

        let unknown = 0;

        let totalKill = 0;

        let totalAssist = 0;

        let totalDeath = 0;

        let totalSpecial = 0;

        let totalPaint = 0;


        battles.forEach(
            function (battle) {

                if (
                    isWin(battle)
                ) {

                    wins++;

                } else if (
                    isLose(battle)
                ) {

                    loses++;

                } else {

                    unknown++;

                }


                const player =
                    getMyPlayer(
                        battle
                    );


                if (!player) {
                    return;
                }


                const result =
                    player.result || {};


                totalKill +=
                    numberValue(
                        result.kill
                    );


                totalAssist +=
                    numberValue(
                        result.assist
                    );


                totalDeath +=
                    numberValue(
                        result.death
                    );


                totalSpecial +=
                    numberValue(
                        result.special
                    );


                totalPaint +=
                    numberValue(
                        player.paint
                    );

            }
        );


        const judged =
            wins + loses;


        const kd =
            totalDeath > 0
                ? (
                    (
                        totalKill +
                        totalAssist
                    ) /
                    totalDeath
                )
                : (
                    totalKill +
                    totalAssist
                );


        return {

            battles:
                battles.length,

            wins:
                wins,

            loses:
                loses,

            unknown:
                unknown,

            judged:
                judged,

            winRate:
                percent(
                    wins,
                    judged
                ),

            loseRate:
                percent(
                    loses,
                    judged
                ),

            totalKill:
                totalKill,

            totalAssist:
                totalAssist,

            totalDeath:
                totalDeath,

            totalSpecial:
                totalSpecial,

            totalPaint:
                totalPaint,

            averageKill:
                average(
                    totalKill,
                    battles.length
                ),

            averageAssist:
                average(
                    totalAssist,
                    battles.length
                ),

            averageDeath:
                average(
                    totalDeath,
                    battles.length
                ),

            averageSpecial:
                average(
                    totalSpecial,
                    battles.length
                ),

            averagePaint:
                average(
                    totalPaint,
                    battles.length
                ),

            kd:
                kd

        };

    }


    /* =======================================================
       RESULT DISTRIBUTION
    ======================================================= */

    function resultDistribution(
        battles
    ) {

        battles =
            arrayValue(
                battles
            );


        const result = {};


        battles.forEach(
            function (battle) {

                const key =
                    getResult(
                        battle
                    ) || "UNKNOWN";


                if (
                    !result[key]
                ) {

                    result[key] = 0;

                }


                result[key]++;

            }
        );


        return result;

    }


    /* =======================================================
       GENERIC GROUP
    ======================================================= */

    function groupBy(
        battles,
        getKey,
        getName
    ) {

        battles =
            arrayValue(
                battles
            );


        const groups =
            {};


        battles.forEach(
            function (battle) {

                let key =
                    getKey(
                        battle
                    );


                if (
                    key === undefined ||
                    key === null ||
                    key === ""
                ) {

                    key =
                        "unknown";

                }


                key =
                    String(
                        key
                    );


                if (
                    !groups[key]
                ) {

                    groups[key] = {

                        key:
                            key,

                        name:
                            getName
                                ? getName(
                                    battle
                                )
                                : key,

                        battles: [],

                        count: 0,

                        wins: 0,

                        loses: 0,

                        unknown: 0,

                        kill: 0,

                        assist: 0,

                        death: 0,

                        special: 0,

                        paint: 0

                    };

                }


                const group =
                    groups[key];


                group.battles.push(
                    battle
                );


                group.count++;


                if (
                    isWin(battle)
                ) {

                    group.wins++;

                } else if (
                    isLose(battle)
                ) {

                    group.loses++;

                } else {

                    group.unknown++;

                }


                const player =
                    getMyPlayer(
                        battle
                    );


                if (!player) {
                    return;
                }


                const result =
                    player.result || {};


                group.kill +=
                    numberValue(
                        result.kill
                    );


                group.assist +=
                    numberValue(
                        result.assist
                    );


                group.death +=
                    numberValue(
                        result.death
                    );


                group.special +=
                    numberValue(
                        result.special
                    );


                group.paint +=
                    numberValue(
                        player.paint
                    );

            }
        );


        return Object.keys(
            groups
        ).map(
            function (key) {

                const group =
                    groups[key];


                const judged =
                    group.wins +
                    group.loses;


                return {

                    key:
                        group.key,

                    name:
                        group.name,

                    count:
                        group.count,

                    wins:
                        group.wins,

                    loses:
                        group.loses,

                    unknown:
                        group.unknown,

                    winRate:
                        percent(
                            group.wins,
                            judged
                        ),

                    loseRate:
                        percent(
                            group.loses,
                            judged
                        ),

                    kill:
                        group.kill,

                    assist:
                        group.assist,

                    death:
                        group.death,

                    special:
                        group.special,

                    paint:
                        group.paint,

                    averageKill:
                        average(
                            group.kill,
                            group.count
                        ),

                    averageAssist:
                        average(
                            group.assist,
                            group.count
                        ),

                    averageDeath:
                        average(
                            group.death,
                            group.count
                        ),

                    averageSpecial:
                        average(
                            group.special,
                            group.count
                        ),

                    averagePaint:
                        average(
                            group.paint,
                            group.count
                        )

                };

            }
        );

    }


    /* =======================================================
       RULE ANALYSIS
    ======================================================= */

    function analyzeRules(
        battles
    ) {

        return groupBy(

            battles,

            function (battle) {

                return (
                    battle.rule &&
                    (
                        battle.rule.code ||
                        battle.rule.id ||
                        battle.rule.name
                    )
                );

            },

            function (battle) {

                return (
                    battle.rule &&
                    battle.rule.name
                ) || "不明";

            }

        );

    }


    /* =======================================================
       MODE ANALYSIS
    ======================================================= */

    function analyzeModes(
        battles
    ) {

        return groupBy(

            battles,

            function (battle) {

                return (
                    battle.mode &&
                    (
                        battle.mode.code ||
                        battle.mode.id ||
                        battle.mode.name
                    )
                );

            },

            function (battle) {

                return (
                    battle.mode &&
                    battle.mode.name
                ) || "不明";

            }

        );

    }


    /* =======================================================
       STAGE ANALYSIS
    ======================================================= */

    function analyzeStages(
        battles
    ) {

        return groupBy(

            battles,

            function (battle) {

                return (
                    battle.stage &&
                    (
                        battle.stage.id ||
                        battle.stage.name
                    )
                );

            },

            function (battle) {

                return (
                    battle.stage &&
                    battle.stage.name
                ) || "不明";

            }

        );

    }


    /* =======================================================
       WEAPON ANALYSIS
    ======================================================= */

    function analyzeWeapons(
        battles
    ) {

        return groupBy(

            battles,

            function (battle) {

                const player =
                    getMyPlayer(
                        battle
                    );


                return (
                    player &&
                    player.weapon &&
                    (
                        player.weapon.id ||
                        player.weapon.name
                    )
                ) || "unknown";

            },

            function (battle) {

                const player =
                    getMyPlayer(
                        battle
                    );


                return (
                    player &&
                    player.weapon &&
                    player.weapon.name
                ) || "不明";

            }

        );

    }


    /* =======================================================
       TRICOLOR ANALYSIS
    ======================================================= */

    function analyzeTricolor(
        battles
    ) {

        battles =
            arrayValue(
                battles
            );


        const normal =
            battles.filter(
                function (battle) {

                    return !battle.isTricolor;

                }
            );


        const tricolor =
            battles.filter(
                function (battle) {

                    return Boolean(
                        battle.isTricolor
                    );

                }
            );


        const roles =
            groupBy(

                tricolor,

                function (battle) {

                    const team =
                        battle.myTeam ||
                        {};


                    return (
                        team.tricolorRole ||
                        "UNKNOWN"
                    );

                },

                function (battle) {

                    const team =
                        battle.myTeam ||
                        {};


                    return (
                        team.tricolorRole ||
                        "不明"
                    );

                }

            );


        return {

            total:
                battles.length,

            normal:
                summarize(
                    normal
                ),

            tricolor:
                summarize(
                    tricolor
                ),

            tricolorCount:
                tricolor.length,

            roles:
                roles

        };

    }


    /* =======================================================
       PAINT ANALYSIS
    ======================================================= */

    function analyzePaint(
        battles
    ) {

        battles =
            arrayValue(
                battles
            );


        let total = 0;

        let max = 0;

        let min = null;


        battles.forEach(
            function (battle) {

                const player =
                    getMyPlayer(
                        battle
                    );


                const paint =
                    player
                        ? numberValue(
                            player.paint
                        )
                        : 0;


                total += paint;


                if (
                    paint > max
                ) {

                    max = paint;

                }


                if (
                    min === null ||
                    paint < min
                ) {

                    min = paint;

                }

            }
        );


        return {

            total:
                total,

            average:
                average(
                    total,
                    battles.length
                ),

            max:
                max,

            min:
                min === null
                    ? 0
                    : min

        };

    }


    /* =======================================================
       COMBAT ANALYSIS
    ======================================================= */

    function analyzeCombat(
        battles
    ) {

        battles =
            arrayValue(
                battles
            );


        let kill = 0;

        let assist = 0;

        let death = 0;


        battles.forEach(
            function (battle) {

                const player =
                    getMyPlayer(
                        battle
                    );


                if (!player) {
                    return;
                }


                const result =
                    player.result || {};


                kill +=
                    numberValue(
                        result.kill
                    );


                assist +=
                    numberValue(
                  e) {

                const player =
                    getPlayer(battle);


                const weapon =
                    player.weapon || {};


                return weapon.name ||
                    "不明";

            }

        );
    }


    // ========================================
    // Tricolor Analysis
    // ========================================

    function analyzeTricolor(battles) {

        const tricolor =
            safeArray(battles).filter(
                function (battle) {

                    return battle &&
                        battle.isTricolor === true;

                }
            );


        const normal =
            safeArray(battles).filter(
                function (battle) {

                    return !(
                        battle &&
                        battle.isTricolor === true
                    );

                }
            );


        const summary =
            summarize(tricolor);


        const roles =
            analyzeGroups(

                tricolor,

                function (battle) {

                    return battle &&
                        battle.myTeam
                        ? battle.myTeam.tricolorRole
                        : "";

                },

                function (battle) {

                    const role =
                        battle &&
                        battle.myTeam
                            ? battle.myTeam.tricolorRole
                            : "";


                    const names = {

                        "ATTACK":
                            "攻撃",

                        "ATTACK1":
                            "攻撃",

                        "ATTACK2":
                            "攻撃",

                        "DEFENSE":
                            "守備"

                    };


                    return names[role] ||
                        role ||
                        "不明";

                }

            );


        return {

            total:
                tricolor.length,

            normal:
                normal.length,

            summary:
                summary,

            roles:
                roles

        };
    }


    // ========================================
    // Paint Analysis
    // ========================================

    function analyzePaint(battles) {

        const list =
            safeArray(battles);


        let total = 0;

        let wins = 0;

        let winPaint = 0;

        let loses = 0;

        let losePaint = 0;


        list.forEach(function (battle) {

            const paint =
                number(
                    getPlayer(battle).paint
                );


            total += paint;


            if (isWin(battle)) {

                wins++;

                winPaint += paint;

            }


            if (isLose(battle)) {

                loses++;

                losePaint += paint;

            }

        });


        return {

            total:
                total,

            average:
                average(
                    total,
                    list.length
                ),

            winAverage:
                average(
                    winPaint,
                    wins
                ),

            loseAverage:
                average(
                    losePaint,
                    loses
                )

        };
    }


    // ========================================
    // Combat Analysis
    // ========================================

    function analyzeCombat(battles) {

        const list =
            safeArray(battles);


        let kills = 0;

        let assists = 0;

        let deaths = 0;

        let specials = 0;


        list.forEach(function (battle) {

            const result =
                getPlayerResult(battle);


            kills +=
                number(result.kill);

            assists +=
                number(result.assist);

            deaths +=
                number(result.death);

            specials +=
                number(result.special);

        });


        return {

            kills:
                kills,

            assists:
                assists,

            deaths:
                deaths,

            specials:
                specials,

            averageKills:
                average(
                    kills,
                    list.length
                ),

            averageAssists:
                average(
                    assists,
                    list.length
                ),

            averageDeaths:
                average(
                    deaths,
                    list.length
                ),

            averageSpecials:
                average(
                    specials,
                    list.length
                ),

            kd:
                deaths
                    ? Math.round(
                        ((kills + assists) /
                            deaths) * 100
                    ) / 100
                    : kills + assists,

            spd:
                deaths
                    ? Math.round(
                        (specials /
                            deaths) * 100
                    ) / 100
                    : specials,

            ptd:
                deaths
                    ? Math.round(
                        (safeArray(list)
                            .reduce(
                                function (
                                    total,
                                    battle
                                ) {

                                    return total +
                                        number(
                                            getPlayer(
                                                battle
                                            ).paint
                                        );

                                },
                                0
                            ) /
                            deaths) * 100
                    ) / 100
                    : 0

        };
    }


    // ========================================
    // Special Analysis
    // ========================================

    function analyzeSpecials(battles) {

        const groups =
            new Map();


        safeArray(battles).forEach(
            function (battle) {

                const player =
                    getPlayer(battle);


                const weapon =
                    player.weapon || {};


                const special =
                    weapon.specialWeapon || {};


                const id =
                    special.id ||
                    special.name ||
                    "";


                const name =
                    special.name ||
                    "不明";


                if (!groups.has(id)) {

                    groups.set(
                        id,
                        {
                            id: id,
                            name: name,
                            uses: 0,
                            battles: 0,
                            wins: 0,
                            loses: 0
                        }
                    );

                }


                const group =
                    groups.get(id);


                group.battles++;

                group.uses +=
                    number(
                        getPlayerResult(
                            battle
                        ).special
                    );


                if (isWin(battle)) {

                    group.wins++;

                }


                if (isLose(battle)) {

                    group.loses++;

                }

            }
        );


        return Array.from(
            groups.values()
        ).map(function (item) {

            return {

                id:
                    item.id,

                name:
                    item.name,

                uses:
                    item.uses,

                battles:
                    item.battles,

                wins:
                    item.wins,

                loses:
                    item.loses,

                winRate:
                    item.battles
                        ? percentage(
                            item.wins /
                            item.battles
                        )
                        : 0,

                average:
                    average(
                        item.uses,
                        item.battles
                    )

            };

        }).sort(function (a, b) {

            return b.uses - a.uses;

        });
    }


    // ========================================
    // Player / Weapon History
    // ========================================

    function getWeaponHistory(battles) {

        return analyzeWeapons(
            battles
        ).map(function (item) {

            return {

                id:
                    item.key,

                name:
                    item.name,

                battles:
                    item.count,

                wins:
                    item.wins,

                loses:
                    item.loses,

                winRate:
                    item.winRate,

                averageKills:
                    item.averageKills,

                averageAssists:
                    item.averageAssists,

                averageDeaths:
                    item.averageDeaths,

                averageSpecials:
                    item.averageSpecials,

                averagePaint:
                    item.averagePaint,

                kd:
                    item.kd

            };

        });
    }


    // ========================================
    // Date Analysis
    // ========================================

    function analyzeByDate(battles) {

        const groups =
            groupBy(

                battles,

                function (battle) {

                    if (
                        !battle ||
                        !battle.playedTime
                    ) {

                        return "unknown";

                    }


                    const date =
                        new Date(
                            battle.playedTime
                        );


                    if (
                        !Number.isFinite(
                            date.getTime()
                        )
                    ) {

                        return "unknown";

                    }


                    const year =
                        date.getFullYear();


                    const month =
                        String(
                            date.getMonth() + 1
                        )
                            .padStart(2, "0");


                    const day =
                        String(
                            date.getDate()
                        )
                            .padStart(2, "0");


                    return (
                        year +
                        "-" +
                        month +
                        "-" +
                        day
                    );

                }

            );


        const result = [];


        groups.forEach(
            function (items, date) {

                const summary =
                    summarize(items);


                result.push({

                    date:
                        date,

                    battles:
                        summary.battles,

                    wins:
                        summary.wins,

                    loses:
                        summary.loses,

                    winRate:
                        summary.winRate,

                    averageKills:
                        summary.averageKills,

                    averageDeaths:
                        summary.averageDeaths,

                    averageSpecials:
                        summary.averageSpecials,

                    averagePaint:
                        summary.averagePaint

                });

            }
        );


        result.sort(function (a, b) {

            return a.date.localeCompare(
                b.date
            );

        });


        return result;
    }


    // ========================================
    // Main Analysis
    // ========================================

    function analyze(battles) {

        const list =
            safeArray(battles);


        return {

            // Basic
            summary:
                summarize(list),

            result:
                resultDistribution(list),

            // Categories
            rules:
                analyzeRules(list),

            modes:
                analyzeModes(list),

            stages:
                analyzeStages(list),

            weapons:
                analyzeWeapons(list),

            specials:
                analyzeSpecials(list),

            // Tricolor
            tricolor:
                analyzeTricolor(list),

            // Performance
            paint:
                analyzePaint(list),

            combat:
                analyzeCombat(list),

            // Timeline
            dates:
                analyzeByDate(list),

            // Weapon history
            weaponHistory:
                getWeaponHistory(list)

        };
    }


    // ========================================
    // Filtered Analysis
    // ========================================

    function analyzeFiltered(
        battles,
        options
    ) {

        let filtered =
            safeArray(battles);


        if (options) {

            // ----------------------------
            // Result
            // ----------------------------

            if (options.result) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            return getResult(
                                battle
                            ) ===
                            String(
                                options.result
                            ).toUpperCase();

                        }
                    );

            }


            // ----------------------------
            // Rule
            // ----------------------------

            if (options.rule) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            return battle &&
                                battle.rule &&
                                battle.rule.code ===
                                options.rule;

                        }
                    );

            }


            // ----------------------------
            // Mode
            // ----------------------------

            if (options.mode) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            return battle &&
                                battle.mode &&
                                battle.mode.mode ===
                                options.mode;

                        }
                    );

            }


            // ----------------------------
            // Stage
            // ----------------------------

            if (options.stage) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            return battle &&
                                battle.stage &&
                                (
                                    battle.stage.id ===
                                    options.stage ||

                                    battle.stage.name ===
                                    options.stage
                                );

                        }
                    );

            }


            // ----------------------------
            // Weapon
            // ----------------------------

            if (options.weapon) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            const player =
                                getPlayer(battle);


                            const weapon =
                                player.weapon || {};


                            return (
                                weapon.id ===
                                options.weapon
                            ) || (
                                weapon.name ===
                                options.weapon
                            );

                        }
                    );

            }


            // ----------------------------
            // Tricolor
            // ----------------------------

            if (
                options.tricolor !==
                undefined
            ) {

                filtered =
                    filtered.filter(
                        function (battle) {

                            return Boolean(
                                battle &&
                                battle.isTricolor
                            ) ===
                            Boolean(
                                options.tricolor
                            );

                        }
                    );

            }

        }


        return analyze(
            filtered
        );
    }


    // ========================================
    // Public API
    // ========================================

    window.Analyzer = {

        analyze:
            analyze,

        analyzeFiltered:
            analyzeFiltered,

        summarize:
            summarize,

        resultDistribution:
            resultDistribution,

        analyzeRules:
            analyzeRules,

        analyzeModes:
            analyzeModes,

        analyzeStages:
            analyzeStages,

        analyzeWeapons:
            analyzeWeapons,

        analyzeSpecials:
            analyzeSpecials,

        analyzeTricolor:
            analyzeTricolor,

        analyzePaint:
            analyzePaint,

        analyzeCombat:
            analyzeCombat,

        analyzeByDate:
            analyzeByDate,

        getWeaponHistory:
            getWeaponHistory

    };


})();
