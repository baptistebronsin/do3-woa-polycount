import { SyntheticEvent, useEffect, useState } from "react";
import TextInput from "../../components/text_input.component";
import Selecteur from "../../components/selecteur.component";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import LoaderSpinner from "../../components/loader_spinner.component";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { Utilisateur } from "../../models/utilisateur.model";
import { toast } from "sonner";

function Inscription() {

    const [page_inscription, set_page_inscription] = useState<number>(1);

    const genres: { value: string, label: string }[] = [{ value: "m", label: "M" }, { value: "mme", label: "Mme" }, { value: "mlle", label: "Mlle" }, { value: "", label: "Aucun" }];

    const [nom, set_nom] = useState<string>("");
    const [prenom, set_prenom] = useState<string>("");
    const [genre, set_genre] = useState<string>(genres[0].value);

    const [email, set_email] = useState<string>("");
    const [mot_de_passe1, set_mot_de_passe1] = useState<string>("");
    const [mot_de_passe2, set_mot_de_passe2] = useState<string>("");

    const [erreur_page1, set_erreur_page1] = useState<string | null>(null);
    const [erreur_page2, set_erreur_page2] = useState<string | null>(null);

    const [chargement, set_chargement] = useState<boolean>(false);

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    useEffect(() => {
        set_erreur_page1(null);
    }, [nom, prenom]);

    useEffect(() => {
        set_erreur_page2(null);
    }, [email, mot_de_passe1, mot_de_passe2]);

    const verifie_premiere_page_correcte = (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom === "" || prenom === "") {
            set_erreur_page1("Veuillez remplir tous les champs.");
            return null;
        }

        set_erreur_page1(null);
        set_page_inscription(2);
    }

    const erreur_mot_de_passe = (): string | null => {
        if(mot_de_passe1.length < 10)
            return "Veuillez utiliser un mot de passe d'au moins 10 caractères.";
        if (!/[&#@$*+\-!]/.test(mot_de_passe1))
            return "Veuillez utiliser un mot de passe contenant au moins un caractère spécial.";
        if (!/[A-Z]/.test(mot_de_passe1))
            return "Veuillez utiliser un mot de passe contenant au moins une majuscule.";
        if (!/[0-9]/.test(mot_de_passe1))
            return "Veuillez utiliser un mot de passe contenant au moins un chiffre.";

        return null;
    }

    const inscription_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "" || mot_de_passe1 === "" || mot_de_passe2 === "") {
            set_erreur_page2("Veuillez remplir tous les champs.");
            return null;
        }

        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email_regex.test(email)) {
            set_erreur_page2("Veuillez saisir une adresse email valide.");
            return null;
        }

        const erreur_mdp: string | null = erreur_mot_de_passe();
        if (erreur_mdp !== null) {
            set_erreur_page2(erreur_mdp);
            return null;
        }

        if (mot_de_passe1 !== mot_de_passe2) {
            set_erreur_page2("Veuillez saisir les mêmes mots de passe.");
            return null;
        }

        const api_body: any = {
            nom: nom,
            prenom: prenom,
            genre: genre,
            email: email,
            mot_de_passe: mot_de_passe1
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/utilisateur/inscription", navigate, api_body);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            localStorage.removeItem('token');
            localStorage.removeItem('utilisateur');
            
            localStorage.setItem('utilisateur', JSON.stringify(reponse.data.data));
            if (!authentification) {
                toast.error("Une erreur est survenue lors de l'utilisateur du provider.");
                return null;
            }

            authentification.set_authentification({ token: reponse.data.token, utilisateur: Utilisateur.from_JSON(reponse.data.data) });

            navigate('/verification-compte', { state: { email: email, mot_de_passe: mot_de_passe1, depuis: 'INSCRIPTION' } });
        }
    }

    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        <p>Inscription</p>
                        {
                                page_inscription == 1 ?
                                <div className="grid-2-auto gap20">
                                    <div>
                                        <form>
                                            <TextInput label="Nom" type="text" placeholder="Votre nom" value={nom} onChange={(e: any) => set_nom(e.target.value)} required />
                                            <div style={{ height: '20px' }}></div>
                                            <TextInput label="Prénom" type="text" placeholder="Votre prénom" value={prenom} onChange={(e: any) => set_prenom(e.target.value)} required />
                                            <div style={{ height: '20px' }}></div>
                                            <Selecteur label="Genre" options={genres} valeur_defaut={genre} changement={set_genre} />
                                            <div style={{ height: '20px' }}></div>
                                            {
                                                erreur_page1 ?
                                                <div className="centre" style={{ marginBottom: '10px' }}>
                                                    <span style={{ color: 'red' }}>{ erreur_page1 }</span>
                                                </div> :
                                                <></>
                                            }
                                            <div className="centre">
                                                <button className="full-button" onClick={verifie_premiere_page_correcte}>Suivant</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="centre">
                                        <img alt="Logo d'un personnage entier marchant" src="/images/inscription.png" style={{ height: '260px' }}/>
                                    </div>
                                </div> :
                                <form>
                                    <div className="grid-2-auto gap60">
                                        <div>
                                            <TextInput label="Email" type="mail" placeholder="Votre email" value={email} onChange={(e: any) => set_email(e.target.value)} required />
                                            <div style={{ height: '20px' }}></div>
                                            <p>Notre but n’est pas de vous harceler avec des emails. Vous ne recevrez que le strict nécéssaire.</p>
                                        </div>
                                        <div>
                                            <TextInput label="Mot de passe" type="password" placeholder="Créez un mot de passe" value={mot_de_passe1} onChange={(e: any) => set_mot_de_passe1(e.target.value)} required />
                                            <div style={{ height: '20px' }}></div>
                                            <TextInput label="Mot de passe*" type="password" placeholder="Vérifiez le mot de passe" value={mot_de_passe2} onChange={(e: any) => set_mot_de_passe2(e.target.value)} required />
                                        </div>
                                    </div>
                                    {
                                        erreur_page2 ?
                                        <div className="centre" style={{ marginBottom: '10px' }}>
                                            <span style={{ color: 'red' }}>{ erreur_page2 }</span>
                                        </div> :
                                        <></>
                                    }
                                    <div className="centre">
                                        {
                                            chargement ?
                                            <button className="full-button centre-centre" onClick={() => {}}>
                                                <LoaderSpinner />
                                                <p className="inline-block">&nbsp;Inscription en cours</p>
                                            </button> :
                                            <button className="full-button" onClick={inscription_api}>M'inscrire</button>
                                        }
                                    </div>
                                </form>
                            }
                        
                        <div>
                            <p className="inline-block">Vous possédez déjà un compte ?&nbsp;</p>
                            <Link className="inline-block lien" to='/connexion'>connectez-vous</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


export default Inscription;