import { Router } from "express";
import db from "../models/index.js";

const { Board } = db.Board;

const boardRouter = Router();

boardRouter.get("/", async(req, res) => {
    try {
        const boards = await Board.findAll();
        res.status(200).send({
            count: boards.length,
            boards
        });
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

boardRouter.get("/:id", async (req, res) => {
    try {
        const findBoard = await Board.findOne({
            where: {
                id: req.params.id
            }
        });

        if (findBoard) {
            res.status(200).send({
                findBoard
            });
        } else {
            res.status(400).send({msg: '해당 아이디 값을 가진 board가 없습니다.'});
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

boardRouter.post("", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).send({msg: '입력요청이 잘못되었습니다.'});
        }

        const result = await Board.create({
            title: title ? title : null, 
            content: content ? content : null
        });

        res.status(201).send({
            msg: `id ${result.id}, ${result.title} 게시글이 생성되었습니다.`
        });
    } catch(err) {
        console.log(err);
        res.status(500).send({
            msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

boardRouter.put("/:id", async (req, res) => {
    try{
        const { title, content } = req.body;

        let board = await Board.findOne({
            where: {
                id: req.params.id
            }
        });

        if(!board || (!title && !content)) {
            res.status(400).send({msg: '게시글이 존재하지 않거나 입력값이 잘못 되었습니다.'});
        }

        if(title) board.title = title;
        if(content)  board.content  = content;

        await board.save();
        res.status(200).send({ msg: '게시글이 정상적으로 수정 되었습니다.' });
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

boardRouter.delete("/:id", async (req, res) => {
    try {
        let board = await Board.findOne({
            where: {
                id: req.params.id
            }
        });

        if(!board) {
            res.status(400).send({msg: '게시글이 존재하지 않거나 입력값이 잘못 되었습니다.'});
        }

        await board.destroy();
        res.status(200).send({ msg: '게시글이 정상적으로 삭제 되었습니다.' });
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

export default boardRouter;