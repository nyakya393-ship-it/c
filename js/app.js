/* =========================================================
   app.js
   Battle Data Viewer
   Application Controller
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       APP STATE
    ===================================================== */

    const AppState = {
        currentPage: "battle",
        previousPage: "battle",
        selectedBattleId: null,
        currentFilter: "all",
        initialized: false
    };


    /* =====================================================
       PAGE DEFINITIONS
    ===================================================== */

    const pages = {
        battle: {
            elementId: "battlePage",
            title: "バトル"
        },

        battleDetail: {
            elementId: "battleDetailPage",
            title: "バトル詳細"
        },

        salmon: {
            elementId: "salmonPage",
            title: "サーモンラン"
        },

        statistics: {
            elementId: "statisticsPage",
            title: "統計"
        },

        settings: {
            elementId: "settingsPage",
            title: "設定"
        }
    };


    /* =====================================================
       DOM
    ===================================================== */

    const DOM = {};


    function cacheDOM() {

        DOM.pageTitle =
            document.getElementById("pageTitle");

        DOM.backButton =
            document.getElementById("backButton");

        DOM.settingsButton =
            document.getElementById("settingsButton");

        DOM.bottomNavigation =
            document.getElementById("bottomNavigation");

        DOM.navItems =
            document.querySelectorAll(".nav-item");

        DOM.pages =
            {};

        Object.keys(pages).forEach((key) => {

            DOM.pages[key] =
                document.getElementById(
                    pages[key].elementId
                );

        });
    }


    /* =====================================================
       PAGE VISIBILITY
    ===================================================== */

    function hideAllPages() {

        Object.keys(DOM.pages).forEach((key) => {

            const page =
                DOM.pages[key];

            if (!page) {
                return;
            }

            page.hidden = true;
            page.classList.remove("active-page");
        });
    }


    function showPage(pageName) {

        const page =
            DOM.pages[pageName];

        if (!page) {
            return;
        }

        hideAllPages();

        page.hidden = false;
        page.classList.add("active-page");

        updateHeader(pageName);
        updateBottomNavigation(pageName);
    }


    /* =====================================================
       HEADER
    ===================================================== */

    function updateHeader(pageName) {

        const page =
            pages[pageName];

        if (!page) {
            return;
        }

        if (DOM.pageTitle) {
            DOM.pageTitle.textContent =
                page.title;
        }

        const isDetail =
            pageName === "battleDetail";

        const isSettings =
            pageName === "settings";

        if (DOM.backButton) {

            DOM.backButton.hidden =
                !isDetail && !isSettings;
        }

        if (DOM.settingsButton) {

            DOM.settingsButton.hidden =
                isSettings || isDetail;
        }
    }


    /* =====================================================
       BOTTOM NAVIGATION
    ===================================================== */

    function updateBottomNavigation(pageName) {

        const isMainPage =
            pageName === "battle" ||
            pageName === "salmon" ||
            pageName === "statistics";

        if (DOM.bottomNavigation) {
            DOM.bottomNavigation.hidden =
                !isMainPage;
        }

        DOM.navItems.forEach((item) => {

            const target =
                item.dataset.page;

            const active =
                target === pageName;

            item.classList.toggle(
                "active",
                active
            );
        });
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function navigateTo(pageName, options = {}) {

        if (!pages[pageName]) {
            return;
        }

        const currentPage =
            AppState.currentPage;

        if (
            currentPage !== pageName &&
            !options.skipHistory
        ) {
            AppState.previousPage =
                currentPage;
        }

        AppState.currentPage =
            pageName;

        showPage(pageName);

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }


    function goBack() {

        if (
            AppState.currentPage ===
            "battleDetail"
        ) {

            navigateTo(
                "battle",
                {
                    skipHistory: true
                }
            );

            return;
        }

        if (
            AppState.currentPage ===
            "settings"
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
            AppState.previousPage ||
            "battle",
            {
                skipHistory: true
            }
        );
    }


    /* =====================================================
       BATTLE DETAIL
    ===================================================== */

    function openBattleDetail(battleId) {

        if (
            battleId === undefined ||
            battleId === null
        ) {
            return;
        }

        AppState.selectedBattleId =
            String(battleId);

        navigateTo("battleDetail");

        /*
         * battle.js が存在する場合、
         * 詳細データの描画を依頼する。
         */

        if (
            typeof window.Battle !==
            "undefined" &&
            typeof window.Battle.showDetail ===
            "function"
        ) {

            window.Battle.showDetail(
                AppState.selectedBattleId
            );
        }
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    function openSettings() {

        navigateTo("settings");
    }


    /* =====================================================
       BATTLE PAGE
    ===================================================== */

    function openBattlePage() {

        navigateTo(
            "battle",
            {
                skipHistory: true
            }
        );

        /*
         * UI側に一覧の再描画を依頼。
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
       SALMON PAGE
    ===================================================== */

    function openSalmonPage() {

        navigateTo("salmon");
    }


    /* =====================================================
       STATISTICS PAGE
    ===================================================== */

    function openStatisticsPage() {

        navigateTo("statistics");

        /*
         * analyzer.js が実装された場合、
         * 統計画面の描画を依頼。
         */

        if (
            typeof window.Analyzer !==
            "undefined" &&
            typeof window.Analyzer.render ===
            "function"
        ) {

            window.Analyzer.render();
        }
    }


    /* =====================================================
       NAV ITEM HANDLER
    ===================================================== */

    function handleNavigation(event) {

        const item =
            event.currentTarget;

        const page =
            item.dataset.page;

        if (!page) {
            return;
        }

        switch (page) {

            case "battle":
                openBattlePage();
                break;

            case "salmon":
                openSalmonPage();
                break;

            case "statistics":
                openStatisticsPage();
                break;

            default:
                break;
        }
    }


    /* =====================================================
       BACK BUTTON
    ===================================================== */

    function handleBack() {

        goBack();
    }


    /* =====================================================
       SETTINGS BUTTON
    ===================================================== */

    function handleSettings() {

        openSettings();
    }


    /* =====================================================
       BROWSER BACK
    ===================================================== */

    function handlePopState() {

        goBack();
    }


    /* =====================================================
       GLOBAL EVENTS
    ===================================================== */

    function bindEvents() {

        if (DOM.backButton) {

            DOM.backButton.addEventListener(
                "click",
                handleBack
            );
        }


        if (DOM.settingsButton) {

            DOM.settingsButton.addEventListener(
                "click",
                handleSettings
            );
        }


        DOM.navItems.forEach((item) => {

            item.addEventListener(
                "click",
                handleNavigation
            );
        });


        window.addEventListener(
            "popstate",
            handlePopState
        );


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
