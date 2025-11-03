const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfe5jqsBh3dUHOZ3qFTkzzR3kOl3wo8WaMQcDo4M_Uw5V2krA/formResponse";
const ENTRY_ID_DATE = 'entry.442057249';
const ENTRY_ID_AMOUNT = 'entry.1545306348';
const ENTRY_ID_MESSAGE = 'entry.445234516';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwoAX6tK9-eU3r2ZyL5sxgD5UbsTEs7o9eX1DrGXbRC8ZShCTWa4ipHM37UeiDOkXdy9A/exec";

console.log("🚀 Initializing Expense Tracker...");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered successfully"))
    .catch(err => console.error("❌ Service Worker registration failed:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expenseForm");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");
  const expenseData = document.getElementById("expenseData");
  const totalDisplay = document.getElementById("totalDisplay");
  const loadBtn = document.getElementById("loadDataBtn");

  async function loadMonths() {
    console.log("📡 Fetching available months...");
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getMonths`);
      const data = await res.json();
      console.log("📦 Received months:", data);

      monthSelect.innerHTML = "";
      yearSelect.innerHTML = "";

      if (data.months && data.months.length > 0) {
        const years = new Set();
        data.months.forEach(m => {
          const [month, year] = m.split("-");
          years.add(year);

          const opt = document.createElement("option");
          opt.value = month;
          opt.textContent = month;
          monthSelect.appendChild(opt);
        });

        years.forEach(y => {
          const opt = document.createElement("option");
          opt.value = y;
          opt.textContent = y;
          yearSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("❌ Failed to load months:", err);
    }
  }

  async function submitExpense(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = new URLSearchParams();
    payload.append(ENTRY_ID_DATE, formData.get("entry.442057249"));
    payload.append(ENTRY_ID_AMOUNT, formData.get("entry.1545306348"));
    payload.append(ENTRY_ID_MESSAGE, formData.get("entry.445234516"));

    console.log("📝 Submitting Expense:", Object.fromEntries(formData));

    try {
      await fetch(FORM_URL, { method: "POST", body: payload });
      alert("✅ Expense added successfully!");
      form.reset();
      await loadMonths();
    } catch (err) {
      console.error("❌ Expense submission failed:", err);
      alert("Submission failed! Please try again.");
    }
  }

  async function loadExpenses() {
    const month = monthSelect.value;
    const year = yearSelect.value;
    console.log(`📅 Fetching data for: ${month}-${year}`);

    try {
      const res = await fetch(`${SCRIPT_URL}?action=getData&month=${month}&year=${year}`);
      const data = await res.json();
      console.log("📦 Received expense data:", data);

      if (data.expenses && data.expenses.length > 0) {
        let total = 0;
        let html = `<table><tr><th>Date</th><th>Amount (₹)</th><th>Description</th></tr>`;
        data.expenses.forEach(row => {
          total += parseFloat(row.amount);
          html += `<tr><td>${row.date}</td><td>${row.amount}</td><td>${row.description}</td></tr>`;
        });
        html += "</table>";
        expenseData.innerHTML = html;
        totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;
      } else {
        expenseData.innerHTML = "<p>No data found for this month.</p>";
        totalDisplay.textContent = "Total: ₹0";
      }
    } catch (err) {
      console.error("❌ Failed to load expenses:", err);
    }
  }

  form.addEventListener("submit", submitExpense);
  loadBtn.addEventListener("click", loadExpenses);
  loadMonths();
});
