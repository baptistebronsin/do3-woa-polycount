import React, { useEffect, useState } from 'react';
import { Groupe } from '../../models/groupe.model';
import { useNavigate } from 'react-router-dom';
import { AxiosError, AxiosResponse } from 'axios';
import requete_api from '../../utils/requete_api.util';
import { AuthContextType, useAuth } from '../../providers/authentification.provider';
import { ParticipantGroupe } from '../../models/participant_groupe.model';
interface CarteGroupeProps {
    groupe: Groupe;
}

const CarteGroupe: React.FC<CarteGroupeProps> = ({ groupe }) => {
    const authentification: AuthContextType | null = useAuth();
    const navigate = useNavigate();

    const [participants, set_participants] = useState<ParticipantGroupe[]>([]);
    const [chargement, set_chargement] = useState<boolean>(false);

    useEffect(() => {
        recuperer_participants_groupe();
    }, []);

    const recuperer_participants_groupe = async () => {
        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('GET', `/groupe/${groupe.pk_groupe_id}/participants`, null, authentification, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            set_participants(reponse.data.data.map((participant: ParticipantGroupe) => {
                return ParticipantGroupe.from_JSON(participant);
            }));
        }
    }

    const handleClick = () => {
        navigate(`/home/groupes/${groupe.pk_groupe_id}`);
    };

    return (
        <div
            onClick={handleClick}
            className='carte-groupe'
        >
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                {
                    groupe.lien_image ?
                    <img src={groupe.lien_image} alt={`groupe partagé numéro ${groupe.pk_groupe_id}`} /> :
                    <div style={{ background: 'linear-gradient(135deg, #4B7BB4, #225292)', height: '80px', borderRadius: '6px' }}></div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h2 style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{groupe.nom ?? `Groupe n°${groupe.pk_groupe_id}`}</h2>
                    {
                        chargement ?
                        <p className="inline-block" style={{ margin: 0, padding: 0, color: 'gray' }}>Chargement en cours</p> :
                        <p style={{ color: 'gray' }}>{ participants.length } { participants.length > 1 ? "membres" : "membre"}</p>
                    }
                </div>
            </div>
            <div style={{ height: '10px' }}></div>
            <hr />
            {
                groupe.cloture_le ?
                <p style={{ color: 'red' }}>Cloturé le { groupe.cloture_le.toLocaleDateString() }</p> :
                <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', color: 'gray' }}>
                    { groupe.description && groupe.description.length > 0 ? groupe.description : "Pas de description" }
                </p>
            }
        </div>
    );
};

export default CarteGroupe;
