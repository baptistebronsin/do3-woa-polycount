import { SyntheticEvent, useState } from "react";
import TextAreaInput from "../input/text_area_input.component";
import TextInput from "../input/text_input.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface Participant {
    id: number,
    nom: string,
    prenom: string
}

function CreationGroupe ({ annulation }: { annulation: Function }) {

    const [nom, set_nom] = useState<string>("");
    const [description, set_description] = useState<string>("");

    const [participants, set_participants] = useState<Participant[]>([{id:1,nom:"nom1",prenom:"prenom1"},{id:2,nom:"nom2",prenom:"prenom2"},{id:3,nom:"nom3",prenom:"prenom3"},{id:4,nom:"nom4",prenom:"prenom4"},{id:5,nom:"nom5",prenom:"prenom5"},{id:6,nom:"nom6",prenom:"prenom6"}]);
    const [information, set_information] = useState<boolean>(false);
    const [creation_participant, set_creation_participant] = useState<boolean>(false);

    const [nom_participant, set_nom_participant] = useState<string>("");
    const [prenom_participant, set_prenom_participant] = useState<string>("");

    const annuler_ajout_participant = (e: SyntheticEvent) => {
        e.preventDefault();

        set_creation_participant(false);
        set_prenom_participant("");
        set_nom_participant("");
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
                            <TextAreaInput label="Description du groupe" longueur_max={200} />
                        </div>
                        <hr />
                        <div>

                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #8E8E8E' }}></div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p>Participants</p>
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
                                        <p style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 30px', gap: '10px', background: "#4B7BB4", borderRadius: '10px', padding: '14px 10px', color: 'white', margin: '10px ' }}>
                                            <TextInput label="Prénom" type="text" placeholder="Le prénom" value={prenom_participant} onChange={(e: any) => set_prenom_participant(e.target.value)} required />
                                            <TextInput label="Nom" type="text" placeholder="Le nom" value={nom_participant} onChange={(e: any) => set_nom_participant(e.target.value)} required />
                                            <FontAwesomeIcon icon={faPlus} color="white" /></p> :
                                        <></>
                                    }
                                    {
                                        participants.map((participant: Participant) => (
                                            <p style={{ background: "#4B7BB4", borderRadius: '10px', padding: '6px 10px', color: 'white', margin: '10px ' }}>{ participant.prenom } { participant.nom.toUpperCase() }</p>
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
            </div>
        </div>
    );
}

export default CreationGroupe;