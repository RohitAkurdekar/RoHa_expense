// === CONFIG ===
const API_URL = "https://script.google.com/macros/s/AKfycbwjlNYxt2f4ff7Th4b1vHbPhnsMXp63WqXAaUft9i-lKrUoiVLoJSo-b7kRr-xxn7dPvA/exec";
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

    const response = await fetch(FORM_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });

    statusText.textContent = "✅ Expense added!";
    form.reset();

    // Reload data after short delay
    setTimeout(() => {
      loadMonths();
    }, 1000);
  } catch (error) {
    console.error(error);
    statusText.textContent = "❌ Failed to submit expense.";
  }
});

// === LOAD MONTHS ===
async function loadMonths() {
  monthSelector.innerHTML = "<option>Loading...</option>";

  try {
    const res = await fetch(`${API_URL}?action=getMonths`);
    const data = await res.json();

    monthSelector.innerHTML = data
      .map((m) => `<option value="${m}">${m}</option>`)
      .join("");

    loadExpenses(data[0]);
  } catch (err) {
    console.error("❌ Failed to load months:", err);
    monthSelector.innerHTML = "<option>Error loading months</option>";
  }
}

// === LOAD EXPENSES FOR MONTH ===
async function loadExpenses(month) {
  tableBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  totalDisplay.textContent = "";

  try {
    const res = await fetch(`${API_URL}?action=getData&month=${month}`);
    const data = await res.json();

    if (!data || !Array.isArray(data)) {
      tableBody.innerHTML = "<tr><td colspan='3'>No data found</td></tr>";
      return;
    }

    let total = 0;
    tableBody.innerHTML = data
      .map((row) => {
        total += parseFloat(row.amount) || 0;
        return `<tr>
          <td>${row.date}</td>
          <td>₹${row.amount}</td>
          <td>${row.message}</td>
        </tr>`;
      })
      .join("");

    totalDisplay.textContent = `💵 Total: ₹${total.toFixed(2)}`;
  } catch (err) {
    console.error("❌ Failed to load expenses:", err);
    tableBody.innerHTML = "<tr><td colspan='3'>Error loading data</td></tr>";
  }
}

// === EVENT ===
monthSelector.addEventListener("change", (e) => {
  loadExpenses(e.target.value);
});

// === INIT ===
loadMonths();

// === SERVICE WORKER (optional offline support) ===
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered successfully"))
    .catch(console.error);
}

