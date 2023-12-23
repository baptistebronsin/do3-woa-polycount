import { NavigateFunction, useFetcher, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { useEffect, useState } from "react";
import { Groupe } from "../../../models/groupe.model";
import LoaderCenter from "../../../components/loader/loader_center.component";
import CreationGroupe from "../../../components/groupe/creation_groupe.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";

function TousGroupes() {
    const authentification: AuthContextType | null = useAuth();

    const navigate: NavigateFunction = useNavigate();

    const [groupes, set_groupes] = useState<Groupe[]>([]);
    const [chargement, set_chargement] = useState<boolean>(true);
    const [creation_groupe, set_creation_groupe] = useState<boolean>(false);

    useEffect(() => {
        creer_groupe_api();
    }, []);

    const ajouter_groupe = async (groupe: Groupe) => {
        set_groupes([...groupes, groupe]);
    }

    const creer_groupe_api = async () => {
        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('GET', "/groupe/", null, authentification, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            set_groupes(reponse.data.data.map((groupe: Groupe) => {
              return Groupe.from_JSON(groupe);
            }));

            console.log(reponse.data.data);
            console.log(groupes);
        }
    }

    return (
        <section style={{ margin: "10px" }}>
            {
                creation_groupe ?
                <CreationGroupe annulation={set_creation_groupe} ajouter_groupe={ajouter_groupe} /> : <></>
            }
            <div>
                <button className="lien" onClick={() => set_creation_groupe(true)}>Créer un groupe</button>
            </div>
            {
                chargement ?
                <LoaderCenter message="Récupération des groupes" /> :
                <>
                    {
                        groupes.length == 0 ?
                        <div className="centre-centre"><h1>Vous n'avez aucun groupe partagé.</h1></div> :
                        <div className="centre-centre"><h1>Vous avez {groupes.length} groupes partagés.</h1></div>
                    }
                </>
            }
        </section>
    );
}

export default TousGroupes;