import firebase from 'firebase';
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBK0LXuaxtIy5u8Gxl-WGqLlHDCqQmHGic",
  authDomain: "anonibus-89f12.firebaseapp.com",
  databaseURL: "https://anonibus-89f12.firebaseio.com",
  projectId: "anonibus-89f12",
  storageBucket: "anonibus-89f12.appspot.com",
  messagingSenderId: "988299945200",
  appId: "1:988299945200:web:0d6e88934fbd6a63f28e35"
};

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
