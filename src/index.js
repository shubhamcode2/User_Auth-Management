import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import express from "express";

dotenv.config();

const app = express();

ConnectDB();

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));

