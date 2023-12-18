import { Route, Routes } from 'react-router-dom';
import Compte from '../pages/home/compte/compte.page';

function CompteRoute() {

    return (
        <Routes>
            <Route path='/' element={ <Compte /> } />
        </Routes>
    );
}

export default CompteRoute;