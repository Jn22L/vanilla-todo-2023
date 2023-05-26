//const HOST_NAME = ZnCommon.getHostName();
const HOST_NAME = "http://localhost:8080";

/**
 * todo 목록을 조회한다.
 * @param {string} opt - TODO:할일, COMPLETE:완료
 * @returns {promise([JSON array])} data - 조회된 todo 목록
 */
const fetchData = async (opt) => {
  let completeYN = opt === "TODO" ? "N" : "Y";
  const url = `${HOST_NAME}/paget3l4/select-hjboard?SEQ=&COMPLETE_YN=${completeYN}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * todo 목록을 렌더링한다.
 * @param {object} todos - 할일목록
 */
const renderData = (todos) => {
  const divList = document.querySelector(".list-bg");
  removeAllChildNodes(divList);
  document.querySelector("#write-form").style.display = "none";
  document.querySelector("#detail-form").style.display = "none";

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

    divListItem.setAttribute("class", "list-item");
    divListItem.setAttribute("data-seq", todo.SEQ);
    divTitleContainer.setAttribute("class", "list-item-title-container");
    h4Title.textContent = todo.TITLE;
    spanComplete.textContent = "✔️";
    spanEdit.textContent = "✏️";
    spanDelete.textContent = "🗑️";
    pContent.textContent = todo.CONTENT;

    divTitleLeft.appendChild(h4Title);
    divTitleRight.appendChild(spanComplete);
    divTitleRight.appendChild(spanEdit);
    divTitleRight.appendChild(spanDelete);
    divTitleContainer.appendChild(divTitleLeft);
    divTitleContainer.appendChild(divTitleRight);
    divListItem.appendChild(divTitleContainer);
    divListItem.appendChild(pContent);
    divList.appendChild(divListItem);

    if (todo.COMPLETE_DATE !== "N") {
      divListItem.style.background = "rgb(255, 165, 0)";
    }

    divTitleLeft.addEventListener("click", () => {
      renderDetailPage({ SEQ: todo.SEQ, TITLE: todo.TITLE, CONTENT: todo.CONTENT });
    });

    spanComplete.addEventListener("click", (e) => {
      if (e.target.parentElement.parentElement.parentElement.style.background === "rgb(255, 165, 0)") {
        e.target.parentElement.parentElement.parentElement.style.background = "white";
      } else {
        e.target.parentElement.parentElement.parentElement.style.background = "rgb(255, 165, 0)";
      }
    });

    spanEdit.addEventListener("click", (event) => {
      renderWritePage({ SEQ: todo.SEQ, TITLE: todo.TITLE, CONTENT: todo.CONTENT });
    });

    spanDelete.addEventListener("click", (e) => {
      if (!confirm("삭제하시겠습니까?")) return;
      let seq = e.target.parentElement.parentElement.parentElement.dataset.seq;
      saveData([{ IUD_FLAG: "D", SEQ: seq }]);
    });
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
  const res = await fetch(`${HOST_NAME}/paget3l4/save-hjboard`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveJSON),
  });

  const resJSON = await res.json();
  fetchData("TODO").then(renderData);
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderDetailPage(obj) {
  removeAllChildNodes(document.querySelector(".list-bg"));
  document.querySelector("#write-form").style.display = "none";
  document.querySelector("#detail-form").style.display = "block";

  document.querySelector("#detail-SEQ").textContent = obj.SEQ;
  document.querySelector("#detail-TITLE").textContent = obj.TITLE;
  document.querySelector("#detail-CONTENT").textContent = obj.CONTENT;
}

function renderWritePage(obj) {
  removeAllChildNodes(document.querySelector(".list-bg"));
  document.querySelector("#write-form").style.display = "block";

  if (obj) {
    document.querySelector("input[name='SEQ']").value = obj.SEQ;
    document.querySelector("input[name='TITLE']").value = obj.TITLE;
    document.querySelector("input[name='CONTENT']").value = obj.CONTENT;
  } else {
    document.querySelector("input[name='SEQ']").value = "";
    document.querySelector("input[name='TITLE']").value = "";
    document.querySelector("input[name='CONTENT']").value = "";
  }

  const btnSave = document.querySelector("#btn-save");
  if (btnSave.classList.contains("once1")) return; // 이벤트핸들러 중복등록 체크
  btnSave.classList.add("once1");
  btnSave.addEventListener("click", (e) => {
    const TITLE = document.querySelector("input[name='TITLE']").value;
    const CONTENT = document.querySelector("input[name='CONTENT']").value;
    const createdRows = [{ IUD_FLAG: "I", TITLE, CONTENT }];

    saveData(createdRows);
  });
}

function init() {
  const topTodo = document.querySelector("#top-todo");
  const topComplete = document.querySelector("#top-complete");
  const topNew = document.querySelector("#top-new");

  topTodo.addEventListener("click", (event) => {
    fetchData("TODO").then(renderData);
  });

  topComplete.addEventListener("click", (event) => {
    fetchData("COMPLETE").then(renderData);
  });

  topNew.addEventListener("click", (event) => {
    renderWritePage();
  });

  topTodo.click();
}

init();
