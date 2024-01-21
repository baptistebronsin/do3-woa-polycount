export const contenu: {
    [key: string]: {
        entete: string,
        contenu: string,
        signature: string
    }
} = {
    mail_bienvenue: {
        entete: "Bienvenue sur Polycount",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Je vous remercie d'avoir choisi Polycount pour gérer vos dépenses groupées.</p><p>Afin de pouvoir profiter de toutes ces fonctionnalités, pouvez-vous valider votre compte en cliquant sur le bouton ci-dessous :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Vérifier mon compte</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette inscription, merci de ne pas tenir compte de ce message.</p>",
        signature: "<p>Bien cordialement,<br>Baptiste, le modérateur de Polycount</p>"
    },
    mail_verification_compte: {
        entete: "Vérification de votre compte",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Veuillez trouver ci-dessous un bouton pour faire vérifier votre compte :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Vérifier mon compte</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    reinitialisation_mot_de_passe: {
        entete: "Réinitialisation de votre mot de passe",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Suite à votre demande, veuillez trouver ci-dessous un bouton pour réinitialiser le mot de passe de votre compte :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Modifier mon mot de passe</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    mail_notification_modification_mot_de_passe_realise: {
        entete: "Changement de votre mot de passe",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Nous vous confirmons que votre mot de passe a bien été changé.</p><p>Si vous n'êtes pas l'auteur de cette demande de changement, veuillez vous rendre dans l'espace \"<strong>Mot de passe oublié</strong>\" et le réinitialiser.<br>Sinon vous pouvez nous contacter à l'adresse email suivante : <a href='mailto:$_MAIL_$'>$_MAIL_$</a>.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    mail_notification_changement: {
        entete: "Changement de votre adresse email",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Nous vous confirmons que votre nouvelle adresse email a bien été changée.</p><p>Veuillez trouver ci-dessous un bouton pour faire vérifier à nouveau votre compte :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Vérifier mon compte</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    mail_desactivation: {
        entete: "Désactivation de votre compte",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Nous sommes triste de vous voir partir si tôt...<br>Sachez que vous avez un délais de 30 jours après la désactivation de votre compte pour revenir en arrière et donc éviter la perte de vos données.</p><p>La date de suppression de vos informations est prévue pour le <strong>$_DATE_DESACTIVATION_$</strong>.</p><p>Car vos données sont personnelles, vous recevrez un dernier mail de notre part pour vous tenir informer de l'état de votre compte Polycount.</p><p>Nous espérons que vous avez pu profiter de notre application et nous vous souhaitons une bonne journée.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    mail_reactivation: {
        entete: "Réactivation de votre compte",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Bon retour parmis nous !</p><p>La réactivation de votre compte entraîne l'annulation de la procédure de suppression de vos informations.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    },
    mail_invitation_groupe: {
        entete: "Invitation à rejoindre un groupe Polycount",
        contenu: "<p>Bonjour $_GENRE_$ $_NOM_$,</p><p>Vous êtes invités à rejoindre le groupe de dépense Polycount <strong>$_NOM_GROUPE_$</strong> de $_PRENOM_INVITEUR_$ $_NOM_INVITEUR_$.</p><p>Veuillez trouver ci-dessous un bouton pour rejoindre ce groupe :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Rejoindre le groupe</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Dans le cas où vous ne souhaitez pas rejoindre ce groupe, veuillez ne pas prendre en compte ce mail.</p>",
        signature: "<p>Bien cordialement,<br>Le service Polycount</p>",
    }
};

export const domaines_black_liste: string[] = [];