const params = new URLSearchParams(location.search);
const userId = params.get("user");

fetch("./timecard.json")
  .then(r => r.json())
  .then(data => {
    const u = data.find(x => String(x.id) === userId);
    if (!u) return;

    const now = new Date();
    const month =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

    let total = 0;
    u.records.forEach(r => {
      if (!r.date.startsWith(month)) return;
      total +=
        (parseInt(r.end.slice(0,2))*60+parseInt(r.end.slice(3))) -
        (parseInt(r.start.slice(0,2))*60+parseInt(r.start.slice(3))) -
        r.break;
    });

    document.getElementById("name").innerText = u.name;
    document.getElementById("month").innerText = month;
    document.getElementById("total").innerText =
      (total/60).toFixed(2) + " 時間";
  });
