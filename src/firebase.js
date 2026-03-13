import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbabuQzPAf5d_KQl3YYZ0ynEOQy_Xck7Q",
  authDomain: "worstbatchsingingoff.firebaseapp.com",
  projectId: "worstbatchsingingoff",
  storageBucket: "worstbatchsingingoff.appspot.com",
  messagingSenderId: "522072612591",
  appId: "1:522072612591:web:4ab093b0a197c9a32dc51a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let anonymousAuthPromise = null;

export const ensureAnonymousAuth = async () => {
  if (auth.currentUser) return auth.currentUser;

  if (!anonymousAuthPromise) {
    anonymousAuthPromise = signInAnonymously(auth)
      .then((cred) => cred.user)
      .catch((error) => {
        anonymousAuthPromise = null;
        throw error;
      });
  }

  return anonymousAuthPromise;
};
