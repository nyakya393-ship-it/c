/* =========================================================
   InkBoard
   js/importer.js
   ========================================================= */

(function () {

    "use strict";


    /* =======================================================
       STATE
    ======================================================= */

    const ImporterState = {

        initialized: false,

        importing: false

    };


    /* =======================================================
       UTILITY
    ======================================================= */

    function getExtension(fileName) {

        if (!fileName) {
            return "";
        }

        const name =
            String(fileName).toLowerCase();

        const index =
            name.lastIndexOf(".");

        if (index === -1) {
            return "";
        }

        return name.slice(index + 1);

    }


    function getFileType(file) {

        if (!file) {
            return null;
        }

        const extension =
            getExtension(file.name);

        if (extension === "json") {
            return "json";
        }

        if (extension === "zip") {
            return "zip";
        }

        return null;

    }


    /* =======================================================
       FILE READING
    ======================================================= */

    function readTextFile(file) {

        return new Promise(function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        String(reader.result || "")
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "ファイルを読み込めませんでした。"
                        )
                    );

                };


            reader.readAsText(
                file,
                "UTF-8"
            );

        });

    }


    function readFileAsArrayBuffer(file) {

        return new Promise(function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "ZIPファイルを読み込めませんでした。"
                        )
                    );

                };


            reader.readAsArrayBuffer(file);

        });

    }


    /* =======================================================
       JSON
    ======================================================= */

    function parseJSON(text) {

        if (
            text === null ||
            text === undefined ||
            String(text).trim() === ""
        ) {

            throw new Error(
                "JSONファイルが空です。"
            );

        }


        try {

            return JSON.parse(text);

        } catch (error) {

            throw new Error(
                "JSONを解析できませんでした。"
            );

        }

    }


    /* =======================================================
       HORAGAI BAY CHECK
    ======================================================= */

    function isHoragaiBayData(data) {

        if (!data || typeof data !== "object") {
            return false;
        }


        /*
         * ホラガイベイのバトルデータ
         */

        if (data.vsHistoryDetail) {
            return true;
        }


        /*
         * Parser側で扱える形式も許可
         */

        if (Array.isArray(data)) {
            return data.length > 0;
        }


        if (Array.isArray(data.battles)) {
            return true;
        }


        if (Array.isArray(data.records)) {
            return true;
        }


        if (Array.isArray(data.vsHistoryDetails)) {
            return true;
        }


        if (Array.isArray(data.historyDetails)) {
            return true;
        }


        return false;

    }


    /* =======================================================
       JSON IMPORT
    ======================================================= */

    async function importJSONFile(file) {

        if (!file) {

            throw new Error(
                "ファイルが選択されていません。"
            );

        }


        const text =
            await readTextFile(file);


        const data =
            parseJSON(text);


        if (!isHoragaiBayData(data)) {

            throw new Error(
                "対応していないJSONデータです。"
            );

        }


        return {

            type: "json",

            fileName:
                file.name || "data.json",

            data: data

        };

    }


    /* =======================================================
       ZIP IMPORT
    ======================================================= */

    async function importZIPFile(file) {

        if (!file) {

            throw new Error(
                "ZIPファイルが選択されていません。"
            );

        }


        const buffer =
            await readFileAsArrayBuffer(file);


        return {

            type: "zip",

            fileName:
                file.name || "data.zip",

            buffer: buffer

        };

    }


    /* =======================================================
       IMPORT FILE
    ======================================================= */

    async function importFile(file) {

        const type =
            getFileType(file);


        if (!type) {

            throw new Error(
                "JSONまたはZIPファイルを選択してください。"
            );

        }


        if (type === "json") {

            return await importJSONFile(file);

        }


        if (type === "zip") {

            return await importZIPFile(file);

        }


        throw new Error(
            "対応していないファイル形式です。"
        );

    }


    /* =======================================================
       PARSER
    ======================================================= */

    async function processImportedFile(importedFile) {

        if (!importedFile) {

            throw new Error(
                "インポートデータがありません。"
            );

        }


        if (
            !window.Parser ||
            typeof window.Parser.parseImport !== "function"
        ) {

            throw new Error(
                "Parserが読み込まれていません。"
            );

        }


        if (
            !window.Storage ||
            typeof window.Storage.importData !== "function"
        ) {

            throw new Error(
                "Storageが読み込まれていません。"
            );

        }


        /*
         * Parser
         */

        const parsedData =
            await window.Parser.parseImport(
                importedFile
            );


        if (
            !parsedData ||
            !Array.isArray(parsedData.records)
        ) {

            throw new Error(
                "バトルデータを解析できませんでした。"
            );

        }


        if (parsedData.records.length === 0) {

            throw new Error(
                "バトルデータが見つかりませんでした。"
            );

        }


        /*
         * IndexedDBへ保存
         */

        const storageResult =
            await window.Storage.importData(
                parsedData
            );


        return {

            parsed: parsedData,

            storage: storageResult

        };

    }


    /* =======================================================
       TOAST HELPER
    ======================================================= */

    function showToast(message) {

        if (
            window.BattleUI &&
            typeof window.BattleUI.showToast === "function"
        ) {

            window.BattleUI.showToast(
                message
            );

            return;

        }


        const toast =
            document.getElementById("toast");


        if (!toast) {
            return;
        }


        toast.textContent =
            String(message);


        toast.hidden = false;


        clearTimeout(
            showToast.timer
        );


        showToast.timer =
            setTimeout(
                function () {

                    toast.hidden = true;

                },
                2800
            );

    }


    /* =======================================================
       LOADING
    ======================================================= */

    function setLoading(
        visible,
        message
    ) {

        if (
            window.BattleUI &&
            typeof window.BattleUI.setLoading === "function"
        ) {

            window.BattleUI.setLoading(
                visible,
                message
            );

            return;

        }


        const loading =
            document.getElementById("loading");


        const loadingText =
            document.getElementById("loadingText");


        if (loading) {

            loading.hidden =
                !visible;

        }


        if (
            loadingText &&
            message
        ) {

            loadingText.textContent =
                message;

        }

    }


    /* =======================================================
       EVENTS
    ======================================================= */

    function dispatchImportCompleted(result) {

        document.dispatchEvent(
            new CustomEvent(
                "importCompleted",
                {
                    detail: result
                }
            )
        );

    }


    function dispatchImportError(error) {

        document.dispatchEvent(
            new CustomEvent(
                "importError",
                {
                    detail: {
                        error: error
                    }
                }
            )
        );

    }


    /* =======================================================
       HANDLE FILE
    ======================================================= */

    async function handleFile(file) {

        if (ImporterState.importing) {

            return null;

        }


        if (!file) {

            return null;

        }


        ImporterState.importing =
            true;


        try {

            setLoading(
                true,
                "ファイルを読み込んでいます..."
            );


            /*
             * ファイル読み込み
             */

            const importedFile =
                await importFile(file);


            setLoading(
                true,
                "バトルデータを解析しています..."
            );


            /*
             * Parser + Storage
             */

            const result =
                await processImportedFile(
                    importedFile
                );


            const storage =
                result.storage || {};


            const total =
                Number(storage.total || 0);


            const added =
                Number(storage.added || 0);


            const updated =
                Number(storage.updated || 0);


            const skipped =
                Number(storage.skipped || 0);


            /*
             * 表示更新
             */

            if (
                window.Battle &&
                typeof window.Battle.refresh === "function"
            ) {

                await window.Battle.refresh();

            }


            if (
                window.BattleUI &&
                typeof window.BattleUI.render === "function"
            ) {

                await window.BattleUI.render();

            }


            /*
             * 完了イベント
             */

            dispatchImportCompleted(
                result
            );


            /*
             * メッセージ
             */

            let message =
                total +
                "件のバトルデータを読み込みました。";


            if (added > 0 && updated > 0) {

                message =
                    added +
                    "件追加、" +
                    updated +
                    "件更新しました。";

            } else if (added > 0) {

                message =
                    added +
                    "件のバトルを追加しました。";

            } else if (updated > 0) {

                message =
                    updated +
                    "件のバトルを更新しました。";

            } else if (skipped > 0) {

                message =
                    skipped +
                    "件は既に保存されています。";

            }


            showToast(
                message
            );


            return result;

        } catch (error) {

            console.error(
                "InkBoard import error:",
                error
            );


            dispatchImportError(
                error
            );


            const message =
                error &&
                error.message
                    ? error.message
                    : "インポートに失敗しました。";


            showToast(
                message
            );


            throw error;

        } finally {

            setLoading(
                false
            );


            ImporterState.importing =
                false;

        }

    }


    /* =======================================================
       FILE INPUT
    ======================================================= */

    function openFilePicker() {

        const input =
            document.getElementById(
                "fileInput"
            );


        if (!input) {

            console.warn(
                "fileInputが見つかりません。"
            );

            return;

        }


        input.value = "";

        input.click();

    }


    /* =======================================================
       INITIALIZE
    ======================================================= */

    function init() {

        if (ImporterState.initialized) {
            return;
        }


        const input =
            document.getElementById(
                "fileInput"
            );


        /*
         * ファイル選択
         */

        if (input) {

            input.addEventListener(
                "change",
                async function (event) {

                    const files =
                        event.target.files;


                    if (
                        !files ||
                        files.length === 0
                    ) {

                        return;

                    }


                    const file =
                        files[0];


                    try {

                        await handleFile(
                            file
                        );

                    } catch (error) {

                        /*
                         * handleFile内ですでに
                         * エラー表示しているため、
                         * ここでは追加表示しない。
                         */

                        console.error(
                            error
                        );

                    }

                }
            );

        }


        /*
         * data-action="import"
         */

        document.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-action='import']"
                    );


                if (!button) {
                    return;
                }


                /*
                 * ファイルinput自身のクリックは除外
                 */

                if (
                    event.target === input
                ) {

                    return;

                }


                event.preventDefault();


                openFilePicker();

            }
        );


        ImporterState.initialized =
            true;

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

    window.Importer = {

        state:
            ImporterState,

        getExtension:
            getExtension,

        getFileType:
            getFileType,

        readTextFile:
            readTextFile,

        readFileAsArrayBuffer:
            readFileAsArrayBuffer,

        parseJSON:
            parseJSON,

        isHoragaiBayData:
            isHoragaiBayData,

        importJSONFile:
            importJSONFile,

        importZIPFile:
            importZIPFile,

        importFile:
            importFile,

        processImportedFile:
            processImportedFile,

        handleFile:
            handleFile,

        openFilePicker:
            openFilePicker,

        init:
            init

    };


})();ror(
                "Import failed:",
                error
            );

            showToast(
                error.message ||
                "データの読み込みに失敗しました。"
            );

        } finally {

            hideLoading();
        }
    }


    /* =====================================================
       FILE INPUT EVENT
    ===================================================== */

    function handleFileInput(event) {

        const files =
            event.target.files;

        if (
            !files ||
            files.length === 0
        ) {
            return;
        }

        handleFile(
            files[0]
        );
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        document.body.classList.add(
            "is-importing"
        );
    }


    function hideLoading() {

        document.body.classList.remove(
            "is-importing"
        );
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(
                ".app-toast"
            );

        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.className =
                "app-toast";

            document.body.appendChild(
                toast
            );
        }

        toast.textContent =
            String(message || "");

        toast.classList.add(
            "show"
        );

        window.clearTimeout(
            toast._timer
        );

        toast._timer =
            window.setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2800
            );
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function bindEvents() {

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                handleFileInput
            );
        }

        if (importButton) {

            importButton.addEventListener(
                "click",
                openFilePicker
            );
        }

        if (emptyImportButton) {

            emptyImportButton.addEventListener(
                "click",
                openFilePicker
            );
        }
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        cacheDOM();

        bindEvents();
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.Importer = {

        init,

        openFilePicker,

        importFile,

        importJSONFile,

        importZIPFile,

        isHoragaiBayData,

        processImportedFile
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
