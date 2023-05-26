const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const mybatisMapper = require("mybatis-mapper");
const app = express();
const port = process.env.PORT || 8080;
const dbconfig = require(`./db.js`);

app.use(cors());
app.use(express.json()); // json body 받기설정

mybatisMapper.createMapper([`./page-t3-l4-mapper.xml`]);

var dbconn;
function handleDisconnect() {
  dbconn = mysql.createConnection(dbconfig);
  dbconn.connect(function (err) {
    if (err) {
      setTimeout(handleDisconnect, 2000);
    }
  });
  dbconn.on("error", function (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();


app.get('/', (req, res) => {
  res.send('Hello World!')
})


/**
 * 조회
 * @param
 * @return
 */
app.get("/paget3l4/select-hjboard", (req, res) => {
  var param = { SEQ: req.query.SEQ, COMPLETE_YN: req.query.COMPLETE_YN };
  var format = { language: "sql", indent: "  " };
  var query = mybatisMapper.getStatement("paget3l4", "selectHjBoard", param, format);
  dbconn.query(query, (error, rows) => {
    if (error) throw error;
    res.send(rows);
  });
});


/**
 * 입력/수정/삭제(N건)
 * @param
 * @return
 */
app.post("/paget3l4/save-hjboard", function (req, res) {
  console.log("param:", req.body.modifiedRows);
  /*  
    modifiedRows: {
        createdRows: [ ...  ],
        updatedRows: [ ...  ],
        deletedRows: [ ...  ]
    }
  */
  let sqlErrMsg = [];

  // 삭제
  req.body.modifiedRows.deletedRows?.forEach(function (row) {
    let SEQ = row.SEQ;
    let sql = `DELETE FROM HJ_BOARD WHERE BOARD_ID = 'T3L4' AND SEQ = ${SEQ}`;
    dbconn.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 입력
  req.body.modifiedRows.createdRows?.forEach(function (row) {
    let TITLE = row.TITLE;
    let CONTENT = row.CONTENT;
    let USER_ID = row.USER_ID;
    let sql = `INSERT INTO HJ_BOARD(BOARD_ID, TITLE, CONTENT, USER_ID, CREATE_DT) VALUES('T3L4', '${TITLE}', '${CONTENT}', 'njlee', ${"NOW()"})`;
    dbconn.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 수정
  req.body.modifiedRows.updatedRows?.forEach(function (row) {
    let SEQ = row.SEQ;
    let TITLE = row.TITLE;
    let CONTENT = row.CONTENT;
    let USER_ID = row.USER_ID;
    let sql = `UPDATE HJ_BOARD SET TITLE = '${TITLE}', CONTENT = '${CONTENT}' , USER_ID = '${USER_ID}' , CREATE_DT = ${"NOW()"} WHERE SEQ = ${SEQ}`;
    dbconn.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 모든 DML 처리후, 결과리턴을 위한 dummy select ... 더 좋은 방법은 ?
  dbconn.query(`SELECT 1`, (error, rows) => {
    res.json(JSON.stringify({ resMsg: sqlErrMsg.length === 0 ? "저장성공" : "에러발생", sqlErrMsg }));
  });
});

/**
 * 완료 toggle
 * @param
 * @return
 */
app.post("/paget3l4/toggle-complete", function (req, res) {
  console.log("param:", req.body.modifiedRows);
  /*  
    modifiedRows: {
        createdRows: [ ...  ],
        updatedRows: [ ...  ],
        deletedRows: [ ...  ]
    }
  */
  let sqlErrMsg = [];
 
  // 수정
  req.body.modifiedRows.updatedRows?.forEach(function (row) {
    let SEQ = row.SEQ;
    let COMPLETE_DATE = row.COMPLETE_DATE;
    let sql = `UPDATE HJ_BOARD SET COMPLETE_DATE = '${COMPLETE_DATE}'  WHERE SEQ = ${SEQ}`;
    dbconn.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 모든 DML 처리후, 결과리턴을 위한 dummy select ... 더 좋은 방법은 ?
  dbconn.query(`SELECT 1`, (error, rows) => {
    res.json(JSON.stringify({ resMsg: sqlErrMsg.length === 0 ? "저장성공" : "에러발생", sqlErrMsg }));
  });
});


const server = app.listen(port, "0.0.0.0", () => {
  var host = server.address().address; // typescript 에서 에러발생 주석
  var port = server.address().port;
  console.log("lighthappyj app listening at http://%s:%s", host, port);
});
