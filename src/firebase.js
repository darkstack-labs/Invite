import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbabuQzPAf5d_KQl3YYZ0ynEOQy_Xck7Q",
  authDomain: "worstbatchsigningoff.firebaseapp.com",
  projectId: "worstbatchsigningoff",
  storageBucket: "worstbatchsigningoff.appspot.com",
  messagingSenderId: "522072612591",
  appId: "1:522072612591:web:4ab093b0a197c9a32dc51a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);