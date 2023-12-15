import { useEffect, useState } from "react";
import MotDePasseOublie from "./mot_de_passe_oublie.page";
import MotDePasseOublieEnvoye from "./mot_de_passe_oublie_envoye.page";
import MotDePasseOublieReinitialiser from "./mot_de_passe_oublie_reinitialiser.page";

function IndexMotDePasseOublie () {
    const [operation_reussie, set_operation_reussie] = useState<boolean>(false);

    const [email, set_email] = useState<string | null>(null);
    const [token, set_token] = useState<string | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        
        set_email(searchParams.get('email'));
        set_token(searchParams.get('token'));
    }, []);

    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        {
                            email && token ?
                            <MotDePasseOublieReinitialiser email={email} token={token} /> :
                            <>
                                <p>Mot de passe oublié</p>
                                 {
                                    !operation_reussie ?
                                    <MotDePasseOublie set_operation_reussie={set_operation_reussie}/> :
                                    <MotDePasseOublieEnvoye />
                                 }
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default IndexMotDePasseOublie;