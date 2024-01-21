import { useEffect, useState } from "react";
import LoaderCenter from "../loader/loader_center.component";
import DetailDepense from "./detail_depense.component";
import GraphiqueDepense from "./graphique_depense.component";
import ListeDepenses from "./liste_depense.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { Depense } from "../../models/depense.model";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Tag } from "../../models/tag.model";
import { toast } from "sonner";
import { Groupe } from "../../models/groupe.model";
import CreationDepense from "./creation_depense.component";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";

function InformationDepense ({ groupe, participant_actuel, nom_participants }: { groupe: Groupe, participant_actuel: ParticipantGroupe | null, nom_participants: NomParticipant[] }) {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [chargement_depenses, set_chargement_depenses] = useState<boolean>(true);

    const [ajoute_depense, set_ajoute_depense] = useState<boolean>(false);

    const [total_depense, set_total_depense] = useState<number>(0);

    const [depenses, set_depenses] = useState<Depense[]>([]);
    const [tags, set_tags] = useState<Tag[]>([]);
    const [attribution_depenses, set_attribution_depenses] = useState<AffiliationDepense[]>([]);
    const [attribution_tags, set_attribution_tags] = useState<{ fk_depense_id: number; fk_tag_id: number }[]>([]);
    const [depense_selectionnee, set_depense_selectionnee] = useState<number | undefined>(undefined);

    useEffect(() => {
        set_chargement_depenses(true);

        const reteneur_depenses = recuperer_depenses_api();
        const reteneur_affiliations = recuperer_affiliations_api();
        const reteneur_tags = recuperer_tous_tags_api();
        const reteneur_tags_depenses = recuperer_tags_depenses_api();
        // recuperer_donnees_api();

        Promise.all([
            reteneur_depenses,
            reteneur_affiliations,
            reteneur_tags,
            reteneur_tags_depenses,
        ]).then(
            ([
            depenses_api,
            affiliations_api,
            tags_api,
            depenses_tags_api,
            ]) => {
            set_depenses(depenses_api);
            set_attribution_depenses(affiliations_api);
            set_tags(tags_api);
            set_attribution_tags(depenses_tags_api);
            }
        );

        set_chargement_depenses(false);
    }, []);

    useEffect(() => {
        set_total_depense(
          depenses.reduce(
            (somme: number, depense: Depense) => (somme += depense.montant),
            0
          )
        );
      }, [depenses]);

    const recuperer_depenses_api = async (): Promise<Depense[]> => {
        const reponse: AxiosResponse | AxiosError | null = await requete_api(
            "GET",
            "/depense/" + groupe.pk_groupe_id,
            null,
            authentification,
            navigate,
            true
        );

        if (!reponse || !("data" in reponse) || !("data" in reponse.data))
            return [];

        return reponse.data.data.map((depense: any) => Depense.from_JSON(depense));
    };

    const recuperer_affiliations_api = async (): Promise<AffiliationDepense[]> => {
        const reponse: AxiosResponse | AxiosError | null = await requete_api(
            "GET",
            "/depense/affiliations/" + groupe.pk_groupe_id,
            null,
            authentification,
            navigate,
            true
        );

        if (!reponse || !("data" in reponse) || !("data" in reponse.data))
            return [];

        return reponse.data.data.map((affiliation: any) =>
            AffiliationDepense.from_JSON(affiliation)
        );
    };

    const recuperer_tous_tags_api = async (): Promise<Tag[]> => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
        "GET",
        "/depense/tags",
        null,
        authentification,
        navigate,
        true
    );

    if (!reponse || !("data" in reponse) || !("data" in reponse.data))
        return [];

    return reponse.data.data.map((tag: any) => Tag.from_JSON(tag));
    }

    const recuperer_tags_depenses_api = async (): Promise<{ fk_depense_id: number; fk_tag_id: number }[]> => {
        const reponse: AxiosResponse | AxiosError | null = await requete_api(
            "GET",
            "/depense/tags/" + groupe.pk_groupe_id,
            null,
            authentification,
            navigate,
            true
        );

        if (!reponse || !("data" in reponse) || !("data" in reponse.data))
            return [];

        return reponse.data.data.map((tag: any) => ({ fk_depense_id: tag.fk_depense_id, fk_tag_id: tag.fk_tag_id }));
    };

    const ajouter_depense = (depense: Depense, affiliations: AffiliationDepense[]): void => {
        set_depenses([...depenses, depense]);
        set_attribution_depenses([...attribution_depenses, ...affiliations]);
        set_total_depense(total_depense + depense.montant);
      };
    
    const supprimer_depense = (depense: Depense): void => {
        set_depenses(depenses.filter((d: Depense) => d.pk_depense_id !== depense.pk_depense_id));
        set_attribution_depenses(attribution_depenses.filter((a: AffiliationDepense) => a.fk_depense_id !== depense.pk_depense_id));
        set_total_depense(total_depense - depense.montant);
        set_attribution_tags(attribution_tags.filter((t) => t.fk_depense_id !== depense.pk_depense_id));
        set_depense_selectionnee(undefined);

        toast.success("La dépense a bien été supprimée");
    }

    return (
        <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px" }}>
            <div style={{ width: "30%", display: "flex", justifyContent: "space-between" }}>
                <h1 className="inline-block">{groupe.nom}</h1>
                <p className="inline-block">
                {chargement_depenses ? (
                    <></>
                ) : (
                    <strong>{total_depense.toFixed(2)} €</strong>
                )}
                </p>
            </div>
            <div>
              {
              ajoute_depense ? (
                participant_actuel ? (
                  <CreationDepense
                    groupe_id={groupe.pk_groupe_id}
                    annulation={() => set_ajoute_depense(false)}
                    ajouter_depense={ ajouter_depense }
                    nom_participants={nom_participants}
                    participant_actuel={participant_actuel}
                    tags={tags}
                    ajouter_affiliations={ (aff: AffiliationDepense[]) => set_attribution_depenses([...attribution_depenses, ...aff]) }
                    ajouter_tags={ (t: { fk_depense_id: number; fk_tag_id: number }[]) => set_attribution_tags([...attribution_tags, ...t]) }
                  />
                ) : <p style={{ textAlign: 'center', color: 'red' }}>Service de création suspendu</p>
              ) : (
                <></>
              )}
            </div>
            {
                depense_selectionnee !== undefined ?
                <div style={{ height: '47px' }}></div> :
                <button
                className="full-button"
                onClick={ authentification?.authentification.utilisateur?.desactive_le !== null ? () => toast.warning("Votre compte est en procédure de désactivation, vous ne pouvez plus créer de dépense.") : (participant_actuel !== null && participant_actuel.peut_creer_depense ? () => set_ajoute_depense(true) : () => toast.warning("Vous n'avez pas les permissions pour créer une dépense")) }
                >
                Ajouter une dépense
                </button>
            }
            </div>
        {
              chargement_depenses ? (
                <LoaderCenter message="Récupération des dépenses" />
              ) : (
                <div
                  style={{ display: "grid", gridTemplateColumns: "30% auto" }}
                >
                  {
                    depenses.length === 0 ? (
                      <p className="centre-centre">Aucune dépense n'a été enregistrée.</p>
                    ) : (
                      <ListeDepenses
                      depenses={depenses}
                      nom_participants={nom_participants}
                      affiliations={attribution_depenses}
                      depense_selectionnee={depense_selectionnee}
                      set_depense_selectionnee={set_depense_selectionnee}
                    />
                    )
                  }
                  <div style={{ margin: "0 20px" }}>
                    {
                      depenses.find((d: Depense) => d.pk_depense_id === depense_selectionnee) ?
                      <DetailDepense depense={ depenses.find((d: Depense) => d.pk_depense_id === depense_selectionnee)! } nom_participants={ nom_participants } affiliations={ attribution_depenses } tags={ tags } attribution_tags={ attribution_tags.filter((tag) => tag.fk_depense_id === depense_selectionnee) } suppression={ supprimer_depense } participant_actuel={ participant_actuel } modifier_depense={ (d: Depense) => set_depenses([...depenses.filter((dep: Depense) => dep.pk_depense_id !== d.pk_depense_id), d]) } /> :
                        nom_participants.length > 0 ? (
                          <GraphiqueDepense
                            nom_participants={nom_participants}
                            depenses={depenses}
                            affiliations={attribution_depenses}
                          />
                        ) : (
                          <LoaderCenter message="Chargement du nom des participants" />
                        )
                    }
                  </div>
                </div>
              )}
        </>
    );
}

export default InformationDepense;