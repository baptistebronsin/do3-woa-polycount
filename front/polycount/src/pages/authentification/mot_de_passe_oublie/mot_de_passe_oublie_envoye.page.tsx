import { Link } from "react-router-dom";

function MotDePasseOublieEnvoye () {

    return (
        <>
            <div>
                <p>
                    Un mail vous a été envoyé avec les instructions pour réinitialiser votre mot de passe.<br />
                    Regardez dans vos spam, il se peut que le mail s'y trouve !
                </p>
            </div>
            <div>
                <p className="inline-block">Vous avez suivi la procédure ?&nbsp;</p>
                <Link className="inline-block lien" to='/connexion'>revenez à la page de connexion</Link>
            </div>
        </>
    );
}

export default MotDePasseOublieEnvoye;