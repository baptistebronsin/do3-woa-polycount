import { SyntheticEvent, useEffect, useState } from "react";
import LoaderSpinner from "../loader/loader_spinner.component";
import TextInput from "../input/text_input.component";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import Selecteur from "../input/selecteur.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Depense } from "../../models/depense.model";
import { Tag } from "../../models/tag.model";
import PastilleTag from "../tag/pastille_tag.component";

function CreationDepense({ groupe_id, annulation, ajouter_depense, nom_participants, participant_actuel, tags, ajouter_affiliations, ajouter_tags }: { groupe_id: number, annulation: Function, ajouter_depense: Function, nom_participants: NomParticipant[], participant_actuel: ParticipantGroupe, tags: Tag[], ajouter_affiliations: Function, ajouter_tags: Function }) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [nom_depense, set_nom_depense] = useState<string>("");
    const [montant, set_montant] = useState<number>(0);
    const [url_image, set_url_image] = useState<string>("");
    const [participant_id_payeur, set_participant_id_payeur] = useState<string>(participant_actuel.pk_participant_groupe_id+"");
    const [participants, set_participants] = useState<NomParticipant[]>([]);
    const [tags_depense, set_tags_depense] = useState<Tag[]>([]);

    const [participants_selecteur, set_participants_selecteur] = useState<NomParticipant[]>([{ pk_participant_id: -1, nom: "Veuillez sectionner un participant" }, ...nom_participants]);
    const [tags_selecteur, set_tags_selecteur] = useState<Tag[]>([{ pk_tag_id: -1, titre: "Veuillez sectionner un tag", couleur: "", icon: "" }, ...tags]);
    const [montant_partage_null, set_montant_partage_null] = useState<number>(0);
    const [montants_partages, set_montants_partages] = useState<{ [key: string]: number }>({});

    const [chargement, set_chargement] = useState<boolean>(false);
    const [message_erreur, set_message_erreur] = useState<string | null>(null);

    // Affiche les options du sélecteur de participants
    useEffect(() => {
        set_participants_selecteur([{ pk_participant_id: -1, nom: "Veuillez sectionner un participant" }, ...nom_participants]);
    }, [nom_participants]);

    // On recalcule le montant partagé si le montant global ou un montant personnalisé est modifié
    useEffect(() => {
        calculer_montant_partage(montants_partages);
    }, [montant, montants_partages]);

    // On recalcule le montant partagé si un participant est ajouté ou supprimé
    useEffect(() => {
        let struct: any = {...montants_partages};
        Object.keys(montants_partages).forEach((key: string) => {
            if (!participants.find((p: NomParticipant) => p.pk_participant_id === parseInt(key)) && participant_actuel.pk_participant_groupe_id !== parseInt(key)) {
                delete struct[key];
            }
        });

        set_montants_partages(struct);

        calculer_montant_partage(struct);
    }, [participants]);

    // Efface le message d'erreur si le nom de la dépense ou le montant est modifié
    useEffect(() => {
        set_message_erreur(null);
    }, [nom_depense, montant]);

    const calculer_montant_partage = (montants: { [key: string]: number }) => {
        if (montant > 0) {
            const montant_partage: number = (montant - Object.keys(montants).reduce((sum: number, key: string) => sum + montants[key], 0)) / (participants.length - Object.keys(montants).filter((key: string) => montants[key] >= 0).length);
            const montant_partage_arrondi: number = Math.round(montant_partage * 100) / 100;

            set_montant_partage_null(montant_partage_arrondi);
        } else if (montant === 0) {
            set_montant_partage_null(0);
        }
    }

    const ajouter_tag = (id: string) => {
        const tag: Tag | undefined = tags_selecteur.filter((t: Tag) => t.pk_tag_id === parseInt(id))[0];

        if (tag) {
            set_tags_depense([...tags_depense, tag]);
            const nouvelle_liste: Tag[] = [...tags_selecteur].filter((t: Tag) => t.pk_tag_id !== tag.pk_tag_id);
            set_tags_selecteur(nouvelle_liste);
        }
    }

    const supprimer_tag = (id: number) => {
        const tag: Tag | undefined = tags_depense.find((t: Tag) => t.pk_tag_id === id);

        if (tag) {
            const nouvelles_liste_tags: Tag[] = [...tags_depense].filter((t: Tag) => t.pk_tag_id !== tag.pk_tag_id);
            set_tags_depense(nouvelles_liste_tags);
            const nouvelle_liste_selecteur: Tag[] = [...tags_selecteur, tag];
            set_tags_selecteur(nouvelle_liste_selecteur);
        }
    }

    const ajouter_participant_depuis_selecteur = (id: string) => {
        const participant: NomParticipant | undefined = nom_participants.filter((p: NomParticipant) => p.pk_participant_id === parseInt(id))[0];
        if (participant) {
            set_participants([...participants, participant]);
            const nouvelle_liste: NomParticipant[] = [...participants_selecteur].filter((p: NomParticipant) => p.pk_participant_id !== participant.pk_participant_id);
            set_participants_selecteur(nouvelle_liste);
        }
    };

    const supprimer_participant_depuis_selecteur = (id: number) => {
        const participant: NomParticipant | undefined = nom_participants.find((p: NomParticipant) => p.pk_participant_id === id);

        if (participant) {
            const nouvelles_liste_participants: NomParticipant[] = [...participants].filter((p: NomParticipant) => p.pk_participant_id !== participant.pk_participant_id);
            set_participants(nouvelles_liste_participants);
            const nouvelle_liste_selecteur: NomParticipant[] = [...participants_selecteur, participant];
            set_participants_selecteur(nouvelle_liste_selecteur);
        }
    }

    const creer_depense_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom_depense === "") {
            set_message_erreur("Veuillez saisir un nom de dépense.");
            return null;
        }

        if (nom_depense.length > 50) {
            set_message_erreur("Veuillez saisir un nom de dépense de moins de 50 caractères.");
            return null;
        }

        if (montant === 0) {
            set_message_erreur("Veuillez saisir un montant de dépense.");
            return null;
        }

        if (montant < 0) {
            set_message_erreur("Veuillez saisir un montant positif.");
            return null;
        }

        Object.keys(montants_partages).forEach((key: string) => {
            if (montants_partages[key] < 0) {
                set_message_erreur("Veuillez saisir un montant positif pour chaque participant.");
                return null;
            }
        });

        if (Object.keys(montants_partages).reduce((sum: number, key: string) => sum + montants_partages[key], 0) > montant) {
            set_message_erreur("La somme des montants des participants est supérieur au montant de la dépense.");
            return null;
        }

        if (Object.keys(montants_partages).reduce((sum: number, key: string) => sum + montants_partages[key], 0) < montant && Object.keys(montants_partages).length === participants.length + 1) {
            set_message_erreur("La somme des montants des participants est inférieur au montant de la dépense.");
            return null;
        }

        const participants_affiliations = [...participants.map(
            (p: NomParticipant) => ({ fk_participant_groupe_id: p.pk_participant_id, montant: montants_partages[p.pk_participant_id+""] ?? null })
        )];

        const tags_api: number[] = tags_depense.map((t: Tag) => t.pk_tag_id);

        const api_body: any = {
            groupe_id_param: groupe_id,
            titre: nom_depense,
            montant: Number(montant),
            url_image: url_image,
            participant_payeur_id: Number(participant_id_payeur),
            participants: participants_affiliations,
            tags: tags_api
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/depense/", api_body, authentification, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("La dépense a bien été créée.");

            ajouter_depense(Depense.from_JSON(reponse.data.data), participants_affiliations.map((p: any) => ({ fk_participant_groupe_id: p.fk_participant_groupe_id, fk_depense_id: reponse.data.data.pk_depense_id, montant: p.montant })));
            ajouter_affiliations(participants_affiliations.map((p: any) => ({ fk_participant_groupe_id: p.fk_participant_groupe_id, fk_depense_id: reponse.data.data.pk_depense_id, montant: p.montant })));
            ajouter_tags(tags_depense.map((t: Tag) => ({ fk_depense_id: reponse.data.data.pk_depense_id, fk_tag_id: t.pk_tag_id })));
            annulation(false);
        }
    }

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(128, 128, 128, 0.8)', zIndex: 9 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: message_erreur ? '540px' : '510px', zIndex: 10, padding: "10px 20px", borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Création d'une dépense</h1>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <p className="lien" onClick={() => annulation(false)}>Annuler</p>
                        {
                            chargement ?
                            <button className="full-button centre-centre" onClick={() => {}}>
                                <LoaderSpinner />
                                <p className="inline-block">&nbsp;Création en cours</p>
                            </button> :
                            <button className="full-button" onClick={creer_depense_api}>Créer la dépense</button>
                        }
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '30px', margin: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="nom-depense" className="inline-block">Nom de la dépense :&nbsp;</label>
                            <TextInput id="nom-depense" label="Nom de la dépense" value={nom_depense} longueur_max={50} onChange={(e: any) => set_nom_depense(e.target.value)} style={{ width: '340px' }} />
                        </div>
                        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="montant-depense" className="inline-block">Montant :&nbsp;</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TextInput id="montant-depense" type="number" label="Montant de la dépense" value={montant} onChange={(e: any) => set_montant(e.target.value)} style={{ display: 'inline-block' }} />
                                <p>&nbsp;€</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label>URL de l'image :&nbsp;</label>
                            <TextInput type="url" label="URL de l'image" value={url_image} onChange={ (e: any) => set_url_image(e.target.value) } placeholder="https://..." style={{ width: '340px' }} />
                        </div>
                        <div style={{ height: '20px' }}></div>
                        <hr />
                        <div style={{ height: '20px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label>Payé par :&nbsp;</label>
                            <Selecteur label="Payeur" options={ nom_participants.map((p: NomParticipant) => ({ value: p.pk_participant_id + "", label: p.nom ?? "participant n°" + p.pk_participant_id })) } valeur_defaut={ participant_id_payeur + "" } changement={ set_participant_id_payeur } />
                        </div>
                        <div style={{ height: '20px' }}></div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label>Tags :&nbsp;</label>
                                <Selecteur label="Tags" options={ tags_selecteur.length > 1 ? tags_selecteur.map((t: Tag) => ({ value: t.pk_tag_id + "", label: t.titre })) : [{ value: "0", label: "Aucun autre tag disponible" }] } valeur_defaut={ tags_selecteur[0].pk_tag_id + "" } changement={ ajouter_tag } />
                            </div>
                            <div style={{ height: '10px' }}></div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                            {
                                tags_depense.length === 0 ?
                                <p>Aucun tag sélectionné</p> :
                                tags_depense.map((t: Tag) => <div className="hover" onClick={ () => supprimer_tag(t.pk_tag_id) }><PastilleTag tag={ t } /></div>)
                            }
                            </div>
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #8E8E8E', maxHeight: '340px' }}></div>
                    <div>
                        <Selecteur label="Participants" options={ participants_selecteur.length > 1 ? participants_selecteur.map((p: NomParticipant) => ({ value: p.pk_participant_id + "", label: p.nom ?? "participant n°" + p.pk_participant_id })) : ( participants.length > 1 ? [{ value: "0", label: "Plus de participant disponible" }] : [{ value: "0", label: "Aucun participant" }]) } valeur_defaut={ participants_selecteur.length > 1 ? participants_selecteur.map((p: NomParticipant) => p.pk_participant_id + "")[0] : "0" } changement={ ajouter_participant_depuis_selecteur } />
                        <div>
                            <h3 style={{ margin: '10px 0' }}>Participants ajoutés</h3>
                            <hr style={{ marginTop: '10px 0' }} />
                            <div style={{ overflow: 'auto', height: '270px', paddingRight: '10px' }}>
                                {
                                    participants.length === 0 ? (
                                    <>
                                        <p className="centre-centre">Aucun participant selectionné</p>
                                    </>
                                    ) : (
                                        <>
                                        {
                                            participants.map((p: NomParticipant) => (
                                                <div key={p.pk_participant_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', margin: '30px 0' }}>
                                                    <p>{ p.nom ?? "participant n°" + p.pk_participant_id }</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                            <TextInput type="number" label="montant personnalisé"  placeholder={montant_partage_null} onChange={(e: any) => { const struct = {...montants_partages}; struct[p.pk_participant_id+""] = Number(e.target.value); set_montants_partages({ ...struct })}} />€
                                                        </div>
                                                        <FontAwesomeIcon icon={faTrashCan} style={{ color: 'red' }} onClick={() => supprimer_participant_depuis_selecteur(p.pk_participant_id)} className="hover" />
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    message_erreur ?
                    <p className="centre" style={{ color: 'red', marginTop: '10px' }}>
                        { message_erreur }
                    </p> : <></>
                }
            </div>
        </div>
    );
}

export default CreationDepense;