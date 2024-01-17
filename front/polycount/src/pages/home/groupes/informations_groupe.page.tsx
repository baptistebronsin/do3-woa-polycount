import { NavigateFunction, useNavigate } from "react-router-dom";
import {
  AuthContextType,
  useAuth,
} from "../../../providers/authentification.provider";

import { useParams } from "react-router-dom";
import { Groupe } from "../../../models/groupe.model";
import { useEffect, useState } from "react";
import { ParticipantGroupe } from "../../../models/participant_groupe.model";
import { Depense } from "../../../models/depense.model";
import ListeDepenses from "../../../components/groupe/liste_depense.component";
import LoaderCenter from "../../../components/loader/loader_center.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { Tag } from "../../../models/tag.model";
import { Utilisateur } from "../../../models/utilisateur.model";
import { AffiliationDepense } from "../../../models/affiliation_depense.model";
import GraphiqueDepense from "../../../components/groupe/graphique_depense.component";
import CreationDepense from "../../../components/groupe/creation_depense.component";
import DetailDepense from "../../../components/groupe/detail_depense.component";
import { toast } from "sonner";

export interface NomParticipant {
  pk_participant_id: number;
  nom: string | null;
}

function InformationsGroupe() {
  const { groupe_id } = useParams<{ groupe_id: string }>();

  const [total_depense, set_total_depense] = useState<number>(0);

  const authentification: AuthContextType | null = useAuth();
  const navigate: NavigateFunction = useNavigate();

  const [groupe, set_groupe] = useState<Groupe | null>(null);
  const [participants_groupe, set_participants_groupe] = useState<
    ParticipantGroupe[]
  >([]);
  const [utilisateurs, set_utilisateurs] = useState<Utilisateur[]>([]);
  const [depenses, set_depenses] = useState<Depense[]>([]);
  const [tags, set_tags] = useState<Tag[]>([]);
  const [attribution_depenses, set_attribution_depenses] = useState<
    AffiliationDepense[]
  >([]);
  const [attribution_tags, set_attribution_tags] = useState<
    { fk_depense_id: number; fk_tag_id: number }[]
  >([]);

  const [nom_participants, set_nom_participants] = useState<NomParticipant[]>(
    []
  );
  const [participant_actuel, set_participant_actuel] =
    useState<ParticipantGroupe | null>(null);

  const [chargement_groupe, set_chargement_groupe] = useState<boolean>(true);
  const [chargement_depenses, set_chargement_depenses] =
    useState<boolean>(true);

  const [ajoute_depense, set_ajoute_depense] = useState<boolean>(false);

  const [depense_selectionnee, set_depense_selectionnee] = useState<number | undefined>(undefined);

  useEffect(() => {
    set_chargement_groupe(true);

    recuperer_groupe_api().then((groupe_api: Groupe | null) => {
      if (groupe_api === null) {
        set_chargement_groupe(false);
        return;
      }

      set_groupe(groupe_api);
      set_chargement_groupe(false);
      set_chargement_depenses(true);

      const reteneur_depenses = recuperer_depenses_api();
      const reteneur_utilisateurs = recuperer_utilisateurs_api();
      const reteneur_affiliations = recuperer_affiliations_api();
      const reteneur_tags = recuperer_tous_tags_api();
      const reteneur_tags_depenses = recuperer_tags_depenses_api();
      const reteneur_participants = recuperer_participants_api();
      // recuperer_donnees_api();

      Promise.all([
        reteneur_depenses,
        reteneur_utilisateurs,
        reteneur_affiliations,
        reteneur_tags,
        reteneur_tags_depenses,
        reteneur_participants,
      ]).then(
        ([
          depenses_api,
          utilisateurs_api,
          affiliations_api,
          tags_api,
          depenses_tags_api,
          participants_api,
        ]) => {
          set_depenses(depenses_api);
          set_utilisateurs(utilisateurs_api);
          set_attribution_depenses(affiliations_api);
          set_tags(tags_api);
          set_attribution_tags(depenses_tags_api);
          set_participants_groupe(participants_api);
        }
      );

      set_chargement_depenses(false);
    });
  }, []);

  useEffect(() => {
    if (participants_groupe.length > 0) {
      set_nom_participants(calculer_nom_participant());
      set_participant_actuel(
        participants_groupe.find(
          (participant: ParticipantGroupe) =>
            participant.fk_utilisateur_id ===
            authentification?.authentification.utilisateur?.pk_utilisateur_id
        ) ?? null
      );
    }
  }, [utilisateurs, participants_groupe]);

  useEffect(() => {
    set_total_depense(
      depenses.reduce(
        (somme: number, depense: Depense) => (somme += depense.montant),
        0
      )
    );
  }, [depenses]);

  const recuperer_groupe_api = async (): Promise<Groupe | null> => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/groupe/" + groupe_id,
      null,
      authentification,
      navigate,
      false
    );

    if (reponse && "data" in reponse)
      return Groupe.from_JSON(reponse.data.data);
    return null;
  };

  const recuperer_participants_api = async (): Promise<ParticipantGroupe[]> => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/groupe/" + groupe_id + "/participants",
      null,
      authentification,
      navigate,
      false
    );

    if (!reponse || !("data" in reponse) || !("data" in reponse.data))
      return [];

    return reponse.data.data.map((participant: any) =>
      ParticipantGroupe.from_JSON(participant)
    );
  };

  const recuperer_depenses_api = async (): Promise<Depense[]> => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/depense/" + groupe_id,
      null,
      authentification,
      navigate,
      true
    );

    if (!reponse || !("data" in reponse) || !("data" in reponse.data))
      return [];

    return reponse.data.data.map((depense: any) => Depense.from_JSON(depense));
  };

  const recuperer_utilisateurs_api = async (): Promise<Utilisateur[]> => {
    const response: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/depense/utilisateurs/" + groupe_id,
      null,
      authentification,
      navigate,
      true
    );

    if (!response || !("data" in response) || !("data" in response.data)) {
      return [];
    }

    return response.data.data.map((utilisateur: any) =>
      Utilisateur.from_JSON(utilisateur)
    );
  };

  const recuperer_affiliations_api = async (): Promise<
    AffiliationDepense[]
  > => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/depense/affiliations/" + groupe_id,
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

  const recuperer_tags_depenses_api = async (): Promise<
    { fk_depense_id: number; fk_tag_id: number }[]
  > => {
    const reponse: AxiosResponse | AxiosError | null = await requete_api(
      "GET",
      "/depense/tags/" + groupe_id,
      null,
      authentification,
      navigate,
      true
    );

    if (!reponse || !("data" in reponse) || !("data" in reponse.data))
      return [];

    return reponse.data.data.map((tag: any) => ({ fk_depense_id: tag.fk_depense_id, fk_tag_id: tag.fk_tag_id }));
  };

  const calculer_nom_participant = (): NomParticipant[] => {
    return participants_groupe.map((participant: ParticipantGroupe) => {
      const utilisateur: Utilisateur | undefined = utilisateurs.find(
        (utilisateur: Utilisateur) =>
          utilisateur.pk_utilisateur_id === participant.fk_utilisateur_id
      );

      if (utilisateur) {
        return {
          pk_participant_id: participant.pk_participant_groupe_id,
          nom: utilisateur.prenom + " " + utilisateur.nom[0] + ".",
        };
      }

      return {
        pk_participant_id: participant.pk_participant_groupe_id,
        nom: participant.nom,
      };
    });
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
      {chargement_groupe ? (
        <LoaderCenter message="Récupération des informations" />
      ) : (
        <>
          {groupe === null ? (
            <div className="centre-centre">
              <div className="rectangle-blanc-ombre largeur600 auto-height">
                <p>Vous n'êtes pas autorisé à accéder à ce groupe partagé.</p>
              </div>
            </div>
          ) : (
            <div>
              {ajoute_depense ? (
                participant_actuel ? (
                  <CreationDepense
                    groupe_id={groupe.pk_groupe_id}
                    annulation={() => set_ajoute_depense(false)}
                    ajouter_depense={ajouter_depense}
                    nom_participants={nom_participants}
                    participant_actuel={participant_actuel}
                  />
                ) : <p style={{ textAlign: 'center', color: 'red' }}>Service de création suspendu</p>
              ) : (
                <></>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "10px",
                }}
              >
                <div
                  style={{
                    width: "30%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h1 className="inline-block">{groupe.nom}</h1>
                  <p className="inline-block">
                    {chargement_depenses ? (
                      <></>
                    ) : (
                      <strong>{total_depense.toFixed(2)} €</strong>
                    )}
                  </p>
                </div>
                {
                  depense_selectionnee != undefined ?
                  <div style={{ height: '47px' }}></div> :
                  <button
                    className="full-button"
                    onClick={() => set_ajoute_depense(true)}
                  >
                    Ajouter une dépense
                  </button>
                }
              </div>
              {chargement_depenses ? (
                <LoaderCenter message="Récupération des dépenses" />
              ) : (
                <div
                  style={{ display: "grid", gridTemplateColumns: "30% auto" }}
                >
                  <ListeDepenses
                    depenses={depenses}
                    nom_participants={nom_participants}
                    affiliations={attribution_depenses}
                    depense_selectionnee={depense_selectionnee}
                    set_depense_selectionnee={set_depense_selectionnee}
                  />
                  <div style={{ margin: "0 20px" }}>
                    {
                      depenses.find((d: Depense) => d.pk_depense_id === depense_selectionnee) ?
                      <DetailDepense depense={ depenses.find((d: Depense) => d.pk_depense_id === depense_selectionnee)! } nom_participants={ nom_participants } affiliations={ attribution_depenses } tags={ tags } attribution_tags={ attribution_tags.filter((tag) => tag.fk_depense_id === depense_selectionnee) } suppression={ supprimer_depense } /> :
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
            </div>
          )}
        </>
      )}
    </>
  );
}

export default InformationsGroupe;
