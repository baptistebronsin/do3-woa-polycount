import { Route, Routes } from 'react-router-dom';
import TousGroupes from '../pages/home/groupes/tous_groupes.page';
import InformationsGroupe from '../pages/home/groupes/informations_groupe.page';

function GroupesRoute() {

    return (
        <Routes>
            <Route path='/' element={ <TousGroupes /> } />
            <Route path=':groupe_id' element={ <InformationsGroupe /> } />
        </Routes>
    );
}

export default GroupesRoute;