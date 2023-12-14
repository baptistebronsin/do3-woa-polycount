import { Link } from "react-router-dom";
import TextInput from "../../components/test_input.component";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

function Connexion() {
    const [email, set_email] = useState<string>("");
    const [mot_de_passe, set_mot_de_passe] = useState<string>("");

    const requete_api = async (e: any) => {
        e.preventDefault();

        try {
            const reponse = await axios.post('http://localhost:8080/utilisateur/connexion', {
                email: email,
                mot_de_passe: mot_de_passe
            });

            if ('message' in reponse.data) {
                toast.success(reponse.data.message);
            } else {
                toast.success("Opération acceptée.");
            }
            
        } catch (erreur) {
            if (erreur instanceof AxiosError) {
                if (erreur.code == "ERR_NETWORK") {
                    toast.error("Impossible de se connecter au serveur.");
                } else if (erreur.response && erreur.response.data) {
                    if ('status' in erreur.response) {
                        if (erreur.response.status == 500) {
                            if ('message' in erreur.response.data) {
                                toast.error(erreur.response.data.message);
                            } else {
                                toast.error("Une erreur serveur est survenue.");
                            }
                        } else {
                            if ('message' in erreur.response.data) {
                                toast.warning(erreur.response.data.message);
                            } else {
                                toast.warning("Une erreur serveur est survenue.");
                            }
                        }
                    } else {
                        toast.error("Le serveur n'a retourné aucun statut.");
                    }
                } else {
                    toast.error("Le serveur n'a retourné aucune donnée.");
                }
            } else {
                toast.error("Une erreur critique indéfinie est survenue.");
            }
        }
    }

    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        <p>Connexion</p>
                        <div className="grid-2-auto">
                            <div className="centre">
                                <img alt="Logo d'un personnage tenant une carte bancaire" src="/images/connexion.png" style={{ height: '260px' }}/>
                            </div>
                            <div>
                                <form>
                                    <TextInput label="Email" type="text" placeholder="Votre email" value={email} onChange={(e: any) => set_email(e.target.value)} />
                                    <div style={{ height: '30px' }}></div>
                                    <TextInput label="Mot de passe" type="password" placeholder="Votre mot de passe" value={mot_de_passe} onChange={(e: any) => set_mot_de_passe(e.target.value)} />
                                    <Link to='/mot_de_passe_oublie' style={{ fontSize: '16px' }}>Mot de passe oublié ?</Link>
                                    <div style={{ height: '30px' }}></div>
                                    <div className="centre">
                                        <button className="full-button" onClick={requete_api}>Me connecter</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div>
                            <p className="inline-block">Vous ne possédez pas encore de compte ?&nbsp;</p>
                            <Link className="inline-block" to='/inscription'>inscrivez-vous</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Connexion;