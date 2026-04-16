import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
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

export const fetchCollection = async (collectionName) => {
  if (isFirebaseConfigured && db) {
    const snap = await getDocs(collection(db, collectionName));
    if (collectionName === "statistics") {
      const statsDoc = snap.docs[0];
      return statsDoc ? { id: statsDoc.id, ...statsDoc.data() } : clone(initialData.statistics);
    }
    return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
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
