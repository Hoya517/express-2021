import bcrypt from "bcrypt";
import faker from "faker";

import db from "./src/models/index.js";
const { User, Board, Permission } = db;
faker.locale = "ko";

const userCount = 1000;
const boardCount = userCount * 0.3 * 365;

const permissions = [{
    title: "전체 관리자", level: 0, desc: "관리자 권한"
}, {
    title: "게시판 관리자", level: 1, desc: "게시판 관리자 권한"
}, {
    title: "사용자 관리자", level: 2, desc: "사용자 관리자 권한"
}, {
    title: "일반 관리자", level: 3, desc: "일반 관리자 권한"
}, {
    title: "게스트", level: 4, desc: "게스트 권한"
}];

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const permission_sync = async() => {
    try {
        for (let i=0; i<permissions.length; i++) {
            const { title, level, desc } = permissions[i];
            await Permission.create({title, level, desc});
        }
    } catch(err) {
        console.log(err);
    }
}

const user_sync = async () => {
    try {
        for(let i=0; i<userCount; i++) {
            const hashpwd = await bcrypt.hash("test1234", 4);
            await User.create({
                name: faker.name.lastName()+faker.name.firstName(),
                age: getRandomInt(15,50),  // i 일때, await으로 동기처리를 해줘야함.
                password: hashpwd,
                permissionId : getRandomInt(1, 5),
            });
            if(i%100 === 0) console.log(`${i}/${userCount}`);
        }
    } catch(err) {
        console.log(err);
    }
};

const board_sync = async() => {
    try {
        for (let i=0; i<boardCount; i++) {
            await Board.create({
                title: faker.lorem.sentences(1),
                content: faker.lorem.sentences(10),
                userId: getRandomInt(1, userCount),
            });
            if(i%100 === 0) console.log(`${i}/${boardCount}`);
        }
    } catch(err) {
        console.log(err)
    }
}

db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true}).then(async() => {
    await db.sequelize.sync({force: true});
    await permission_sync();
    console.log("퍼미션 생성 완료");
    await user_sync();  // 유저 생성 안할때, 주석
    console.log("유저 생성 완료");
    await board_sync(); // 생성 안할때, 주석
    console.log("게시글 생성 완료");
    process.exit();
});
