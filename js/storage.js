/* =========================================================
   InkBoard
   js/storage.js
   ========================================================= */

(function () {

    "use strict";


    /* =======================================================
       DATABASE SETTINGS
    ======================================================= */

    const DB_NAME = "InkBoardDB";

    const DB_VERSION = 1;

    const BATTLE_STORE = "battles";


    let dbInstance = null;


    /* =======================================================
       OPEN DATABASE
    ======================================================= */

    function openDatabase() {

        if (dbInstance) {

            return Promise.resolve(
                dbInstance
            );

        }


        return new Promise(
            function (resolve, reject) {

                if (!window.indexedDB) {

                    reject(
                        new Error(
                            "このブラウザではIndexedDBを利用できません。"
                        )
                    );

                    return;

                }


                const request =
                    indexedDB.open(
                        DB_NAME,
                        DB_VERSION
                    );


                request.onupgradeneeded =
                    function (event) {

                        const db =
                            event.target.result;


                        let store;


                        if (
                            !db.objectStoreNames.contains(
                                BATTLE_STORE
                            )
                        ) {

                            store =
                                db.createObjectStore(
                                    BATTLE_STORE,
                                    {
                                        keyPath: "id"
                                    }
                                );

                        } else {

                            store =
                                event.target.transaction.objectStore(
                                    BATTLE_STORE
                                );

                        }


                        /*
                         * 日時検索用インデックス
                         */

                        if (
                            !store.indexNames.contains(
                                "playedTime"
                            )
                        ) {

                            store.createIndex(
                                "playedTime",
                                "playedTime",
                                {
                                    unique: false
                                }
                            );

                        }


                        /*
                         * ルール検索用インデックス
                         *
                         * ネストした
                         * rule.code はブラウザによって
                         * IndexedDBの対応が不安定なため、
                         * 実際の検索はgetAll後に行う。
                         */

                    };


                request.onsuccess =
                    function (event) {

                        dbInstance =
                            event.target.result;


                        dbInstance.onclose =
                            function () {

                                dbInstance =
                                    null;

                            };


                        resolve(
                            dbInstance
                        );

                    };


                request.onerror =
                    function () {

                        reject(
                            request.error ||
                            new Error(
                                "IndexedDBを開けませんでした。"
                            )
                        );

                    };


                request.onblocked =
                    function () {

                        reject(
                            new Error(
                                "データベースが別の処理によって使用中です。"
                            )
                        );

                    };

            }
        );

    }


    /* =======================================================
       TRANSACTION
    ======================================================= */

    function getStore(
        mode
    ) {

        return openDatabase()
            .then(
                function (db) {

                    const transaction =
                        db.transaction(
                            BATTLE_STORE,
                            mode
                        );


                    const store =
                        transaction.objectStore(
                            BATTLE_STORE
                        );


                    return {

                        db:
                            db,

                        transaction:
                            transaction,

                        store:
                            store

                    };

                }
            );

    }


    /* =======================================================
       PUT ONE BATTLE
    ======================================================= */

    function putBattle(
        battle
    ) {

        return new Promise(
            function (resolve, reject) {

                if (
                    !battle ||
                    battle.id === undefined ||
                    battle.id === null
                ) {

                    reject(
                        new Error(
                            "保存するバトルにIDがありません。"
                        )
                    );

                    return;

                }


                getStore(
                    "readwrite"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.put(
                                    battle
                                );


                            request.onsuccess =
                                function () {

                                    resolve(
                                        battle
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトルを保存できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       PUT MANY BATTLES
    ======================================================= */

    function putBattles(
        battles
    ) {

        battles =
            Array.isArray(battles)
                ? battles
                : [];


        if (
            battles.length === 0
        ) {

            return Promise.resolve(
                {
                    total: 0,
                    saved: 0
                }
            );

        }


        return new Promise(
            function (resolve, reject) {

                getStore(
                    "readwrite"
                )
                    .then(
                        function (context) {

                            let completed =
                                0;


                            const transaction =
                                context.transaction;


                            transaction.oncomplete =
                                function () {

                                    resolve(
                                        {
                                            total:
                                                battles.length,

                                            saved:
                                                completed
                                        }
                                    );

                                };


                            transaction.onerror =
                                function () {

                                    reject(
                                        transaction.error ||
                                        new Error(
                                            "バトルの保存中にエラーが発生しました。"
                                        )
                                    );

                                };


                            transaction.onabort =
                                function () {

                                    reject(
                                        transaction.error ||
                                        new Error(
                                            "バトルの保存処理が中断されました。"
                                        )
                                    );

                                };


                            battles.forEach(
                                function (battle) {

                                    if (
                                        !battle ||
                                        battle.id === undefined ||
                                        battle.id === null
                                    ) {

                                        return;

                                    }


                                    const request =
                                        context.store.put(
                                            battle
                                        );


                                    request.onsuccess =
                                        function () {

                                            completed++;

                                        };

                                }
                            );

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       GET ONE BATTLE
    ======================================================= */

    function getBattle(
        id
    ) {

        return new Promise(
            function (resolve, reject) {

                if (
                    id === undefined ||
                    id === null
                ) {

                    resolve(
                        null
                    );

                    return;

                }


                getStore(
                    "readonly"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.get(
                                    String(id)
                                );


                            request.onsuccess =
                                function () {

                                    resolve(
                                        request.result ||
                                        null
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトルを取得できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       GET ALL BATTLES
    ======================================================= */

    function getAllBattles() {

        return new Promise(
            function (resolve, reject) {

                getStore(
                    "readonly"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.getAll();


                            request.onsuccess =
                                function () {

                                    const battles =
                                        Array.isArray(
                                            request.result
                                        )
                                            ? request.result
                                            : [];


                                    battles.sort(
                                        sortNewest
                                    );


                                    resolve(
                                        battles
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトル履歴を取得できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       COUNT
    ======================================================= */

    function countBattles() {

        return new Promise(
            function (resolve, reject) {

                getStore(
                    "readonly"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.count();


                            request.onsuccess =
                                function () {

                                    resolve(
                                        request.result || 0
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトル数を取得できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       DELETE ONE
    ======================================================= */

    function deleteBattle(
        id
    ) {

        return new Promise(
            function (resolve, reject) {

                if (
                    id === undefined ||
                    id === null
                ) {

                    resolve(
                        false
                    );

                    return;

                }


                getStore(
                    "readwrite"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.delete(
                                    String(id)
                                );


                            request.onsuccess =
                                function () {

                                    resolve(
                                        true
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトルを削除できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       CLEAR ALL
    ======================================================= */

    function clearBattles() {

        return new Promise(
            function (resolve, reject) {

                getStore(
                    "readwrite"
                )
                    .then(
                        function (context) {

                            const request =
                                context.store.clear();


                            request.onsuccess =
                                function () {

                                    resolve(
                                        true
                                    );

                                };


                            request.onerror =
                                function () {

                                    reject(
                                        request.error ||
                                        new Error(
                                            "バトル履歴を削除できませんでした。"
                                        )
                                    );

                                };

                        }
                    )
                    .catch(
                        reject
                    );

            }
        );

    }


    /* =======================================================
       IMPORT DATA
    ======================================================= */

    async function importData(
        data
    ) {

        let records = [];


        if (
            Array.isArray(data)
        ) {

            records =
                data;

        } else if (
            data &&
            Array.isArray(data.records)
        ) {

            records =
                data.records;

        } else {

            throw new Error(
                "インポートするバトルデータがありません。"
            );

        }


        /*
         * IDが存在するものだけ保存
         */

        records =
            records.filter(
                function (battle) {

                    return (
                        battle &&
                        battle.id !== undefined &&
                        battle.id !== null
                    );

                }
            );


        if (
            records.length === 0
        ) {

            throw new Error(
                "保存できるバトルデータがありません。"
            );

        }


        /*
         * 既存IDを取得
         */

        const existing =
            await getAllBattles();


        const existingIds =
            new Set(
                existing.map(
                    function (battle) {

                        return String(
                            battle.id
                        );

                    }
                )
            );


        let added = 0;

        let updated = 0;

        let skipped = 0;


        const unique =
            new Map();


      s);

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error ||
                                new Error(
                                    "バトル履歴を取得できませんでした。"
                                )
                            );

                        };

                } catch (error) {

                    reject(error);

                }

            }
        );
    }


    // ========================================
    // Count
    // ========================================

    function countBattles() {

        return new Promise(
            async function (resolve, reject) {

                try {

                    const db =
                        await openDatabase();


                    const tx =
                        db.transaction(
                            STORE_NAME,
                            "readonly"
                        );


                    const store =
                        tx.objectStore(
                            STORE_NAME
                        );


                    const request =
                        store.count();


                    request.onsuccess =
                        function () {

                            resolve(
                                request.result || 0
                            );

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error ||
                                new Error(
                                    "バトル数を取得できませんでした。"
                                )
                            );

                        };

                } catch (error) {

                    reject(error);

                }

            }
        );
    }


    // ========================================
    // Delete One Battle
    // ========================================

    function deleteBattle(id) {

        return transaction(
            "readwrite",
            function (store) {

                store.delete(id);

            }
        );
    }


    // ========================================
    // Delete All
    // ========================================

    function clearBattles() {

        return transaction(
            "readwrite",
            function (store) {

                store.clear();

            }
        );
    }


    // ========================================
    // Export
    // ========================================

    async function exportData() {

        const battles =
            await getAllBattles();


        return {

            version: 1,

            exportedAt:
                new Date().toISOString(),

            app:
                "InkBoard",

            battles:
                battles

        };
    }


    // ========================================
    // Export JSON File
    // ========================================

    async function exportJSON() {

        const data =
            await exportData();


        const json =
            JSON.stringify(
                data,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        const date =
            new Date()
                .toISOString()
                .slice(0, 10);


        link.download =
            "InkBoard-backup-" +
            date +
            ".json";


        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(url);

            },
            1000
        );


        return true;
    }


    // ========================================
    // Import Parsed Data
    // ========================================

    async function importData(parsedData) {

        if (!parsedData) {

            throw new Error(
                "インポートデータがありません。"
            );

        }


        const records =
            Array.isArray(parsedData)
                ? parsedData
                : parsedData.records;


        if (!Array.isArray(records)) {

            throw new Error(
                "保存するバトルデータが見つかりません。"
            );

        }


        const validRecords =
            records.filter(function (record) {

                return record &&
                    record.id;

            });


        if (validRecords.length === 0) {

            throw new Error(
                "有効なバトルデータがありません。"
            );

        }


        // --------------------------------
        // Existing IDs
        // --------------------------------

        const existing =
            await getAllBattles();


        const existingIds =
            new Set(
                existing.map(function (battle) {

                    return battle.id;

                })
            );


        let added = 0;

        let updated = 0;


        await transaction(
            "readwrite",
            function (store) {

                validRecords.forEach(
                    function (battle) {

                        if (
                            existingIds.has(
                                battle.id
                            )
                        ) {

                            updated++;

                        } else {

                            added++;

                        }


                        store.put(battle);

                    }
                );

            }
        );


        return {

            total:
                validRecords.length,

            added:
                added,

            updated:
                updated,

            skipped:
                records.length -
                validRecords.length

        };
    }


    // ========================================
    // Replace All Data
    // ========================================

    async function replaceData(parsedData) {

        if (!parsedData) {

            throw new Error(
                "置き換えるデータがありません。"
            );

        }


        const records =
            Array.isArray(parsedData)
                ? parsedData
                : parsedData.records;


        if (!Array.isArray(records)) {

            throw new Error(
                "バトルデータが配列ではありません。"
            );

        }


        const validRecords =
            records.filter(function (record) {

                return record &&
                    record.id;

            });


        await transaction(
            "readwrite",
            function (store) {

                store.clear();


                validRecords.forEach(
                    function (battle) {

                        store.put(battle);

                    }
                );

            }
        );


        return {

            total:
                validRecords.length

        };
    }


    // ========================================
    // Search
    // ========================================

    async function searchBattles(options) {

        const battles =
            await getAllBattles();


        if (!options) {
            return battles;
        }


        return battles.filter(
            function (battle) {

                // --------------------------------
                // Rule
                // --------------------------------

                if (
                    options.rule &&
                    battle.rule &&
                    battle.rule.code !== options.rule
                ) {

                    return false;

                }


                // --------------------------------
                // Mode
                // --------------------------------

                if (
                    options.mode &&
                    battle.mode &&
                    battle.mode.mode !== options.mode
                ) {

                    return false;

                }


                // --------------------------------
                // Tricolor
                // --------------------------------

                if (
                    options.tricolor !== undefined &&
                    battle.isTricolor !== options.tricolor
                ) {

                    return false;

                }


                // --------------------------------
                // Weapon
                // --------------------------------

                if (options.weapon) {

                    const weaponId =
                        battle.player &&
                        battle.player.weapon
                            ? battle.player.weapon.id
                            : "";


                    if (
                        weaponId !== options.weapon
                    ) {

                        return false;

                    }

                }


                // --------------------------------
                // Result
                // --------------------------------

                if (options.result) {

                    if (
                        battle.judgement !==
                        options.result
                    ) {

                        return false;

                    }

                }


                // --------------------------------
                // Text
                // --------------------------------

                if (options.text) {

                    const text =
                        String(
                            options.text
                        ).toLowerCase();


                    const values = [

                        battle.player &&
                            battle.player.name,

                        battle.player &&
                            battle.player.byname,

                        battle.rule &&
                            battle.rule.name,

                        battle.stage &&
                            battle.stage.name,

                        battle.player &&
                            battle.player.weapon &&
                            battle.player.weapon.name

                    ];


                    const matched =
                        values.some(
                            function (value) {

                                return String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(text);

                            }
                        );


                    if (!matched) {
                        return false;
                    }

                }


                // --------------------------------
                // Date range
                // --------------------------------

                if (options.from) {

                    const time =
                        new Date(
                            battle.playedTime
                        ).getTime();


                    const from =
                        new Date(
                            options.from
                        ).getTime();


                    if (
                        Number.isFinite(from) &&
                        Number.isFinite(time) &&
                        time < from
                    ) {

                        return false;

                    }

                }


                if (options.to) {

                    const time =
                        new Date(
                            battle.playedTime
                        ).getTime();


                    const to =
                        new Date(
                            options.to
                        ).getTime();


                    if (
                        Number.isFinite(to) &&
                        Number.isFinite(time) &&
                        time > to
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );
    }


    // ========================================
    // Database Delete
    // ========================================

    async function deleteDatabase() {

        if (dbPromise) {

            try {

                const db =
                    await dbPromise;

                db.close();

            } catch (error) {

                console.warn(
                    error
                );

            }

            dbPromise = null;

        }


        return new Promise(
            function (resolve, reject) {

                const request =
                    indexedDB.deleteDatabase(
                        DB_NAME
                    );


                request.onsuccess =
                    function () {

                        resolve(true);

                    };


                request.onerror =
                    function () {

                        reject(
                            request.error ||
                            new Error(
                                "データベースを削除できませんでした。"
                            )
                        );

                    };


                request.onblocked =
                    function () {

                        reject(
                            new Error(
                                "データベースが使用中のため削除できません。"
                            )
                        );

                    };

            }
        );
    }


    // ========================================
    // Public API
    // ========================================

    window.Storage = {

        openDatabase:
            openDatabase,

        putBattle:
            putBattle,

        putBattles:
            putBattles,

        getBattle:
            getBattle,

        getAllBattles:
            getAllBattles,

        countBattles:
            countBattles,

        deleteBattle:
            deleteBattle,

        clearBattles:
            clearBattles,

        exportData:
            exportData,

        exportJSON:
            exportJSON,

        importData:
            importData,

        replaceData:
            replaceData,

        searchBattles:
            searchBattles,

        deleteDatabase:
            deleteDatabase

    };


})();
