import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './assets/css/main.css';
import './assets/css/text_input.css';
import './assets/css/selecteur.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inscription from './pages/authentification/inscription.page';
import Connexion from './pages/authentification/connexion.page';
import MotDePasseOublie from './pages/authentification/mot_de_passe_oublie.page';
import { Toaster } from 'sonner';

ReactDOM.render(
  <>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path='/'/>
          <Route path='/inscription' element={ <Inscription /> } />
          <Route path='/connexion' element={ <Connexion /> } />
          <Route path='/mot_de_passe_oublie' element={ <MotDePasseOublie /> } />
        </Routes>
      </Router>
    </React.StrictMode>
    <Toaster position="bottom-right" visibleToasts={5} expand={false} closeButton={true} toastOptions={{duration: 10000}} richColors/>
  </>,
  document.getElementById('root')
);
