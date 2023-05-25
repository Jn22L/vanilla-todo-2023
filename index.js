function init() {
  const todos = [
    { title: "종합소득세 신고", content: "5월말까지 신고하기" },
    { title: "전기세 납부", content: "납부기한 5일" },
    { title: "등산", content: "주말에" },
  ];

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

    divListItem.setAttribute("class", "list-item");
    divTitleContainer.setAttribute("class", "list-item-title-container");
    h4Title.textContent = todo.title;
    spanComplete.textContent = "✔️";
    spanEdit.textContent = "✏️";
    spanDelete.textContent = "🗑️";
    pContent.textContent = todo.content;

    divTitleLeft.appendChild(h4Title);
    divTitleRight.appendChild(spanComplete);
    divTitleRight.appendChild(spanEdit);
    divTitleRight.appendChild(spanDelete);
    divTitleContainer.appendChild(divTitleLeft);
    divTitleContainer.appendChild(divTitleRight);
    divListItem.appendChild(divTitleContainer);
    divListItem.appendChild(pContent);
    divList.appendChild(divListItem);

    spanComplete.addEventListener("click", (e) => {
      if (e.target.parentElement.parentElement.parentElement.style.background === "rgb(255, 165, 0)") {
        e.target.parentElement.parentElement.parentElement.style.background = "white";
      } else {
        e.target.parentElement.parentElement.parentElement.style.background = "rgb(255, 165, 0)";
      }
    });
    spanEdit.addEventListener("click", (event) => {
      console.log("수정");
    });
    spanDelete.addEventListener("click", (event) => {
      console.log("삭제");
    });
  });
}

init();
