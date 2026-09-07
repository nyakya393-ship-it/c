// =========================
// Storage
// InkBoard
// IndexedDB
// =========================

(function () {

    "use strict";


    // ========================================
    // Database
    // ========================================

    const DB_NAME = "InkBoardDB";

    const DB_VERSION = 1;

    const STORE_NAME = "battles";


    let dbPromise = null;


    // ========================================
    // Open Database
    // ========================================

    function openDatabase() {

        if (dbPromise) {
            return dbPromise;
        }


        dbPromise = new Promise(function (resolve, reject) {

            if (!window.indexedDB) {

                reject(
                    new Error(
                        "このブラウザではIndexedDBを利用できません。"
                    )
                );

                return;
            }


            const request =
                window.indexedDB.open(
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
                            STORE_NAME
                        )
                    ) {

                        store =
                            db.createObjectStore(
                                STORE_NAME,
                                {
                                    keyPath: "id"
                                }
                            );

                    } else {

                        store =
                            event.target.transaction.objectStore(
                                STORE_NAME
                            );

                    }


                    // 日付順に取得するためのインデックス
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


                    // ルール検索用
                    if (
                        !store.indexNames.contains(
                            "ruleCode"
                        )
                    ) {

                        store.createIndex(
                            "ruleCode",
                            "rule.code",
                            {
                                unique: false
                            }
                        );

                    }
                };


            request.onsuccess =
                function () {

                    const db =
                        request.result;


                    db.onversionchange =
                        function () {

                            db.close();

                        };


                    resolve(db);

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

        });


        return dbPromise;
    }


    // ========================================
    // Transaction Helper
    // ========================================

    async function transaction(
        mode,
        callback
    ) {

        const db =
            await openDatabase();


        return new Promise(function (
            resolve,
            reject
        ) {

            const tx =
                db.transaction(
                    STORE_NAME,
                    mode
                );


            const store =
                tx.objectStore(
                    STORE_NAME
                );


            let result;


            try {

                result =
                    callback(store);

            } catch (error) {

                reject(error);

                return;
            }


            tx.oncomplete =
                function () {

                    resolve(result);

                };


            tx.onerror =
                function () {

                    reject(
                        tx.error ||
                        new Error(
                            "データベース処理に失敗しました。"
                        )
                    );

                };


            tx.onabort =
                function () {

                    reject(
                        tx.error ||
                        new Error(
                            "データベース処理が中断されました。"
                        )
                    );

                };

        });
    }


    // ========================================
    // Add / Update Battle
    // ========================================

    function putBattle(battle) {

        return transaction(
            "readwrite",
            function (store) {

                if (
                    !battle ||
                    !battle.id
                ) {

                    throw new Error(
                        "保存できないバトルデータです。"
                    );

                }


                store.put(battle);

            }
        );
    }


    // ========================================
    // Add Multiple Battles
    // ========================================

    async function putBattles(battles) {

        if (!Array.isArray(battles)) {

            throw new Error(
                "保存するバトルデータが配列ではありません。"
            );

        }


        if (battles.length === 0) {
            return 0;
        }


        const validBattles =
            battles.filter(function (battle) {

                return battle &&
                    battle.id;

            });


        if (validBattles.length === 0) {
            return 0;
        }


        await transaction(
            "readwrite",
            function (store) {

                validBattles.forEach(
                    function (battle) {

                        store.put(battle);

                    }
                );

            }
        );


        return validBattles.length;
    }


    // ========================================
    // Get One Battle
    // ========================================

    function getBattle(id) {

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
                        store.get(id);


                    request.onsuccess =
                        function () {

                            resolve(
                                request.result || null
                            );

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error ||
                                new Error(
                                    "バトルデータを取得できませんでした。"
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
    // Get All Battles
    // ========================================

    function getAllBattles() {

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
                        store.getAll();


                    request.onsuccess =
                        function () {

                            const battles =
                                Array.isArray(
                                    request.result
                                )
                                    ? request.result
                                    : [];


                            battles.sort(
                                function (a, b) {

                                    const timeA =
                                        new Date(
                                            a.playedTime
                                        ).getTime();


                                    const timeB =
                                        new Date(
                                            b.playedTime
                                        ).getTime();


                                    if (
                                        Number.isFinite(timeA) &&
                                        Number.isFinite(timeB)
                                    ) {

                                        return timeB - timeA;

                                    }


                                    return 0;

                                }
                            );


                            resolve(battles);

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
