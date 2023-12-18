import { Route, Routes } from 'react-router-dom';
import GroupesRoute from './../routes/groupes.route';
import Navigation from '../components/navigation.component';
import CompteRoute from './compte.route';

function HomeRoute() {

    return (
        <>
            <Navigation />
            <Routes>
                <Route path='/groupes/*' element={ <GroupesRoute /> } />
                <Route path='/compte/*' element={ <CompteRoute /> } />
            </Routes>
        </>
    );
}

export default HomeRoute;