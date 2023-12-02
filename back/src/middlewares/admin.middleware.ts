import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

export const admin_authentification: any = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({
            message: "Aucun token administrateur trouvé !"
        });
    }
    else {
        if (token.split(' ')[1] == process.env.TOKEN_ADMINISTRATEUR)
            next();
        else
            res.status(401).json({
                message: "Token administrateur erroné !"
            });
    }
}