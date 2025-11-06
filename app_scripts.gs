function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "getMonths") {
    // Return all sheets that match Month-Year format
    const sheets = ss.getSheets().map(s => s.getName());
    const months = sheets.filter(n => /^[A-Za-z]+\s*[-]?\s*\d{4}$/.test(n));
    console.log("✅ Available months:", months);
    return jsonOutput({ months });
  }

  if (action === "getData") {
    const month = e.parameter.month;
    if (!month) return jsonOutput({ error: "Month required" });

    const target = ss.getSheetByName(month);
    if (!target) return jsonOutput({ error: `No sheet found for ${month}` });

    const rows = target.getDataRange().getValues();
    if (rows.length <= 1) return jsonOutput({ data: [] });

    const headers = rows.shift().map(h => h.toString().trim().toLowerCase());
    const dateIndex = headers.indexOf("date");
    const amountIndex = headers.indexOf("amount");
    const descIndex = headers.indexOf("description");

    const data = rows.map(r => ({
      date: dateIndex >= 0 ? r[dateIndex] : "",
      amount: amountIndex >= 0 ? r[amountIndex] : "",
      description: descIndex >= 0 ? r[descIndex] : ""
    }));

    const total = data.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    return jsonOutput({ data, total });
  }

  return jsonOutput({ error: "Invalid action" });
}

/**
 * Triggered by form submission
 * Copies data from "Form Responses 1" to the correct month sheet
 */
function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName("Form Responses 1");
  const lastRow = formSheet.getLastRow();
  const data = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];

  const timestamp = new Date(data[0]);
  const monthName = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "MMMM-yyyy");

  console.log(`🗓 Processing entry for ${monthName}`);

  let monthSheet = ss.getSheetByName(monthName);
  if (!monthSheet) {
    console.log(`🆕 Creating new sheet: ${monthName}`);
    monthSheet = ss.insertSheet(monthName);
    monthSheet.appendRow(["Date", "Amount", "Description"]);
  }

  const date = data[1];
  const amount = data[2];
  const desc = data[3];

  monthSheet.appendRow([date, amount, desc]);
  console.log(`✅ Added row to ${monthName}:`, { date, amount, desc });
}

/**
 * Helper function for JSON output
 */
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
