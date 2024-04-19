// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjgNhUNznNBOfG87Nxwk2k78nvroKcY58",
  authDomain: "shareme-654a9.firebaseapp.com",
  projectId: "shareme-654a9",
  storageBucket: "shareme-654a9.appspot.com",
  messagingSenderId: "560295369241",
  appId: "1:560295369241:web:bb0f774367b59e8878a888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)