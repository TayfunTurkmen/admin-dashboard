import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { initialData } from "../data/mockData";

const STORAGE_KEY = "dashboard_data_store";

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = (value) => JSON.parse(JSON.stringify(value));

const readLocalStore = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return clone(initialData);
  }
  return JSON.parse(raw);
};

const writeLocalStore = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const serializeFirestoreDeep = (value) => {
  if (value == null) return value;
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeFirestoreDeep);
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        return value.toDate().toISOString();
      } catch {
        /* fall through */
      }
    }
    if (Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(
        Object.entries(value).map(([key, nested]) => [key, serializeFirestoreDeep(nested)]),
      );
    }
  }
  return value;
};

export const fetchCollection = async (collectionName) => {
  if (isFirebaseConfigured && db) {
    const snap = await getDocs(collection(db, collectionName));
    if (collectionName === "statistics") {
      const statsDoc = snap.docs[0];
      const raw = statsDoc ? { id: statsDoc.id, ...statsDoc.data() } : clone(initialData.statistics);
      return serializeFirestoreDeep(raw);
    }
    return snap.docs.map((item) => serializeFirestoreDeep({ id: item.id, ...item.data() }));
  }

  await delay();
  const store = readLocalStore();
  return clone(store[collectionName]);
};

export const addItem = async (collectionName, payload) => {
  if (isFirebaseConfigured && db) {
    const ref = await addDoc(collection(db, collectionName), payload);
    return { id: ref.id, ...payload };
  }

  await delay();
  const store = readLocalStore();
  const newItem = {
    id: `${collectionName}_${Date.now()}`,
    ...payload,
  };
  store[collectionName] = [newItem, ...(store[collectionName] ?? [])];
  writeLocalStore(store);
  return newItem;
};

export const updateItem = async (collectionName, id, payload) => {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, collectionName, id), payload);
    return { id, ...payload };
  }

  await delay();
  const store = readLocalStore();
  store[collectionName] = (store[collectionName] ?? []).map((item) =>
    item.id === id ? { ...item, ...payload } : item,
  );
  writeLocalStore(store);
  return store[collectionName].find((item) => item.id === id);
};

export const deleteItem = async (collectionName, id) => {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, collectionName, id));
    return id;
  }

  await delay(200);
  const store = readLocalStore();
  store[collectionName] = (store[collectionName] ?? []).filter((item) => item.id !== id);
  writeLocalStore(store);
  return id;
};
