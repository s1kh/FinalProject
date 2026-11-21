const invoices = {
  1001: { owner: "alice", total: "$50",  item: "Notebook" },
  1002: { owner: "bob",   total: "$75",  item: "Headphones" },
  1003: { owner: "carol", total: "$120", item: "Keyboard" }
};

const currentUser = "alice";
let mode = "vulnerable";

function vulnerableGet(id) {
  return invoices[id];
}

function fixedGet(id, user) {
  const inv = invoices[id];
  if (!inv || inv.owner !== user) return null;
  return inv;
}

const urlbar = document.getElementById("urlbar");
const result = document.getElementById("result");
const btnVuln = document.getElementById("btn-vuln");
const btnFixed = document.getElementById("btn-fixed");

function setMode(newMode) {
  mode = newMode;
  btnVuln.classList.toggle("active", newMode === "vulnerable");
  btnFixed.classList.toggle("active", newMode === "fixed");
  urlbar.textContent = "/invoice?id=...";
  result.className = "result";
  result.textContent = "Press a button.";
}

btnVuln.onclick = () => setMode("vulnerable");
btnFixed.onclick = () => setMode("fixed");

document.querySelectorAll("button[data-id]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.id;
    urlbar.textContent = "/invoice?id=" + id;

    const inv = mode === "vulnerable"
      ? vulnerableGet(id)
      : fixedGet(id, currentUser);

    if (!inv) {
      result.className = "result blocked";
      result.textContent = "403 Forbidden\nThis invoice is not yours.";
    } else if (inv.owner === currentUser) {
      result.className = "result safe";
      result.textContent = "Invoice " + id + "\nOwner: " + inv.owner +
        "\nItem: " + inv.item + "\nTotal: " + inv.total;
    } else {
      result.className = "result leak";
      result.textContent = "LEAK! You read another user's data.\nOwner: " +
        inv.owner + "\nItem: " + inv.item + "\nTotal: " + inv.total;
    }
  };
});