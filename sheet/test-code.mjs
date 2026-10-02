import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
const headers = readFileSync(new URL("./orders-template.csv", import.meta.url), "utf8").trim().split(",");

test("delivery columns are appended without reordering existing columns", () => {
  assert.deepEqual(headers.slice(0, 18), ["order_id", "order_number", "timestamp", "customer_name", "phone_e164", "full_address", "city", "items", "quantity", "total", "currency", "payment_method", "fraud_flag", "call_status", "delivery_status", "notes", "event_id", "occurred_at"]);
  assert.deepEqual(headers.slice(18), ["Ville", "Adresse", "Couleur"]);
  assert.equal(readFileSync(new URL("../docs/orders-sheet-template.csv", import.meta.url), "utf8").trim(), headers.join(","));
});

test("Apps Script maps delivery fields and preserves staff and legacy data", () => {
  const rows = [headers];
  const sheet = {
    getDataRange: () => ({ getValues: () => rows }),
    appendRow: (row) => rows.push(row),
    getRange: (row) => ({ setValues: (values) => { rows[row - 1] = values[0]; } }),
  };
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => "local-test" }) },
    Utilities: { computeHmacSha256Signature: () => [1, 2] },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { openById: () => ({ getActiveSheet: () => sheet }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: () => ({ setMimeType() {} }) },
  });
  vm.runInContext(source, context);
  const post = (order) => context.doPost({ postData: { contents: JSON.stringify({ event: "order.created", order }) }, parameter: { signature: "0102" } });
  post({ order_number: "MLS-TEST", city: "Rabat", full_address: "Rue test 12", color: "rose" });
  assert.deepEqual(Array.from(rows[1].slice(18)), ["Rabat", "Rue test 12", "Rose"]);
  rows[1][13] = "confirmed";
  rows[1][14] = "shipped";
  rows[1][15] = "Staff note";
  post({ order_number: "MLS-TEST", total: "449.00" });
  assert.deepEqual(Array.from(rows[1].slice(13, 16)), ["confirmed", "shipped", "Staff note"]);
  assert.deepEqual(Array.from(rows[1].slice(18)), ["Rabat", "Rue test 12", "Rose"]);
  assert.equal(rows.length, 2);
});
function sheetHarness(sheetHeaders) {
  const rows = [sheetHeaders];
  const sheet = {
    getDataRange: () => ({ getValues: () => rows }),
    appendRow: (row) => rows.push(row),
    getRange: (row) => ({ setValues: (values) => { rows[row - 1] = values[0]; } }),
  };
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => "local-test" }) },
    Utilities: { computeHmacSha256Signature: () => [1, 2] },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { openById: () => ({ getActiveSheet: () => sheet }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: () => ({ setMimeType() {} }) },
  });
  vm.runInContext(source, context);
  const post = (order) => context.doPost({ postData: { contents: JSON.stringify({ event: "order.created", order }) }, parameter: { signature: "0102" } });
  return { rows, post };
}

const legacyOrder = { order_number: "MLS-OLD", customer_name: "Ancienne commande", full_address: "", city: "", total: "449.00" };

test("orders from an old backend leave the new cells empty without errors", () => {
  const { rows, post } = sheetHarness(headers);
  assert.doesNotThrow(() => post(legacyOrder));
  assert.equal(rows.length, 2);
  assert.equal(rows[1][1], "MLS-OLD");
  assert.deepEqual(Array.from(rows[1].slice(18)), ["", "", ""]);
});

test("null or missing delivery values never write undefined or null", () => {
  const { rows, post } = sheetHarness(headers);
  post({ order_number: "MLS-NULL", Ville: null, Adresse: null, Couleur: null, city: null, full_address: null, color: null });
  assert.deepEqual(Array.from(rows[1].slice(18)), ["", "", ""]);
});

test("a sheet without the new headers still accepts new and old orders", () => {
  const { rows, post } = sheetHarness(headers.slice(0, 18));
  assert.doesNotThrow(() => post(legacyOrder));
  assert.doesNotThrow(() => post({ order_number: "MLS-NEW", Ville: "Rabat", Adresse: "Rue test 12", Couleur: "Rose", city: "Rabat", full_address: "Rue test 12", color: "rose" }));
  assert.equal(rows.length, 3);
  assert.equal(rows[2].length, 18);
  assert.equal(rows[2][5], "Rue test 12");
  assert.equal(rows[2][6], "Rabat");
});

test("an update from an old backend keeps delivery data already in the sheet", () => {
  const { rows, post } = sheetHarness(headers);
  post({ order_number: "MLS-KEEP", city: "Fès", full_address: "Rue du test 9", color: "ivory" });
  post({ order_number: "MLS-KEEP", city: "", full_address: "", total: "449.00" });
  assert.equal(rows.length, 2);
  assert.deepEqual(Array.from(rows[1].slice(18)), ["Fès", "Rue du test 9", "Ivoire"]);
});
