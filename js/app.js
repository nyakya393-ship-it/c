/* =========================================================
   InkBoard
   js/app.js
   ========================================================= */

(function () {

    "use strict";


    /* =======================================================
       STATE
    ======================================================= */

    const AppState = {

        currentPage: "battle",

        previousPage: "battle",

        selectedBattleId: null,

        currentFilter: "all",

        initialized: false

    };


    /* =======================================================
       DOM
    ======================================================= */

    const DOM = {

        pages: {},

        headerTitle: null,

        backButton: null,

        settingsButton: null,

        bottomNav: null

    };


    /* =======================================================
       PAGE MAP
    ======================================================= */

    const PAGE_MAP = {

        battle: "battlePage",

        battleDetail: "battleDetailPage",

        salmon: "salmonPage",

        statistics: "statisticsPage",

        settings: "settingsPage"

    };


    /* =======================================================
       CACHE DOM
    ======================================================= */

    function cacheDOM() {

        Object.keys(PAGE_MAP).forEach(function (pageName) {

            DOM.pages[pageName] =
                document.getElementById(PAGE_MAP[pageName]);

        });


        DOM.headerTitle =
            document.getElementById("headerTitle");


        DOM.backButton =
            document.getElementById("backButton");


        DOM.settingsButton =
            document.getElementById("settingsButton");


        DOM.bottomNav =
            document.getElementById("bottomNav");

    }


    /* =======================================================
       PAGE TITLE
    ======================================================= */

    function getPageTitle(pageName) {

        switch (pageName) {

            case "battle":
                return "バトル";

            case "battleDetail":
                return "リザルト";

            case "salmon":
                return "サーモンラン";

            case "statistics":
                return "統計";

            case "settings":
                return "設定";

            default:
                return "InkBoard";

        }

    }


    /* =======================================================
       SHOW PAGE
    ======================================================= */

    function showPage(pageName) {

        Object.keys(DOM.pages).forEach(function (name) {

            const page = DOM.pages[name];

            if (!page) {
                return;
            }

            if (name === pageName) {

                page.hidden = false;

            } else {

                page.hidden = true;

            }

        });

    }


    /* =======================================================
       HEADER
    ======================================================= */

    function updateHeader(pageName) {

        if (DOM.headerTitle) {

            DOM.headerTitle.textContent =
                getPageTitle(pageName);

        }


        if (DOM.backButton) {

            const shouldShowBack =
                pageName === "battleDetail" ||
                pageName === "settings";

            DOM.backButton.hidden =
                !shouldShowBack;

        }


        if (DOM.settingsButton) {

            DOM.settingsButton.hidden =
                pageName !== "battle";

        }

    }


    /* =======================================================
       BOTTOM NAV
    ======================================================= */

    function updateBottomNav(pageName) {

        if (!DOM.bottomNav) {
            return;
        }


        const items =
            DOM.bottomNav.querySelectorAll("[data-page]");


        items.forEach(function (item) {

            const target =
                item.getAttribute("data-page");

            item.classList.toggle(
                "active",
                target === pageName
            );

        });


        /*
         * 詳細画面・設定画面では
         * メインナビゲーションを表示しない
         */

        const hideNav =
            pageName === "battleDetail" ||
            pageName === "settings";


        DOM.bottomNav.style.display =
            hideNav ? "none" : "";

    }


    /* =======================================================
       NAVIGATE
    ======================================================= */

    function navigateTo(pageName, options) {

        options = options || {};


        if (!PAGE_MAP[pageName]) {

            console.warn(
                "Unknown page:",
                pageName
            );

            return;

        }


        const current =
            AppState.currentPage;


        if (
            current !== pageName &&
            !options.skipHistory
        ) {

            AppState.previousPage =
                current;

        }


        AppState.currentPage =
            pageName;


        showPage(pageName);

        updateHeader(pageName);

        updateBottomNav(pageName);


        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });


        /*
         * ページごとの更新処理
         */

        if (pageName === "battle") {

            if (
                window.BattleUI &&
                typeof window.BattleUI.render === "function"
            ) {

                window.BattleUI.render();

            }

        }


        if (pageName === "statistics") {

            if (
                window.BattleUI &&
                typeof window.BattleUI.renderStatistics === "function"
            ) {

                window.BattleUI.renderStatistics();

            }

        }

    }


    /* =======================================================
       GO BACK
    ======================================================= */

    function goBack() {

        if (
            AppState.currentPage === "battleDetail"
        ) {

            AppState.selectedBattleId =
                null;

            navigateTo(
                "battle",
                {
                    skipHistory: true
                }
            );

            return;

        }


        if (
            AppState.currentPage === "settings"
        ) {

            navigateTo(
                "battle",
                {
                    skipHistory: true
                }
            );

            return;

        }


        navigateTo(
            AppState.previousPage || "battle",
            {
                skipHistory: true
            }
        );

    }


    /* =======================================================
       OPEN BATTLE DETAIL
    ======================================================= */

    function openBattleDetail(battleId) {

        if (
            battleId === undefined ||
            battleId === null
        ) {

            console.warn(
                "Battle ID is missing."
            );

            return;

        }


        AppState.selectedBattleId =
            String(battleId);


        AppState.previousPage =
            AppState.currentPage;


        navigateTo(
            "battleDetail",
            {
                skipHistory: true
            }
        );


        if (
            window.Battle &&
            typeof window.Battle.showDetail === "function"
        ) {

            window.Battle.showDetail(
                String(battleId)
            );

        } else {

            console.warn(
                "Battle.showDetail is not available."
            );

        }

    }


    /* =======================================================
       OPEN SETTINGS
    ======================================================= */

    function openSettings() {

        AppState.previousPage =
            AppState.currentPage;


        navigateTo(
            "settings",
            {
                skipHistory: true
            }
        );

    }


    /* =======================================================
       OPEN BATTLE
    ======================================================= */

    function openBattlePage() {

        navigateTo(
            "battle",
            {
                skipHistory: true
            }
        );

    }


    /* =======================================================
       OPEN SALMON
    ======================================================= */

    function openSalmonPage() {

        navigateTo(
            "salmon",
            {
                skipHistory: true
            }
        );

    }


    /* =======================================================
       OPEN STATISTICS
    ======================================================= */

    function openStatisticsPage() {

        navigateTo(
            "statistics",
            {
                skipHistory: true
            }
        );

    }


    /* =======================================================
       NAVIGATION EVENTS
    ======================================================= */

    function bindNavigation() {

        if (DOM.bottomNav) {

            DOM.bottomNav.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-page]"
                        );


                    if (!button) {
                        return;
                    }


                    const pageName =
                        button.getAttribute(
                            "data-page"
                        );


                    if (!pageName) {
                        return;
                    }


                    navigateTo(pageName);

                }
            );

        }


        if (DOM.settingsButton) {

            DOM.settingsButton.addEventListener(
                "click",
                function () {

                    openSettings();

                }
            );

        }


        if (DOM.backButton) {

            DOM.backButton.addEventListener(
                "click",
                function () {

                    goBack();

                }
            );

        }


        /*
         * BattleUIなどから発火される
         * openBattleDetail イベント
         */

        document.addEventListener(
            "openBattleDetail",
            function (event) {

                if (
                    !event.detail ||
                    event.detail.id === undefined
                ) {

                    return;

                }


                openBattleDetail(
                    event.detail.id
                );

            }
        );

    }


    /* =======================================================
       INITIALIZE
    ======================================================= */

    async function init() {

        if (AppState.initialized) {
            return;
        }


        cacheDOM();

        bindNavigation();


        AppState.initialized =
            true;


        /*
         * 最初はバトル画面
         */

        navigateTo(
            "battle",
            {
                skipHistory: true
            }
        );


        /*
         * BattleUIが存在する場合、
         * 初期データを表示
         */

        if (
            window.BattleUI &&
            typeof window.BattleUI.render === "function"
        ) {

            try {

                await window.BattleUI.render();

            } catch (error) {

                console.error(
                    "BattleUI render error:",
                    error
                );

            }

        }

    }


    /* =======================================================
       DOM READY
    ======================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


    /* =======================================================
       PUBLIC API
    ======================================================= */

    window.App = {

        state: AppState,

        navigateTo: navigateTo,

        goBack: goBack,

        openBattleDetail: openBattleDetail,

        openSettings: openSettings,

        openBattlePage: openBattlePage,

        openSalmonPage: openSalmonPage,

        openStatisticsPage: openStatisticsPage,

        init: init

    };


})();     );


        /*
         * バトル一覧の行から
         * app.js に詳細表示を依頼できるよう、
         * カスタムイベントを受け取る。
         */

        document.addEventListener(
            "openBattleDetail",
            (event) => {

                const battleId =
                    event.detail &&
                    event.detail.battleId;

                openBattleDetail(
                    battleId
                );
            }
        );
    }


    /* =====================================================
       INITIAL PAGE
    ===================================================== */

    function initializePage() {

        AppState.currentPage =
            "battle";

        AppState.previousPage =
            "battle";

        AppState.selectedBattleId =
            null;

        AppState.currentFilter =
            "all";

        showPage("battle");
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        if (AppState.initialized) {
            return;
        }

        cacheDOM();

        bindEvents();

        initializePage();

        AppState.initialized =
            true;

        /*
         * データ読み込み後に
         * UI側が自動描画できるよう、
         * BattleUI の初期描画を呼び出す。
         */

        if (
            typeof window.BattleUI !==
            "undefined" &&
            typeof window.BattleUI.render ===
            "function"
        ) {

            window.BattleUI.render();
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.App = {

        state: AppState,

        navigateTo,

        goBack,

        openBattleDetail,

        openSettings,

        openBattlePage,

        openSalmonPage,

        openStatisticsPage,

        init
    };


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();
