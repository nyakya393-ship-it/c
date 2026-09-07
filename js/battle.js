// =========================
// Battle System
// InkBoard
// =========================

(function () {
    "use strict";

    const Battle = {

        state: {
            battles: [],
            filteredBattles: [],
            currentBattle: null,
            currentFilter: "all",
            initialized: false
        },

        // =========================
        // Basic Utilities
        // =========================

        el: function (tag, className, text) {

            const element =
                document.createElement(tag);

            if (className) {
                element.className = className;
            }

            if (text !== undefined) {
                element.textContent = String(text);
            }

            return element;
        },

        clear: function (element) {

            if (!element) {
                return;
            }

            while (element.firstChild) {
                element.removeChild(
                    element.firstChild
                );
            }
        },

        text: function (value, fallback) {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return fallback || "";
            }

            return String(value);
        },

        number: function (value, fallback) {

            const number =
                Number(value);

            if (Number.isFinite(number)) {
                return number;
            }

            return fallback || 0;
        },

        percent: function (value) {

            const number =
                this.number(value);

            if (number <= 1) {
                return Math.round(
                    number * 1000
                ) / 10;
            }

            return Math.round(
                number * 10
            ) / 10;
        },

        formatDate: function (value) {

            if (!value) {
                return "日時不明";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return String(value);
            }

            const y =
                date.getFullYear();

            const m =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const d =
                String(
                    date.getDate()
                ).padStart(2, "0");

            const h =
                String(
                    date.getHours()
                ).padStart(2, "0");

            const min =
                String(
                    date.getMinutes()
                ).padStart(2, "0");

            return (
                y +
                "/" +
                m +
                "/" +
                d +
                " " +
                h +
                ":" +
                min
            );
        },

        // =========================
        // Result
        // =========================

        getResult: function (battle) {

            if (!battle) {
                return "UNKNOWN";
            }

            const result =
                battle.result ||
                battle.judgement ||
                (
                    battle.myTeam &&
                    battle.myTeam.judgement
                );

            if (!result) {
                return "UNKNOWN";
            }

            const value =
                String(result).toUpperCase();

            if (
                value === "WIN" ||
                value === "LOSE" ||
                value === "LOSS"
            ) {
                return value === "LOSS"
                    ? "LOSE"
                    : value;
            }

            if (
                value.includes("WIN")
            ) {
                return "WIN";
            }

            if (
                value.includes("LOSE") ||
                value.includes("LOSS")
            ) {
                return "LOSE";
            }

            return "UNKNOWN";
        },

        getResultLabel: function (result) {

            switch (result) {

                case "WIN":
                    return "WIN";

                case "LOSE":
                    return "LOSE";

                default:
                    return "—";
            }
        },

        // =========================
        // Image
        // =========================

        createImage: function (
            src,
            className,
            alt
        ) {

            const image =
                this.el(
                    "img",
                    className || ""
                );

            image.alt =
                alt || "";

            image.loading =
                "lazy";

            if (src) {

                image.src =
                    src;

            } else {

                image.classList.add(
                    "image-missing"
                );
            }

            image.addEventListener(
                "error",
                function () {

                    image.classList.add(
                        "image-error"
                    );

                    image.removeAttribute(
                        "src"
                    );
                },
                { once: true }
            );

            return image;
        },

        // =========================
        // Weapon
        // =========================

        getWeapon: function (player) {

            if (
                !player ||
                !player.weapon
            ) {
                return null;
            }

            return player.weapon;
        },

        createWeaponImage: function (
            weapon,
            className
        ) {

            const wrapper =
                this.el(
                    "div",
                    className ||
                    "battle-weapon-image"
                );

            if (!weapon) {
                return wrapper;
            }

            const imageUrl =
                weapon.image ||
                weapon.image2d ||
                weapon.thumbnail;

            if (imageUrl) {

                wrapper.append(
                    this.createImage(
                        imageUrl,
                        "weapon-icon",
                        weapon.name || "ブキ"
                    )
                );

            } else {

                wrapper.classList.add(
                    "image-missing"
                );
            }

            return wrapper;
        },

        // =========================
        // Player
        // =========================

        getPlayers: function (team) {

            if (
                !team ||
                !Array.isArray(team.players)
            ) {
                return [];
            }

            return team.players;
        },

        getMyPlayer: function (battle) {

            if (!battle) {
                return null;
            }

            if (
                battle.player &&
                battle.player.isMyself
            ) {
                return battle.player;
            }

            const teams =
                battle.teams || [];

            for (
                let i = 0;
                i < teams.length;
                i++
            ) {

                const players =
                    this.getPlayers(
                        teams[i]
                    );

                const player =
                    players.find(
                        function (item) {
                            return (
                                item &&
                                item.isMyself
                            );
                        }
                    );

                if (player) {
                    return player;
                }
            }

            if (
                battle.player
            ) {
                return battle.player;
            }

            return null;
        },

        getPlayerName: function (
            player
        ) {

            if (!player) {
                return "名無し";
            }

            return (
                player.name ||
                player.callSign ||
                player.byname ||
                "名無し"
            );
        },

        getPlayerStats: function (
            player
        ) {

            const result =
                player &&
                player.result
                    ? player.result
                    : {};

            return {
                kill: this.number(
                    result.kill
                ),
                assist: this.number(
                    result.assist
                ),
                death: this.number(
                    result.death
                ),
                special: this.number(
                    result.special
                ),
                paint: this.number(
                    player &&
                    player.paint
                ),
                noroshiTry: this.number(
                    result.noroshiTry
                )
            };
        },

        // =========================
        // Player Detail
        // =========================

        createGearRow: function (
            label,
            gear
        ) {

            const row =
                this.el(
                    "div",
                    "player-gear-row"
                );

            const title =
                this.el(
                    "span",
                    "player-gear-label",
                    label
                );

            const content =
                this.el(
                    "div",
                    "player-gear-content"
                );

            if (gear) {

                if (gear.image) {

                    content.append(
                        this.createImage(
                            gear.image,
                            "gear-image",
                            gear.name || label
                        )
                    );
                }

                content.append(
                    this.el(
                        "span",
                        "player-gear-name",
                        gear.name || "不明"
                    )
                );

            } else {

                content.append(
                    this.el(
                        "span",
                        "player-gear-name",
                        "—"
                    )
                );
            }

            row.append(
                title,
                content
            );

            return row;
        },

        createPlayerDetail: function (
            player
        ) {

            const panel =
                this.el(
                    "div",
                    "player-detail-panel"
                );

            if (!player) {
                return panel;
            }

            const header =
                this.el(
                    "div",
                    "player-detail-header"
                );

            if (
                player.nameplate &&
                player.nameplate.image
            ) {

                header.append(
                    this.createImage(
                        player.nameplate.image,
                        "player-nameplate-image",
                        "ネームプレート"
                    )
                );
            }

            const nameBlock =
                this.el(
                    "div",
                    "player-detail-name"
                );

            nameBlock.append(
                this.el(
                    "div",
                    "player-name",
                    this.getPlayerName(
                        player
                    )
                )
            );

            if (player.byname) {

                nameBlock.append(
                    this.el(
                        "div",
                        "player-byname",
                        player.byname
                    )
                );
            }

            header.append(
                nameBlock
            );

            panel.append(
                header
            );

            // -------------------------
            // Weapon
            // -------------------------

            const weapon =
                this.getWeapon(player);

            if (weapon) {

                const weaponBox =
                    this.el(
                        "div",
                        "player-detail-weapon"
                    );

                weaponBox.append(
                    this.createWeaponImage(
                        weapon,
                        "player-detail-weapon-image"
                    )
                );

                const weaponInfo =
                    this.el(
                        "div",
                        "player-detail-weapon-info"
                    );

                weaponInfo.append(
                    this.el(
                        "div",
                        "player-detail-weapon-name",
                        weapon.name || "不明"
                    )
                );

                if (
                    weapon.subWeapon &&
                    weapon.subWeapon.name
                ) {

                    weaponInfo.append(
                        this.el(
                            "div",
                            "player-detail-sub",
                            "サブ  " +
                            weapon.subWeapon.name
                        )
                    );
                }

                if (
                    weapon.specialWeapon &&
                    weapon.specialWeapon.name
                ) {

                    weaponInfo.append(
                        this.el(
                            "div",
                            "player-detail-special",
                            "スペシャル  " +
                            weapon.specialWeapon.name
                        )
                    );
                }

                weaponBox.append(
                    weaponInfo
                );

                panel.append(
                    weaponBox
                );
            }

            // -------------------------
            // Stats
            // -------------------------

            const stats =
                this.getPlayerStats(
                    player
                );

            const statsBox =
                this.el(
                    "div",
                    "player-detail-stats"
                );

            const statItems = [
                ["K", stats.kill],
                ["A", stats.assist],
                ["D", stats.death],
                ["SP", stats.special],
                ["塗り", stats.paint]
            ];

            statItems.forEach(
                function (item) {

                    const box =
                        this.el(
                            "div",
                            "player-stat"
                        );

                    box.append(
                        this.el(
                            "span",
                            "player-stat-label",
                            item[0]
                        ),
                        this.el(
                            "strong",
                            "player-stat-value",
                            item[1]
                        )
                    );

                    statsBox.append(
                        box
                    );
                }
            );

            panel.append(
                statsBox
            );

            // -------------------------
            // Gear
            // -------------------------

            const gearBox =
                this.el(
                    "div",
                    "player-gear-list"
                );

            gearBox.append(
                this.createGearRow(
                    "アタマ",
                    player.headGear
                ),
                this.createGearRow(
                    "フク",
                    player.clothingGear
                ),
                this.createGearRow(
                    "クツ",
                    player.shoesGear
                )
            );

            panel.append(
                gearBox
            );

            return panel;
        },

        // =========================
        // Team Color
        // =========================

        getTeamColor: function (
            team
        ) {

            if (
                !team ||
                !team.color
            ) {
                return "";
            }

            if (
                typeof team.color === "string"
            ) {
                return team.color;
            }

            return (
                team.color.cssColor ||
                team.color.hex ||
                team.color.value ||
                team.color.color ||
                ""
            );
        },

        applyTeamColor: function (
            element,
            team
        ) {

            const color =
                this.getTeamColor(
                    team
                );

            if (
                element &&
                color
            ) {

                element.style.setProperty(
                    "--team-color",
                    color
                );

                element.style.setProperty(
                    "--ink-color",
                    color
                );
            }
        },

        // =========================
        // Team Role
        // =========================

        getRoleLabel: function (
            role
        ) {

            switch (
                String(role || "")
                    .toUpperCase()
            ) {

                case "DEFENSE":
                    return "守備側";

                case "ATTACK":
                case "ATTACK1":
                    return "攻撃側";

                case "ATTACK2":
                    return "攻撃側";

                default:
                    return role || "";
            }
        },

        // =========================
        // Team Card
        // =========================

        createPlayerCard: function (
            player
        ) {

            const card =
                this.el(
                    "button",
                    "battle-player-card"
                );

            card.type =
                "button";

            const weapon =
                this.getWeapon(
                    player
                );

            card.append(
                this.createWeaponImage(
                    weapon,
                    "battle-player-weapon"
                )
            );

            const information =
                this.el(
                    "div",
                    "battle-player-info"
                );

            information.append(
                this.el(
                    "div",
                    "battle-player-name",
                    this.getPlayerName(
                        player
                    )
                )
            );

            const stats =
                this.getPlayerStats(
                    player
                );

            information.append(
                this.el(
                    "div",
                    "battle-player-stats",
                    stats.kill +
                    "/" +
                    stats.assist +
                    "/" +
                    stats.death
                )
            );

            card.append(
                information
            );

            card.addEventListener(
                "click",
        
        const center =
            el(
                "span",
                "result-player-center"
            );


        const name =
            el(
                "span",
                "result-player-name",
                safeString(
                    player &&
                    player.name,
                    "プレイヤー"
                )
            );


        center.append(
            name
        );


        if (
            player &&
            player.byname
        ) {

            center.append(
                el(
                    "span",
                    "result-player-byname",
                    player.byname
                )
            );

        }


        const stats =
            createPlayerStats(
                player
            );


        const paint =
            el(
                "span",
                "result-player-paint",
                formatNumber(
                    player &&
                    player.paint
                )
            );


        card.append(
            weaponArea,
            center,
            stats,
            paint
        );


        if (clickable !== false) {

            card.addEventListener(
                "click",
                function () {

                    showPlayerDetail(
                        player,
                        teamIndex,
                        playerIndex
                    );

                }
            );

        } else {

            card.disabled =
                true;

        }


        return card;

    }


    /* =======================================================
       PLAYER DETAIL
    ======================================================= */

    function createGearItem(
        gear,
        label
    ) {

        const item =
            el(
                "div",
                "gear-item"
            );


        const image =
            createImage(
                gear &&
                gear.image,
                label,
                "gear-image"
            );


        const info =
            el(
                "div",
                "gear-info"
            );


        info.append(
            el(
                "div",
                "gear-label",
                label
            ),
            el(
                "div",
                "gear-name",
                safeString(
                    gear &&
                    gear.name,
                    "不明"
                )
            )
        );


        item.append(
            image,
            info
        );


        return item;

    }


    function showPlayerDetail(
        player,
        teamIndex,
        playerIndex
    ) {

        if (!player) {
            return;
        }


        const container =
            document.getElementById(
                "battleDetail"
            );


        if (!container) {
            return;
        }


        const current =
            container.querySelector(
                ".player-detail-panel"
            );


        if (current) {

            current.remove();

        }


        const panel =
            el(
                "section",
                "player-detail-panel"
            );


        const header =
            el(
                "div",
                "player-detail-header"
            );


        const close =
            el(
                "button",
                "player-detail-close",
                "閉じる"
            );


        close.type =
            "button";


        close.addEventListener(
            "click",
            function () {

                panel.remove();

            }
        );


        const nameArea =
            el(
                "div",
                "player-detail-name-area"
            );


        nameArea.append(
            el(
                "div",
                "player-detail-name",
                safeString(
                    player.name,
                    "プレイヤー"
                )
            )
        );


        if (
            player.byname
        ) {

            nameArea.append(
                el(
                    "div",
                    "player-detail-byname",
                    player.byname
                )
            );

        }


        header.append(
            nameArea,
            close
        );


        const nameplate =
            el(
                "div",
                "player-nameplate"
            );


        if (
            player.nameplate &&
            player.nameplate.image
        ) {

            nameplate.append(
                createImage(
                    player.nameplate.image,
                    "ネームプレート",
                    "player-nameplate-image"
                )
            );

        }


        const weapon =
            getWeapon(
                player
            );


        const weaponBox =
            el(
                "div",
                "player-detail-weapon"
            );


        weaponBox.append(
            createWeaponImage(
                player,
                "player-detail-weapon-image"
            )
        );


        const weaponInfo =
            el(
                "div",
                "player-detail-weapon-info"
            );


        weaponInfo.append(
            el(
                "div",
                "player-detail-section-label",
                "ブキ"
            ),
            el(
                "div",
                "player-detail-weapon-name",
                safeString(
                    weapon &&
                    weapon.name,
                    "不明"
                )
            )
        );


        if (
            weapon &&
            weapon.subWeapon &&
            weapon.subWeapon.name
        ) {

            weaponInfo.append(
                el(
                    "div",
                    "player-detail-subweapon",
                    "サブ："
                    +
                    weapon.subWeapon.name
                )
            );

        }


        if (
            weapon &&
            weapon.specialWeapon &&
            weapon.specialWeapon.name
        ) {

            weaponInfo.append(
                el(
                    "div",
                    "player-detail-special",
                    "スペシャル："
                    +
                    weapon.specialWeapon.name
                )
            );

        }


        weaponBox.append(
            weaponInfo
        );


        const result =
            player.result || {};


        const combat =
            el(
                "div",
                "player-detail-combat"
            );


        const combatValues = [

            [
                "キル",
                result.kill
            ],

            [
                "アシスト",
                result.assist
            ],

            [
                "デス",
                result.death
            ],

            [
                "スペシャル",
                result.special
            ],

            [
                "塗り",
                player.paint
            ]

        ];


        combatValues.forEach(
            function (item) {

                const box =
                    el(
                        "div",
                        "player-detail-stat"
                    );


                box.append(
                    el(
                        "span",
                        "player-detail-stat-label",
                        item[0]
                    ),
                    el(
                        "strong",
                        "player-detail-stat-value",
                        formatNumber(
                            item[1]
                        )
                    )
                );


                combat.append(
                    box
                );

            }
        );


        const gear =
            el(
                "div",
                "gear-list"
            );


        gear.append(
            createGearItem(
                player.headGear,
                "アタマ"
            ),
            createGearItem(
                player.clothingGear,
                "フク"
            ),
            createGearItem(
                player.shoesGear,
                "クツ"
            )
        );


        panel.append(
            header,
            nameplate,
            weaponBox,
            combat,
            gear
        );


        container.append(
            panel
        );


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =======================================================
       TEAM COLOR
    ======================================================= */

    function getTeamColor(
        team
    ) {

        const color =
            team &&
            team.color;


        if (!color) {

            return "";

        }


        if (
            typeof color === "string"
        ) {

            return color;

        }


        if (
            typeof color === "object"
        ) {

            return (
                color.cssColor ||
                color.hex ||
                color.color ||
                color.main ||
                color.value ||
                color.rgb ||
                ""
            );

        }


        return "";

    }


    function applyTeamColor(
        element,
        team
    ) {

        if (!element) {
            return;
        }


        const color =
            getTeamColor(
                team
            );


        if (!color) {
            return;
        }


        /*
         * 実データのcolorを
         * CSS変数として渡す。
         */

        element.style.setProperty(
            "--team-color",
            color
        );


        element.style.setProperty(
            "--ink-color",
            color
        );

    }


    /* ===================================================ImportButton"
                >
                    <span class="material-symbols-rounded">
                        upload_file
                    </span>

                    データをインポート
                </button>

            </div>

        `;


        const button =
            getElement(
                "battleEmptyImportButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    const input =
                        getElement(
                            "fileInput"
                        );


                    if (input) {
                        input.click();
                    }

                }
            );

        }
    }


    // ========================================
    // Render Battle List
    // ========================================

    async function renderList() {

        const container =
            getBattleListElement();


        if (!container) {
            return;
        }


        try {

            await loadBattles();

        } catch (error) {

            console.error(
                error
            );


            battles = [];

        }


        if (battles.length === 0) {

            renderEmptyList();

            updateSummary(
                []
            );

            return;
        }


        container.innerHTML = "";


        const fragment =
            document.createDocumentFragment();


        battles.forEach(
            function (battle) {

                fragment.appendChild(
                    createBattleRow(
                        battle
                    )
                );

            }
        );


        container.appendChild(
            fragment
        );


        updateSummary(
            battles
        );
    }


    // ========================================
    // Summary
    // ========================================

    function updateSummary(list) {

        const battlesList =
            array(list);


        let wins = 0;

        let loses = 0;


        battlesList.forEach(
            function (battle) {

                const result =
                    safeString(
                        battle.judgement
                    ).toUpperCase();


                if (result === "WIN") {

                    wins++;

                } else if (result === "LOSE") {

                    loses++;

                }

            }
        );


        const judged =
            wins + loses;


        const rate =
            judged
                ? Math.round(
                    wins /
                    judged *
                    1000
                ) / 10
                : 0;


        const winElement =
            getElement(
                "battleWinRate"
            );


        const winsElement =
            getElement(
                "battleWins"
            );


        const losesElement =
            getElement(
                "battleLoses"
            );


        const totalElement =
            getElement(
                "battleTotal"
            );


        if (winElement) {

            winElement.textContent =
                rate + "%";

        }


        if (winsElement) {

            winsElement.textContent =
                String(wins);

        }


        if (losesElement) {

            losesElement.textContent =
                String(loses);

        }


        if (totalElement) {

            totalElement.textContent =
                String(battlesList.length);

        }

    }


    // ========================================
    // Team Color
    // ========================================

    function getTeamColorStyle(team) {

        if (
            !team ||
            !team.color
        ) {
            return "";
        }


        const color =
            team.color;


        if (typeof color === "string") {

            return color;

        }


        if (
            color &&
            typeof color === "object"
        ) {

            if (color.hex) {
                return color.hex;
            }


            if (color.r !== undefined) {

                const r =
                    number(color.r);


                const g =
                    number(color.g);


                const b =
                    number(color.b);


                return (
                    "rgb(" +
                    r +
                    "," +
                    g +
                    "," +
                    b +
                    ")"
                );

            }

        }


        return "";
    }


    // ========================================
    // Player Stats
    // ========================================

    function createPlayerStats(player) {

        const result =
            player &&
            player.result
                ? player.result
                : {};


        return `

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.kill
                    )}
                </span>
                <span class="player-stat-label">
                    K
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.assist
                    )}
                </span>
                <span class="player-stat-label">
                    A
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.death
                    )}
                </span>
                <span class="player-stat-label">
                    D
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.special
                    )}
                </span>
                <span class="player-stat-label">
                    SP
                </span>
            </span>

        `;
    }


    // ========================================
    // Player Card
    // ========================================

    function createPlayerCard(
        player,
        team
    ) {

        if (!player) {
            return "";
        }


        const weapon =
            player.weapon || {};


        const weaponImage =
            getWeaponImage(
                weapon
            );


        const imageHTML =
            weaponImage
                ? `
                    <img
                        class="detail-player-weapon"
                        src="${escapeHTML(
                            weaponImage
                        )}"
                        alt=""
                        loading="lazy"
                    >
                `
                : `
                    <span class="material-symbols-rounded detail-player-weapon-placeholder">
                        construction
                    </span>
                `;


        const myselfClass =
            player.isMyself
                ? " myself"
                : "";


        const myselfBadge =
            player.isMyself
                ? `
                    <span class="player-myself">
                        YOU
                    </span>
                `
                : "";


        const teamColor =
            getTeamColorStyle(
                team
            );


        const colorStyle =
            teamColor
                ? `style="--team-color:${escapeHTML(
                    teamColor
                )}"`
                : "";


        return `

            <div
                class="detail-player${myselfClass}"
                ${colorStyle}
            >

                <div class="detail-player-weapon-wrap">
                    ${imageHTML}
                </div>


                <div class="detail-player-main">

                    <div class="detail-player-name">

                        <span>
                            ${escapeHTML(
                                player.name ||
                                "プレイヤー"
                            )}
                        </span>

                        ${myselfBadge}

                    </div>


                    <div class="detail-player-byname">
                        ${escapeHTML(
                            player.byname ||
                            player.callSign ||
                            ""
                        )}
                    </div>


                    <div class="detail-player-weapon-name">
                        ${escapeHTML(
                            weapon.name ||
                            "ブキ不明"
                        )}
                    </div>

                </div>


                <div class="detail-player-stats">

                    ${createPlayerStats(
                        player
                    )}

                </div>

            </div>

        `;
    }


    // ========================================
    // Team Card
    // ========================================

    function createTeamCard(
        team,
        index,
        isMyTeam
    ) {

        if (!team) {
            return "";
        }


        const players =
            array(team.players);


        const teamColor =
            getTeamColorStyle(
                team
            );


        const colorStyle =
            teamColor
                ? `style="--team-color:${escapeHTML(
                    teamColor
                )}"`
                : "";


        const result =
            safeString(
                team.judgement
            );


        const resultClass =
            getResultClass(
                result
=====================================================
       BATTLE ROW
    ===================================================== */

    function createBattleRow(battle){

        const resultClass = getResultClass(
            battle.judgement
        );

        const resultText = getResultText(
            battle.judgement
        );

        const ruleName = safeString(
            battle.rule &&
            battle.rule.name,
            "ルール不明"
        );

        const stageName = safeString(
            battle.stage &&
            battle.stage.name,
            "ステージ不明"
        );

        const weaponName = getWeaponName(
            getMyPlayer(battle)
        );

        const stageImage = imageURL(
            battle.stage &&
            battle.stage.image
        );

        const weaponImage = getWeaponImage(
            getMyPlayer(battle)
        );

        const time = formatPlayedTime(
            battle.playedTime
        );

        const tricolor = battle.isTricolor;

        const row = document.createElement("button");

        row.type = "button";
        row.className = `battle-row ${resultClass}`;

        row.dataset.battleId = safeString(
            battle.id
        );

        row.innerHTML = `

            <div class="battle-row-result">
                <span class="battle-result-mark">
                    ${escapeHTML(resultText)}
                </span>

                ${
                    tricolor
                        ? `<span class="battle-tricolor-label">トリカラ</span>`
                        : ""
                }
            </div>

            <div class="battle-row-main">

                <div class="battle-row-stage">

                    ${
                        stageImage
                            ? `
                            <img
                                class="battle-row-stage-image"
                                src="${escapeHTML(stageImage)}"
                                alt=""
                            >
                            `
                            : ""
                    }

                    <div class="battle-row-stage-text">
                        <strong>
                            ${escapeHTML(stageName)}
                        </strong>

                        <span>
                            ${escapeHTML(ruleName)}
                        </span>
                    </div>

                </div>

                <div class="battle-row-weapon">

                    ${
                        weaponImage
                            ? `
                            <img
                                src="${escapeHTML(weaponImage)}"
                                alt=""
                            >
                            `
                            : ""
                    }

                    <span>
                        ${escapeHTML(weaponName)}
                    </span>

                </div>

            </div>

            <div class="battle-row-meta">
                ${escapeHTML(time)}
            </div>

        `;

        row.addEventListener("click", () => {

            const event = new CustomEvent(
                "openBattleDetail",
                {
                    detail: {
                        battleId: battle.id
                    }
                }
            );

            document.dispatchEvent(event);
        });

        return row;
    }


    /* =====================================================
       EMPTY
    ===================================================== */

    function renderEmptyList(){

        const list = document.getElementById(
            "battleList"
        );

        if(!list){
            return;
        }

        list.innerHTML = `

            <div class="battle-empty">

                <span class="material-symbols-rounded">
                    sports_esports
                </span>

                <h3>
                    まだバトル記録がありません
                </h3>

                <p>
                    ホラガイベイのJSONデータを
                    読み込んでください。
                </p>

                <button
                    type="button"
                    data-action="import"
                >
                    データを読み込む
                </button>

            </div>

        `;
    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary(battles){

        const total = battles.length;

        const wins = battles.filter(
            battle =>
                getResultClass(battle.judgement) === "win"
        ).length;

        const loses = battles.filter(
            battle =>
                getResultClass(battle.judgement) === "lose"
        ).length;

        const rate =
            wins + loses > 0
                ? ((wins / (wins + loses)) * 100).toFixed(1)
                : "0.0";

        const winElement =
            document.getElementById("battleWinRate");

        const winsElement =
            document.getElementById("battleWins");

        const losesElement =
            document.getElementById("battleLoses");

        const totalElement =
            document.getElementById("battleTotal");

        if(winElement){
            winElement.textContent =
                `${rate}%`;
        }

        if(winsElement){
            winsElement.textContent =
                String(wins);
        }

        if(losesElement){
            losesElement.textContent =
                String(loses);
        }

        if(totalElement){
            totalElement.textContent =
                String(total);
        }
    }


    /* =====================================================
       LIST
    ===================================================== */

    function renderList(battles = state.battles){

        const list =
            document.getElementById("battleList");

        if(!list){
            return;
        }

        if(!battles.length){

            renderEmptyList();
            updateSummary([]);

            return;
        }

        list.innerHTML = "";

        battles.forEach(battle => {

            list.appendChild(
                createBattleRow(battle)
            );

        });

        updateSummary(battles);
    }


    /* =====================================================
       PLAYER STATS
    ===================================================== */

    function createPlayerStats(player){

        const result =
            getPlayerResult(player);

        const paint =
            getPlayerPaint(player);

        return `

            <div class="result-player-stats">

                <span>
                    <b>${result.kill}</b>K
                </span>

                <span>
                    <b>${result.assist}</b>A
                </span>

                <span>
                    <b>${result.death}</b>D
                </span>

                <span>
                    <b>${result.special}</b>SP
                </span>

                <span class="paint-stat">
                    <b>${formatNumber(paint)}</b>p
                </span>

            </div>

        `;
    }


    /* =====================================================
       PLAYER CARD
    ===================================================== */

    function createPlayerCard(
        player,
        teamColor,
        isMine = false
    ){

        const name =
            getPlayerName(player);

        const title =
            getPlayerTitle(player);

        const weapon =
            getWeaponName(player);

        const weaponImage =
            getWeaponImage(
                player.weapon
            );

        const specialImage =
            getSpecialImage(
                player.weapon
            );

        const specialName =
            getSpecialName(player);

        const subName =
            getSubName(player);

        const playerId =
            safeString(
                player.id ||
                player.nameId ||
                name
            );

        return `

            <button
                type="button"
                class="
                    result-player
                    ${isMine ? "is-me" : ""}
                "
                data-player-id="${escapeHTML(playerId)}"
                style="
                    --player-ink:${escapeHTML(teamColor)};
                "
            >

                <div class="result-player-color"></div>

                <div class="result-player-identity">

                    <div class="result-player-name-line">

                        ${
                            isMine
                                ? `
                                <span class="result-me-label">
                                    YOU
                                </span>
                                `
                                : ""
                        }

                        <strong class="result-player-name">
                            ${escapeHTML(name)}
                        </strong>

                    </div>

                    ${
                        title
                            ? `
                            <span class="result-player-title">
                                ${escapeHTML(title)}
                            </span>
                            `
                            : ""
                    }

                    <span class="result-player-weapon-name">
                        ${escapeHTML(weapon)}
                    </span>

                </div>

                <div class="result-player-weapon">

                    ${
                        weaponImage
                            ? `
                            <img
                                src="${escapeHTML(weaponImage)}"
                                alt="${escapeHTML(weapon)}"
                            >
ImportButton"
                >
                    <span class="material-symbols-rounded">
                        upload_file
                    </span>

                    データをインポート
                </button>

            </div>

        `;


        const button =
            getElement(
                "battleEmptyImportButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    const input =
                        getElement(
                            "fileInput"
                        );


                    if (input) {
                        input.click();
                    }

                }
            );

        }
    }


    // ========================================
    // Render Battle List
    // ========================================

    async function renderList() {

        const container =
            getBattleListElement();


        if (!container) {
            return;
        }


        try {

            await loadBattles();

        } catch (error) {

            console.error(
                error
            );


            battles = [];

        }


        if (battles.length === 0) {

            renderEmptyList();

            updateSummary(
                []
            );

            return;
        }


        container.innerHTML = "";


        const fragment =
            document.createDocumentFragment();


        battles.forEach(
            function (battle) {

                fragment.appendChild(
                    createBattleRow(
                        battle
                    )
                );

            }
        );


        container.appendChild(
            fragment
        );


        updateSummary(
            battles
        );
    }


    // ========================================
    // Summary
    // ========================================

    function updateSummary(list) {

        const battlesList =
            array(list);


        let wins = 0;

        let loses = 0;


        battlesList.forEach(
            function (battle) {

                const result =
                    safeString(
                        battle.judgement
                    ).toUpperCase();


                if (result === "WIN") {

                    wins++;

                } else if (result === "LOSE") {

                    loses++;

                }

            }
        );


        const judged =
            wins + loses;


        const rate =
            judged
                ? Math.round(
                    wins /
                    judged *
                    1000
                ) / 10
                : 0;


        const winElement =
            getElement(
                "battleWinRate"
            );


        const winsElement =
            getElement(
                "battleWins"
            );


        const losesElement =
            getElement(
                "battleLoses"
            );


        const totalElement =
            getElement(
                "battleTotal"
            );


        if (winElement) {

            winElement.textContent =
                rate + "%";

        }


        if (winsElement) {

            winsElement.textContent =
                String(wins);

        }


        if (losesElement) {

            losesElement.textContent =
                String(loses);

        }


        if (totalElement) {

            totalElement.textContent =
                String(battlesList.length);

        }

    }


    // ========================================
    // Team Color
    // ========================================

    function getTeamColorStyle(team) {

        if (
            !team ||
            !team.color
        ) {
            return "";
        }


        const color =
            team.color;


        if (typeof color === "string") {

            return color;

        }


        if (
            color &&
            typeof color === "object"
        ) {

            if (color.hex) {
                return color.hex;
            }


            if (color.r !== undefined) {

                const r =
                    number(color.r);


                const g =
                    number(color.g);


                const b =
                    number(color.b);


                return (
                    "rgb(" +
                    r +
                    "," +
                    g +
                    "," +
                    b +
                    ")"
                );

            }

        }


        return "";
    }


    // ========================================
    // Player Stats
    // ========================================

    function createPlayerStats(player) {

        const result =
            player &&
            player.result
                ? player.result
                : {};


        return `

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.kill
                    )}
                </span>
                <span class="player-stat-label">
                    K
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.assist
                    )}
                </span>
                <span class="player-stat-label">
                    A
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.death
                    )}
                </span>
                <span class="player-stat-label">
                    D
                </span>
            </span>

            <span class="player-stat">
                <span class="player-stat-value">
                    ${formatNumber(
                        result.special
                    )}
                </span>
                <span class="player-stat-label">
                    SP
                </span>
            </span>

        `;
    }


    // ========================================
    // Player Card
    // ========================================

    function createPlayerCard(
        player,
        team
    ) {

        if (!player) {
            return "";
        }


        const weapon =
            player.weapon || {};


        const weaponImage =
            getWeaponImage(
                weapon
            );


        const imageHTML =
            weaponImage
                ? `
                    <img
                        class="detail-player-weapon"
                        src="${escapeHTML(
                            weaponImage
                        )}"
                        alt=""
                        loading="lazy"
                    >
                `
                : `
                    <span class="material-symbols-rounded detail-player-weapon-placeholder">
                        construction
                    </span>
                `;


        const myselfClass =
            player.isMyself
                ? " myself"
                : "";


        const myselfBadge =
            player.isMyself
                ? `
                    <span class="player-myself">
                        YOU
                    </span>
                `
                : "";


        const teamColor =
            getTeamColorStyle(
                team
            );


        const colorStyle =
            teamColor
                ? `style="--team-color:${escapeHTML(
                    teamColor
                )}"`
                : "";


        return `

            <div
                class="detail-player${myselfClass}"
                ${colorStyle}
            >

                <div class="detail-player-weapon-wrap">
                    ${imageHTML}
                </div>


                <div class="detail-player-main">

                    <div class="detail-player-name">

                        <span>
                            ${escapeHTML(
                                player.name ||
                                "プレイヤー"
                            )}
                        </span>

                        ${myselfBadge}

                    </div>


                    <div class="detail-player-byname">
                        ${escapeHTML(
                            player.byname ||
                            player.callSign ||
                            ""
                        )}
                    </div>


                    <div class="detail-player-weapon-name">
                        ${escapeHTML(
                            weapon.name ||
                            "ブキ不明"
                        )}
                    </div>

                </div>


                <div class="detail-player-stats">

                    ${createPlayerStats(
                        player
                    )}

                </div>

            </div>

        `;
    }


    // ========================================
    // Team Card
    // ========================================

    function createTeamCard(
        team,
        index,
        isMyTeam
    ) {

        if (!team) {
            return "";
        }


        const players =
            array(team.players);


        const teamColor =
            getTeamColorStyle(
                team
            );


        const colorStyle =
            teamColor
                ? `style="--team-color:${escapeHTML(
                    teamColor
                )}"`
                : "";


        const result =
            safeString(
                team.judgement
            );


        const resultClass =
            getResultClass(
                result
            );


        const role =
            safeString(
                team.tricolorRole
            );


        const roleNames = {

            "ATTACK":
                "攻撃",

            "ATTACK1":
                "攻撃",

            "ATTACK2":
                "攻撃",

            "DEFENSE":
                "守備"

        };


        const roleText =
            roleNames[role] ||
            role;


        const teamName =
            team.festTeamName ||
            (
                isMyTeam
                    ? "自分のチーム"
                    : "チーム " +
                        String(index + 1)
            );


        const paintRatio =
            number(
                team.result &&
                team.result.paintRatio
            );


        const paintPercent =
            paintRatio
                ? Math.round(
                    paintRatio * 1000
                ) / 10
                : 0;


        const score =
            number(
                team.result &&
                team.result.score
            );


        const noroshi =
            number(
                team.result &&
                team.result.noroshi
            );


        const playersHTML =
            players.map(
                function (player) {

                    return createPlayerCard(
                        player,
                        team
                    );

                }
            ).join("");


        return `

            <section
                class="detail-team-card ${
                    isMyTeam
                        ? "my-team"
                        : ""
                }"
                ${colorStyle}
            >

                <header class="detail-team-header">

                    <div class="detail-team-title">

                        <span class="detail-team-index">
                            ${escapeHTML(
                                String(index + 1)
                            )}
                        </span>

                        <span class="detail-team-name">
                            ${escapeHTML(
                                teamName
                            )}
                        </span>

                        ${
                            roleText
                                ? `
                                    <span class="tricolor-role">
                                        ${escapeHTML(
                                            roleText
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    ${
                        result
                            ? `
                                <span class="detail-team-result ${resultClass}">
                                    ${escapeHTML(
                                        getResultText(
                                            result
                                        )
                                    )}
                                </span>
                            `
                            : ""
                    }

                </header>


                <div class="detail-team-summary">

                    <div class="detail-team-value">

                        <span class="detail-team-value-number">
                            ${paintPercent}%
                        </span>

                        <span class="detail-team-value-label">
                            塗り
                        </span>

                    </div>


                    ${
                        score
                            ? `
                                <div class="detail-team-value">

                                    <span class="detail-team-value-number">
                                        ${formatNumber(score)}
                                    </span>

                                    <span class="detail-team-value-label">
                                        スコア
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    ${
                        noroshi
                            ? `
                                <div class="detail-team-value">

                                    <span class="detail-team-value-number">
                                        ${formatNumber(noroshi)}
                                    </span>

                                    <span class="detail-team-value-label">
                                        ノロシ
                                    </span>

                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="detail-team-players">

                    ${playersHTML}

                </div>

            </section>

        `;
    }


    // ========================================
    // Weapon / Special Info
    // ========================================

    function createMyWeaponInfo(battle) {

        const player =
            battle.player || {};


        const weapon =
            player.weapon || {};


        const specialImage =
            getSpecialImage(
                weapon
            );


        const specialHTML =
            specialImage
                ? `
                    <img
                        class="my-result-special-image"
                        src="${escapeHTML(
                            specialImage
                        )}"
                        alt=""
                        loading="lazy"
                    >
                `
                : "";


        return `

            <div class="my-result-weapon">

                ${
                    getWeaponImage(weapon)
                        ? `
                            <img
                                class="my-result-weapon-image"
                                src="${escapeHTML(
                                    getWeaponImage(
                                        weapon
                                    )
                                )}"
                                alt=""
                            >
                        `
                        : ""
                }


                <div class="my-result-weapon-text">

                    <span class="my-result-weapon-name">
                        ${escapeHTML(
                            weapon.name ||
                            "ブキ不明"
                        )}
                    </span>

                    <span class="my-result-sub">
                        ${escapeHTML(
                            getSubName(
                                weapon
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="my-result-special">

                ${specialHTML}

                <div class="my-result-special-text">

                    <span class="my-result-special-label">
                        スペシャル
                    </span>

                    <span class="my-result-special-name">
                        ${escapeHTML(
                            getSpecialName(
                                weapon
                            )
                        )}
                    </span>

                </div>

            </div>

        `;
    }


    // ========================================
    // My Result
    // ========================================

    function createMyResult(battle) {

        const player =
            battle.player || {};


        const result =
            player.result || {};


        const judgement =
            getResultClass(
                battle.judgement
            );


        return `

            <section
                class="my-result-card ${judgement}"
            >

                <div class="my-result-header">

                    <div>

                        <span class="my-result-label">
                            RESULT
                        </span>

                        <span class="my-result-value">
                            ${escapeHTML(
                                getResultText(
                                    battle.judgement
                                )
                            )}
                        </span>

                    </div>


                    <div class="my-result-time">

                        ${escapeHTML(
                            formatPlayedTime(
                                battle.playedTime
                            )
                        )}

                    </div>

                </div>


                <div class="my-result-player">

                    <div class="my-result-name">

                        <span class="my-result-player-name">
                            ${escapeHTML(
                                player.name ||
                                "プレイヤー"
                            )}
                        </span>

                        ${
                            player.byname
                                ? `
                                    <span class="my-result-byname">
                                        ${escapeHTML(
                                            player.byname
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <div class="my-result-paint">

                        <span class="my-result-paint-value">
                            ${formatNumber(
                                player.paint
                            )}
                        </span>

                        <span class="my-result-paint-label">
                            塗り
                        </span>

                    </div>

                </div>


                <div class="my-result-stats">

                    <div class="my-stat">

                        <span class="my-stat-value">
                            ${formatNumber(
                                result.kill
                            )}
                        </span>

                        <span class="my-stat-label">
                            K
                        </span>

                    </div>


                    <div class="my-stat">

                        <span class="my-stat-value">
                            ${formatNumber(
                                result.assist
                            )}
                        </span>

                        <span class="my-stat-label">
                            A
                        </span>

                    </div>


                    <div class="my-stat">

                        <span class="my-stat-value">
                            ${formatNumber(
                                result.death
                            )}
                        </span>

                        <span class="my-stat-label">
                            D
                        </span>

                    </div>


                    <div class="my-stat">

                        <span class="my-stat-value">
                            ${formatNumber(
                                result.special
                            )}
                        </span>

                        <span class="my-stat-label">
                            SP
                        </span>

                    </div>

                </div>


                <div class="my-result-equipment">

                    ${createMyWeaponInfo(
                        battle
                    )}

                </div>

            </section>

        `;
    }


    // ========================================
    // Stage Header
    // ========================================

    function createStageHeader(battle) {

        const stage =
            battle.stage || {};


        const stageImage =
            safeString(
                stage.image
            );


        const imageHTML =
            stageImage
                ? `
                    <img
                        class="battle-detail-stage-image"
                        src="${escapeHTML(
                            stageImage
                        )}"
                        alt=""
                    >
                `
                : `
                    <div class="battle-detail-stage-placeholder">
                        <span class="material-symbols-rounded">
                            map
                        </span>
                    </div>
                `;


        const ruleName =
            battle.rule &&
            battle.rule.name
                ? battle.rule.name
                : "ルール不明";


        const modeName =
            battle.mode &&
            battle.mode.name
                ? battle.mode.name
                : "";


        return `

            <section class="battle-detail-stage">

                ${imageHTML}


                <div class="battle-detail-stage-overlay">

                    <div class="battle-detail-stage-name">
                        ${escapeHTML(
                            stage.name ||
                            "ステージ不明"
                        )}
                    </div>


                    <div class="battle-detail-stage-info">

                        <span>
                            ${escapeHTML(
                                ruleName
                            )}
                        </span>

                        ${
                            modeName
                                ? `
                                    <span>
                                        ${escapeHTML(
                                            modeName
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

            </section>

        `;
    }


    // ========================================
    // Match Information
    // ========================================

    function createMatchInfo(battle) {

        const duration =
            formatDuration(
                battle.duration
            );


        const knockout =
            safeString(
                battle.knockout
            );


        const fest =
            battle.festMatch;


        return `

            <section class="battle-detail-info">

                <div class="detail-info-item">

                    <span class="material-symbols-rounded">
                        schedule
                    </span>

                    <div>

                        <span class="detail-info-label">
                            試合時間
                        </span>

                        <span class="detail-info-value">
                            ${escapeHTML(
                                duration
                            )}
                        </span>

                    </div>

                </div>


                ${
                    knockout
                        ? `
                            <div class="detail-info-item">

                                <span class="material-symbols-rounded">
                                    bolt
                                </span>

                                <div>

                                    <span class="detail-info-label">
                                        ノックアウト
                                    </span>

                                    <span class="detail-info-value">
                                        ${escapeHTML(
                                            knockout
                                        )}
                                    </span>

                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    fest
                        ? `
                            <div class="detail-info-item">

                                <span class="material-symbols-rounded">
                                    festival
                                </span>

                                <div>

                                    <span class="detail-info-label">
                                        フェスパワー
                                    </span>

                                    <span class="detail-info-value">
                                        ${formatNumber(
                                            fest.myFestPower
                                        )}
                                    </span>

                                </div>

                            </div>
                        `
                        : ""
                }

            </section>

        `;
    }


    // ========================================
    // Tricolor Detail
    // ========================================

    function createTricolorDetail(
        battle
    ) {

        const teams = [];


        if (battle.myTeam) {

            teams.push({
                team:
                    battle.myTeam,
                isMyTeam:
                    true
            });

        }


        array(
            battle.otherTeams
        ).forEach(
            function (team) {

                teams.push({

                    team:
                        team,

                    isMyTeam:
                        false

                });

            }
        );


        const teamsHTML =
            teams.map(
                function (item, index) {

                    return createTeamCard(
                        item.team,
                        index,
                        item.isMyTeam
                    );

                }
            ).join("");


        return `

            <section class="tricolor-detail">

                <div class="tricolor-banner">

                    <span class="material-symbols-rounded">
                        groups
                    </span>

                    <div>

                        <span class="tricolor-banner-title">
                            トリカラバトル
                        </span>

                        <span class="tricolor-banner-subtitle">
                            ${escapeHTML(
                                battle.myTeam &&
                                battle.myTeam.tricolorRole
                                    ? (
                                        battle.myTeam.tricolorRole ===
                                        "DEFENSE"
                                            ? "守備"
                                            : "攻撃"
                                    )
                                    : ""
                            )}
                        </span>

                    </div>

                </div>


                <div class="tricolor-teams">

                    ${teamsHTML}

                </div>

            </section>

        `;
    }


    // ========================================
    // Normal Battle Detail
    // ========================================

    function createNormalDetail(
        battle
    ) {

        const myTeam =
            battle.myTeam;


        const otherTeams =
            array(
                battle.otherTeams
            );


        const myTeamHTML =
            myTeam
                ? createTeamCard(
                    myTeam,
                    0,
                    true
                )
                : "";


        const otherTeamHTML =
            otherTeams.map(
                function (team, index) {

                    return createTeamCard(
                        team,
                        index + 1,
                        false
                    );

                }
            ).join("");


        return `

            <section class="normal-battle-teams">

                ${myTeamHTML}

                ${otherTeamHTML}

            </section>

        `;
    }


    // ========================================
    // Detail Render
    // ========================================

    function renderDetail(
        battle
    ) {

        const container =
            getBattleDetailElement();


        if (!container) {
            return;
        }


        if (!battle) {

            container.innerHTML = `

                <div class="battle-detail-error">

                    <span class="material-symbols-rounded">
                        error
                    </span>

                    <p>
                        バトルデータを取得できませんでした。
                    </p>

                </div>

            `;

            return;
        }


        const tricolor =
            battle.isTricolor === true;


        const teamsHTML =
            tricolor
                ? createTricolorDetail(
                    battle
                )
                : createNormalDetail(
                    battle
                );


        container.innerHTML = `

            <div class="battle-detail-content">

                ${createStageHeader(
                    battle
                )}


                <div class="battle-detail-body">

                    ${createMyResult(
                        battle
                    )}


                    ${createMatchInfo(
                        battle
                    )}


                    ${teamsHTML}

                </div>

            </div>

        `;
    }


    // ========================================
    // Show Detail
    // ========================================

    async function showDetail(id) {

        try {

            const battle =
                await getBattle(id);


            currentBattle =
                battle;


            renderDetail(
                battle
            );


            return battle;

        } catch (error) {

            console.error(
                error
            );


            currentBattle =
                null;


            renderDetail(
                null
            );


            return null;

        }
    }


    // ========================================
    // Current Battle
    // ========================================

    function getCurrentBattle() {

        return currentBattle;

    }


    // ========================================
    // Filter
    // ========================================

    async function filterBattles(
        filter
    ) {

        await loadBattles();


        const value =
            safeString(
                filter
            );


        if (!value || value === "all") {

            return battles;

        }


        if (value === "tricolor") {

            return battles.filter(
                function (battle) {

                    return battle.isTricolor === true;

                }
            );

        }


        if (value === "win") {

            return battles.filter(
                function (battle) {

                    return isResult(
                        battle,
                        "WIN"
                    );

                }
            );

        }


        if (value === "lose") {

            return battles.filter(
                function (battle) {

                    return isResult(
                        battle,
                        "LOSE"
                    );

                }
            );

        }


        return battles;
    }


    function isResult(
        battle,
        result
    ) {

        return safeString(
            battle &&
            battle.judgement
        ).toUpperCase() ===
        result;
    }


    // ========================================
    // Render Filtered
    // ========================================

    async function renderFiltered(
        filter
    ) {

        const container =
            getBattleListElement();


        if (!container) {
            return;
        }


        const list =
            await filterBattles(
                filter
            );


        if (list.length === 0) {

            renderEmptyList();

            updateSummary(
                []
            );

            return;
        }


        container.innerHTML = "";


        const fragment =
            document.createDocumentFragment();


        list.forEach(
            function (battle) {

                fragment.appendChild(
                    createBattleRow(
                        battle
                    )
                );

            }
        );


        container.appendChild(
            fragment
        );


        updateSummary(
            list
        );

    }


    // ========================================
    // Refresh
    // ========================================

    async function refresh() {

        await renderList();

    }


    // ========================================
    // Public API
    // ========================================

    window.Battle = {

        loadBattles:
            loadBattles,

        getBattle:
            getBattle,

        renderList:
            renderList,

        render:
            renderList,

        showDetail:
            showDetail,

        renderDetail:
            renderDetail,

        getCurrentBattle:
            getCurrentBattle,

        filterBattles:
            filterBattles,

        renderFiltered:
            renderFiltered,

        refresh:
            refresh

    };


})();
