export class Token {
    pk_token_id: number;
    fk_utilisateur_id: number;
    token: string;
    type_verification: string;
    date_creation: Date;
    date_desactivation: Date;

    public constructor (pk_token_id: number, fk_utilisateur_id: number, token: string, type_verification: string, date_creation: Date, date_desactivation: Date) {
        this.pk_token_id = pk_token_id;
        this.fk_utilisateur_id = fk_utilisateur_id;
        this.token = token;
        this.type_verification = type_verification;
        this.date_creation = date_creation;
        this.date_desactivation = date_desactivation;
    }

    public static from_JSON (json: any): Token {
       return new Token(
            json['pk_token_id'],
            json['fk_utilisateur_id'],
            json['token'],
            json['type_verification'],
            new Date(json['date_creation']),
            new Date(json['date_desactivation'])
    );
    }
}