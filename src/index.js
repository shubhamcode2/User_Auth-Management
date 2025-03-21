import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: '50kb' }));
app.use(
    express.urlencoded({
        extended: true,
        inflate: true,
        limit: "1mb",
        parameterLimit: 5000,
        type: "application/x-www-form-urlencoded",
    })
);
app.use(express.static("public"));
app.use(cookieParser());

ConnectDB()
    .then(() => app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`)))
    .catch((err) => console.log("error in connecting db in index.js", err));

app.get("/", (req, res) => res.send("Hello World!"));


