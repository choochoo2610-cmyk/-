// ===== 締め日設定 =====
const CLOSE_DAY = 20;

// targetMonth: "2026-02" など
function isInClosingMonth(dateStr, targetMonth) {
  const d = new Date(dateStr);
  const [y, m] = targetMonth.split("-").map(Number);

  // 前月21日 00:00
  const start = new Date(y, m - 2, CLOSE_DAY + 1, 0, 0, 0);
  // 当月20日 23:59
  const end = new Date(y, m - 1, CLOSE_DAY, 23, 59, 59);

  return d >= start && d <= end;
}

// ===== URLから user ID を取得 =====
const params = new URLSearchParams(location.search);
const userId = params.get("user");

if (!userId) {
  document.body.innerHTML = "ユーザー指定がありません";
  throw new Error("no user");
}

// ===== 今月 =====
const now = new Date();
const monthStr =
  now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

// ===== 時刻を分に =====
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ===== データ取得 =====
fetch("./timecard.json")
  .then(res => {
    if (!res.ok) throw new Error("JSONが見つかりません");
    return res.json();
  })
  .then(data => {
    const user = data.find(u => String(u.id) === userId);
    if (!user) {
      document.body.innerHTML = "該当する人が見つかりません";
      return;
    }

    let totalMin = 0;

    user.records.forEach(r => {
      if (!isInClosingMonth(r.date, monthStr)) return;
      const work =
        Math.max(0, toMin(r.end) - toMin(r.start) - (r.break || 0));
      totalMin += work;
    });

    document.getElementById("name").innerText = user.name;
    document.getElementById("total").innerText =
      (totalMin / 60).toFixed(2) + " 時間";
    document.getElementById("month").innerText =
      monthStr + " の合計勤務時間";
  })
  .catch(err => {
    document.body.innerHTML = "データを読み込めません";
    console.error(err);
  });
