import { Link } from "react-router-dom";
import TextInput from "../../components/test_input.component";

function MotDePasseOublie () {

    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        <p>Mot de passe oublié</p>
                        <div className="grid-2-auto">
                            <div className="centre">
                                <img alt="Logo d'un personnage ne se souvenant pas de son mot de passe" src="/images/password.png" style={{ height: '260px' }}/>
                            </div>
                            <div>
                                <form>
                                    <p>
                                        Veuillez indiquer l'email que vous avez renseigné lors de votre inscription.
                                    </p>
                                    <div style={{ height: '30px' }}></div>
                                    <TextInput label="Email" type="text" placeholder="Votre email" />
                                    <div style={{ height: '30px' }}></div>
                                    <div className="centre">
                                        <button className="full-button">Réinitialiser</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div>
                            <p className="inline-block">Vous êtes perdu ?&nbsp;</p>
                            <Link className="inline-block" to='/connexion'>revenez à la page de connexion</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MotDePasseOublie;