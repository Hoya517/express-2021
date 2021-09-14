import { Router } from "express";
// import _, { create } from "lodash";
import sequelize from "sequelize";
import faker from "faker";
faker.locale = "ko";

const seq = new sequelize('express', 'root', 'hoy2158831a@', {
    host: 'localhost',
    dialect: 'mysql'
});

const check_sequelize_auth = async () => {
    try{
        await seq.authenticate();
        console.log("연결 성공");
    }catch(err){
        console.log("연결 실패: ", err);
    }
};
check_sequelize_auth();

const User = seq.define("user", {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    age: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});

const user_sync = async () => {
    try {
        await User.sync({force: true});
        for(let i=0; i<100; i++) {
            User.create({
                name: faker.name.lastName()+faker.name.firstName(),
                age: getRandomInt(15,50)  // i 일때, await으로 동기처리를 해줘야함.
            });
        }
    } catch(err) {
        console.log(err);
    }
};
// user_sync();  // 유저 생성 안할때, 주석

const userRouter = Router();

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


console.log("준비됨");


userRouter.get("/", async(req, res) => {
    try {
        let { name, age } = req.query;
        const { Op } = sequelize;
        const findUserQuery = {
            attributes: ['name', 'age'],
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

userRouter.get("/:id", (req, res) => {
    const findUser = _.find(users, {id: parseInt(req.params.id)});
    let msg;
    if(findUser){
        msg = "정상적으로 조회되었습니다.";
        res.status(200).send({
            msg, findUser
        });
    } else {
        msg = "해당 아이디를 가진 유저가 없습니다.";
        res.status(400).send({
            msg, findUser
        });
    }
    
});

//유저생성
userRouter.post("", async(req, res) => {
    try {
        const { name, age} = req.body;
        if (!name || !age) res.status(400).send({msg: "입력요청이 잘못되었습니다."});

        const result = await User.create({name, age});
        res.status(201).send({
            msg: `id ${result.id}, ${result.name} 유저가 생성되었습니다.`
        });
    } catch(err) {
        console.log(err);
        res.status(500).send({
            msg: "서비스 이용에 불편을 드려 죄송합니다."
        });
    }
    
});

//name 변경
userRouter.put("/:id", (req, res) => {
    const findUser = _.find(users, {id: parseInt(req.params.id)});
    let result;
    if(findUser && findUser.id == req.params.id){
        findUser.name = req.body.name;
        result = `유저 이름을 ${findUser.name}으로 변경`;
        res.status(200).send({
            result
        });
    } else {
        result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
        res.status(400).send({
            result
        });
    }
});

//user 지우기
userRouter.delete("/:id", (req, res) => {
    let findUser = _.find(users, {id: parseInt(req.params.id)});
    let result;
    if(findUser && findUser.id == req.params.id){
        users = _.reject(users, ["id", parseInt(req.params.id)]);
        result = `아이디가 ${req.params.id}인 유저 삭제`;
        res.status(200).send({
            result
        });
    } else {
        result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
        res.status(400).send({
            result
        });
    }
});

export default userRouter;