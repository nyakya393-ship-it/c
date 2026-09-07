// =========================
// UI
// InkBoard
// User Interface Controller
// =========================

(function () {

    "use strict";


    // ========================================
    // State
    // ========================================

    let currentFilter = "all";


    // ========================================
    // Utility
    // ========================================

    function get(id) {

        return document.getElementById(id);

    }


    function safeString(value, fallback = "") {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value);

    }


    // ========================================
    // Toast
    // ========================================

    let toastTimer = null;


    function showToast(
        message,
        type = "normal"
    ) {

        let toast =
            get("toast");


        if (!toast) {

            toast =
                document.createElement("div");


            toast.id =
                "toast";


            toast.className =
                "toast";


            document.body.appendChild(
                toast
            );

        }


        toast.className =
            "toast toast-" +
            type;


        toast.textContent =
            safeString(message);


        requestAnimationFrame(
            function () {

                toast.classList.add(
                    "show"
                );

            }
        );


        if (toastTimer) {

            clearTimeout(
                toastTimer
            );

        }


        toastTimer =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                2600
            );

    }


    // ========================================
    // Loading
    // ========================================

    function setLoading(
        loading
    ) {

        document.body.classList.toggle(
            "is-loading",
            Boolean(loading)
        );

    }


    // ========================================
    // Import
    // ========================================

    function openFilePicker() {

        const input =
            get("fileInput");


        if (!input) {

            showToast(
                "ファイル選択欄が見つかりません。",
                "error"
            );

            return;
        }


        input.click();

    }


    // ========================================
    // Export
    // ========================================

    async function exportData() {

        if (
            !window.Storage ||
            !window.Storage.exportJSON
        ) {

            showToast(
                "保存機能を利用できません。",
                "error"
            );

            return;

        }


        try {

            setLoading(true);


            await window.Storage.exportJSON();


            showToast(
                "バックアップを書き出しました。",
                "success"
            );


        } catch (error) {

            console.error(
                error
            );


            showToast(
                error.message ||
                "エクスポートに失敗しました。",
                "error"
            );


        } finally {

            setLoading(false);

        }

    }


    // ========================================
    // Delete All
    // ========================================

    async function deleteAllData() {

        const confirmed =
            window.confirm(
                "保存されているバトル履歴をすべて削除します。\n\nこの操作は元に戻せません。\n\n本当に削除しますか？"
            );


        if (!confirmed) {
            return;
        }


        try {

            setLoading(true);


            if (
                !window.Storage ||
                !window.Storage.clearBattles
            ) {

                throw new Error(
                    "保存機能を利用できません。"
                );

            }


            await window.Storage.clearBattles();


            if (
                window.Battle &&
                window.Battle.refresh
            ) {

                await window.Battle.refresh();

            }


            showToast(
                "バトル履歴を削除しました。",
                "success"
            );


            if (
                window.App &&
                window.App.openBattlePage
            ) {

                window.App.openBattlePage();

            }


        } catch (error) {

            console.error(
                error
            );


            showToast(
                error.message ||
                "削除に失敗しました。",
                "error"
            );


        } finally {

            setLoading(false);

        }

    }


    // ========================================
    // Filter Buttons
    // ========================================

    function setupFilters() {

        const filters =
            document.querySelectorAll(
                "[data-battle-filter]"
            );


        filters.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const filter =
                            safeString(
                                button.dataset
                                    .battleFilter
                            ) || "all";


                        currentFilter =
                            filter;


                        filters.forEach(
                            function (item) {

                                item.classList.toggle(
                                    "active",
                                    item === button
                                );

                            }
                        );


                        try {

                            if (
                                window.Battle &&
                                window.Battle.renderFiltered
                            ) {

                                await window.Battle
                                    .renderFiltered(
                                        filter
                                    );

                            }

                        } catch (error) {

                            console.error(
                                error
                            );


                            showToast(
                                "フィルター処理に失敗しました。",
                                "error"
                            );

                        }

                    }
                );

            }
        );

    }


    // ========================================
    // Import Buttons
    // ========================================

    function setupImportButtons() {

        const buttons =
            document.querySelectorAll(
                "[data-action='import']"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openFilePicker();

                    }
                );

            }
        );

    }


    // ========================================
    // Settings Buttons
    // ========================================

    function setupSettingsButtons() {

        const exportButton =
            get("exportButton");


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                function () {

                    exportData();

                }
            );

        }


        const deleteButton =
            get("deleteAllButton");


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteAllData();

                }
            );

        }


        const importButton =
            get("settingsImportButton");


        if (importButton) {

            importButton.addEventListener(
                "click",
                function () {

                    openFilePicker();

                }
            );

        }

    }


    // ========================================
    // File Input
    // ========================================

    function setupFileInput() {

        const input =
            get("fileInput");


        if (!input) {
            return;
        }


        input.addEventListener(
            "change",
            function () {

                if (
                    !input.files ||
                    input.files.length === 0
                ) {
                    return;
                }


                const file =
                    input.files[0];


                if (
                    window.Importer &&
                    window.Importer.handleFile
                ) {

                    window.Importer.handleFile(
                        file
                    );

                } else {

                    showToast(
                        "インポート機能を利用できません。",
                        "error"
                    );

                }


                // 同じファイルをもう一度選べるようにする
                input.value = "";

            }
        );

    }


    // ========================================
    // Navigation
    // ========================================

    function setupNavigation() {

        const buttons =
            document.querySelectorAll(
                "[data-page]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const page =
                            safeString(
                                button.dataset.page
                            );


                        if (!page) {
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
