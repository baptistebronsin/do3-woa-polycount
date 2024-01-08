export class Tag {
    pk_tag_id: number;
    titre: string;
    couleur: string;
    icon: string;

    constructor(pk_tag_id: number, titre: string, couleur: string, icon: string) {
        this.pk_tag_id = pk_tag_id;
        this.titre = titre;
        this.couleur = couleur;
        this.icon = icon;
    }

    public static from_JSON(json: any): Tag {
        return new Tag(
            json['pk_tag_id'],
            json['titre'],
            json['couleur'],
            json['icon']
        );
    }
}