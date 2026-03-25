// import { serve } from "bun";
import express from "express";
import type { Request, NextFunction, Response, Express } from "express";
import cors from "cors";

// NOTE: Add routes from "routes/" here:
import authorizationRoutes from "./routes/auth.routes";

const app: Express = express();

// Json support
app.use(express.json());

// NOTE: Might need this for traefik traffic:
// src: https://expressjs.com/en/guide/behind-proxies.html
// app.set("trust proxy", true);

// Cross origin resource sharing support
app.use(cors());

// NOTE: Use the routes from "routes/" here:
app.use("/auth", authorizationRoutes);

// WARNING: Probably should remove '|| xxxx'to integrate with the traefik / docker env
const port = process.env.PORT || 3001;

app.get(
	'/',
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			res.status(200).json({
				message: "Hello there!",
				success: true,
			});
		} catch (err: unknown) {
			next(new Error((err as Error).message));
		}
	},
);

app.listen(port, () => {
	console.log(`Up and running on port ${port}`);
});

// Bun in the oven stuff
// serve({
// 	port: 3001,
// 	fetch(req) {
// 		return new Response("Backend connection OK, I hope");
// 	}
// });
//

