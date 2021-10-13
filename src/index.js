import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";

import db from "./models/index.js";

const app = express();
// NODE_ENV 환경변수 체크, 개발환경일때와 상용환경을 구분
if (process.env.NODE_ENV==="development") {
    // DATABASE에서 외래키 체크를 강제로 해제 !! 로컬 개발 환경에서만 제한적으로 사용해야 함.
    db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {raw: true})
    .then(()=>{
        // 기존 테이블을 모두 지우고 새로 생성, force:true 옵션은 모델 변경 직후에만 넣고 이외에는 빼주는게 좋음.
        db.sequelize.sync({force: true}).then(()=>{   // 기존의 테이블 구조가 어떻든 무조건 현재 코드의 모델 구조로 강제로 동기화( 기존 테이블 삭제후 새로 생성 )
            console.log("개발환경 sync 끝");
            app.use(express.json());  // req.body 파싱을 위한 코드
            app.use(express.urlencoded({ extended: true }));  // req.body 파싱을 위한 코드
            app.use("/users", userRouter);  // http://loacalhost:3000/users
            app.use("/boards", boardRouter);  // http://loacalhost:3000/boards
            app.listen(3000);  // http://loacalhost:3000
        });
    });
} else if (process.env.NODE_ENV==="production") {
    db.sequelize.sync().then(()=>{  // 현재 코드의 모델과 디비를 동기화 하되 기존에 있는 데이터 (삭제, 변경 불가) 추가만 가능
        console.log("상용환경 sync 끝");
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use("/users", userRouter);
        app.use("/boards", boardRouter);
        app.listen(3000);
    });
}
