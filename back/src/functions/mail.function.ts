import * as nodemailer from 'nodemailer';
import { url_logo, longueur_logo_polycount, hauteur_logo_polycount } from '../images/logo_large.image';
import dotenv from "dotenv";

dotenv.config();

export async function envoyer_mail(mail_destinataire: string, objet: string, corps: string): Promise<boolean> {
    try {
        let transporter = nodemailer.createTransport({
            host: 'mail.baraly.fr',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL!,
                pass: process.env.PASSWORD_MAIL!
            }
        });

        const hauteur_logo: number = 40;
        const longueur_logo: number = (hauteur_logo * longueur_logo_polycount) / hauteur_logo_polycount;

        const corps_logo: string = "<img src='" + url_logo + "' alt='Logo Polycount' width='" + longueur_logo + "' height='" + hauteur_logo + "' style='border-radius: 10px;'>";

        const corps_mail_logo_debut: string = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Polycount</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #EEEEEE;">
            
                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <!-- En-tête de l'email avec logo -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 20px;">
                                        ` + corps_logo + `
                                    </td>
                                </tr>
                            </table>
            
                            <!-- Contenu principal de l'email -->
                            <table style="background: white; border-radius: 10px; max-width: 700px;" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 20px; padding-top: 0;">
                                        ` + corps + `
                                    </td>
                                </tr>
                            </table>
            
                            <!-- Pied de page de l'email -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 20px;">
                                        <p>Un problème, une question ? Contactez-nous à <a href="mailto:` + process.env.MAIL! + `">` + process.env.MAIL! + `</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const corps_mail: string = corps_mail_logo_debut;

        await transporter.sendMail({
            from: {
                name: "Polycount",
                address: process.env.MAIL!
            },
            to: mail_destinataire, // list of receivers
            subject: objet, // Subject line
            html: corps_mail, // html body
        });

        return true;
    }
    catch (err: any) {
        console.log(err);
        return false;
    }
}