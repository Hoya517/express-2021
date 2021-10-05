import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";

import db from './models/index.js';
const app = express();

db.sequelize.sync().then(()=>{
    console.log("sync 끝");
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/users", userRouter);
    app.use("/boards", boardRouter);
    app.listen(3000);
});