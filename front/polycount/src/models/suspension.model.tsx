export class Suspension {
    pk_suspension_id: number;
    message_utilisateur: string | null;
    date_debut: Date;
    date_fin: Date | null;

    public constructor (pk_suspension_id: number, message_utilisateur: string | null, date_debut: Date, date_fin: Date | null) {
        this.pk_suspension_id = pk_suspension_id;
        this.message_utilisateur = message_utilisateur;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
    }

    public static from_JSON (json: any): Suspension {
        return new Suspension(
            json['pk_suspension_id'],
            json['message_utilisateur'],
            new Date(json['date_debut']),
            json['date_fin'] ? new Date(json['date_fin']) : null
        );
    }
}