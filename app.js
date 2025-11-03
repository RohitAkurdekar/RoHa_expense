// === CONFIG ===
const API_URL = "https://script.google.com/macros/s/AKfycbwoAX6tK9-eU3r2ZyL5sxgD5UbsTEs7o9eX1DrGXbRC8ZShCTWa4ipHM37UeiDOkXdy9A/exec";
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfe5jqsBh3dUHOZ3qFTkzzR3kOl3wo8WaMQcDo4M_Uw5V2krA/formResponse";
const ENTRY_ID_DATE = "entry.442057249";
const ENTRY_ID_AMOUNT = "entry.1545306348";
const ENTRY_ID_MESSAGE = "entry.445234516";

// === DOM ===
const form = document.getElementById("expenseForm");
const statusText = document.getElementById("formStatus");
const tableBody = document.querySelector("#expenseTable tbody");
const totalDisplay = document.getElementById("total");
const monthSelector = document.getElementById("monthSelector");

// === ADD EXPENSE ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const amount = document.getElementById("amount").value;
  const message = document.getElementById("message").value;

  statusText.textContent = "⏳ Submitting...";

  try {
    const formData = new FormData();
    formData.append(ENTRY_ID_DATE, date);
    formData.append(ENTRY_ID_AMOUNT, amount);
    formData.append(ENTRY_ID_MESSAGE, message);

    await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });

    statusText.textContent = "✅ Expense added!";
    form.reset();

    setTimeout(loadMonths, 1000);
  } catch (error) {
    console.error("❌ Form submit error:", error);
    statusText.textContent = "❌ Failed to submit expense.";
  }
});

// === LOAD MONTHS ===
async function loadMonths() {
  console.log("📡 Fetching available months...");
  try {
    const res = await fetch(`${API_URL}?action=getMonths`);
    const data = await res.json();
    console.log("📦 Months API response:", data);

    if (!data.months || !Array.isArray(data.months)) throw new Error("Invalid months response");

    monthSelector.innerHTML = "";
    data.months.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      monthSelector.appendChild(opt);
    });

    if (data.months.length > 0) loadExpenses(data.months[0]);
  } catch (err) {
    console.error("❌ Failed to load months:", err);
  }
}

// === LOAD EXPENSES ===
async function loadExpenses(month) {
  console.log(`📊 Loading expenses for ${month}`);
  tableBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  totalDisplay.textContent = "";

  try {
    const res = await fetch(`${API_URL}?action=getData&month=${encodeURIComponent(month)}`);
    const result = await res.json();
    console.log("📦 Expense data:", result);

    if (!result.data || !Array.isArray(result.data)) {
      tableBody.innerHTML = "<tr><td colspan='3'>No data found</td></tr>";
      totalDisplay.textContent = "";
      return;
    }

    let total = 0;
    tableBody.innerHTML = result.data
      .map((r) => {
        total += parseFloat(r.amount || 0);
        return `<tr>
          <td>${new Date(r.date).toLocaleDateString()}</td>
          <td>₹${r.amount}</td>
          <td>${r.description}</td>
        </tr>`;
      })
      .join("");

    totalDisplay.textContent = `💵 Total: ₹${total.toFixed(2)}`;
  } catch (err) {
    console.error("❌ Failed to load expenses:", err);
    tableBody.innerHTML = "<tr><td colspan='3'>Error loading data</td></tr>";
  }
}

monthSelector.addEventListener("change", (e) => loadExpenses(e.target.value));

window.addEventListener("DOMContentLoaded", loadMonths);

// === SERVICE WORKER ===
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered successfully"))
    .catch(console.error);
}

