import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAUvtwB4NqNm50VmDS9YHL38U-yNoXqY4k",
    authDomain: "expo-7b3c1.firebaseapp.com",
    projectId: "expo-7b3c1",
    storageBucket: "expo-7b3c1.firebasestorage.app",
    messagingSenderId: "843660951518",
    appId: "1:843660951518:web:186f910e8f792a8fd6a74f",
    measurementId: "G-HB5F1XY7LS"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
