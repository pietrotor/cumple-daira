/**
 * REGISTRO DE VISITAS — Google Apps Script
 *
 * 1. Crea una hoja de cálculo nueva en Google Sheets
 * 2. Extensiones → Apps Script
 * 3. Pega este código y guarda
 * 4. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5. Copia la URL y pégala en js/config.js → analyticsWebhookUrl
 */

function doGet(e) {
  try {
    const sheet = getOrCreateSheet_();
    const p = e.parameter;

    sheet.appendRow([
      p.fecha || new Date().toISOString(),
      p.evento || "visita",
      p.ip || "",
      p.pais || "",
      p.codigo_pais || "",
      p.ciudad || "",
      p.region || "",
      p.idioma || "",
      p.pantalla || "",
      p.navegador || "",
      p.pagina || "",
    ]);

    return ContentService.createTextOutput("ok").setMimeType(
      ContentService.MimeType.TEXT
    );
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message).setMimeType(
      ContentService.MimeType.TEXT
    );
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Visitas");

  if (!sheet) {
    sheet = ss.insertSheet("Visitas");
    sheet.appendRow([
      "Fecha (UTC)",
      "Evento",
      "IP",
      "País",
      "Código país",
      "Ciudad",
      "Región",
      "Idioma",
      "Pantalla",
      "Navegador",
      "URL página",
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange("A1:K1").setFontWeight("bold");
  }

  return sheet;
}
