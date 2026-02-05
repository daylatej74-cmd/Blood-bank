/**
 * LifeBank Service Worker
 * Handles offline caching, background sync, and performance optimization
 */

const CACHE_NAME = 'lifebank-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/register.html',
    '/inventory.html',
    '/about.html',
    '/main.js',
    '/resources/hero-medical.jpg',
    '/resources/medical-team.jpg',
    '/resources/laboratory-tech.jpg',
    '/resources/blood-donation-center.jpg',
    '/resources/medical-equipment.jpg',
    '/resources/blood-cells-microscope.jpg',
    '/resources/hospital-emergency.jpg',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js',
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Installing and caching assets');
            return cache.addAll(ASSETS_TO_CACHE.slice(0, 10)); // Cache only local assets initially
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if available
            if (response) {
                return response;
            }

            // Fetch from network
            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseClone = response.clone();

                // Cache successful responses
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            }).catch(() => {
                // Offline fallback
                console.log('Service Worker: Offline - serving from cache or offline page');
                return caches.match('/index.html');
            });
        })
    );
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * Background sync for form submissions
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form-data') {
        event.waitUntil(syncFormData());
    }
});

/**
 * Sync form data to server
 */
async function syncFormData() {
    try {
        const db = await openIndexedDB();
        const forms = await getFromDB(db, 'pending-forms');
        
        for (const form of forms) {
            try {
                await fetch('/api/donate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
                
                // Remove from pending
                await deleteFromDB(db, 'pending-forms', form.id);
            } catch (error) {
                console.error('Failed to sync form:', error);
            }
        }
    } catch (error) {
        console.error('Sync error:', error);
        throw error; // Retry sync
    }
}

/**
 * IndexedDB helpers
 */
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LifeBank', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-forms')) {
                db.createObjectStore('pending-forms', { keyPath: 'id' });
            }
        };
    });
}

async function getFromDB(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function deleteFromDB(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
