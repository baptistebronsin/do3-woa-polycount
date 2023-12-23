import React, { createContext, useContext, useEffect, useState } from 'react';
import { Utilisateur } from '../models/utilisateur.model';

export interface AuthContextType {
    authentification: {
      token: string | null;
      utilisateur: Utilisateur | null;
      mot_de_passe: string | null;
    };
    set_authentification: React.Dispatch<React.SetStateAction<{
      token: string | null;
      utilisateur: Utilisateur | null;
      mot_de_passe: string | null;
    }>>;
};
  
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [authentification, set_authentification] = useState<{token: string | null, utilisateur: Utilisateur | null, mot_de_passe: string | null}>({ token: null, utilisateur: null, mot_de_passe: null });
  const [chargement, set_chargement] = useState(true);

  useEffect(() => {
    const token: string | null = localStorage.getItem('token');
    const user: string | null = localStorage.getItem('utilisateur');
    const mot_de_passe: string | null = localStorage.getItem('mot_de_passe');

    if (token && user && mot_de_passe) {
        set_authentification({ token: token, utilisateur: Utilisateur.from_JSON(JSON.parse(user)), mot_de_passe: mot_de_passe });
    }

    set_chargement(false);
  }, []);

  return (
    <>
      {
        chargement ?
        <div className='centre-centre'>
          <p>Récupération de vos informations en cours...</p>
        </div> :
        <AuthContext.Provider value={{ authentification, set_authentification }}>
          {children}
        </AuthContext.Provider>
      }
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
