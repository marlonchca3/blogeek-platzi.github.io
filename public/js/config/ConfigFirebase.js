const firebaseConfig = {
  apiKey: 'AIzaSyAClxWmv5WK9o2FyHdzvgV0fZDBNpKOWqA',
  authDomain: 'blogeekplatzi1-8afed.firebaseapp.com',
  projectId: 'blogeekplatzi1-8afed',
  storageBucket: 'blogeekplatzi1-8afed.appspot.com',
  messagingSenderId: '6699378495',
  appId: '1:6699378495:web:96139fad02a6c3981c558a',
  measurementId: 'G-HYRW93G3KH'
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}