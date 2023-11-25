export const statuts: {
    succes: {
        ok: number,
        cree: number,
        accepte: number,
        pas_de_contenu: number
    },
    erreur_client: {
        parametres_manquant: number,
        mauvaise_requete: number,
        pas_authentifie: number,
        paiement: number,
        contenu_pas_autorise: number,
        pas_trouve: number
    },
    erreur_serveur: {
        erreur_interne: number
    }
} = {
    succes: {
        ok: 200,
        cree: 201,
        accepte: 202,
        pas_de_contenu: 204
    },
    erreur_client: {
        parametres_manquant: 400,
        mauvaise_requete: 400,
        pas_authentifie: 401,
        paiement: 402,
        contenu_pas_autorise: 403,
        pas_trouve: 404
    },
    erreur_serveur: {
        erreur_interne: 500
    }
};