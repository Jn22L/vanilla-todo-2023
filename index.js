//const HOST_NAME = ZnCommon.getHostName();
const HOST_NAME = "http://localhost:8080";
let gParentSeq;
const G_USER_STATE = { isLogin: true, userId: "testUser", userName: "testUser", selectedTopMenu: "TODO" };

/**
 * todo 목록을 조회한다.
 * @param {string} opt - TODO:할일, COMPLETE:완료
 * @returns {promise([JSON array])} data - 조회된 todo 목록
 */
const fetchData = async (opt) => {
  let completeYN = opt === "TODO" ? "N" : "Y";
  const url = `${HOST_NAME}/paget3l4/select-njboard?SEQ=&COMPLETE_YN=${completeYN}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * todo 목록을 렌더링한다.
 * @param {string} opt - TODO:할일, COMPLETE:완료
 * @param {object} todos - 할일목록
 */
const renderData = (opt, todos) => {
  loadTemplatePage("#list-page");
  const divList = document.querySelector(".list-bg");

  todos.map((todo) => {
    const divListItem = document.createElement("div");
    const divTitleContainer = document.createElement("div");
    const divTitleLeft = document.createElement("div");
    const h4Title = document.createElement("h4");
    const divTitleRight = document.createElement("div");
    const spanComplete = document.createElement("span");
    const spanEdit = document.createElement("span");
    const spanDelete = document.createElement("span");
    const pContent = document.createElement("p");
    const spanCreateDate = document.createElement("span");
    const spanCompleteDate = document.createElement("span");
    const spanCreateUser = document.createElement("span");

    divListItem.setAttribute("class", "list-item");
    divListItem.setAttribute("data-seq", todo.SEQ);
    divTitleContainer.setAttribute("class", "list-item-title-container");
    h4Title.textContent = todo.TITLE;
    spanComplete.textContent = "✔️";
    spanEdit.textContent = "✏️";
    spanDelete.textContent = "🗑️";
    spanDelete.setAttribute("data-comment_cnt", todo.COMMENT_CNT);
    pContent.textContent = todo.CONTENT;
    spanCreateDate.textContent = todo.CREATE_DATE_SHORT;
    spanCreateUser.textContent = "/" + todo.USER_NAME;

    if (todo.COMMENT_CNT > 0) {
      h4Title.textContent += ` [${todo.COMMENT_CNT}]`;
    }

    divTitleLeft.appendChild(h4Title);
    divTitleRight.appendChild(spanComplete);
    divTitleRight.appendChild(spanEdit);
    divTitleRight.appendChild(spanDelete);
    divTitleContainer.appendChild(divTitleLeft);
    divTitleContainer.appendChild(divTitleRight);
    divListItem.appendChild(divTitleContainer);
    divListItem.appendChild(pContent);
    divListItem.appendChild(spanCreateDate);
    if (todo.COMPLETE_DATE !== "N") {
      spanCompleteDate.textContent = "/" + todo.COMPLETE_DATE.substring(2, 4) + "." + todo.COMPLETE_DATE.substring(4, 6) + "." + todo.COMPLETE_DATE.substring(6, 8);
      divListItem.appendChild(spanCompleteDate);
    }
    divListItem.appendChild(spanCreateUser);
    divList.appendChild(divListItem);

    if (todo.COMPLETE_DATE !== "N") {
      divListItem.style.background = "rgb(255, 165, 0)";
    }

    // TITLE click event handler
    divTitleLeft.addEventListener("click", () => {
      //renderDetailPage({ SEQ: todo.SEQ, TITLE: todo.TITLE, CONTENT: todo.CONTENT, IMG_URL: todo.IMG_URL });
      renderDetailPage(todo);
    });

    // ✔️ click event handler
    spanComplete.addEventListener("click", (e) => {
      let today;
      if (e.target.parentElement.parentElement.parentElement.style.background === "rgb(255, 165, 0)") {
        e.target.parentElement.parentElement.parentElement.style.background = "white";
        today = "N";
      } else {
        e.target.parentElement.parentElement.parentElement.style.background = "rgb(255, 165, 0)";
        today = new Date().toISOString().substring(0, 10).replace(/-/g, "");
      }
      if (!G_USER_STATE.isLogin) {
        //alert("로그인이 필요한 서비스 입니다.");
        return;
      }

      // 자신의 글일때, 완료 내역 DB저장
      if (todo.USER_ID === G_USER_STATE.userId) {
        toggleComplete({ SEQ: todo.SEQ, COMPLETE_DATE: today });
      }
    });

    // ✏️ click event handler
    spanEdit.addEventListener("click", (event) => {
      if (!G_USER_STATE.isLogin) {
        alert("로그인이 필요한 서비스 입니다.");
        return;
      }
      if (todo.USER_ID != G_USER_STATE.userId) {
        alert("자신의 글만 수정가능 합니다.");
        return;
      }
      renderWritePage({ SEQ: todo.SEQ, TITLE: todo.TITLE, CONTENT: todo.CONTENT, IMG_URL: todo.IMG_URL, USER_ID: todo.USER_ID });
    });

    // 🗑️ click event handler
    spanDelete.addEventListener("click", async (e) => {
      let seq = e.target.parentElement.parentElement.parentElement.dataset.seq;
      let commentCnt = e.target.dataset.comment_cnt;
      if (commentCnt > 0) {
        alert("댓글이 있는글은 삭제할 수 없습니다.");
        return;
      }

      if (!G_USER_STATE.isLogin) {
        alert("로그인이 필요한 서비스 입니다.");
        return;
      }

      if (todo.USER_ID != G_USER_STATE.userId) {
        alert("자신의 글만 삭제가능합니다.");
        return;
      }

      if (!confirm("삭제하시겠습니까?")) return;
      saveData([{ IUD_FLAG: "D", SEQ: seq }]);
    });

    if (opt === "COMPLETE") {
      divTitleContainer.removeChild(divTitleRight);
    }
  });
};

/**
 * todo 목록을 저장한다.
 * @param {object[]} objArr - 저장할 todo object 배열: [{},{},{}...]
 */
const saveData = async (objArr) => {
  const createdRows = objArr.filter((v) => v.IUD_FLAG === "I");
  const updatedRows = objArr.filter((v) => v.IUD_FLAG === "U");
  const deletedRows = objArr.filter((v) => v.IUD_FLAG === "D");
  const saveJSON = { modifiedRows: { createdRows, updatedRows, deletedRows } };

  // save JSON 양식
  //
  // modifiedRows: {
  //       createdRows: [ {...},{...} ...  ],
  //       updatedRows: [ {...},{...} ...  ],
  //       deletedRows: [ {...},{...} ...  ]
  // }
  const res = await fetch(`${HOST_NAME}/paget3l4/save-njboard`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveJSON),
  });

  const resJSON = await res.json();
  fetchData("TODO").then((json) => renderData("TODO", json));
};

/**
 * 완료처리 한다.
 * @param {object} obj - {SEQ: 게시물번호, COMPLETE_DATE: 미완료(N) | 완료(오늘날짜(YYYYMMDD)) }
 */
const toggleComplete = async (obj) => {
  const updatedRows = [{ SEQ: obj.SEQ, COMPLETE_DATE: obj.COMPLETE_DATE }];
  const saveJSON = { modifiedRows: { updatedRows } };

  const res = await fetch(`${HOST_NAME}/paget3l4/toggle-complete`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveJSON),
  });

  const resJSON = await res.json();
};

/**
 * 댓글을 조회한다.
 * @param {string} parentSeq - 게시글번호
 * @returns {promise([JSON array])} data - 조회된 댓글목록
 */
const fetchComment = async (parentSeq) => {
  const url = `${HOST_NAME}/paget3l4/select-comment?PARENT_SEQ=${parentSeq}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * 댓글 목록을 렌더링한다.
 * @param {number} parentSeq - 게시글번호
 * @param {object} comments - 댓글목록
 */
const renderComment = (comments) => {
  const divCommentList = document.querySelector("#comment-list-wrapper");
  removeAllChildNodes(divCommentList);

  comments.map((comment) => {
    const hr = document.createElement("hr");
    const divCommentItem = document.createElement("div");
    const divTitleContainer = document.createElement("div");
    const divTitleLeft = document.createElement("div");
    const divTitleRight = document.createElement("div");
    const pContent = document.createElement("p");

    const spanCreateUserName = document.createElement("span");
    const spanCreateDate = document.createElement("span");
    const spanComplete = document.createElement("span");
    const spanDelete = document.createElement("span");

    divTitleContainer.setAttribute("class", "detail-comment-title-container");
    spanCreateUserName.textContent = comment.CREATE_USER_NAME;
    spanCreateDate.textContent = comment.CREATE_DATE;
    pContent.textContent = comment.CONTENT;
    spanComplete.textContent = "✔️";
    spanDelete.textContent = "🗑️";
    spanDelete.setAttribute("data-seq", comment.SEQ);

    divTitleLeft.appendChild(spanCreateUserName);
    divTitleRight.appendChild(spanCreateDate);
    divTitleRight.appendChild(spanComplete);
    divTitleRight.appendChild(spanDelete);
    divTitleContainer.appendChild(divTitleLeft);
    divTitleContainer.appendChild(divTitleRight);

    divCommentItem.appendChild(hr);
    divCommentItem.appendChild(divTitleContainer);
    divCommentItem.appendChild(pContent);
    divCommentList.appendChild(divCommentItem);

    if (comment.IMG_URL) {
      const img = document.createElement("img");
      img.src = comment.IMG_URL;
      divCommentList.appendChild(img);
    }

    // ✔️ click event handler
    spanComplete.addEventListener("click", (e) => {
      let today;
      if (e.target.parentElement.parentElement.parentElement.style.background === "rgb(255, 165, 0)") {
        e.target.parentElement.parentElement.parentElement.style.background = "white";
        today = "N";
      } else {
        e.target.parentElement.parentElement.parentElement.style.background = "rgb(255, 165, 0)";
        today = new Date().toISOString().substring(0, 10).replace(/-/g, "");
      }

      // 자신의 글일때, 완료 내역 DB저장 -
      // if (comment.USER_ID != G_USER_STATE.userId) {
      //   toggleComplete({ SEQ: todo.SEQ, COMPLETE_DATE: today });
      // }
    });

    // 🗑️ click event handler
    spanDelete.addEventListener("click", (e) => {
      if (!G_USER_STATE.isLogin) {
        alert("로그인이 필요한 서비스 입니다.");
        return;
      }

      if (comment.CREATE_USER != G_USER_STATE.userId) {
        alert("자신의 댓글만 삭제가능합니다.");
        return;
      }

      if (!confirm("삭제하시겠습니까?")) return;
      let seq = e.target.dataset.seq;
      saveComment([{ IUD_FLAG: "D", SEQ: seq }]);
    });
  });

  const taCONTENT = document.querySelector("#comment-CONTENT");
  const inputIMG_URL = document.querySelector("#comment-IMG_URL");
  taCONTENT.value = "";
  inputIMG_URL.value = "";

  const btnCommentSave = document.querySelector("#btn-comment-save");
  if (btnCommentSave.classList.contains("once1")) return; // 이벤트핸들러 중복등록 체크
  btnCommentSave.classList.add("once1");
  btnCommentSave.addEventListener("click", (e) => {
    if (!G_USER_STATE.isLogin) {
      alert("로그인이 필요한 서비스 입니다.");
      return;
    }

    if (taCONTENT.value.trim() === "") {
      alert("내용을 입력해 주세요.");
      taCONTENT.focus();
      return;
    }
    saveComment([{ IUD_FLAG: "I", PARENT_SEQ: gParentSeq, CONTENT: taCONTENT.value, IMG_URL: inputIMG_URL.value, USER_ID: G_USER_STATE.userId }]);
  });
};

/**
 * 댓글을 저장한다.
 * @param {object[]} objArr - 저장할 todo object 배열: [{},{},{}...]
 */
const saveComment = async (objArr) => {
  const createdRows = objArr.filter((v) => v.IUD_FLAG === "I");
  const updatedRows = objArr.filter((v) => v.IUD_FLAG === "U");
  const deletedRows = objArr.filter((v) => v.IUD_FLAG === "D");
  const saveJSON = { modifiedRows: { createdRows, updatedRows, deletedRows } };

  // save JSON 양식
  //
  // modifiedRows: {
  //       createdRows: [ {...},{...} ...  ],
  //       updatedRows: [ {...},{...} ...  ],
  //       deletedRows: [ {...},{...} ...  ]
  // }
  const res = await fetch(`${HOST_NAME}/paget3l4/save-comment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveJSON),
  });

  const resJSON = await res.json();
  fetchComment(gParentSeq).then(renderComment);
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderDetailPage(obj) {
  loadTemplatePage("#detail-page");
  history.pushState("detail-page", null, "index.html");

  document.querySelector("#detail-TITLE").textContent = obj.TITLE;
  document.querySelector("#detail-USER_NAME").textContent = obj.USER_NAME;
  document.querySelector("#detail-CREATE_DATE").textContent = obj.CREATE_DATE;
  if (obj.COMPLETE_DATE !== "N") {
    document.querySelector("#detail-CREATE_DATE").textContent += "(" + obj.COMPLETE_DATE.substring(2, 4) + "." + obj.COMPLETE_DATE.substring(4, 6) + "." + obj.COMPLETE_DATE.substring(6, 8) + ")";
  }
  //document.querySelector("#detail-COMPLETE_DATE").textContent = obj.COMPLETE_DATE;
  document.querySelector("#detail-CONTENT").textContent = obj.CONTENT;
  const img = document.querySelector("#detail-IMG_URL");

  if (obj.IMG_URL) {
    img.style.display = "block";
    img.src = obj.IMG_URL;
  } else {
    img.style.display = "none";
  }

  gParentSeq = obj.SEQ;
  fetchComment(gParentSeq).then(renderComment);
}

function renderWritePage(obj) {
  loadTemplatePage("#write-page");

  const inputSEQ = document.querySelector("input[name='SEQ']");
  const inputTITLE = document.querySelector("input[name='TITLE']");
  //const taCONTENT = document.querySelector("input[name='CONTENT']");
  const textareaCONTENT = document.querySelector("textarea[name='CONTENT']");
  const inputIMG_URL = document.querySelector("input[name='IMG_URL']");
  const inputUSER_ID = document.querySelector("input[name='USER_ID']");

  if (obj) {
    inputSEQ.value = obj.SEQ;
    inputTITLE.value = obj.TITLE;
    //taCONTENT.value = obj.CONTENT;
    textareaCONTENT.value = obj.CONTENT;
    inputIMG_URL.value = obj.IMG_URL;
    inputUSER_ID.value = obj.USER_ID;
  } else {
    inputSEQ.value = "";
    inputTITLE.value = "";
    //taCONTENT.value = "";
    textareaCONTENT.value = "";
    inputIMG_URL.value = "";
    inputUSER_ID.value = "";
  }

  const btnSave = document.querySelector("#btn-save");
  if (btnSave.classList.contains("once1")) return; // 이벤트핸들러 중복등록 체크
  btnSave.classList.add("once1");
  btnSave.addEventListener("click", (e) => {
    if (!G_USER_STATE.isLogin) {
      alert("로그인이 필요한 서비스 입니다.");
      return;
    }
    let iudFlag = inputSEQ.value > 0 ? "U" : "I";

    if (iudFlag === "U" && G_USER_STATE.userId !== document.querySelector("input[name='USER_ID']").value) {
      alert("자신의 글만 수정가능 합니다.");
      return;
    }
    if (inputTITLE.value.trim() === "") {
      alert("제목을 입력해 주세요.");
      inputTITLE.focus();
      return;
    }
    if (textareaCONTENT.value.trim() === "") {
      alert("내용을 입력해 주세요.");
      textareaCONTENT.focus();
      return;
    }

    saveData([{ IUD_FLAG: iudFlag, SEQ: inputSEQ.value, TITLE: inputTITLE.value, CONTENT: textareaCONTENT.value, IMG_URL: inputIMG_URL.value, USER_ID: G_USER_STATE.userId }]);
  });
}

function getCookie(name) {
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: "/",
    // 필요한 경우, 옵션 기본값을 설정할 수도 있습니다.
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function setDarkmode(mode) {
  const body = document.querySelector("body");
  const topDarkmode = document.querySelector("#top-darkmode");
  if (mode === "dark" || mode == undefined) {
    body.setAttribute("class", "dark-mode");
    topDarkmode.innerHTML = "☀️";
    setCookie("darkmode", "dark", { "max-age": 3600 });
  } else {
    body.removeAttribute("class");
    topDarkmode.innerHTML = "🌙";
    setCookie("darkmode", "light", { "max-age": 3600 });
  }
}

function loadTemplatePage(pageId) {
  var article = document.querySelector("article");
  removeAllChildNodes(article);
  var t = document.querySelector(pageId);
  var clone = document.importNode(t.content, true);
  article.appendChild(clone);
}

async function handleBtnLoginClick(e) {
  G_USER_STATE.isLogin = true;
  G_USER_STATE.userId = "testUser";
  G_USER_STATE.userName = "testUser";
  initPage();

  // const { isLoginOK, LOGIN_USER_NAME } = await ZnCommon.isLogin();
  // const inputUSER_ID = document.querySelector("input[name='USER_ID']");
  // const inputUSER_PW = document.querySelector("input[name='USER_PW']");

  // if (inputUSER_ID.value.trim() === "") {
  //   alert("아이디를 입력해 주세요.");
  //   inputUSER_ID.focus();
  //   return;
  // }
  // if (inputUSER_PW.value.trim() === "") {
  //   alert("패스워드를 입력해 주세요.");
  //   inputUSER_PW.focus();
  //   return;
  // }
  // if (!isLoginOK) {
  //   const loginRet = await ZnCommon.loginPw(inputUSER_ID.value, CryptoJS.SHA256(inputUSER_PW.value).toString().toUpperCase()); // 로그인 진행
  //   G_USER_STATE.isLogin = loginRet.isLoginOK;
  //   G_USER_STATE.userId = loginRet.LOGIN_USER_ID;
  //   G_USER_STATE.userName = loginRet.LOGIN_USER_NAME;
  //   if (loginRet.isLoginOK) {
  //     initPage();
  //   }
  // }
}

async function handleLogout() {
  if (!confirm("로그아웃 할까요?")) return;
  //const ret = await ZnCommon.logout();
  //if (JSON.parse(ret).RST_MSG === "저장성공") {
  G_USER_STATE.isLogin = false;
  G_USER_STATE.userId = "";
  G_USER_STATE.userName = "";
  initPage();
  //}
}

// 로그아웃, 로그인시 refresh
async function initPage() {
  G_USER_STATE.selectedTopMenu = "TODO";
  history.pushState(G_USER_STATE.selectedTopMenu, null, "index.html");

  const topBtnGoLogin = document.querySelector("#btn-go-login");
  fetchData("TODO").then((json) => renderData("TODO", json));
  if (G_USER_STATE.isLogin) {
    G_USER_STATE.isLogin = true;
    G_USER_STATE.userId = "testUser";
    G_USER_STATE.userName = "testUser";

    document.getElementById("top-login-user-name").innerHTML = G_USER_STATE.userName;
    topBtnGoLogin.textContent = "로그아웃";
  } else {
    G_USER_STATE.isLogin = false;
    G_USER_STATE.userId = "";
    G_USER_STATE.userName = "";

    document.getElementById("top-login-user-name").innerHTML = "";
    topBtnGoLogin.textContent = "로그인";
  }
}

function init() {
  const body = document.querySelector("body");
  const topTodo = document.querySelector("#top-todo");
  const topComplete = document.querySelector("#top-complete");
  const topNew = document.querySelector("#top-new");
  const topBtnGoLogin = document.querySelector("#btn-go-login");
  const topDarkmode = document.querySelector("#top-darkmode");

  topTodo.addEventListener("click", (e) => {
    G_USER_STATE.selectedTopMenu = "TODO";
    history.pushState(G_USER_STATE.selectedTopMenu, null, "index.html");
    fetchData("TODO").then((json) => renderData("TODO", json));
  });

  topComplete.addEventListener("click", (e) => {
    G_USER_STATE.selectedTopMenu = "COMPLETE";
    history.pushState(G_USER_STATE.selectedTopMenu, null, "index.html");
    fetchData("COMPLETE").then((json) => renderData("COMPLETE", json));
  });

  topNew.addEventListener("click", (e) => {
    renderWritePage();
  });

  topBtnGoLogin.addEventListener("click", (e) => {
    if (topBtnGoLogin.textContent === "로그아웃") {
      handleLogout();
      return;
    }

    loadTemplatePage("#login-page");
    const topBtnLogin = document.querySelector("#btn-login");

    document.querySelector("input[name='USER_ID']").focus();

    if (topBtnLogin.classList.contains("once1")) return; // 이벤트핸들러 중복등록 체크
    topBtnLogin.classList.add("once1");

    topBtnLogin.addEventListener("click", (e) => {
      handleBtnLoginClick();
    });

    document.querySelector("input[name='USER_PW']").addEventListener("keyup", function (ev) {
      if (ev.keyCode === 13) {
        topBtnLogin.click();
      }
    });

  });

  topDarkmode.addEventListener("click", (e) => {
    let mode = body.getAttribute("class", "dark-mode") === "dark-mode" ? "light" : "dark";
    setDarkmode(mode);
  });

  setDarkmode(getCookie("darkmode"));
  initPage();

  //뒤로가기 이벤트
  window.onpopstate = function (event) {
    let prevListPage = G_USER_STATE.selectedTopMenu || "TODO";
    fetchData(prevListPage).then((json) => renderData(prevListPage, json));
  };
}

init();
