// === CONFIG ===
const API_URL = "https://script.google.com/macros/s/AKfycbwoAX6tK9-eU3r2ZyL5sxgD5UbsTEs7o9eX1DrGXbRC8ZShCTWa4ipHM37UeiDOkXdy9A/exec";
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfe5jqsBh3dUHOZ3qFTkzzR3kOl3wo8WaMQcDo4M_Uw5V2krA/formResponse";
const ENTRY_ID_DATE = "entry.442057249";
const ENTRY_ID_AMOUNT = "entry.1545306348";
const ENTRY_ID_MESSAGE = "entry.445234516";

// === ELEMENTS ===
const form = document.getElementById("expenseForm");
const monthSelect = document.getElementById("monthSelect");
const loadDataBtn = document.getElementById("loadDataBtn");
const expenseDataDiv = document.getElementById("expenseData");
const totalDisplay = document.getElementById("totalDisplay");

// === SERVICE WORKER ===
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered successfully"))
    .catch(err => console.error("❌ SW registration failed:", err));
}

// === ADD EXPENSE ===
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    date: form.date.value,
    amount: form.amount.value,
    desc: form.desc.value
  };

  if (parseFloat(data.amount) < 0) {
    alert("Amount cannot be negative.");
    return;
  }

  console.log("📝 Submitting Expense:", data);

  if (navigator.onLine) {
    submitToGoogle(data);
  } else {
    saveOffline(data);
    alert("Saved offline. Will sync when online.");
  }

  form.reset();
});

function submitToGoogle(data) {
  console.log("📤 Sending to Google Form...");
  const fd = new FormData();
  fd.append(ENTRY_ID_DATE, data.date);
  fd.append(ENTRY_ID_AMOUNT, data.amount);
  fd.append(ENTRY_ID_MESSAGE, data.desc);

  fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd })
    .then(() => console.log("✅ Submitted successfully!"))
    .catch(err => console.error("❌ Submit failed:", err));
}

function saveOffline(data) {
  let entries = JSON.parse(localStorage.getItem("offlineEntries") || "[]");
  entries.push(data);
  localStorage.setItem("offlineEntries", JSON.stringify(entries));
}

document.getElementById("syncBtn").addEventListener("click", syncOfflineEntries);
window.addEventListener("online", syncOfflineEntries);

function syncOfflineEntries() {
  const entries = JSON.parse(localStorage.getItem("offlineEntries") || "[]");
  entries.forEach(submitToGoogle);
  if (entries.length > 0) {
    alert("Offline entries synced!");
    localStorage.removeItem("offlineEntries");
  }
}

// === FETCH EXPENSES ===
async function loadMonths() {
  console.log("📡 Fetching available months...");
  try {
    const res = await fetch(`${API_URL}?action=getMonths`);
    const json = await res.json();
    monthSelect.innerHTML = "";
    json.months.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      monthSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Failed to load months:", err);
  }
}

loadDataBtn.addEventListener("click", async () => {
  const month = monthSelect.value;
  console.log("📅 Loading data for:", month);
  expenseDataDiv.innerHTML = "Loading...";
  totalDisplay.textContent = "";

  try {
    const res = await fetch(`${API_URL}?action=getData&month=${month}`);
    const json = await res.json();

    if (json.error) {
      expenseDataDiv.innerHTML = `<p>${json.error}</p>`;
      return;
    }

    renderTable(json.data, json.total);
  } catch (err) {
    console.error("❌ Fetch failed:", err);
  }
});

function renderTable(data, total) {
  if (!data.length) {
    expenseDataDiv.innerHTML = "<p>No entries found.</p>";
    return;
  }

  totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;

  let html = "<table><tr><th>Date</th><th>Amount (₹)</th><th>Description</th></tr>";
  data.forEach(row => {
    html += `<tr><td>${row.date}</td><td>${row.amount}</td><td>${row.description}</td></tr>`;
  });
  html += "</table>";

  expenseDataDiv.innerHTML = html;
}

loadMonths();
