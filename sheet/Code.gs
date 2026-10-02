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
    const staffFields = ['call_status', 'delivery_status', 'notes'];
    const previous = existing > 0 ? values[existing] : [];
    const eventIdIndex = headers.indexOf('event_id');
    // A retried "created" event must not overwrite a row that already holds the newer "updated" snapshot.
    if (existing > 0 && eventIdIndex !== -1 && /:order\.created$/.test(String(event.event_id || '')) && /:order\.updated$/.test(String(previous[eventIdIndex]))) {
      return json({ ok: true, skipped: 'stale' });
    }
    const optionalFields = { Ville: 'city', Adresse: 'full_address', Couleur: 'color', Upsell: null, 'Taie 1': null, 'Taie 2': null, 'Montant upsell': null };
    const colorNames = { champagne: 'Champagne', ivory: 'Ivoire', black: 'Noir', rose: 'Rose' };
    const row = headers.map(function(header, index) {
      if (staffFields.indexOf(header) !== -1 && existing > 0) return previous[index];
      if (optionalFields.hasOwnProperty(header)) {
        const fallbackKey = optionalFields[header];
        const optionalValue = event.order[header] !== undefined ? event.order[header] : (fallbackKey ? event.order[fallbackKey] : undefined);
        if (optionalValue === undefined || optionalValue === null || optionalValue === '') return previous[index] || '';
        return header === 'Couleur' ? colorNames[optionalValue] || optionalValue : optionalValue;
      }
      const value = event.order[header] !== undefined ? event.order[header] : event[header];
      return typeof value === 'object' ? JSON.stringify(value) : value || '';
    });
    if (existing > 0) sheet.getRange(existing + 1, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
  } finally { lock.releaseLock(); }
  return json({ ok: true });
}
function json(data, status) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
