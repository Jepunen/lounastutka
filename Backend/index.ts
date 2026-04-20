// import { serve } from "bun";
import express from "express";
import type { Request, NextFunction, Response, Express } from "express";
import cors from "cors";

// NOTE: Custom error handler
import errorHandler from "./utils/error.ts";

// NOTE: Add routes from "routes/" here:
import authorizationRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes.ts";

const app: Express = express();

// Json support
app.use(express.json());

// NOTE: Might need this for traefik traffic:
// src: https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", true);

// Cross origin resource sharing support
app.use(cors());

// NOTE: Use the routes from "routes/" here:
// When unsure, use ALL...
app.use("/api/auth", authorizationRoutes);
app.use("/api/protected", protectedRoutes);

// NOTE: Should be included to "use" as last
app.use(errorHandler);

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

