// jsSHA = require("jssha");
var config = {
  apiKey: "AIzaSyCuZLBjpZutZ9DNL8J289vLANuQYuoZ7Qw",
  authDomain: "election9ja-f799a.firebaseapp.com",
  databaseURL: "https://election9ja-f799a.firebaseio.com",
  projectId: "election9ja-f799a",
  storageBucket: "election9ja-f799a.appspot.com",
  messagingSenderId: "224193206732"
};
firebase.initializeApp(config);

//get access to database reference
const dbRef = firebase.database().ref();

//get access to candidates store
const candidatesRef = dbRef.child('candidates');

//access to voters store in db
const votersRef = dbRef.child('voters');

//for handling image uploads
// Get a reference to the storage service, which is used to create references in your storage bucket
var storageRef = firebase.storage().ref();

var authRef = firebase.getAuth;

console.log("config started");