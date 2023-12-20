import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import TextAreaInput from "../input/text_area_input.component";
import TextInput from "../input/text_input.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function CreationGroupe ({ annulation }: { annulation: Function }) {
    const [, updateState] = useState({});
    const forceUpdate = useCallback(() => updateState({}), []);

    const [nom, set_nom] = useState<string>("");
    const [description, set_description] = useState<string>("");

    const [participants, set_participants] = useState<string[]>([]);
    const [information, set_information] = useState<boolean>(false);
    const [creation_participant, set_creation_participant] = useState<boolean>(false);

    const [nom_participant, set_nom_participant] = useState<string>("");

    const [message_erreur, set_message_erreur] = useState<string | null>(null);

    useEffect(() => {
        set_message_erreur(null);
    }, [nom, description, nom_participant]);

    const annuler_ajout_participant = (e: SyntheticEvent) => {
        e.preventDefault();

        set_creation_participant(false);
        set_nom_participant("");
    }

    const creer_participant = (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom_participant == "") {
            set_message_erreur("Veuillez remplir tous les champs de votre nouveau participant");
            return null;
        }

        if (nom_participant.length > 30) {
            set_message_erreur("Veuillez saisir un nom de moins de 30 caractères");
            return null;
        }

        const participants_fun: string[] = participants;
        participants_fun.push(nom_participant);
        set_participants(participants_fun);

        set_creation_participant(false);
        set_nom_participant("");

        return null;
    }

    const supprimer_participant = (index: number) => {

        if (index < 0 || index >= participants.length){
            set_message_erreur("COUCOU INDEX " + index);

            return null;
        }
        const participants_fun: string[] = [...participants];
        participants_fun.splice(index, 1);
        set_participants(participants_fun);
        return null;
    }

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(10, 10, 10, 0.3)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: '500px', zIndex: 10, padding: "10px 20px", borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Création d'un groupe de partage</h1>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <p className="lien" onClick={() => annulation(false)}>Annuler</p>
                        <button className="full-button">Créer le groupe</button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '30px', margin: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="nom-groupe" className="inline-block">Nom du groupe :&nbsp;</label>
                            <TextInput id="nom-groupe" label="Nom du groupe" longueur_max={50} style={{ width: '340px' }} />
                        </div>
                        <div style={{ margin: '20px 0' }}>
                            <TextAreaInput label="Description du groupe" longueur_max={200} placeholder="Optionnel" />
                        </div>
                        <hr />
                        <div>
                            <div style={{ height: '10px' }}></div>
                            <p>Ajout d'une image</p>
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #8E8E8E' }}></div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p>Participants fictifs</p>
                            {
                                information ?
                                <p className="lien" onClick={() => set_information(false)}>retourner à la page précédente</p> : <p className="lien" onClick={() => set_information(true)}>infos ?</p>
                            }
                        </div>
                        {
                            information ?
                            <div>
                                <div style={{ height: '10px' }}></div>
                                <hr />
                                <div style={{ height: '10px' }}></div>
                                <p>Vous pouvez d'orès et déjà créer des participants au groupe partagé. Mais ceux-ci seront considéré comme <strong>fictif</strong> le temps qu'un utilisateur réel prenne sa place.</p>
                            </div> :
                            <div style={{ height: '370px', display: 'grid', gridTemplateRows: 'auto 50px', gap: '10px' }}>
                                <div style={{ overflow: 'auto' }}>
                                    {
                                        creation_participant ?
                                        <p style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: '10px', alignItems: "center", background: "#4B7BB4", borderRadius: '10px', padding: '14px 30px', margin: '10px ' }}>
                                            <TextInput label="Nom" type="text" placeholder="Le nom de votre participant fictif" value={nom_participant} onChange={(e: any) => set_nom_participant(e.target.value)} required />
                                            <div className="centre">
                                                <FontAwesomeIcon icon={faPlus} color="white" size="1x" className="hover" onClick={creer_participant} />
                                            </div>
                                        </p> :
                                        <></>
                                    }
                                    {
                                        participants.map((participant: string, index: number) => (
                                            <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "#4B7BB4", borderRadius: '10px', padding: '6px 10px', color: 'white', margin: '10px ' }}><span>{ participant }</span><FontAwesomeIcon icon={faTrashCan} className="hover" onClick={() => supprimer_participant(index)} /></p>
                                        ))
                                    }
                                    {
                                        participants.length == 0 && !creation_participant ?
                                        <div className="centre-centre"><p>Aucun participant créé</p></div> :
                                        <></>
                                    }
                                </div>
                                <div className="centre">
                                    {
                                        creation_participant ?
                                        <p className="light-button inline-block" style={{ border: '1px dashed', background: "#EEEEEE" }} onClick={annuler_ajout_participant}>Annuler l'ajout</p> :
                                        <p className="light-button inline-block" style={{ border: '1px dashed' }}  onClick={() => set_creation_participant(true)}>Ajouter un participant</p>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
                {
                    message_erreur ?
                    <p style={{ color: 'red', marginTop: '10px' }}>
                        { message_erreur }
                    </p> : <></>
                }
            </div>
        </div>
    );
}

export default CreationGroupe;