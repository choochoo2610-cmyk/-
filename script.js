const CLOSE_DAY = 20;

/* ===== 安全な初期化 ===== */
let data = [];
try {
  data = JSON.parse(localStorage.getItem("timecard-data") || "[]");
} catch {
  data = [];
  localStorage.removeItem("timecard-data");
}

/* ===== 要素 ===== */
const userName = document.getElementById("userName");
const userWage = document.getElementById("userWage");
const userSelect = document.getElementById("userSelect");
const date = document.getElementById("date");
const start = document.getElementById("start");
const end = document.getElementById("end");
const breakTime = document.getElementById("breakTime");
const records = document.getElementById("records");
const summary = document.getElementById("summary");

/* ===== 共通 ===== */
function save() {
  localStorage.setItem("timecard-data", JSON.stringify(data));
}

function getUser() {
  return data.find(u => u.id == userSelect.value);
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/* ===== 人 ===== */
function addUser() {
  if (!userName.value || !userWage.value) {
    alert("名前と時給を入力してください");
    return;
  }

  data.push({
    id: Date.now(),
    name: userName.value,
    wage: Number(userWage.value),
    records: []
  });

  userName.value = "";
  userWage.value = "";
  save();
  render();
}

/* ===== 勤務 ===== */
function addRecord() {
  const u = getUser();
  if (!u || !date.value || !start.value || !end.value) return;

  u.records.push({
    date: date.value,
    start: start.value,
    end: end.value,
    break: Number(breakTime.value) || 0
  });

  save();
  render();
}

/* ===== 20日締め判定 ===== */
function inThisPeriod(d) {
  const now = new Date();
  const close = new Date(now.getFullYear(), now.getMonth(), CLOSE_DAY);
  const startP = new Date(close);
  startP.setMonth(startP.getMonth() - 1);
  startP.setDate(CLOSE_DAY + 1);
  return d >= startP && d <= close;
}

/* ===== 描画 ===== */
function render() {
  userSelect.innerHTML = data
    .map(u => `<option value="${u.id}">${u.name}</option>`)
    .join("");

  const u = getUser();
  if (!u) return;

  let totalMin = 0;
  records.innerHTML = "<tr><th>日付</th><th>時間</th></tr>";

  u.records.forEach(r => {
    const d = new Date(r.date);
    if (!inThisPeriod(d)) return;

    const m = Math.max(0, toMin(r.end) - toMin(r.start) - r.break);
    totalMin += m;

    records.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${(m / 60).toFixed(2)}</td>
      </tr>`;
  });

  summary.innerText =
    `合計 ${(totalMin / 60).toFixed(2)} 時間 ／ ¥${Math.floor((totalMin / 60) * u.wage)}`;
}

/* ===== 月1回確定 ===== */
function finalizeMonth() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "timecard.json";
  a.click();
}

window.onload = render;
