export class Utilisateur {
    pk_utilisateur_id: number;
    nom: string;
    prenom: string;
    genre: string;
    email: string;
    mot_de_passe: string;
    cree_le: Date;
    valide_le: Date | null;
    desactive_le: Date | null;
    stripe_customer_id: string;

    public constructor (pk_utilisateur_id: number, nom: string, prenom: string, genre: string, email: string, mot_de_passe: string, cree_le: Date, valide_le: Date | null, desactive_le: Date | null, stripe_customer_id: string) {
        this.pk_utilisateur_id = pk_utilisateur_id;
        this.nom = nom;
        this.prenom = prenom;
        this.genre = genre;
        this.email = email;
        this.mot_de_passe = mot_de_passe;
        this.cree_le = cree_le;
        this.valide_le = valide_le;
        this.desactive_le = desactive_le;
        this.stripe_customer_id = stripe_customer_id;
    }

    public static from_JSON (json: string): Utilisateur {
        const json_object: any = JSON.parse(json);
        
        return new Utilisateur(
            json_object['pk_utilisateur_id'],
            json_object['nom'],
            json_object['prenom'],
            json_object['genre'],
            json_object['email'],
            json_object['mot_de_passe'],
            new Date(json_object['cree_le']),
            json_object['valide_le'] ? new Date(json_object['valide_le']) : null,
            json_object['desactive_le'] ? new Date(json_object['desactive_le']) : null,
            json_object['stripe_customer_id']
        );
    }
}