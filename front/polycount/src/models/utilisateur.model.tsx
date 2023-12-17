export class Utilisateur {
    pk_utilisateur_id: number;
    nom: string;
    prenom: string;
    genre: string | null;
    email: string;

    public constructor (pk_utilisateur_id: number, nom: string, prenom: string, genre: string, email: string) {
        this.pk_utilisateur_id = pk_utilisateur_id;
        this.nom = nom;
        this.prenom = prenom;
        this.genre = genre;
        this.email = email;
    }

    public static from_JSON (json: any): Utilisateur {
        return new Utilisateur(
            json['pk_utilisateur_id'],
            json['nom'],
            json['prenom'],
            json['genre'],
            json['email']
        );
    }
}