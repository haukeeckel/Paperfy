let isGameMaster = document.querySelector("#isGameMaster");
let gameMasterExp = document.querySelector("#gameMasterExp");
let gameMasterLabel = document.querySelector("#gameMasterLabel");

document.addEventListener("DOMContentLoaded", () => {
  if (!isGameMaster.checked) {
    gameMasterExp.style.display = "none";
    gameMasterLabel.style.display = "none";
  } else {
    gameMasterExp.style.display = "block";
    gameMasterLabel.style.display = "block";
  }
});

isGameMaster.addEventListener("click", () => {
  if (isGameMaster.checked) {
    gameMasterExp.style.display = "block";
    gameMasterLabel.style.display = "block";
    gameMasterExp.value = "low";
  } else {
    gameMasterExp.style.display = "none";
    gameMasterLabel.style.display = "none";
    gameMasterExp.value = "none";
  }
});
