import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { useParams } from "react-router-dom";
import { Groupe } from "../../../models/groupe.model";
import { useEffect, useState } from "react";
import { ParticipantGroupe } from "../../../models/participant_groupe.model";
import LoaderCenter from "../../../components/loader/loader_center.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { Utilisateur } from "../../../models/utilisateur.model";
import InformationDepense from "../../../components/groupe/information_depense.component";
import InformationParticipant from "../../../components/groupe/information_participant.component";
import ReglageGroupe from "../../../components/groupe/reglage_groupe.component";

export interface NomParticipant {
  pk_participant_id: number;
  nom: string | null;
}

function InformationsGroupe() {
  const { groupe_id } = useParams<{ groupe_id: string }>();

  const authentification: AuthContextType | null = useAuth();
  const navigate: NavigateFunction = useNavigate();

  const [groupe, set_groupe] = useState<Groupe | null>(null);
  const [participants_groupe, set_participants_groupe] = useState<ParticipantGroupe[]>([]);
  const [utilisateurs, set_utilisateurs] = useState<Utilisateur[]>([]);

  const [nom_participants, set_nom_participants] = useState<NomParticipant[]>([]);
  const [participant_actuel, set_participant_actuel] = useState<ParticipantGroupe | null>(null);

  const [chargement_groupe, set_chargement_groupe] = useState<boolean>(true);
  
  const [section_selectionnee, set_section_selectionnee] = useState<number>(0);

  useEffect(() => {
    recuperer_toutes_depenses_api();
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

  const recuperer_toutes_depenses_api = async (): Promise<void> => {
    set_chargement_groupe(true);

    const groupe_api: Groupe | null = await recuperer_groupe_api();

    set_chargement_groupe(false);

    if (groupe_api === null) {
      return;
    }

    set_groupe(groupe_api);

    const participant_groupe_api: ParticipantGroupe[] = await recuperer_participants_api();
    const utilisateurs_api: Utilisateur[] = await recuperer_utilisateurs_api();
    const nom_participants_fun: NomParticipant[] = calculer_nom_participant();

    set_participants_groupe(participant_groupe_api);
    set_utilisateurs(utilisateurs_api);
    set_nom_participants(nom_participants_fun);
  }

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

  return (
    <>
      {chargement_groupe ? (
        <LoaderCenter message="Récupération des informations" />
      ) : (
        <>
          {
          groupe === null || participant_actuel === null ? (
            <div className="centre-centre">
              <div className="rectangle-blanc-ombre largeur600 auto-height">
                <p>Vous n'êtes pas autorisé à accéder à ce groupe partagé.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="centre">
                <div style={{ display: 'flex', gap: '40px' }}>
                    <button className={"lien-block" + (section_selectionnee === 0 ? " underline" : "")} onClick={() => set_section_selectionnee(0)}>dépenses</button>
                    <button className={"lien-block" + (section_selectionnee === 1 ? " underline" : "")} onClick={() => set_section_selectionnee(1)}>participants</button>
                    <button className={"lien-block" + (section_selectionnee === 2 ? " underline" : "")} onClick={() => set_section_selectionnee(2)}>réglages</button>
                </div>
              </div>
              {
                section_selectionnee === 0 ?
                <InformationDepense groupe={ groupe } participant_actuel={ participant_actuel } nom_participants={ nom_participants } /> : 
                section_selectionnee === 1 ?
                <InformationParticipant groupe={ groupe } participants={ participants_groupe } utilisateurs={ utilisateurs }  nom_participants={ nom_participants } participant_actuel={ participant_actuel } ajouter_participant={ (p: ParticipantGroupe) => set_participants_groupe([...participants_groupe, p]) } ajouter_utilisateur={ (u: Utilisateur) => set_utilisateurs([...utilisateurs, u]) } set_participants={ set_participants_groupe } /> :
                <ReglageGroupe />
              }
            </div>
          )}
        </>
      )}
    </>
  );
}

export default InformationsGroupe;
