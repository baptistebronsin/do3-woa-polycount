DROP TABLE IF EXISTS Suspension;
DROP TABLE IF EXISTS Utilisateur_Lie_Depense;
DROP TABLE IF EXISTS Tag_Lie_Depense;
DROP TABLE IF EXISTS Depense;
DROP TABLE IF EXISTS Tag;
DROP TABLE IF EXISTS Participant_Groupe;
DROP TABLE IF EXISTS Groupe;
DROP TABLE IF EXISTS Utilisateur;

CREATE TABLE Utilisateur (
    pk_utilisateur_id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    genre VARCHAR(4) CHECK (genre IN ('M', 'Mme', 'Mlle')) DEFAULT NULL,
    email VARCHAR(250) NOT NULL,
    mot_de_passe TEXT NOT NULL,
    cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valide_le TIMESTAMP DEFAULT NULL,
    token VARCHAR(200) NOT NULL
);

CREATE TABLE Groupe (
    pk_groupe_id SERIAL PRIMARY KEY,
    nom VARCHAR(50) DEFAULT NULL,
    description VARCHAR(200) DEFAULT NULL,
    fk_utilisateur_createur_id INTEGER NOT NULL,
    cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cloture_le TIMESTAMP DEFAULT NULL,
    lien_image TEXT DEFAULT NULL,
    FOREIGN KEY (fk_utilisateur_createur_id) REFERENCES Utilisateur (pk_utilisateur_id)
);

CREATE TABLE Participant_Groupe (
    pk_participant_groupe_id SERIAL PRIMARY KEY,
    fk_utilisateur_id INTEGER NOT NULL,
    fk_groupe_id INTEGER NOT NULL,
    peut_creer_depense BOOLEAN NOT NULL DEFAULT TRUE,
    peut_modifier_depense BOOLEAN NOT NULL DEFAULT TRUE,
    peut_supprimer_depense BOOLEAN NOT NULL DEFAULT TRUE,
    peut_manipuler_tag BOOLEAN NOT NULL DEFAULT TRUE,
    peut_modifier_montant_max_depense BOOLEAN NOT NULL DEFAULT TRUE,
    montant_max_depense FLOAT DEFAULT NULL,
    rejoint_le TIMESTAMP DEFAULT NULL, -- NULL s'il est invité mais n'a pas encore rejoint
    quitte_le TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (fk_utilisateur_id) REFERENCES Utilisateur (pk_utilisateur_id),
    FOREIGN KEY (fk_groupe_id) REFERENCES Groupe (pk_groupe_id)
);

CREATE TABLE Tag (
    pk_tag_id SERIAL PRIMARY KEY,
    titre VARCHAR(40) NOT NULL,
    couleur VARCHAR(6) NOT NULL,
    icon VARCHAR(50) NOT NULL
);

CREATE TABLE Depense (
    pk_depense_id SERIAL PRIMARY KEY,
    fk_groupe_id INTEGER NOT NULL,
    fk_utilisateur_createur_id INTEGER NOT NULL,
    titre VARCHAR(100) DEFAULT NULL,
    montant FLOAT NOT NULL,
    ajoute_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lien_image TEXT DEFAULT NULL,
    FOREIGN KEY (fk_utilisateur_createur_id) REFERENCES Utilisateur (pk_utilisateur_id),
    FOREIGN KEY (fk_groupe_id) REFERENCES Groupe (pk_groupe_id)
);

CREATE TABLE Tag_Lie_Depense (
    fk_tag_id INTEGER NOT NULL,
    fk_depense_id INTEGER NOT NULL,
    PRIMARY KEY (fk_tag_id, fk_depense_id),
    FOREIGN KEY (fk_tag_id) REFERENCES Tag (pk_tag_id),
    FOREIGN KEY (fk_depense_id) REFERENCES Depense (pk_depense_id)
);

CREATE TABLE Utilisateur_Lie_Depense (
    fk_utilisateur_id INTEGER NOT NULL,
    fk_depense_id INTEGER NOT NULL,
    montant FLOAT NOT NULL,
    PRIMARY KEY (fk_utilisateur_id, fk_depense_id),
    FOREIGN KEY (fk_utilisateur_id) REFERENCES Utilisateur (pk_utilisateur_id),
    FOREIGN KEY (fk_depense_id) REFERENCES Depense (pk_depense_id)
);

CREATE TABLE Suspension (
    pk_suspension_id SERIAL PRIMARY KEY,
    fk_utilisateur_id INTEGER NOT NULL,
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_utilisateur VARCHAR(300) DEFAULT NULL,
    message_admin VARCHAR(300) DEFAULT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE DEFAULT NULL,
    FOREIGN KEY (fk_utilisateur_id) REFERENCES Utilisateur (pk_utilisateur_id)
);