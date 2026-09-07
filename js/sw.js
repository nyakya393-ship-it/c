// =========================
// Service Worker
// InkBoard
// =========================

"use strict";


// ========================================
// Cache
// ========================================

const CACHE_NAME =
    "inkboard-cache-v1";


const APP_SHELL = [

    "./",

    "./index.html",

    "./style.css",

    "./js/app.js",

    "./js/importer.js",

    "./js/parser.js",

    "./js/storage.js",

    "./js/analyzer.js",

    "./js/battle.js",

    "./js/ui.js",

    "./manifest.webmanifest"

];


// ========================================
// Install
// ========================================

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(
                function (cache) {

                    return cache.addAll(
                        APP_SHELL
                    );

                }
            )

        );


        self.skipWaiting();

    }
);


// ========================================
// Activate
// ========================================

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches.keys().then(
                function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }


                                return null;

                            }
                        )

                    );

                }
            ).then(
                function () {

                    return self.clients.claim();

                }
            )

        );

    }
);


// ========================================
// Fetch
// ========================================

self.addEventListener(
    "fetch",
    function (event) {

        const request =
            event.request;


        // GET以外はそのまま
        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        // --------------------------------
        // 外部サイト
        // --------------------------------

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            caches.match(
                request
            ).then(
                function (cachedResponse) {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(
                        request
                    ).then(
                        function (networkResponse) {

                            if (
                                !networkResponse ||
                                networkResponse.status !== 200 ||
                                networkResponse.type !==
                                    "basic"
                            ) {

                                return networkResponse;

                            }


                            const responseClone =
                                networkResponse.clone();


                            caches.open(
                                CACHE_NAME
                            ).then(
                                function (cache) {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                }
                            );


                            return networkResponse;

                        }
                    );

                }
            )

        );

    }
);
