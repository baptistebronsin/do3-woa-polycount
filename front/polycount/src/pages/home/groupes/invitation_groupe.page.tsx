import { useEffect, useState } from "react";
import { Link, NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { Groupe } from "../../../models/groupe.model";
import { Axios, AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import LoaderCenter from "../../../components/loader/loader_center.component";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";

function InvitationGroupe () {
    const location = useLocation();
  
    const search_params: URLSearchParams = new URLSearchParams(location.search);
    const type_verification: string | null = search_params.get('type');
    

    return (
        <>
        <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
        <div className="centre-centre">
            <div className="rectangle-blanc-ombre largeur800 auto-height">
                {
                    type_verification === 'EMAIL' ? (
                        <InvitationGroupeEmail search_params={ search_params } />
                    ) : type_verification === 'LIEN' ? (
                        <InvitationGroupeLien search_params={ search_params } />
                    ) : (
                        <div className="centre-centre">
                            <p>Une erreur est survenue lors de la récupération de l'invitation.</p>
                        </div>
                    )
                }
            </div>
        </div>
        </>
    );
}

function InvitationGroupeEmail ({ search_params }: { search_params: URLSearchParams }) {
    const groupe_id: string | null = search_params.get('groupe_id');
    const token: string | null = search_params.get('token');
    const groupe_token: string | null = search_params.get('groupe_token');

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [groupe, set_groupe] = useState<Groupe | null>(null);
    const [accepter_invitation, set_accepter_invitation] = useState<boolean>(false);
    const [chargement_recuperer_groupe, set_chargement_recuperer_groupe] = useState<boolean>(false);
    const [chargement_acceptation_invitation, set_chargement_acceptation_invitation] = useState<boolean>(false);

    // useEffect(() => {
    //     if (groupe_id && !isNaN(Number(groupe_id)) && token && groupe_token && !isNaN(Number(groupe_token))) {
    //         recuperer_groupe_api();
    //     }
    // }, []);

    // const recuperer_groupe_api = async (): Promise<void> => {
    //     const api_body = {
    //         groupe_id: Number(groupe_id),
    //         token: token,
    //     }

    //     set_chargement_recuperer_groupe(true);
    //     const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/email/verification/detail", api_body, authentification, navigate, true);
    //     set_chargement_recuperer_groupe(false);

    //     if (reponse && 'data' in reponse && 'data' in reponse.data) {
    //         set_groupe(Groupe.from_JSON(reponse.data.data));
    //     }
    // }

    return (
        <div className="grid-20-auto-20">
            <p>Invitation au groupe de dépense depuis un mail</p>
        </div>
    );
}

function InvitationGroupeLien ({ search_params }: { search_params: URLSearchParams }) {
    const groupe_id: string | null = search_params.get('groupe_id');
    const token: string | null = search_params.get('token');
    const groupe_token: string | null = search_params.get('groupe_token');

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [groupe, set_groupe] = useState<Groupe | null>(null);
    const [accepter_invitation, set_accepter_invitation] = useState<boolean>(false);
    const [chargement_recuperer_groupe, set_chargement_recuperer_groupe] = useState<boolean>(false);
    const [chargement_acceptation_invitation, set_chargement_acceptation_invitation] = useState<boolean>(false);

    useEffect(() => {
        if (authentification === null || authentification.authentification === null || authentification.authentification.token === null)
            return;

        if (groupe_id && !isNaN(Number(groupe_id)) && token && groupe_token && !isNaN(Number(groupe_token))) {
            recuperer_groupe_api();
        }
    }, []);

    const recuperer_groupe_api = async (): Promise<void> => {
        const api_body = {
            groupe_id: Number(groupe_id),
            token: token,
        }

        set_chargement_recuperer_groupe(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/lien/verification/detail", api_body, authentification, navigate, true);
        set_chargement_recuperer_groupe(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            set_groupe(Groupe.from_JSON(reponse.data.data));
        }
    }

    const accepter_invitation_api = async (): Promise<void> => {
        const api_body = {
            groupe_id: Number(groupe_id),
            token: token,
            groupe_token: Number(groupe_token)
        }

        set_chargement_acceptation_invitation(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/lien/verification", api_body, authentification, navigate, true);

        set_chargement_acceptation_invitation(false);

        if (reponse && 'data' in reponse) {
            set_accepter_invitation(true);
        }
    }

    return (
        <>
            {
                groupe_id && !isNaN(Number(groupe_id)) && token && groupe_token && !isNaN(Number(groupe_token)) ? (
                    <div className="grid-20-auto-20">
                        <p>Invitation au groupe de dépense depuis un lien</p>
                        {
                            authentification === null || authentification.authentification === null || authentification.authentification.token === null ? (
                                <div className="grid-2-auto">
                                    <div className="centre">
                                        <img alt="Logo d'un groupe de personnages content" src="/images/connexion.png" style={{ height: '260px' }}/>
                                    </div>
                                    <div className="centre-centre">
                                        <p>Veuillez être connecté avant de pouvoir rejoindre un groupe de dépense.</p>
                                    </div>
                                </div>
                            ) : 
                            (
                                <div>
                                    {
                                        chargement_recuperer_groupe ? (
                                            <LoaderCenter message="Récupération des informations d'invitation" />
                                        ) : (
                                            groupe === null ? (
                                                <div className="centre-centre">
                                                    <div className="grid-2-auto">
                                                        <div className="centre">
                                                            <img alt="Logo d'un groupe perdu" src="/images/void.png" style={{ height: '260px' }}/>
                                                        </div>
                                                        <div className="centre-centre">
                                                            <p>L'invitation à ce groupe n'est plus disponible.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                {
                                                    accepter_invitation ? (
                                                        <div className="grid-2-auto">
                                                            <div className="centre">
                                                                <img alt="Logo d'un groupe de personnages content" src="/images/happy.png" style={{ height: '260px' }}/>
                                                            </div>
                                                            <div className="centre-centre">
                                                                <p>Vous avez bien été ajouté au groupe de dépense <strong>{ groupe.nom }</strong>.</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="grid-2-auto">
                                                                <div className="centre">
                                                                    <img alt="Logo d'un groupe de personnages" src="/images/groupe.png" style={{ height: '260px' }}/>
                                                                </div>
                                                                <div className="centre-centre">
                                                                    <p>Vous avez été invité à rejoindre le groupe de dépense <strong>{ groupe.nom }</strong>.</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ height: '20px' }}></div>
                                                            <div className="centre">
                                                            {
                                                                chargement_acceptation_invitation ?
                                                                <button className="full-button centre-centre" onClick={() => {}}>
                                                                    <LoaderSpinner />
                                                                    <p className="inline-block">&nbsp;Connection en cours</p>
                                                                </button> :
                                                                <button className="full-button" onClick={ accepter_invitation_api }>Rejoindre</button>
                                                            }
                                                            </div>
                                                        </>
                                                    )
                                                }
                                                </>
                                            )
                                        )
                                    }
                                </div>
                            )
                        }
                        
                        <div>
                            <p className="inline-block">Vous souhaitez retourner à la page d'accueil ?&nbsp;</p>
                            <Link className="inline-block lien" to='/connexion'>page d'accueil</Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid-2-auto">
                        <div className="centre">
                            <img alt="Logo d'un personnage tenant une erreur" src="/images/error.png" style={{ height: '260px' }}/>
                        </div>
                        <div className="centre-centre">
                            <p>Il semble que l'URL a été altérée. Veuillez vérifier le lien d'invitation que vous avez reçu.</p>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default InvitationGroupe;