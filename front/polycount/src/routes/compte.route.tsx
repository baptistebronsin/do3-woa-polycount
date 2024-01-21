import { Route, Routes } from 'react-router-dom';
import Informations from '../pages/home/compte/informations.page';
import EmailUtilisateur from '../pages/home/compte/email_utilisateur.page';
import MotDePasseUtilisateur from '../pages/home/compte/mot_de_passe_utilisateur.page';

function CompteRoute() {

    return (
        <Routes>
            <Route path='/informations' element={ <Informations /> } />
            <Route path='/email' element={ <EmailUtilisateur /> } />
            <Route path='/mot-de-passe' element={ <MotDePasseUtilisateur /> } />
        </Routes>
    );
}

export default CompteRoute;