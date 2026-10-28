
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-3zJ9P2fjkOeQPRTw49qLC0dPVZBv8BY",
  authDomain: "statii-newsite.firebaseapp.com",
  projectId: "statii-newsite",
  storageBucket: "statii-newsite.firebasestorage.app",
  messagingSenderId: "185299319333",
  appId: "1:185299319333:web:7eec27f2658048a5449dcc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
