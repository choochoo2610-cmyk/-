let data = JSON.parse(localStorage.getItem("timecard") || "[]");
let editIndex = null;

const userSelect = document.getElementById("userSelect");
const monthSelect = document.getElementById("monthSelect");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

monthSelect.value = new Date().toISOString().slice(0, 7);
monthSelect.onchange = render;

function save() {
  localStorage.setItem("timecard", JSON.stringify(data));
}

function getUser() {
  return data.find(u => u.id == userSelect.value);
}

/* ===== 人の管理 ===== */

function addUser() {
  if (!userName.value || !userWage.value) return;

  data.push({
    id: Date.now(),
    name: userName.value,
    wage: Number(userWage.value),
    records: [],
    history: []
  });

  userName.value = "";
  userWage.value = "";
  save();
  render();
}

function editUser() {
  const u = getUser();
  if (!u) return;

  const newName = prompt("名前を編集", u.name);
  if (newName === null) return;

  const newWage = prompt("時給を編集", u.wage);
  if (newWage === null) return;

  u.name = newName;
  u.wage = Number(newWage);
  u.history.push(`人情報編集：${newName}（¥${newWage}）`);

  save();
  render();
}

function deleteUser() {
  const u = getUser();
  if (!u) return;

  if (!confirm(`${u.name} を削除しますか？（全データ削除）`)) return;

  data = data.filter(user => user.id !== u.id);
  save();
  render();
}

/* ===== 勤務管理 ===== */

function addRecord() {
  const u = getUser();
  if (!u) return;

  const start = roundTime(startInput.value, round.value);
  const end = roundTime(endInput.value, round.value);

  const record = {
    date: date.value,
    start,
    end,
    memo: memo.value
  };

  if (editIndex !== null) {
    u.records[editIndex] = record;
    u.history.push(`勤務編集：${date.value}`);
    editIndex = null;
  } else {
    u.records.push(record);
    u.history.push(`勤務追加：${date.value}`);
  }

  memo.value = "";
  save();
  render();
}

function editRecord(i) {
  const r = getUser().records[i];
  date.value = r.date;
  startInput.value = r.start;
  endInput.value = r.end;
  memo.value = r.memo;
  editIndex = i;
}

function deleteRecord(i) {
  const u = getUser();
  if (!confirm("この勤務を削除しますか？")) return;

  u.history.push(`勤務削除：${u.records[i].date}`);
  u.records.splice(i, 1);
  save();
  render();
}

/* ===== 共通 ===== */

function roundTime(time, unit) {
  let [h, m] = time.split(":").map(Number);
  m = Math.round(m / unit) * unit;
  if (m === 60) { h++; m = 0; }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function render() {
  userSelect.innerHTML = data.map(u =>
    `<option value="${u.id}">${u.name}（¥${u.wage}）</option>`
  ).join("");

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
    "<tr><th>日付</th><th>時間</th><th>メモ</th><th>操作</th></tr>";

  u.records.forEach((r, i) => {
    if (!r.date.startsWith(month)) return;

    const s = toMin(r.start);
    const e = toMin(r.end);
    totalMin += (e - s);

    records.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${r.start}〜${r.end}</td>
        <td>${r.memo}</td>
        <td>
          <button class="edit" onclick="editRecord(${i})">編集</button>
          <button class="delete" onclick="deleteRecord(${i})">削除</button>
        </td>
      </tr>
    `;
  });

  summary.innerText =
    `合計 ${(totalMin / 60).toFixed(2)} 時間 ／ 概算 ¥${Math.floor(totalMin / 60 * u.wage)}`;

  history.innerHTML =
    u.history.slice(-10).map(h => `<li>${h}</li>`).join("");
}

render();
