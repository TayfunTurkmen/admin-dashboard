import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

const MOCK_USER_KEY = "dashboard_mock_user";
const MOCK_EMAIL = "vendor@gmail.com";
const MOCK_PASSWORD = "Admin123!";

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const loginUser = async ({ email, password }) => {
  if (isFirebaseConfigured && auth) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  await delay();
  if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
    const user = { uid: "mock-admin", email: MOCK_EMAIL };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    return user;
  }

  throw new Error("Giris basarisiz. Demo icin vendor@gmail.com / Admin123! kullanin.");
};

export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
    return;
  }
  await delay(250);
  localStorage.removeItem(MOCK_USER_KEY);
};

export const observeAuthState = (callback) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }

  const raw = localStorage.getItem(MOCK_USER_KEY);
  callback(raw ? JSON.parse(raw) : null);
  return () => {};
};
