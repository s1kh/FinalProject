const START = 100;
let balance = START;
let mode = "vulnerable";
let locked = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const balanceEl = document.getElementById("balance");
const result = document.getElementById("result");
const btnVuln = document.getElementById("btn-vuln");
const btnFixed = document.getElementById("btn-fixed");
const runButtons = document.querySelectorAll("button[data-n]");

async function withdrawVulnerable(amount, id) {
  if (balance >= amount) {
    await sleep(100);
    balance -= amount;
    return "Request " + id + ": OK, withdrew " + amount;
  }
  return "Request " + id + ": Rejected, not enough money";
}

async function withdrawFixed(amount, id) {
  while (locked) await sleep(10);
  locked = true;
  try {
    if (balance >= amount) {
      await sleep(100);
      balance -= amount;
      return "Request " + id + ": OK, withdrew " + amount;
    }
    return "Request " + id + ": Rejected, not enough money";
  } finally {
    locked = false;
  }
}

function showBalance() {
  balanceEl.textContent = "Balance: " + balance;
  balanceEl.classList.toggle("negative", balance < 0);
}

function setMode(newMode) {
  mode = newMode;
  btnVuln.classList.toggle("active", newMode === "vulnerable");
  btnFixed.classList.toggle("active", newMode === "fixed");
  balance = START;
  locked = false;
  showBalance();
  result.className = "result";
  result.textContent = "Press a button.";
}

btnVuln.onclick = () => setMode("vulnerable");
btnFixed.onclick = () => setMode("fixed");

runButtons.forEach(btn => {
  btn.onclick = async () => {
    const n = Number(btn.dataset.n);

    runButtons.forEach(b => b.disabled = true);
    balance = START;
    locked = false;
    showBalance();
    result.className = "result";
    result.textContent = "Sending " + n + " request(s)...";

    const fn = mode === "vulnerable" ? withdrawVulnerable : withdrawFixed;
    const requests = Array.from({ length: n }, (_, i) => fn(100, i + 1));
    const logs = await Promise.all(requests);

    showBalance();

    const text = logs.join("\n") + "\n\nFinal balance: " + balance;
    if (balance < 0) {
      result.className = "result leak";
      result.textContent = "RACE! More money left the account than it had.\n" + text;
    } else {
      result.className = "result safe";
      result.textContent = "Safe. Only one withdrawal succeeded.\n" + text;
    }

    runButtons.forEach(b => b.disabled = false);
  };
});