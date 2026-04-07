import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";


export async function helloThere(req: AuthenticatedRequest, res: Response) {
	res.status(200).json({ msg: "Hello There but from protected!" });
}

