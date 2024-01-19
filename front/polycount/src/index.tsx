import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './assets/css/main.css';
import './assets/css/text_input.css';
import './assets/css/selecteur.css';
import './assets/css/text_area_input.css'
import './assets/css/carte_groupe.css';
import './assets/css/carte_depense.css';
import './assets/css/selecteur_dynamique.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inscription from './pages/authentification/inscription.page';
import Connexion from './pages/authentification/connexion.page';
import { Toaster } from 'sonner';
import IndexMotDePasseOublie from './pages/authentification/mot_de_passe_oublie/index.page';
import Verification from './pages/authentification/verification.page';
import { AuthProvider } from './providers/authentification.provider';
import ProtectedRoute from './routes/protected.route';
import HomeRoute from './routes/home.route';
import SuspensionPage from './pages/authentification/suspension.page';

ReactDOM.render(
  <AuthProvider>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path='/' element={ <Connexion /> }/>
          <Route path='/inscription' element={ <Inscription /> } />
          <Route path='/connexion' element={ <Connexion /> } />
          <Route path='/mot-de-passe-oublie' element={ <IndexMotDePasseOublie /> } />
          <Route path='/verification-compte' element={ <Verification /> } />
          <Route path='/suspension' element={ <SuspensionPage /> } />
          
          <Route path='/home/*' element={ <ProtectedRoute><HomeRoute /></ProtectedRoute> } />
        </Routes>
      </Router>
    </React.StrictMode>
    <Toaster position="bottom-right" visibleToasts={5} expand={false} closeButton={true} toastOptions={{duration: 10000}} richColors/>
  </AuthProvider>,
  document.getElementById('root')
);
