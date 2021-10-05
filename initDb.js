import bcrypt from "bcrypt";
import faker from "faker";

import db from ".src/models/index.js";
const { User, Board } = db;
faker.locale = "ko";

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const user_sync = async () => {
    try {
        await User.sync({force: true});
        for(let i=0; i<10000; i++) {
            const hashpwd = await bcrypt.hash("test1234", 10);
            User.create({
                name: faker.name.lastName()+faker.name.firstName(),
                age: getRandomInt(15,50),  // i 일때, await으로 동기처리를 해줘야함.
                password: hashpwd
            });
        }
    } catch(err) {
        console.log(err);
    }
};

const board_sync = async() => {
    try {
        await Board.sync({force: true});
        for (let i=0; i<10000; i++) {
            await Board.create({
                title: faker.lorem.sentences(1),
                content: faker.lorem.sentences(10)
            })
        }
    } catch(err) {
        console.log(err)
    }
}

user_sync();  // 유저 생성 안할때, 주석
board_sync(); // 생성 안할때, 주석
