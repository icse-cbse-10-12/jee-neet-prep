(() => {
  const display = document.querySelector("#timerDisplay");
  const progress = document.querySelector("#timerProgress");
  const status = document.querySelector("#timerStatus");
  const start = document.querySelector("#timerStart");
  const reset = document.querySelector("#timerReset");
  const modes = [...document.querySelectorAll(".timer-mode")];
  if (!display || !progress || !status || !start || !reset || !modes.length) return;
  let total = 25 * 60, remaining = total, interval = null, running = false;
  function paint() {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
    const seconds = (remaining % 60).toString().padStart(2, "0");
    display.textContent = minutes + ":" + seconds;
    display.setAttribute("aria-label", minutes + " minutes " + seconds + " seconds remaining");
    progress.style.width = (total ? remaining / total * 100 : 0) + "%";
    document.title = (running ? display.textContent + " · " : "") + "JEE & NEET Study Hub | MasterClass";
  }
  function stop() {
    if (interval !== null) window.clearInterval(interval);
    interval = null; running = false; start.textContent = "Resume focus";
  }
  function tick() {
    if (remaining > 0) remaining -= 1;
    paint();
    if (remaining === 0) {
      stop(); start.textContent = "Start again";
      status.textContent = "Session complete! Take a short stretch, then choose your next task.";
      display.setAttribute("aria-label", "Session complete");
    }
  }
  modes.forEach(button => button.addEventListener("click", () => {
    stop(); total = Number(button.dataset.minutes) * 60; remaining = total;
    modes.forEach(mode => {
      const active = mode === button;
      mode.classList.toggle("active", active);
      mode.setAttribute("aria-pressed", String(active));
    });
    start.textContent = "Start " + (total === 300 ? "break" : "focus");
    status.textContent = total === 300 ? "A little rest helps you return refreshed." : "Ready when you are. You can pause any time.";
    paint();
  }));
  start.addEventListener("click", () => {
    if (running) {
      stop(); status.textContent = "Paused. Resume whenever you're ready."; return;
    }
    if (remaining === 0) remaining = total;
    running = true; start.textContent = "Pause";
    status.textContent = total === 300 ? "Break time. Step away from the screen if you can." : "Focus on just one task until the timer ends.";
    interval = window.setInterval(tick, 1000); paint();
  });
  reset.addEventListener("click", () => {
    stop(); remaining = total;
    start.textContent = "Start " + (total === 300 ? "break" : "focus");
    status.textContent = "Timer reset. Ready when you are."; paint();
  });
  paint();
})();