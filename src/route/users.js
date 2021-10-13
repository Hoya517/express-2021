import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../models/index.js";

const { User, Board, Permission } = db;

const userRouter = Router();

// path: localhost:3000/users/
userRouter.get("/", async(req, res) => {
    try {
        // req.query => localhost:3000/users?name=홍길동&age=12
        // req.query.name => 홍길동
        // req.query.age => 12
        let { name, age } = req.query;
        const Op = Sequelize.Op;
        const findUserQuery = {
            attributes: ['id', 'name', 'age'],
            include: [Permission]
        }
        let result;
        if (name && age) {
            findUserQuery['where'] = { name: {[Op.substring]: name}, age }
        } else if (name) {
            findUserQuery['where'] = { name: {[Op.substring]: name} }
        } else if (age) {
            findUserQuery['where'] = { age }
        }

        result = await User.findAll(findUserQuery);
        res.send({
            count: result.length,
            result
        })
    } catch(err) {
        console.log(err);
        res.status(500).send({msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."})
    }
});

userRouter.get("/:id", async (req, res) => {
    try {
        const findUser = await User.findOne({
            // include: [Permission, Board],
            include: [{
                model: Permission,
                attributes: ["id", "title", "level"],
            }, {
                model: Board,
                attributes: ["id", "title"]
            }],
            where: {
                id: req.params.id
            }
        });

        if (findUser) {
            res.status(200).send({findUser});
        } else {
            res.status(400).send({msg: '해당 아이디 값을 가진 board가 없습니다.'});
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

//유저생성
userRouter.post("/", async(req, res) => {
    try {
        // get과 다르게 (req.query) 가 아닌 req.body 에서 값을 가지고 옴.
        const { name, age, password, permission } = req.body;  // permission 추가
        if (!name || !age || !password || !permission) res.status(400).send({msg: "입력요청이 잘못되었습니다."});
        else {
            const hashpwd = await bcrypt.hash(password, 4);
            const user = await User.create({name, age, password: hashpwd});  // password hash 처리

            await user.createPermission({
                title: permission.title, level: permission.level
            });

            res.status(201).send({
                msg: `id ${user.id}, ${user.name} 유저가 생성되었습니다.`
            });
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

//name 변경
userRouter.put("/:id", async (req, res) => {
    try{
        const { name, age } = req.body;

        let user = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        if(!user || (!name && !age)) {
            res.status(400).send({msg: '유저가 존재하지 않거나 입력값이 잘못 되었습니다.'});
        } else {
            if(name) user.name = name;
            if(age)  user.age  = age;
    
            await user.save();
            res.status(200).send({ msg: '유저정보가 정상적으로 수정 되었습니다.' });
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

//user 지우기
userRouter.delete("/:id", async (req, res) => {  // auth(인증)체크 || 권한 체크
    try {
        let user = await User.findOne({
            where: {
                id: req.params.id
            }
        });

        if(!user) {
            res.status(400).send({msg: '유저가 존재하지 않거나 입력값이 잘못 되었습니다.'});
        } else {
            await user.destroy();
            res.status(200).send({ msg: '유저정보가 정상적으로 삭제 되었습니다.' });
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({ msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

userRouter.get("/test/:id", async(req, res) => {
    try{
        // findAll
        const Op = Sequelize.Op;
        const userResult = await User.findAll({
            attributes: ['id', 'name', 'age', 'updatedAt'],
            where : {
                [Op.or] : [{
                    [Op.and]: {
                        name: { [Op.startsWith] : "김" },
                        age:  { [Op.eq] : 29 }
                    }
                }, {
                    name: { [Op.startsWith] : "하" },
                    age: { [Op.eq] : 29 }
                }]
            },
            order : [['age', 'DESC'], ['name', 'ASC']]
        });
        
        const boardResult = await Board.findAll();  //limit

        const user = await User.findOne({
            where: { id: req.params.id }
        });

        if(!user) {
            res.status(400).send({ msg: '해당 유저가 존재하지 않습니다.'});
        }

        await user.destroy();
        board.title += "test 타이틀 입니다.";
        await board.save();

        res.status(200).send({
            user,
            board,
            users: {
                count: userResult.length,
                data: userResult
            },
            boards: {
                count: boardResult.length,
                data: boardResult
            }
        })
    } catch(err) {
        console.log(err)
        res.status(500).send({msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."})
    }
});

export default userRouter;