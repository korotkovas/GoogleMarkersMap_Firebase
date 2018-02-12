
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyB3bkOU-hxHLhl-s6OKrMzUjf2o5_wHOeY",
    authDomain: "mapsmarker-d9088.firebaseapp.com",
    databaseURL: "https://mapsmarker-d9088.firebaseio.com",
    projectId: "mapsmarker-d9088",
    storageBucket: "mapsmarker-d9088.appspot.com",
    messagingSenderId: "341742274773"
  };
  firebase.initializeApp(config)

var data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null
};

var map;
var markers = []; // Create a marker array to hold your markers

    /**
     * Handles the sign in button press.
     */
    function toggleSignIn() {
        if (firebase.auth().currentUser) {
          // [START signout]
          firebase.auth().signOut();
          // [END signout]
        } else {
          var email = document.getElementById('email').value;
          var password = document.getElementById('password').value;
          if (email.length < 4) {
            alert('Please enter an email address.');
            return;
          }
          if (password.length < 4) {
            alert('Please enter a password.');
            return;
          }
          // Sign in with email and pass.
          // [START authwithemail]
          firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            if (errorCode === 'auth/wrong-password') {
              alert('Wrong password.');
            } else {
              alert(errorMessage);
            }
            console.log(error);
            document.getElementById('sign-in').disabled = false;
            // [END_EXCLUDE]
          });
          // [END authwithemail]
        }
        document.getElementById('sign-in').disabled = true;
      }
      
      /**
       * Handles the sign up button press.
       */
      function handleSignUp() {
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        if (email.length < 4) {
          alert('Please enter an email address.');
          return;
        }
        if (password.length < 4) {
          alert('Please enter a password.');
          return;
        }
        // Sign in with email and pass.
        // [START createwithemail]
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
          } else {
            alert(errorMessage);
          }
          console.log(error);
          // [END_EXCLUDE]
        });
        // [END createwithemail]
      }
  
      /**
       * Sends an email verification to the user.
       */
      function sendEmailVerification() {
        // [START sendemailverification]
        firebase.auth().currentUser.sendEmailVerification().then(function() {
          // Email Verification sent!
          // [START_EXCLUDE]
          alert('Email Verification Sent!');
          // [END_EXCLUDE]
        });
        // [END sendemailverification]
      }
  
      function sendPasswordReset() {
        var email = document.getElementById('email').value;
        // [START sendpasswordemail]
        firebase.auth().sendPasswordResetEmail(email).then(function() {
          // Password Reset Email Sent!
          // [START_EXCLUDE]
          alert('Password Reset Email Sent!');
          // [END_EXCLUDE]
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode == 'auth/invalid-email') {
            alert(errorMessage);
          } else if (errorCode == 'auth/user-not-found') {
            alert(errorMessage);
          }
          console.log(error);
          // [END_EXCLUDE]
        });
        // [END sendpasswordemail];
      }

  
      /**
       * Funkciaj authenficcation'o tikrinimo
       * Taip pat keicia mygtuku pavadinimus priklausomai nuo authenficationo
       */
      function initAuth() {
        // Stebi naudotojo būsenos pakeitimus.
        // [START authstatelistener]
        firebase.auth().onAuthStateChanged(function(user) {
          // [START_EXCLUDE silent]
          // document.getElementById('verify-email').disabled = true;
          // [END_EXCLUDE]
          if (user) {
            // Useris uzejo
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            // [START_EXCLUDE]
            // document.getElementById('sign-in-status').textContent = 'Signed in';
            document.getElementById('add-marker').disabled = false;
            document.getElementById('sign-in').textContent = 'Atsijungti';
            // document.getElementById('account-details').textContent = JSON.stringify(user, null, '  ');
            // if (!emailVerified) {
            //   document.getElementById('verify-email').disabled = false;
            // }
            // [END_EXCLUDE]
          } else {
            // Useris isejo
            // [START_EXCLUDE]
            // document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('add-marker').disabled = true;
            document.getElementById('sign-in').textContent = 'Prisijungti';
            // document.getElementById('account-details').textContent = 'null';
            // [END_EXCLUDE]
          }
          // [START_EXCLUDE silent]
          document.getElementById('sign-in').disabled = false;
          
          // [END_EXCLUDE]
          
        });
        // [END authstatelistener]
  
        document.getElementById('sign-in').addEventListener('click', toggleSignIn, false);
        document.getElementById('sign-up').addEventListener('click', handleSignUp, false);

        // document.getElementById('verify-email').addEventListener('click', sendEmailVerification, false);
        // document.getElementById('password-reset').addEventListener('click', sendPasswordReset, false);
      }

// Funkcija uzkrovimo duomonu is Firebase
var loadedMarkers = false;

function loadMarkers() {
  loadedMarkers = false;
  firebase.database().ref('places/').once('value')
    .then((data) => {    
      const places = []
      const obj = data.val()
      for (let key in obj) {
        var nowDate = Math.round(new Date().getTime())
        var oldDate = obj[key].timestamp
        var sinseAdd = nowDate - oldDate
        var removed = false
        if (sinseAdd > 30 * 60 * 1000) {
          // Jeigu nuo to momento kai sukurem praejo 24h - pasalinam markeri is duombazes
          firebase.database().ref().child('places/' + key + '/').remove()
          removed = true
        } else {
          // Jeigu nepraejo 24h tai uzkraunam markeri
          removed = false             
        }
        if (!removed) {
          places.push({
            id: key,
            lat: obj[key].lat,
            lng: obj[key].lng,
            timestamp: obj[key].timestamp,
            title: obj[key].title
          })          
        }      
      }
      // Perduodam duomenis, gautus is duombazes (places) i funkcija itvirtinimo zemelapio
      if (loadedMarkers == false) {
        setMarkers(places);
        loadedMarkers = true;
      }
    })
}

function reloadMarkers() {
  // Paslepia visus markerius is zemelapio
  for (var i=0; i<markers.length; i++) {
    markers[i].setMap(null);
  } 
  // Atnaujina masyva markers
  markers = [];
  // Isnaujo uzkrauna markerius is Firebase
  loadedMarkers = false;
  firebase.database().ref('places/').once('value')
    .then((data) => {    
      const places = []
      const obj = data.val()
      for (let key in obj) {     
        places.push({
          id: key,
          lat: obj[key].lat,
          lng: obj[key].lng,
          timestamp: obj[key].timestamp,
          title: obj[key].title
        })  
      }
      if (loadedMarkers == false) {
        // Prideda markeri zemielapije
        setMarkers(places);
        loadedMarkers = true;
      }   
    })
}

// Funkcija pridejimo i Firebase
function addToFirebase(data) {
  var data = this.data;
  // Aptinka ir iraso laika kai pridejom markeri
  data.timestamp = Math.round(new Date().getTime());
  firebase.database().ref('places').push(data, function(err) {
    if (err) {  // Duomenis negali buti irasyti i Firebase.
      console.warn(err);
    }
  });  
}