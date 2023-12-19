import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { useState } from "react";
import { Groupe } from "../../../models/groupe.model";
import LoaderCenter from "../../../components/loader/loader_center.component";
import CreationGroupe from "../../../components/groupe/creation_groupe.component";

function TousGroupes() {
    const authentification: AuthContextType | null = useAuth();

    const navigate: NavigateFunction = useNavigate();

    const [groupes, set_groupes] = useState<Groupe[]>([]);
    const [chargement, set_chargement] = useState<boolean>(true);
    const [creation_groupe, set_creation_groupe] = useState<boolean>(false);

    return (
        <section style={{ margin: "10px" }}>
            {
                creation_groupe ?
                <CreationGroupe annulation={set_creation_groupe} /> : <></>
            }
            <div>
                <button className="lien" onClick={() => set_creation_groupe(true)}>Créer un groupe</button>
            </div>
            {
                chargement ?
                <LoaderCenter message="Récupération des groupes" /> :
                <></>
            }
        </section>
    );
}

export default TousGroupes;