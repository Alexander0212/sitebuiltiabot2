/**
 * Google Apps Script for spreadsheet "Rag агенты"
 * Sheet: Лист2
 *
 * Columns:
 * createdAt | name | phone | service | doctor | date | time | slotLabel | concern | status | timezone | source
 *
 * 1. Open the sheet → Extensions → Apps Script
 * 2. Paste this file, set SECRET
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Put URL + SECRET into NOVA .env.local
 */

var SECRET = "lume_rag_2026";
var DEFAULT_SHEET_NAME = "Лист2";

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (SECRET && body.secret !== SECRET) {
      return json_({ ok: false, error: "unauthorized" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = body.sheetName || DEFAULT_SHEET_NAME;
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
    ensureHeader_(sheet);

    sheet.appendRow([
      body.createdAt || new Date().toISOString(),
      body.name || "",
      String(body.phone || ""),
      body.service || "",
      body.doctor || "",
      body.date || "",
      body.time || "",
      body.slotLabel || "",
      body.concern || "",
      body.status || "new",
      body.timezone || "Europe/Kyiv",
      body.source || "",
    ]);

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 3).setNumberFormat("@");
    if (body.phone) {
      sheet.getRange(lastRow, 3).setValue(String(body.phone));
    }

    return json_({ ok: true, sheet: sheet.getName() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: "nova-estate-booking",
    sheet: DEFAULT_SHEET_NAME,
  });
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    "createdAt",
    "name",
    "phone",
    "service",
    "doctor",
    "date",
    "time",
    "slotLabel",
    "concern",
    "status",
    "timezone",
    "source",
  ]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
