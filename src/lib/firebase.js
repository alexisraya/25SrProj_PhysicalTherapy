import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAzF2W4NylZymDQNr568mKw2OxFWiNRxpw",
    authDomain: "mend-e1022.firebaseapp.com",
    projectId: "mend-e1022",
    storageBucket: "mend-e1022.appspot.com",
    messagingSenderId: "977797563736",
    appId: "1:977797563736:web:4c6748d4ffae36d276912d",
    measurementId: "G-6TKQ8JYXSX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);