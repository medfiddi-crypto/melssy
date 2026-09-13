function doPost(e) {
  const properties = PropertiesService.getScriptProperties();
  const secret = properties.getProperty('ORDER_WEBHOOK_SECRET');
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const raw = e.postData.contents;
  const signature = e.parameter.signature || '';
  const expected = Utilities.computeHmacSha256Signature(raw, secret)
    .map(function(byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
  if (signature !== expected) return json({ error: 'invalid signature' }, 401);
  const event = JSON.parse(raw);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const rowIndex = headers.indexOf('order_number');
    const existing = values.findIndex(function(row, index) { return index > 0 && row[rowIndex] === event.order.order_number; });
    const row = headers.map(function(header) { return event.order[header] || event[header] || ''; });
    if (existing > 0) sheet.getRange(existing + 1, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
  } finally { lock.releaseLock(); }
  return json({ ok: true });
}
function json(data, status) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
