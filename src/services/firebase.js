  
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
const config = {
  apiKey: "AIzaSyDh9_W8juiuXVGanYTB_6g6cTakdzyGGwA",
  authDomain: "chatappjh.firebaseapp.com",
  databaseURL: "https://chatappjh-default-rtdb.europe-west1.firebasedatabase.app/"
};

firebase.initializeApp(config);

export const auth = firebase.auth;
export const db = firebase.database();