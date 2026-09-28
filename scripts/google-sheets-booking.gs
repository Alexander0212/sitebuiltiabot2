/**
 * Google Apps Script for spreadsheet "Rag агенты"
 * Default sheet: Лист2
 *
 * Columns (order matters — append by position):
 * createdAt | name | phone | format | details | date | time | when | summary | status | timezone | source
 *
 * Legacy JSON keys still accepted: service→format, doctor→details, slotLabel→when, concern→summary
 *
 * 1. Open the sheet → Extensions → Apps Script
 * 2. Paste this file, set SECRET to match GOOGLE_SHEETS_WEBHOOK_SECRET
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Put URL + SECRET into .env.local
 *
 * Safe header rename in an EXISTING sheet:
 * You may rename row-1 headers in Google Sheets UI — the script writes by column index,
 * not by header title. After renaming, keep the same column order.
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

    var format = body.format || body.service || "";
    var details = body.details || body.doctor || "";
    var when = body.when || body.slotLabel || "";
    var summary = body.summary || body.concern || "";

    sheet.appendRow([
      body.createdAt || new Date().toISOString(),
      body.name || "",
      String(body.phone || ""),
      format,
      details,
      body.date || "",
      body.time || "",
      when,
      summary,
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
    "format",
    "details",
    "date",
    "time",
    "when",
    "summary",
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
