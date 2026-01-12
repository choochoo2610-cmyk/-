// ===== データ管理 =====
let data = JSON.parse(localStorage.getItem("timecard-data") || "[]");

// ===== DOM =====
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
const breakTime = document.getElementById("breakTime");
const viewUrl = document.getElementById("viewUrl");

// ===== 保存 =====
function save() {
  localStorage.setItem("timecard-data", JSON.stringify(data));
}

// ===== 選択中の人 =====
function getUser() {
  return data.find(u => u.id == userSelect.value);
}

// ===== 履歴追加 =====
function addHistory(text) {
  const u = getUser();
  if (!u) return;
  u.history.push(`${new Date().toLocaleString()}：${text}`);
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
    addHistory(`名前変更：${u.name} → ${newName}`);
    u.name = newName;
  }
  if (newWage && Number(newWage) !== u.wage) {
    addHistory(`時給変更：¥${u.wage} → ¥${newWage}`);
    u.wage = Number(newWage);
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

// ===== 時刻処理 =====
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ===== 勤務追加 =====
function addRecord() {
  const u = getUser();
  if (!u || !date.value || !start.value || !end.value) return;

  const r = {
    date: date.value,
    start: start.value,
    end: end.value,
    break: Number(breakTime.value) || 0,
    memo: memo.value
  };

  u.records.push(r);
  addHistory(`勤務追加：${r.date} ${r.start}〜${r.end}（休憩${r.break}分）`);

  memo.value = "";
  save();
  render();
}

// ===== 勤務削除 =====
function deleteRecord(i) {
  const u = getUser();
  if (!u) return;

  const r = u.records[i];
  if (!confirm(`${r.date} の勤務を削除しますか？`)) return;

  addHistory(`勤務削除：${r.date} ${r.start}〜${r.end}`);
  u.records.splice(i, 1);

  save();
  render();
}

// ===== 勤務編集 =====
function editRecord(i) {
  const u = getUser();
  if (!u) return;

  const r = u.records[i];

  const nd = prompt("日付", r.date);
  const ns = prompt("出勤", r.start);
  const ne = prompt("退勤", r.end);
  const nb = prompt("休憩（分）", r.break);

  if (!nd || !ns || !ne) return;

  addHistory(
    `勤務修正：${r.date} ${r.start}〜${r.end} → ${nd} ${ns}〜${ne}`
  );

  r.date = nd;
  r.start = ns;
  r.end = ne;
  r.break = Number(nb) || 0;

  save();
  render();
}

// ===== 描画 =====
function render() {
  const selectedId = userSelect.value;

  userSelect.innerHTML = data
    .map(u => `<option value="${u.id}">${u.name}（¥${u.wage}）</option>`)
    .join("");

  if (selectedId) userSelect.value = selectedId;

  const u = getUser();
  if (!u) {
    records.innerHTML = "";
    summary.innerText = "";
    history.innerHTML = "";
    viewUrl.innerText = "";
    return;
  }

  let totalMin = 0;
  const month = monthSelect.value;

  records.innerHTML =
    "<tr><th>日付</th><th>時間</th><th>操作</th></tr>";

  u.records.forEach((r, i) => {
    if (month && !r.date.startsWith(month)) return;

    const m = Math.max(0, toMin(r.end) - toMin(r.start) - (r.break || 0));
    totalMin += m;

    records.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${(m / 60).toFixed(2)} 時間</td>
        <td>
          <button onclick="editRecord(${i})">編集</button>
          <button onclick="deleteRecord(${i})">削除</button>
        </td>
      </tr>`;
  });

  summary.innerText =
    `合計 ${(totalMin / 60).toFixed(2)} 時間 ／ ¥${Math.floor(
      (totalMin / 60) * u.wage
    )}`;

  history.innerHTML = u.history
    .slice(-30)
    .map(h => `<li>${h}</li>`)
    .join("");

  const base = location.origin + location.pathname.replace(/\/[^/]*$/, "/");
  viewUrl.innerText = `${base}view.html?user=${u.id}`;
}

// ===== 初期化 =====
window.onload = render;
