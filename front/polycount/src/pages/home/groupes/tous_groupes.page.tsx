import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { useEffect, useState } from "react";
import { Groupe } from "../../../models/groupe.model";
import LoaderCenter from "../../../components/loader/loader_center.component";
import CreationGroupe from "../../../components/groupe/creation_groupe.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import CarteGroupe from "../../../components/groupe/carte_groupe.component";
import { toast } from "sonner";

function TousGroupes() {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [groupes, set_groupes] = useState<Groupe[]>([]);
    const [chargement, set_chargement] = useState<boolean>(true);
    const [creation_groupe, set_creation_groupe] = useState<boolean>(false);

    useEffect(() => {
        recuperer_groupe_api();
    }, []);

    const ajouter_groupe = async (groupe: Groupe) => {
        set_groupes([...groupes, groupe]);
    }

    const recuperer_groupe_api = async () => {
        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('GET', "/groupe/", null, authentification, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            set_groupes(reponse.data.data.map((groupe: Groupe) => {
              return Groupe.from_JSON(groupe);
            }).sort((a: Groupe, b: Groupe) => {
                return a.pk_groupe_id > b.pk_groupe_id ? 1 : -1;
            }));
        }
    }

    return (
        <section style={{ margin: "10px 20px" }}>

            {
                creation_groupe ?
                <CreationGroupe annulation={set_creation_groupe} ajouter_groupe={ajouter_groupe} /> : <></>
            }
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {
                    !chargement && groupes.length > 0 ?
                    <h1 style={{ display: 'inline-block' }}>Vous avez {groupes.length} {groupes.length > 1 ? "groupes partagés" : "groupe partagé"}</h1> :
                    <p></p>
                }
                <button className="full-button" onClick={ authentification?.authentification.utilisateur?.desactive_le !== null ? () => toast.warning("Votre compte est en procédure de désactivation, vous ne pouvez plus créer de groupe.") : () => set_creation_groupe(true)}>Créer un groupe</button>
            </div>
            <div style={{ height: '20px' }}></div>
            {
                chargement ?
                <LoaderCenter message="Récupération des groupes" /> :
                <>
                    {
                        groupes.length === 0 ?
                        <div className="centre-centre"><h1>Vous n'avez aucun groupe partagé.</h1></div> :
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '30px' }}>
                            {
                                groupes.map((groupe: Groupe) => {
                                    return (<CarteGroupe groupe={groupe} />);
                                })
                            }
                        </div>
                    }
                </>
            }
        </section>
    );
}

export default TousGroupes;