import { RequestHandler, Request, Response } from "express";

export const endpoint_listener: RequestHandler = async (req: Request, res: Response) => {
    console.log(req.body);

    return res.status(200).json({ message: "OK" });
}