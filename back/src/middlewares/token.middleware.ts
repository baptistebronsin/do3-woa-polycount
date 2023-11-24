import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authentification: any = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({
            message: "Aucun token trouvé !"
        });
    }
    else {
        const token_secret: string = process.env.CLE_TOKEN!;

        Jwt.verify(token.split(' ')[1], token_secret, (err: any, value: any) => {
            if (err) {
                res.status(401).json({
                    message: "Token erroné !"
                });
            }
            else {
                (<any>req).user = value.data;
                next();
            }
        });
    }
}

export const genere_token: any = (user: any) => {
    const token_secret: string = process.env.CLE_TOKEN!
    return Jwt.sign({data: user}, token_secret, {expiresIn: process.env.EXPIRATION_JWTOKEN})
}