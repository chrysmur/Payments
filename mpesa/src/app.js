import dotenv from "dotenv";
import express from "express";

import { mpesaRoute } from "./routes/mpesaroute.js";

dotenv.config();

const app = express();

app.use(express.json());

// Payment routes
app.use(process.env.API_PREFIX + "/pay", mpesaRoute);

// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).send({
    message: "Page not Found",
  });
});

const { PORT } = process.env;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

