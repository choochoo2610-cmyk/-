// ===== データ管理 =====
let data = JSON.parse(localStorage.getItem("timecard-data") || "[]");

const userName = document.getElementById("userName");
const userWage = document.getElementById("userWage");
const userSelect = document.getElementById("userSelect");
const monthSelect = document.getElementById("monthSelect");
const records = document.getElementById("records");
const summary = document.getElementById("summary");
const history = document.getElementById("history");
const date = document.getElementById("date");
const start = document.getElementById("start");
const end = document.getElementById("end");
const memo = document.getElementById("memo");

function save() {
  localStorage.setItem("timecard-data", JSON.stringify(data));
}

function getUser() {
  return data.find(u => u.id == userSelect.value);
}

// ===== 履歴 =====
function addHistory(text) {
  const u = getUser();
  if (!u) return;
  const t = new Date().toLocaleString();
  u.history.push(`${t}：${text}`);
}

// ===== 人管理 =====
function addUser() {
  if (!userName.value || !userWage.value) return;

  data.push({
    id: Date.now(),
    name: userName.value,
    wage: Number(userWage.value),
    records: [],
    history: [`${new Date().toLocaleString()}：人を追加`]
  });

  userName.value = "";
  userWage.value = "";
  save();
  render();
}

function editUser() {
  const u = getUser();
  if (!u) return;

  const newName = prompt("名前", u.name);
  const newWage = prompt("時給", u.wage);

  if (newName && newName !== u.name) {
    u.name = newName;
    addHistory(`名前を「${newName}」に変更`);
  }
  if (newWage && Number(newWage) !== u.wage) {
    u.wage = Number(newWage);
    addHistory(`時給を ¥${newWage} に変更`);
  }

  save();
  render();
}

function deleteUser() {
  const u = getUser();
  if (!u) return;
  if (!confirm(`${u.name} を削除しますか？`)) return;

  data = data.filter(x => x.id !== u.id);
  save();
  render();
}

// ===== 勤務 =====
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addRecord() {
  const u = getUser();
  if (!u) return;

const record = {
  date: date.value,
  start: start.value,
  end: end.value,
  break: Number(breakTime.value) || 0,
  memo: memo.value
};

 u.records.push(record);
addHistory(`${record.date} 勤務追加（休憩 ${record.break} 分）`);

  memo.value = "";
  save();
  render();
}
const breakTime = document.getElementById("breakTime");

function deleteRecord(i) {
  const u = getUser();
  if (!u) return;

  addHistory(`${u.records[i].date} の勤務を削除`);
  u.records.splice(i, 1);

  save();
  render();
}

// ===== 描画 =====
function render() {
  const selectedId = userSelect.value;

  userSelect.innerHTML = data
    .map(u => `<option value="${u.id}">${u.name}（¥${u.wage}）</option>`)
    .join("");

  if (selectedId && data.some(u => u.id == selectedId)) {
    userSelect.value = selectedId;
  }

  const u = getUser();
  if (!u) {
    records.innerHTML = "";
    summary.innerText = "";
    history.innerHTML = "";
    return;
  }

  const month = monthSelect.value;
  let totalMin = 0;

  records.innerHTML =
  "<tr><th>日付</th><th>時間</th><th>休憩</th><th>メモ</th><th>操作</th></tr>";

  u.records.forEach((r, i) => {
    if (month && !r.date.startsWith(month)) return;

    const s = toMin(r.start);
const e = toMin(r.end);
const workMin = Math.max(0, (e - s) - (r.break || 0));
totalMin += workMin;
    
    records.innerHTML += `
  <tr>
    <td>${r.date}</td>
    <td>${r.start}〜${r.end}</td>
    <td>${r.break || 0}分</td>
    <td>${r.memo}</td>
    <td>
      <button onclick="deleteRecord(${i})">削除</button>
    </td>
  </tr>
`;
  });

  summary.innerText =
    `合計 ${(totalMin / 60).toFixed(2)} 時間 ／ 概算 ¥${Math.floor(
      (totalMin / 60) * u.wage
    )}`;

  history.innerHTML = u.history
    .slice(-20)
    .map(h => `<li>${h}</li>`)
    .join("");
}

// ===== 初期化 =====
window.onload = () => {
  render();
};
// ===== 閲覧用データ出力 =====
function exportData() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "timecard.json";
  a.click();
}
