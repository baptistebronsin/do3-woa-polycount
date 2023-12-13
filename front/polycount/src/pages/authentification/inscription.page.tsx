import { MouseEventHandler, useEffect, useState } from "react";
import TextInput from "../../components/test_input.component";
import Selecteur from "../../components/selecteur.component";
import { Link } from "react-router-dom";

function Inscription() {

    const [page_inscription, set_page_inscription] = useState<number>(1);

    const genres: { value: string, label: string }[] = [{ value: "m", label: "M" }, { value: "mme", label: "Mme" }, { value: "mlle", label: "Mlle" }, { value: "rien", label: "Aucun" }];

    const [nom, set_nom] = useState<string>("");
    const [prenom, set_prenom] = useState<string>("");
    const [genre, set_genre] = useState<string>(genres[0].value);

    const [email, set_email] = useState<string>("");
    const [mot_de_passe1, set_mot_de_passe1] = useState<string>("");
    const [mot_de_passe2, set_mot_de_passe2] = useState<string>("");

    const [erreur_page1, set_erreur_page1] = useState<string | null>(null);

    useEffect(() => {
        set_erreur_page1(null);
    }, [nom, prenom]);

    const verifie_premiere_page_correcte = (e: any) => {
        e.preventDefault();

        if (nom == "" || prenom == "") {
            set_erreur_page1("Veuillez remplir tous les champs.");
        } else {
            set_erreur_page1(null);
            set_page_inscription(2);
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
                                            <TextInput label="Nom" type="text" placeholder="Votre nom" value={nom} onChange={(e: any) => set_nom(e.target.value)} />
                                            <div style={{ height: '20px' }}></div>
                                            <TextInput label="Prénom" type="text" placeholder="Votre prénom" value={prenom} onChange={(e: any) => set_prenom(e.target.value)} />
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
                                    <></>
                                    <div className="grid-2-auto gap60">
                                        <div>
                                            <TextInput label="Email" type="mail" placeholder="Votre email" value={email} onChange={(e: any) => set_email(e.target.value)} />
                                            <div style={{ height: '20px' }}></div>
                                            <p>Notre but n’est pas de vous harceler avec des emails. Vous ne recevrez que le strict nécéssaire.</p>
                                        </div>
                                        <div>
                                            <TextInput label="Mot de passe" type="password" placeholder="Créez un mot de passe" value={mot_de_passe1} onChange={(e: any) => set_mot_de_passe1(e.target.value)} />
                                            <div style={{ height: '20px' }}></div>
                                            <TextInput label="Mot de passe*" type="password" placeholder="Vérifiez le mot de passe" value={mot_de_passe2} onChange={(e: any) => set_mot_de_passe2(e.target.value)} />
                                        </div>
                                    </div>
                                    <div style={{ height: '20px' }}></div>
                                    <div className="centre">
                                        <button className="full-button" onClick={() => alert("GOOOO")}>M'inscrire</button>
                                    </div>
                                </form>
                            }
                        
                        <div>
                            <p className="inline-block">Vous possédez déjà un compte ?&nbsp;</p>
                            <Link className="inline-block" to='/connexion'>connectez-vous</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


export default Inscription;