import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD4aMMr6Tw5L1dAY7LPBCOIG5q9ngLdD-0",
    authDomain: "anthony-daniela-boda.firebaseapp.com",
    projectId: "anthony-daniela-boda",
    storageBucket: "anthony-daniela-boda.firebasestorage.app",
    messagingSenderId: "930099733458",
    appId: "1:930099733458:web:7d11eb53cde32f751b9e0b",
    measurementId: "G-9PDD294HMQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);
