importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyAMx6oWTAIsrMqSgcgrn2ykFZpBjW5YlPw',
    authDomain: 'myschool-f862b.firebaseapp.com',
    projectId: 'myschool-f862b',
    storageBucket: 'myschool-f862b.appspot.com',
    messagingSenderId: '198850585669',
    appId: '1:198850585669:web:e392c229bf5eb284652f2c',
});

firebase.messaging();
