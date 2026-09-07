// =========================
// Analyzer
// InkBoard
// Battle Statistics
// =========================

(function () {

    "use strict";


    // ========================================
    // Utility
    // ========================================

    function number(value) {

        const n = Number(value);

        return Number.isFinite(n) ? n : 0;
    }


    function safeArray(value) {

        return Array.isArray(value)
            ? value
            : [];
    }


    function percentage(value) {

        return Math.round(
            value * 1000
        ) / 10;
    }


    function average(total, count) {

        if (!count) {
            return 0;
        }

        return Math.round(
            (total / count) * 10
        ) / 10;
    }


    function getResult(battle) {

        return String(
            battle &&
            battle.judgement
                ? battle.judgement
                : ""
        ).toUpperCase();
    }


    function isWin(battle) {

        return getResult(battle) === "WIN";
    }


    function isLose(battle) {

        return getResult(battle) === "LOSE";
    }


    function getPlayer(battle) {

        if (
            battle &&
            battle.player
        ) {

            return battle.player;

        }

        return {
            paint: 0,
            weapon: {
                id: "",
                name: ""
            },
            result: {
                kill: 0,
                death: 0,
                assist: 0,
                special: 0
            }
        };
    }


    function getPlayerResult(battle) {

        const player =
            getPlayer(battle);


        return player.result || {
            kill: 0,
            death: 0,
            assist: 0,
            special: 0
        };
    }


    // ========================================
    // Basic Summary
    // ========================================

    function summarize(battles) {

        const list =
            safeArray(battles);


        let wins = 0;

        let loses = 0;

        let unknown = 0;

        let kills = 0;

        let assists = 0;

        let deaths = 0;

        let specials = 0;

        let paint = 0;


        list.forEach(function (battle) {

            const result =
                getResult(battle);


            if (result === "WIN") {

                wins++;

            } else if (result === "LOSE") {

                loses++;

            } else {

                unknown++;

            }


            const playerResult =
                getPlayerResult(battle);


            kills +=
                number(playerResult.kill);

            assists +=
                number(playerResult.assist);

            deaths +=
                number(playerResult.death);

            specials +=
                number(playerResult.special);


            paint +=
                number(
                    getPlayer(battle).paint
                );

        });


        const judged =
            wins + loses;


        return {

            battles:
                list.length,

            wins:
                wins,

            loses:
                loses,

            unknown:
                unknown,

            judged:
                judged,

            winRate:
                judged
                    ? percentage(wins / judged)
                    : 0,

            loseRate:
                judged
                    ? percentage(loses / judged)
                    : 0,

            totalKills:
                kills,

            totalAssists:
                assists,

            totalDeaths:
                deaths,

            totalSpecials:
                specials,

            totalPaint:
                paint,

            averageKills:
                average(kills, list.length),

            averageAssists:
                average(assists, list.length),

            averageDeaths:
                average(deaths, list.length),

            averageSpecials:
                average(specials, list.length),

            averagePaint:
                average(paint, list.length),

            kd:
                deaths
                    ? Math.round(
                        ((kills + assists) / deaths) * 100
                    ) / 100
                    : kills + assists

        };
    }


    // ========================================
    // Result Distribution
    // ========================================

    function resultDistribution(battles) {

        const list =
            safeArray(battles);


        let win = 0;

        let lose = 0;

        let other = 0;


        list.forEach(function (battle) {

            const result =
                getResult(battle);


            if (result === "WIN") {

                win++;

            } else if (result === "LOSE") {

                lose++;

            } else {

                other++;

            }

        });


        return {

            win: win,

            lose: lose,

            other: other,

            total:
                win +
                lose +
                other

        };
    }


    // ========================================
    // Group Helper
    // ========================================

    function groupBy(battles, getKey) {

        const groups = new Map();


        safeArray(battles).forEach(
            function (battle) {

                const key =
                    String(
                        getKey(battle) || "unknown"
                    );


                if (!groups.has(key)) {

                    groups.set(
                        key,
                        []
                    );

                }


                groups
                    .get(key)
                    .push(battle);

            }
        );


        return groups;
    }


    // ========================================
    // Group Statistics
    // ========================================

    function analyzeGroups(battles, getKey, getName) {

        const groups =
            groupBy(
                battles,
                getKey
            );


        const result = [];


        groups.forEach(
            function (items, key) {

                const summary =
                    summarize(items);


                result.push({

                    key:
                        key,

                    name:
                        getName
                            ? getName(items[0], key)
                            : key,

                    count:
                        items.length,

                    wins:
                        summary.wins,

                    loses:
                        summary.loses,

                    winRate:
                        summary.winRate,

                    averageKills:
                        summary.averageKills,

                    averageAssists:
                        summary.averageAssists,

                    averageDeaths:
                        summary.averageDeaths,

                    averageSpecials:
                        summary.averageSpecials,

                    averagePaint:
                        summary.averagePaint,

                    kd:
                        summary.kd,

                    battles:
                        items

                });

            }
        );


        result.sort(function (a, b) {

            if (b.count !== a.count) {

                return b.count - a.count;

            }

            return b.winRate - a.winRate;

        });


        return result;
    }


    // ========================================
    // Rule Analysis
    // ========================================

    function analyzeRules(battles) {

        return analyzeGroups(

            battles,

            function (battle) {

                return battle &&
                    battle.rule
                    ? battle.rule.code
                    : "";

            },

            function (battle) {

                return battle &&
                    battle.rule
                    ? battle.rule.name
                    : "不明";

            }

        );
    }


    // ========================================
    // Mode Analysis
    // ========================================

    function analyzeModes(battles) {

        return analyzeGroups(

            battles,

            function (battle) {

                return battle &&
                    battle.mode
                    ? battle.mode.mode
                    : "";

            },

            function (battle) {

                return battle &&
                    battle.mode
                    ? battle.mode.name
                    : "不明";

            }

        );
    }


    // ========================================
    // Stage Analysis
    // ========================================

    function analyzeStages(battles) {

        return analyzeGroups(

            battles,

            function (battle) {

                return battle &&
                    battle.stage
                    ? battle.stage.id ||
                        battle.stage.name
                    : "";

            },

            function (battle) {

                return battle &&
                    battle.stage
                    ? battle.stage.name
                    : "不明";

            }

        );
    }


    // ========================================
    // Weapon Analysis
    // ========================================

    function analyzeWeapons(battles) {

        return analyzeGroups(

            battles,

            function (battle) {

                const player =
                    getPlayer(battle);


                const weapon =
                    player.weapon || {};


                return weapon.id ||
                    weapon.name ||
                    "";

            },

            function (battle) {

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
