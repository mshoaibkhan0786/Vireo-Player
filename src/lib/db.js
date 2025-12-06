const DB_NAME = 'VireoPlayerDB';
const STORE_NAME = 'playlist';
const VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const savePlaylistToDB = async (playlist) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        // We only store the File objects and metadata, NOT the blob URLs (which expire)
        const serializablePlaylist = playlist.map(item => ({
            name: item.name,
            type: item.type,
            size: item.size,
            file: item.file // File objects are serializable in IDB
        }));

        const request = store.put(serializablePlaylist, 'currentPlaylist');

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
};

export const getPlaylistFromDB = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('currentPlaylist');

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};
