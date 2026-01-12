fetch("./timecard.json")
  .then(r => r.json())
  .then(data => {
    const u = data[0];
    let total = 0;

    u.records.forEach(r => {
      const s = r.start.split(":");
      const e = r.end.split(":");
      total += (e[0]*60+ +e[1]) - (s[0]*60+ +s[1]) - (r.break||0);
    });

    document.getElementById("name").innerText = u.name;
    document.getElementById("total").innerText =
      (total / 60).toFixed(2) + " 時間";
  });
