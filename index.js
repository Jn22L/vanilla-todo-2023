const fetchData = async () => {
  const url = `https://jsonplaceholder.typicode.com/posts`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const renderData = (todos) => {
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
    //pContent.textContent = todo.content;
    pContent.textContent = todo.body;

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
      console.log("update");
    });
    spanDelete.addEventListener("click", (event) => {
      console.log("delete");
    });
  });
};

function init() {
  fetchData().then(renderData);
}

init();
