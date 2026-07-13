/**
 * Hello World Atlas — "Request a New Bottle" → Google Sheet
 *
 * Appends each submission as a row in the bound spreadsheet.
 *
 * SETUP (one time):
 *  1. Open the sheet:
 *     https://docs.google.com/spreadsheets/d/1uWcbvQZ4MkipZRkrhg8uEXC8HWL9wxuYlZ9gFk0GiMo/edit
 *  2. Extensions → Apps Script. Delete any boilerplate, paste this whole file, Save.
 *  3. Deploy → New deployment → type "Web app".
 *       - Execute as:  Me
 *       - Who has access:  Anyone
 *     Deploy, authorize, and COPY the Web app URL (ends in /exec).
 *  4. Put that URL in the site's env as VITE_SHEETS_ENDPOINT
 *     (local .env and Vercel → Settings → Environment Variables), then redeploy.
 *
 * After changing this script, re-deploy with Deploy → Manage deployments →
 * (edit) → Version: New version, or the site will keep hitting the old code.
 */

var SHEET_NAME = 'Requests' // tab to write to; created automatically if missing
var HEADERS = ['Submitted At', 'Email', 'Requested Places', 'Source']

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)

    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)

    // write a header row the first time
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.email || '',
      data.locations || '',
      data.source || 'hello-world-atlas',
    ])

    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: String(err) })
  }
}

// lets you open the /exec URL in a browser to confirm the deployment is live
function doGet() {
  return json({ ok: true, service: 'hello-world-atlas bottle requests' })
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
