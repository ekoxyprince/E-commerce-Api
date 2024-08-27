const DB_NAME = "guestCartDB";
const DB_VERSION = 1;
const STORE_NAME = "cart";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => {
      console.error("Database failed to open:", event.target.errorCode);
      reject(event.target.errorCode);
    };
    request.onsuccess = (event) => {
      console.log("Database opened successfully");
      resolve(event.target.result);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
        console.log("Object store created");
      }
    };
  });
};

const addToCartIndexedDB = async (cartItem) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cartItem);
      request.onsuccess = () => {
        console.log("Item added to cart:", cartItem);
        resolve(true);
      };
      request.onerror = (event) => {
        console.error("Error adding item to cart:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  } catch (error) {
    console.error("Error in addToCartIndexedDB:", error);
  }
};

const getCartIndexedDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = (event) => {
        console.log("Cart items retrieved:", event.target.result);
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error("Error retrieving cart items:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  } catch (error) {
    console.error("Error in getCartIndexedDB:", error);
  }
};

const deleteFromCartIndexedDB = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => {
        console.log("Item deleted from cart:", id);
        resolve(true);
      };
      request.onerror = (event) => {
        console.error("Error deleting item from cart:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  } catch (error) {
    console.error("Error in deleteFromCartIndexedDB:", error);
  }
};
