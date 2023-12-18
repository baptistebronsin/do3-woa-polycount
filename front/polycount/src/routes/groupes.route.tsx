import { Route, Routes } from 'react-router-dom';
import TousGroupes from '../pages/home/groupes/tous_groupes.page';

function GroupesRoute() {

    return (
        <Routes>
            <Route path='/' element={ <TousGroupes /> } />
        </Routes>
    );
}

export default GroupesRoute;