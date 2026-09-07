/* =========================================================
   importer.js
   Horagai Bay Data Importer
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONSTANTS
    ===================================================== */

    const JSON_EXTENSIONS = [
        ".json"
    ];

    const ZIP_EXTENSIONS = [
        ".zip"
    ];


    /* =====================================================
       DOM
    ===================================================== */

    let fileInput = null;
    let importButton = null;
    let emptyImportButton = null;


    /* =====================================================
       INITIALIZE DOM
    ===================================================== */

    function cacheDOM() {

        fileInput =
            document.getElementById("fileInput");

        importButton =
            document.getElementById("importButton");

        emptyImportButton =
            document.getElementById(
                "emptyImportButton"
            );
    }


    /* =====================================================
       OPEN FILE PICKER
    ===================================================== */

    function openFilePicker() {

        if (!fileInput) {
            return;
        }

        fileInput.value = "";

        fileInput.click();
    }


    /* =====================================================
       FILE EXTENSION
    ===================================================== */

    function getExtension(fileName) {

        const name =
            String(fileName || "")
                .toLowerCase();

        const lastDot =
            name.lastIndexOf(".");

        if (lastDot === -1) {
            return "";
        }

        return name.slice(lastDot);
    }


    /* =====================================================
       FILE TYPE
    ===================================================== */

    function getFileType(file) {

        const extension =
            getExtension(file.name);

        if (
            JSON_EXTENSIONS.includes(
                extension
            )
        ) {
            return "json";
        }

        if (
            ZIP_EXTENSIONS.includes(
                extension
            )
        ) {
            return "zip";
        }

        if (
            file.type ===
            "application/json"
        ) {
            return "json";
        }

        if (
            file.type ===
            "application/zip" ||
            file.type ===
            "application/x-zip-compressed"
        ) {
            return "zip";
        }

        return "unknown";
    }


    /* =====================================================
       READ TEXT FILE
    ===================================================== */

    function readTextFile(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    resolve(
                        reader.result
                    );
                };

                reader.onerror = () => {

                    reject(
                        new Error(
                            "JSONファイルを読み込めませんでした。"
                        )
                    );
                };

                reader.readAsText(
                    file,
                    "UTF-8"
                );
            }
        );
    }


    /* =====================================================
       PARSE JSON
    ===================================================== */

    function parseJSON(text) {

        if (
            typeof text !==
            "string"
        ) {
            throw new Error(
                "JSONデータが文字列ではありません。"
            );
        }

        const trimmed =
            text.trim();

        if (!trimmed) {
            throw new Error(
                "JSONファイルが空です。"
            );
        }

        try {

            return JSON.parse(
                trimmed
            );

        } catch (error) {

            console.error(
                "JSON parse error:",
                error
            );

            throw new Error(
                "JSONの形式を読み取れませんでした。"
            );
        }
    }


    /* =====================================================
       CHECK HORAGAI BAY DATA
    ===================================================== */

    function isHoragaiBayData(data) {

        if (
            !data ||
            typeof data !== "object"
        ) {
            return false;
        }

        /*
         * 今回確認したホラガイベイの
         * バトルJSONでは、ルートに
         * vsHistoryDetail が存在する。
         */

        if (
            data.vsHistoryDetail &&
            typeof data.vsHistoryDetail ===
                "object"
        ) {
            return true;
        }

        return false;
    }


    /* =====================================================
       IMPORT JSON
    ===================================================== */

    async function importJSONFile(file) {

        const text =
            await readTextFile(file);

        const data =
            parseJSON(text);

        if (
            !isHoragaiBayData(data)
        ) {

            throw new Error(
                "ホラガイベイのバトルデータとして認識できませんでした。"
            );
        }

        return {
            type: "json",
            fileName: file.name,
            data
        };
    }


    /* =====================================================
       ZIP SUPPORT
    ===================================================== */

    async function importZIPFile(file) {

        /*
         * ZIPの実データ構造は、
         * 実際のホラガイベイZIPを基準に
         * parser側で扱う。
         *
         * ここではZIPファイルそのものを
         * ArrayBufferとして取得し、
         * parser.jsへ渡せる状態にする。
         */

        const buffer =
            await readFileAsArrayBuffer(
                file
            );

        return {
            type: "zip",
            fileName: file.name,
            buffer
        };
    }


    /* =====================================================
       READ ARRAY BUFFER
    ===================================================== */

    function readFileAsArrayBuffer(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    resolve(
                        reader.result
                    );
                };

                reader.onerror = () => {

                    reject(
                        new Error(
                            "ファイルを読み込めませんでした。"
                        )
                    );
                };

                reader.readAsArrayBuffer(
                    file
                );
            }
        );
    }


    /* =====================================================
       IMPORT DISPATCH
    ===================================================== */

    async function importFile(file) {

        if (!file) {
            return null;
        }

        const type =
            getFileType(file);

        switch (type) {

            case "json":

                return await importJSONFile(
                    file
                );

            case "zip":

                return await importZIPFile(
                    file
                );

            default:

                throw new Error(
                    "対応していないファイル形式です。JSONまたはZIPを選択してください。"
                );
        }
    }


    /* =====================================================
       SEND TO PARSER
    ===================================================== */

    async function processImportedFile(
        importedFile
    ) {

        if (!importedFile) {
            return;
        }

        /*
         * parser.js が読み込まれていれば
         * 実際のデータ解析を依頼する。
         */

        if (
            typeof window.Parser !==
                "undefined" &&
            typeof window.Parser.parseImport !==
                "function"
        ) {

            throw new Error(
                "データ解析機能が読み込まれていません。"
            );
        }

        if (
            typeof window.Parser ===
                "undefined"
        ) {

            throw new Error(
                "parser.js が読み込まれていません。"
            );
        }

        const parsed =
            await window.Parser.parseImport(
                importedFile
            );

        /*
         * parser.jsの結果を
         * storage.jsへ保存する。
         */

        if (
            parsed &&
            typeof window.Storage !==
                "undefined" &&
            typeof window.Storage.importData ===
                "function"
        ) {

            return await window.Storage.importData(
                parsed
            );
        }

        return parsed;
    }


    /* =====================================================
       HANDLE FILE
    ===================================================== */

    async function handleFile(file) {

        if (!file) {
            return;
        }

        try {

            showLoading();

            const importedFile =
                await importFile(file);

            const result =
                await processImportedFile(
                    importedFile
                );

            console.log(
                "Import completed:",
                result
            );

            showToast(
                "データを読み込みました"
            );

            /*
             * インポート後に一覧を再描画。
             */

            if (
                typeof window.BattleUI !==
                    "undefined" &&
                typeof window.BattleUI.render ===
                    "function"
            ) {

                await window.BattleUI.render();
            }

        } catch (error) {

            console.error(
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
