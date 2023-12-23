import { AxiosError, AxiosResponse } from "axios";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import requete_api from "../../../utils/requete_api.util";
import { SyntheticEvent, useEffect, useState } from "react";
import { Token } from "../../../models/token.model";
import TextInput from "../../../components/input/text_input.component";
import { toast } from "sonner";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";

function MotDePasseOublieReinitialiser ({ email, token }: { email: string, token: string }) {
    const [token_api, set_token_api] = useState<Token | null>(null);

    const [mot_de_passe1, set_mot_de_passe1] = useState<string>("");
    const [mot_de_passe2, set_mot_de_passe2] = useState<string>("");

    const [erreur_page, set_erreur_page] = useState<string | null>(null);

    const [min_10_carac, set_min_10_carac] = useState<boolean>(false);
    const [min_1_carac_spe, set_min_1_carac_spe] = useState<boolean>(false);
    const [min_1_carac_maj, set_min_1_carac_maj] = useState<boolean>(false);
    const [min_1_chiffre, set_min_1_chiffre] = useState<boolean>(false);

    const [mot_de_passe_modifie, set_mot_de_passe_modifie] = useState<boolean>(false);

    const [chargement, set_chargement] = useState<boolean>(false);

    const navigate: NavigateFunction = useNavigate();

    const verifier_token = async () => {
        const api_body: any = {
            email: email,
            token: token
        };

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/utilisateur/verifier_mot_de_passe_token", api_body, null, navigate, true);

        if (!reponse || !('data' in reponse)) {
            navigate("/connexion");
        } else {
            set_token_api(Token.from_JSON(reponse.data.data));
        }
    }

    const changer_mot_de_passe_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!min_10_carac || !min_1_carac_spe || !min_1_carac_maj || !min_1_chiffre) {
            set_erreur_page("Veuillez vérifier toutes les conditions.");
            return;
        }

        if (mot_de_passe1 !== mot_de_passe2) {
            set_erreur_page("Veuillez renseigner les mêmes mots de passe.");
            return;
        }

        const api_body: any = {
            email: email,
            token: token,
            mot_de_passe: mot_de_passe1
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/modifier_mot_de_passe_oublie", api_body, null, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            set_mot_de_passe_modifie(true);
            toast.success(reponse.data.message);
        }
    }

    useEffect(() => {
        verifier_token();
    }, []);

    useEffect(() => {
        set_min_10_carac(mot_de_passe1.length >= 10);
        set_min_1_carac_spe(/[&#@$*+\-!]/.test(mot_de_passe1));
        set_min_1_carac_maj(/[A-Z]/.test(mot_de_passe1));
        set_min_1_chiffre(/[0-9]/.test(mot_de_passe1));
    }, [mot_de_passe1]);

    useEffect(() => {
        set_erreur_page(null);
    }, [mot_de_passe1, mot_de_passe2]);

    return (
        <>
            <p>Réinitialisation du mot de passe</p>
            {
                mot_de_passe_modifie ?
                <div className="grid-2-auto">
                    <div className="centre">
                        <img alt="Logo d'un personnage contant" src="/images/succes.png" style={{ height: '260px' }}/>
                    </div>
                    <div className="centre-centre">
                        <p>Votre mot de passe a bien été modifié.</p>
                    </div>
                </div> :
                <>
                    {
                        token_api ?
                        <div>
                            {
                                token_api.date_creation < new Date() && token_api.date_desactivation > new Date() ?
                                <div className="grid-2-auto gap20">
                                    <form>
                                        <TextInput label="Mot de passe" type="password" placeholder="Votre nouveau mot de passe" value={mot_de_passe1} onChange={(e: any) => set_mot_de_passe1(e.target.value)} required />
                                        <div style={{ height: '30px' }}></div>
                                        <TextInput label="Mot de passe*" type="password" placeholder="Vérifiez votre mot de passe" value={mot_de_passe2} onChange={(e: any) => set_mot_de_passe2(e.target.value)} required />
                                        {
                                            erreur_page ?
                                            <>
                                                <div style={{ height: '10px' }}></div>
                                                <div className="centre" style={{ marginBottom: '10px' }}>
                                                    <span style={{ color: 'red' }}>{ erreur_page }</span>
                                                    <div style={{ height: '10px' }}></div>
                                                </div>
                                            </> :
                                            <div style={{ height: '30px' }}></div>
                                        }
                                        <div className="centre">
                                        {
                                            chargement ?
                                            <button className="full-button centre-centre" onClick={() => {}}>
                                                <LoaderSpinner />
                                                <p className="inline-block">&nbsp;Réinitialisation en cours</p>
                                            </button> :
                                            <button className="full-button" onClick={changer_mot_de_passe_api}>Réinitialiser le mot de passe</button>
                                        }
                                        </div>
                                    </form>
                                    <div>
                                        <ul>
                                            <li style={ min_10_carac ? { color: 'green' } : { color: 'red' }}>au moins 10 caractères</li>
                                            <li style={ min_1_carac_spe ? { color: 'green' } : { color: 'red' }}>au moins 1 caractère spécial</li>
                                            <li style={ min_1_carac_maj ? { color: 'green' } : { color: 'red' }}>au moins 1 majuscule</li>
                                            <li style={ min_1_chiffre ? { color: 'green' } : { color: 'red' }}>au moins 1 chiffre</li>
                                        </ul>
                                    </div>
                                </div> :
                                <>
                                    <p>Ce token est périmé, vous ne pouvez plus réinitialiser votre mot de passe.</p>
                                </>
                            }
                        </div> :
                        <div>
                            <p>Chargement...</p>
                        </div>
                    }
                </>
            }
            
            <div>
                <p className="inline-block">Vous souhaitez annuler la procédure ?&nbsp;</p>
                <Link className="inline-block lien" to='/connexion'>revenez à la page de connexion</Link>
            </div>
        </>
    );
}

export default MotDePasseOublieReinitialiser;