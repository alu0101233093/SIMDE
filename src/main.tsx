import { store } from './store';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n'; // Initialize i18next instance
import './main.scss';

import App from './interface/App';

import { FirebaseAppProvider } from 'reactfire'

// Import Firebase and configuration
import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqokoBJjcC74V7Pi4RreTLYlVKvUvLM4M",
    authDomain: "tfg-simde.firebaseapp.com",
    databaseURL: "https://tfg-simde-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tfg-simde",
    storageBucket: "tfg-simde.appspot.com",
    messagingSenderId: "146015167050",
    appId: "1:146015167050:web:a0e29d158ee4a3fe04bcb3",
    measurementId: "G-3DP30HR76K"
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// React application entrypoint
const render = (Component: React.ComponentType) => {
    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <FirebaseAppProvider firebaseConfig={firebaseConfig}>  
                        <Component />
                    </FirebaseAppProvider> 
                </I18nextProvider>
            </Provider>
        </React.StrictMode>,
        document.getElementById('app')
    )
}

render(App)
