let data = JSON.parse(localStorage.getItem("timecard") || "[]");
let editIndex = null;

const monthSelect = document.getElementById("monthSelect");
monthSelect.value = new Date().toISOString().slice(0,7);

function save() {
  localStorage.setItem("timecard", JSON.stringify(data));
}

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
    u.history.push(`編集：${date.value}`);
    editIndex = null;
  } else {
    u.records.push(record);
    u.history.push(`追加：${date.value}`);
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
  if (!confirm("削除しますか？")) return;
  u.history.push(`削除：${u.records[i].date}`);
  u.records.splice(i, 1);
  save();
  render();
}

function roundTime(time, unit) {
  let [h, m] = time.split(":").map(Number);
  m = Math.round(m / unit) * unit;
  if (m === 60) { h++; m = 0; }
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function getUser() {
  return data.find(u => u.id == userSelect.value);
}

function toMin(t) {
  let [h,m]=t.split(":").map(Number);
  return h*60+m;
}

function render() {
  userSelect.innerHTML = data.map(u =>
    `<option value="${u.id}">${u.name}（¥${u.wage}）</option>`
  ).join("");

  const u = getUser();
  if (!u) return;

  const targetMonth = monthSelect.value;
  let totalMin = 0;

  records.innerHTML =
    "<tr><th>日付</th><th>時間</th><th>メモ</th><th>操作</th></tr>";

  u.records.forEach((r, i) => {
    if (!r.date.startsWith(targetMonth)) return;

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
      </tr>`;
  });

  summary.innerText =
    `合計 ${(totalMin/60).toFixed(2)} 時間 ／ 概算 ¥${Math.floor(totalMin/60*u.wage)}`;

  history.innerHTML = u.history.slice(-10).map(h => `<li>${h}</li>`).join("");
}

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

render();
