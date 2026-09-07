// =========================
// UI System
// InkBoard
// =========================

(function () {
    "use strict";

    const UI = {

        initialized: false,

        elements: {
            toast: null,
            loading: null,
            fileInput: null,

            importButton: null,
            exportButton: null,
            deleteButton: null,

            backButton: null,
            settingsButton: null
        },

        // =========================
        // DOM
        // =========================

        cacheElements: function () {

            this.elements.toast =
                document.getElementById("toast");

            this.elements.loading =
                document.getElementById("loading");

            this.elements.fileInput =
                document.getElementById("fileInput");

            this.elements.importButton =
                document.querySelector(
                    '[data-action="import"]'
                );

            this.elements.exportButton =
                document.querySelector(
                    '[data-action="export"]'
                );

            this.elements.deleteButton =
                document.querySelector(
                    '[data-action="delete-data"]'
                );

            this.elements.backButton =
                document.querySelector(
                    '[data-action="back"]'
                );

            this.elements.settingsButton =
                document.querySelector(
                    '[data-action="settings"]'
                );
        },

        // =========================
        // Toast
        // =========================

        showToast: function (message, duration) {

            const toast = this.elements.toast;

            if (!toast) {
                return;
            }

            toast.textContent = String(message || "");

            toast.classList.add("show");

            clearTimeout(this.toastTimer);

            this.toastTimer = setTimeout(function () {

                toast.classList.remove("show");

            }, duration || 2200);
        },

        hideToast: function () {

            const toast = this.elements.toast;

            if (!toast) {
                return;
            }

            toast.classList.remove("show");
        },

        // =========================
        // Loading
        // =========================

        showLoading: function (message) {

            const loading = this.elements.loading;

            if (!loading) {
                return;
            }

            const text =
                loading.querySelector(
                    ".loading-text"
                );

            if (text && message) {
                text.textContent = message;
            }

            loading.classList.add("show");
            loading.setAttribute("aria-hidden", "false");
        },

        hideLoading: function () {

            const loading = this.elements.loading;

            if (!loading) {
                return;
            }

            loading.classList.remove("show");
            loading.setAttribute("aria-hidden", "true");
        },

        // =========================
        // Import
        // =========================

        openImport: function () {

            if (
                window.Importer &&
                typeof window.Importer.openFilePicker === "function"
            ) {
                window.Importer.openFilePicker();
                return;
            }

            const input = this.elements.fileInput;

            if (input) {
                input.value = "";
                input.click();
            }
        },

        // =========================
        // Export
        // =========================

        exportData: async function () {

            try {

                this.showLoading("バックアップを作成中…");

                if (
                    !window.Storage ||
                    typeof window.Storage.exportJSON !== "function"
                ) {
                    throw new Error(
                        "Storage.exportJSON が見つかりません。"
                    );
                }

                await window.Storage.exportJSON();

                this.showToast(
                    "バックアップを保存しました"
                );

            } catch (error) {

                console.error(error);

                this.showToast(
                    "バックアップの作成に失敗しました"
                );

            } finally {

                this.hideLoading();
            }
        },

        // =========================
        // Delete
        // =========================

        deleteData: async function () {

            const confirmed =
                window.confirm(
                    "保存されているバトル履歴をすべて削除します。\n\nこの操作は元に戻せません。\n\n本当に削除しますか？"
                );

            if (!confirmed) {
                return;
            }

            try {

                this.showLoading("データを削除中…");

                if (
                    !window.Storage ||
                    typeof window.Storage.clearBattles !== "function"
                ) {
                    throw new Error(
                        "Storage.clearBattles が見つかりません。"
                    );
                }

                await window.Storage.clearBattles();

                if (
                    window.Battle &&
                    typeof window.Battle.refresh === "function"
                ) {
                    await window.Battle.refresh();
                }

                this.showToast(
                    "バトル履歴を削除しました"
                );

            } catch (error) {

                console.error(error);

                this.showToast(
                    "データの削除に失敗しました"
                );

            } finally {

                this.hideLoading();
            }
        },

        // =========================
        // Navigation
        // =========================

        goBack: function () {

            if (
                window.App &&
                typeof window.App.goBack === "function"
            ) {
                window.App.goBack();
            }
        },

        openSettings: function () {

            if (
                window.App &&
                typeof window.App.openSettings === "function"
            ) {
                window.App.openSettings();
            }
        },

        openBattle: function () {

            if (
                window.App &&
                typeof window.App.openBattlePage === "function"
            ) {
                window.App.openBattlePage();
            }
        },

        openSalmon: function () {

            if (
                window.App &&
                typeof window.App.openSalmonPage === "function"
            ) {
                window.App.openSalmonPage();
            }
        },

        openStatistics: function () {

            if (
                window.App &&
                typeof window.App.openStatisticsPage === "function"
            ) {
                window.App.openStatisticsPage();
            }
        },

        // =========================
        // Event Delegation
        // =========================

        handleAction: function (action, element) {

            switch (action) {

                case "import":
                    this.openImport();
                    break;

                case "export":
                    this.exportData();
                    break;

                case "delete-data":
                    this.deleteData();
                    break;

                case "back":
                    this.goBack();
                    break;

                case "settings":
                    this.openSettings();
                    break;

                case "battle":
                    this.openBattle();
                    break;

                case "salmon":
                    this.openSalmon();
                    break;

                case "statistics":
                    this.openStatistics();
                    break;

                default:
                    break;
            }
        },

        bindActions: function () {

            document.addEventListener(
                "click",
                (event) => {

                    const target =
                        event.target.closest(
                            "[data-action]"
                        );

                    if (!target) {
                        return;
                    }

                    const action =
                        target.getAttribute(
                            "data-action"
                        );

                    if (!action) {
                        return;
                    }

                    this.handleAction(
                        action,
                        target
                    );
                }
            );
        },

        // =========================
        // Import Events
        // =========================

        bindImportEvents: function () {

            document.addEventListener(
                "importCompleted",
                (event) => {

                    const detail =
                        event.detail || {};

                    const count =
                        Number(detail.count || 0);

                    if (count > 0) {

                        this.showToast(
                            count +
                            "件のバトルデータを読み込みました"
                        );

                    } else {

                        this.showToast(
                            "バトルデータを読み込みました"
                        );
                    }

                    if (
                        window.Battle &&
                        typeof window.Battle.refresh === "function"
                    ) {
                        window.Battle.refresh();
                    }
                }
            );

            document.addEventListener(
                "importError",
                (event) => {

                    const detail =
                        event.detail || {};

                    const message =
                        detail.message ||
                        "インポートに失敗しました";

                    this.showToast(message);
                }
            );
        },

        // =========================
        // Keyboard
        // =========================

        bindKeyboard: function () {

            document.addEventListener(
                "keydown",
                (event) => {

                    if (event.key !== "Escape") {
                        return;
                    }

                    const detailPage =
                        document.getElementById(
                            "battleDetailPage"
                        );

                    if (
                        detailPage &&
                        detailPage.classList.contains("active")
                    ) {
                        this.goBack();
                    }
                }
            );
        },

        // =========================
        // Page State
        // =========================

        updatePageState: function () {

            if (!window.App) {
                return;
            }

            const currentPage =
                window.App.state &&
                window.App.state.currentPage;

            if (!currentPage) {
                return;
            }

            document.body.setAttribute(
                "data-page",
                currentPage
            );
        },

        // =========================
        // Battle UI
        // =========================

        refreshBattleUI: async function () {

            if (
                !window.Battle ||
                typeof window.Battle.refresh !== "function"
            ) {
                return;
            }

            try {

                await window.Battle.refresh();

            } catch (error) {

                console.error(
                    "Battle UI refresh error:",
                    error
                );
            }
        },

        // =========================
        // Initial Render
        // =========================

        render: async function () {

            this.updatePageState();

            if (
                window.BattleUI &&
                typeof window.BattleUI.render === "function"
            ) {

                try {
                    await window.BattleUI.render();
                } catch (error) {
                    console.error(error);
                }
            }
        },

        // =========================
        // Initialization
        // =========================

        init: async function () {

            if (this.initialized) {
                return;
            }

            this.initialized = true;

            this.cacheElements();

            this.bindActions();

            this.bindImportEvents();

            this.bindKeyboard();

            await this.render();
        }
    };

    // =========================
    // App Events
    // =========================

    document.addEventListener(
        "appPageChanged",
        function () {

            UI.updatePageState();

        }
    );

    // =========================
    // Public API
    // =========================

    window.UI = UI;

    // =========================
    // DOM Ready
    // =========================

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                UI.init();
            },
            { once: true }
        );

    } else {

        UI.init();
    }

})();(!page) {
                            return;
                        }


                        switch (page) {

                            case "battle":

                                if (
                                    window.App &&
                                    window.App.openBattlePage
                                ) {

                                    window.App
                                        .openBattlePage();

                                }

                                break;


                            case "salmon":

                                if (
                                    window.App &&
                                    window.App.openSalmonPage
                                ) {

                                    window.App
                                        .openSalmonPage();

                                }

                                break;


                            case "statistics":

                                if (
                                    window.App &&
                                    window.App.openStatisticsPage
                                ) {

                                    window.App
                                        .openStatisticsPage();

                                }

                                break;


                            case "settings":

                                if (
                                    window.App &&
                                    window.App.openSettings
                                ) {

                                    window.App
                                        .openSettings();

                                }

                                break;


                            default:

                                break;

                        }

                    }
                );

            }
        );


        const backButton =
            get("backButton");


        if (backButton) {

            backButton.addEventListener(
                "click",
                function () {

                    if (
                        window.App &&
                        window.App.goBack
                    ) {

                        window.App.goBack();

                    }

                }
            );

        }

    }


    // ========================================
    // Battle Detail Back
    // ========================================

    function setupDetailBack() {

        const buttons =
            document.querySelectorAll(
                "[data-action='back']"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        if (
                            window.App &&
                            window.App.goBack
                        ) {

                            window.App.goBack();

                        }

                    }
                );

            }
        );

    }


    // ========================================
    // Import Result
    // ========================================

    function handleImportCompleted(
        event
    ) {

        const detail =
            event.detail || {};


        const added =
            Number(
                detail.added || 0
            );


        const updated =
            Number(
                detail.updated || 0
            );


        const total =
            Number(
                detail.total || 0
            );


        if (total <= 0) {

            showToast(
                "インポートできるバトルがありません。",
                "error"
            );

            return;

        }


        let message =
            total +
            "件のバトルを読み込みました";


        if (added > 0) {

            message +=
                "（新規 " +
                added +
                "件";

            if (updated > 0) {

                message +=
                    " / 更新 " +
                    updated +
                    "件";

            }

            message +=
                "）";

        } else if (updated > 0) {

            message +=
                "（更新 " +
                updated +
                "件）";

        }


        showToast(
            message,
            "success"
        );

    }


    // ========================================
    // Import Error
    // ========================================

    function handleImportError(
        event
    ) {

        const detail =
            event.detail || {};


        showToast(
            detail.message ||
            "インポートに失敗しました。",
            "error"
        );

    }


    // ========================================
    // Import Events
    // ========================================

    function setupImportEvents() {

        document.addEventListener(
            "importCompleted",
            handleImportCompleted
        );


        document.addEventListener(
            "importError",
            handleImportError
        );

    }


    // ========================================
    // Render Battle
    // ========================================

    async function renderBattle() {

        if (
            !window.Battle ||
            !window.Battle.renderFiltered
        ) {
            return;
        }


        try {

            await window.Battle
                .renderFiltered(
                    currentFilter
                );

        } catch (error) {

            console.error(
                error
            );

        }

    }


    // ========================================
    // Main Render
    // ========================================

    async function render() {

        setupFilters();

        setupImportButtons();

        setupSettingsButtons();

        setupFileInput();

        setupNavigation();

        setupDetailBack();

        setupImportEvents();


        await renderBattle();

    }


    // ========================================
    // Refresh
    // ========================================

    async function refresh() {

        await renderBattle();

    }


    // ========================================
    // Public API
    // ========================================

    window.BattleUI = {

        render:
            render,

        refresh:
            refresh,

        renderBattle:
            renderBattle,

        showToast:
            showToast,

        setLoading:
            setLoading,

        openFilePicker:
            openFilePicker,

        exportData:
            exportData,

        deleteAllData:
            deleteAllData

    };


})();
