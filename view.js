const userSelect = document.getElementById("userSelect");
const monthSelect = document.getElementById("monthSelect");
const records = document.getElementById("records");
const summary = document.getElementById("summary");

let data = [];

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// データ読み込み
fetch("./timecard.json")
  .then(r => r.json())
  .then(d => {
    data = d;
    renderUsers();
  });

function renderUsers() {
  userSelect.innerHTML = data
    .map(u => `<option value="${u.id}">${u.name}</option>`)
    .join("");
  render();
}

userSelect.onchange = render;
monthSelect.onchange = render;

function render() {
  const u = data.find(x => x.id == userSelect.value);
  if (!u) return;

  const month = monthSelect.value;
  let totalMin = 0;

  records.innerHTML =
    "<tr><th>日付</th><th>勤務時間</th></tr>";

  u.records.forEach(r => {
    if (month && !r.date.startsWith(month)) return;

    const s = toMin(r.start);
    const e = toMin(r.end);
    const workMin = Math.max(0, (e - s) - (r.break || 0));

    totalMin += workMin;

    records.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${(workMin / 60).toFixed(2)} 時間</td>
      </tr>
    `;
  });

  summary.innerText = `${(totalMin / 60).toFixed(2)} 時間`;
}
