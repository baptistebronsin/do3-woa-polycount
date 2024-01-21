import { Route, Routes } from 'react-router-dom';
import Informations from '../pages/home/compte/informations.page';

function CompteRoute() {

    return (
        <Routes>
            <Route path='/informations' element={ <Informations /> } />
            <Route path='/email' element={ <Informations /> } />
            <Route path='/mot-de-passe' element={ <Informations /> } />
        </Routes>
    );
}

export default CompteRoute;