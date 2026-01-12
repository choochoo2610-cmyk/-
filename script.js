let data = JSON.parse(localStorage.getItem("timecard") || "[]");

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

  u.records.push({
    date: date.value,
    start,
    end,
    memo: memo.value
  });

  u.history.push(`追加：${date.value} ${start}-${end}`);
  memo.value = "";
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

  let totalMin = 0;
  records.innerHTML = "<tr><th>日付</th><th>時間</th><th>メモ</th></tr>";

  u.records.forEach(r => {
    const s = toMin(r.start);
    const e = toMin(r.end);
    totalMin += (e - s);
    records.innerHTML +=
      `<tr><td>${r.date}</td><td>${r.start}〜${r.end}</td><td>${r.memo}</td></tr>`;
  });

  summary.innerText =
    `合計 ${(totalMin/60).toFixed(2)} 時間 ／ 概算 ¥${Math.floor(totalMin/60*u.wage)}`;

  history.innerHTML = u.history.map(h => `<li>${h}</li>`).join("");
}

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

render();
