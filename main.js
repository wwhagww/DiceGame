const {body} = document;
const $scoreBoard = document.getElementById("score-board");
const $turnCnt = document.getElementById("turn-cnt");
const $rollCnt = document.getElementById("roll-cnt");
const $diceContainer = document.getElementById("dice-container");
const $rollBtn = document.getElementById("roll-btn");

// 보드판 생성
const $fragB = document.createDocumentFragment();
const rows = [];
for (let i=0; i<6; i++) {
  const $tr = document.createElement("tr");
  rows.push($tr);
  $fragB.appendChild($tr);
}

const board = {};
const kinds = ["1", "2", "3", "4", "5", "6",
              "CH", "FH", "4K", "SS", "LS", "YC"];
kinds.forEach((kind, idx) => {
  const $tr = rows[idx % 6];
  const $tdKind = document.createElement("td");
  const $tdScore = document.createElement("td");
  $tdScore.classList.add("score");
  $tdKind.textContent = kind;
  $tdScore.id = kind;
  board[kind] = {
    idx,
    node: $tdScore
  };
  $tr.appendChild($tdKind);
  $tr.appendChild($tdScore);
});

const $lastRow = document.createElement("tr");
const lastRow = [
  document.createElement("td"),
  document.createElement("td"),
  document.createElement("td"),
  document.createElement("td")
];
lastRow[0].textContent = "+35";
lastRow[2].textContent = "Total";
const $bonusCalc = lastRow[1];
const $totalScore = lastRow[3];
lastRow.forEach($td => $lastRow.appendChild($td));
$fragB.appendChild($lastRow);
$scoreBoard.appendChild($fragB);


// 주사위 생성
const diceNodes = [];
const $fragD = document.createDocumentFragment();
for (let i=0; i<5; i++) {
  const $dice = document.createElement("div");
  $dice.classList.add("dice");
  $dice.id = String(i);
  
  diceNodes.push($dice);
  $fragD.appendChild($dice);
}
$diceContainer.appendChild($fragD);

// 변수 선언
const calcScore = {
  "1": () => sum(dices.filter(n => n == 1)),
  "2": () => sum(dices.filter(n => n == 2)),
  "3": () => sum(dices.filter(n => n == 3)),
  "4": () => sum(dices.filter(n => n == 4)),
  "5": () => sum(dices.filter(n => n == 5)),
  "6": () => sum(dices.filter(n => n == 6)),
  "CH": () => sum(dices),
  "FH": () => {
    const cnt = [0,0,0,0,0,0];
    dices.forEach(n => cnt[n-1]++);
    if (cnt.includes(2) && cnt.includes(3) || cnt.includes(5))
      return sum(dices);
    else return 0;
  },
  "4K": () => {
    const cnt = [0,0,0,0,0,0];
    dices.forEach(n => cnt[n-1]++);
    if (cnt.includes(4) || cnt.includes(5))
      return sum(dices);
    else return 0;
  },
  "SS": () => {
    const cnt = [0,0,0,0,0,0];
    dices.forEach(n => cnt[n-1]++);
    if (cnt.reduce((acc, cur) => cur > 0 || acc >= 4 ? acc+1 : 0, 0) >= 4)
      return 15;
    else return 0;
  },
  "LS": () => {
    const cnt = [0,0,0,0,0,0];
    dices.forEach(n => cnt[n-1]++);
    if (cnt.reduce((acc, cur) => cur > 0 || acc >= 5 ? acc+1 : 0, 0) >= 5)
      return 30;
    else return 0;
  },
  "YC": () => {
    const cnt = [0,0,0,0,0,0];
    dices.forEach(n => cnt[n-1]++);
    if (cnt.includes(5))
      return 50;
    else return 0;
  }
};
const scores = new Array(12).fill(null);
const dices = new Array(5).fill(null);
let turnCnt = 1;
let rollCnt = 0;
let bonus = false;
let phase = "wait" // wait <> rolling

// 함수 정의
function sum(arr) {
  return arr.reduce((acc, cur) => acc+cur, 0);
}
function drawDices() {
  for (let i=0; i<5; i++) {
    diceNodes[i].textContent = dices[i] !== null ? dices[i] : "?";
  }
}
function rollDices() {
  if (rollCnt >= 3) return;
  for (let i=0; i<5; i++) {
    if (diceNodes[i].classList.contains("fix")) continue;
    dices[i] = Math.floor(Math.random() * 6 + 1);
  }
  phase = "rolling";
  rollCnt++;
  $rollCnt.textContent = rollCnt;
  
  drawDices();
  drawBoard();
}
function toggleDice({target}) {
  if (phase !== "rolling") return;
  if (!target.matches(".dice")) return;
  const idx = Number(target.id);
  if (dices[idx] === null) return;
  
  target.classList.toggle("fix");
}
function drawBoard() {
  kinds.forEach((kind, idx) => {
    board[kind].node.textContent = (scores[idx] !== null ? scores[idx] 
    : rollCnt > 0 ? calcScore[kind]() 
    : "");
  });
  $bonusCalc.textContent = sum(scores.slice(0,6)) + "/63";
  $totalScore.textContent = sum(scores) + (bonus ? 35 : 0);
}
function writeScore({target}) {
  if (phase !== "rolling") return;
  if (!target.matches(".score")) return;
  const kind = target.id;
  const idx = board[kind].idx;
  if (scores[idx] !== null) return;
  
  scores[idx] = calcScore[kind]();
  if (sum(scores.slice(0,6)) >= 63) {
    bonus = true;
    $bonusCalc.className = "filled";
  }
  board[kind].node.classList.add("filled");
  
  for (let i=0; i<5; i++) {
    dices[i] = null;
    diceNodes[i].classList.remove("fix");
  }
  
  phase = "wait";
  rollCnt = 0;
  $rollCnt.textContent = rollCnt;
  turnCnt++;
  $turnCnt.textContent = turnCnt;
  
  drawBoard();
  drawDices();
  
  if (turnCnt > 12) {
    gameEnd();
  }
}
function drawRank() {
  const $ranking = document.getElementById("ranking");
  const $rankList = document.createElement("ol");
  $rankList.className = "rank-list";
  const rankInfo = JSON.parse(localStorage.getItem("ranking")) ?? [];
  for (const info of rankInfo) {
    const $li = document.createElement("li");
    $li.textContent = `${info.score} - ${info.name}`;
    $rankList.appendChild($li);
  }
  if ($ranking.firstElementChild) {
    $ranking.removeChild($ranking.firstElementChild);
  }
  $ranking.appendChild($rankList);
}
function gameEnd() {
  $totalScore.className = "filled";
  body.removeChild(document.getElementById("turn-indicator"));
  body.removeChild(document.getElementById("roll-indicator"));
  body.removeChild($diceContainer);
  body.removeChild($rollBtn);
  
  const ranking = JSON.parse(localStorage.getItem("ranking")) ?? [];
  const totalScore = sum(scores) + (bonus ? 35 : 0);
  if (ranking.length < 10 || totalScore > ranking[ranking.length-1].score) {
    let userName;
    do {
      userName = prompt("닉네임을 입력해주세요.");
    } while (!userName)
      
    ranking.push({
      name: userName,
      score: totalScore
    });
    ranking.sort((a, b) => b.score - a.score);
    if (ranking.length > 10) ranking.pop();
    localStorage.setItem("ranking", JSON.stringify(ranking));
  }
  drawRank();
}

// 초기화 및 이벤트 할당
$rollBtn.addEventListener("click", rollDices);
$diceContainer.addEventListener("click", toggleDice);
$scoreBoard.addEventListener("click", writeScore);
drawRank();
drawDices();