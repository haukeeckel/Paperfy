let isGameMaster = document.querySelector("#isGameMaster");
let gameMasterExp = document.querySelector("#gameMasterExp");
let gameMasterLabel = document.querySelector("#gameMasterLabel");

isGameMaster.addEventListener("click", () => {
  if (isGameMaster.checked) {
    gameMasterExp.style.display = "block";
    gameMasterLabel.style.display = "block";
  } else {
    gameMasterExp.style.display = "none";
    gameMasterLabel.style.display = "none";
    gameMasterExp.value = "NONE";
  }
});
