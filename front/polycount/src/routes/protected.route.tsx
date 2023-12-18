import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../providers/authentification.provider";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: any) => {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    useEffect(() => {
        if (!authentification || !authentification.authentification.token) {
            navigate('/connexion');
        }
    }, [authentification, navigate]);

    return authentification && authentification.authentification.token ? children : null;
};

export default ProtectedRoute;