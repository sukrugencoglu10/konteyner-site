// ============================================================
// PEKCON Container - Teklif Formu Google Apps Script
// ============================================================

var SHEET_NAME  = 'Teklif Formları';
var NOTIFY_EMAIL = 'info@pekcon.com,sukrugencoglu10@gmail.com';

var ISLEM_LABELS = {
  'Satin_Alma': 'Satın Alma',
  'Kiralama':   'Kiralama'
};

var URUN_LABELS = {
  'Standart_Konteyner': 'Standart Yük Konteyner',
  'Birlesimli_Ofis':    'Birleşimli / Ofis Konteyner',
  'Demonte_Flatpack':   'Demonte (Flatpack) Konteyner',
  'Metropol_Kabin':     'Metropol / Lüks Kabin',
  'WC_Dus_Konteyner':   'WC / Duş Konteyneri',
  'Ozel_Uretim':        'Özel Üretim / Proje Bazlı'
};

function getLabel(map, v) { return map[v] || v || '—'; }
function getVal(v)         { var s = v ? String(v).trim() : ''; return s !== '' ? s : '—'; }

// ============================================================
// Satır yardımcısı
// ============================================================
function row(label, value, last) {
  var border = last ? '' : 'border-bottom:1px solid #e2e8f0;';
  return '<tr>'
    + '<td style="padding:11px 14px;width:40%;background:#f7fafc;font-size:13px;font-weight:600;color:#4a5568;white-space:nowrap;' + border + 'border-right:1px solid #e2e8f0;">' + label + '</td>'
    + '<td style="padding:11px 14px;font-size:13px;color:#1a202c;' + border + '">' + value + '</td>'
    + '</tr>';
}

// ============================================================
// E-posta HTML
// ============================================================
function buildEmailHtml(d) {
  var now   = new Date();
  var tarih = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');

  var islem = getLabel(ISLEM_LABELS, d.transactionType);
  var urun  = getLabel(URUN_LABELS,  d.productCategory);
  var cargo = getVal(d.cargoType);
  var adet  = getVal(d.containerQuantity);
  var bolge = getVal(d.deliveryRegion);
  var isim  = getVal(d.userName);
  var tel   = getVal(d.userPhone);
  var telClean = tel.replace(/\D/g,''); // Sadece rakamlar
  var email = getVal(d.userEmail);
  var gclid = getVal(d.gclid_field);

  var badgeColor = (d.transactionType === 'Kiralama') ? '#e67e22' : '#0069b4';

  var gclidRow = (gclid !== '—')
    ? '<p style="margin:8px 0 0;font-size:10px;color:#a0aec0;">Google Click ID: ' + gclid + '</p>'
    : '';

  var html = '<!DOCTYPE html>'
    + '<html lang="tr"><head><meta charset="UTF-8"></head>'
    + '<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;">'
    + '<tr><td align="center" style="padding:32px 12px;">'

    // Kart
    + '<table cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #d9e2ec;box-shadow:0 4px 20px rgba(0,0,0,0.10);">'

    // --- Üst bant (Kırmızı) ---
    + '<tr><td style="background:#c41e3a;padding:18px 28px;border-radius:8px 8px 0 0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td><span style="font-size:21px;font-weight:900;color:#fff;letter-spacing:3px;">PEKCON</span>'
    + '<span style="font-size:11px;color:#fff;margin-left:8px;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">container.pekcon.com</span></td>'
    + '<td align="right"><a href="https://container.pekcon.com" style="font-size:11px;color:#fff;text-decoration:none;font-weight:600;">Ziyaret Et →</a></td>'
    + '</tr></table>'
    + '</td></tr>'

    // --- Başlık ---
    + '<tr><td style="padding:22px 28px 0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td><p style="margin:0;font-size:18px;font-weight:700;color:#1a202c;">Yeni Teklif Talebi</p>'
    + '<p style="margin:4px 0 0;font-size:12px;color:#718096;">' + tarih + '</p></td>'
    + '<td align="right"><span style="display:inline-block;background:' + badgeColor + ';color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;">' + islem + '</span></td>'
    + '</tr></table>'
    + '</td></tr>'

    // Ayırıcı
    + '<tr><td style="padding:16px 28px 0;"><hr style="border:none;border-top:2px solid #e2e8f0;margin:0;"></td></tr>'

    // --- Talep Detayları ---
    + '<tr><td style="padding:20px 28px 8px;">'
    + '<p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#0069b4;text-transform:uppercase;letter-spacing:0.8px;">Talep Detayları</p>'
    + '<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;">'
    + row('İşlem Türü',         '<strong>' + islem + '</strong>')
    + row('İhtiyaç / Yapı Tipi', urun)
    + row('Yük Konteyner Tipi', cargo)
    + row('Adet',               adet)
    + row('Teslimat Bölgesi',   bolge, true)
    + '</table>'
    + '</td></tr>'

    // --- Müşteri Bilgileri ---
    + '<tr><td style="padding:20px 28px 8px;">'
    + '<p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#0069b4;text-transform:uppercase;letter-spacing:0.8px;">Müşteri İletişim Bilgileri</p>'
    + '<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;">'
    + row('Ad Soyad', '<strong>' + isim + '</strong>')
    + row('Telefon',  '<a href="tel:' + tel + '" style="color:#0069b4;font-weight:700;text-decoration:none;">' + tel + '</a>')
    + row('E-posta',  '<a href="mailto:' + email + '" style="color:#0069b4;text-decoration:none;">' + email + '</a>', true)
    + '</table>'
    + '</td></tr>'

    // --- Aksiyon butonları ---
    + '<tr><td style="padding:16px 28px 24px;">'
    + '<table cellpadding="0" cellspacing="0"><tr>'
    + '<td style="padding-right:8px;"><a href="tel:+90' + telClean + '" style="display:inline-block;background:#c41e3a;color:#fff;font-size:12px;font-weight:700;padding:10px 16px;border-radius:6px;text-decoration:none;">📞 Ara</a></td>'
    + '<td style="padding-right:8px;"><a href="https://wa.me/90' + telClean + '?text=Merhaba,%20teklif%20talebim%20hakkında%20konuşmak%20istiyorum." style="display:inline-block;background:#25d366;color:#fff;font-size:12px;font-weight:700;padding:10px 16px;border-radius:6px;text-decoration:none;">💬 WhatsApp</a></td>'
    + '<td><a href="mailto:' + email + '?subject=Teklif Talebiniz - PEKCON" style="display:inline-block;background:#fff;color:#c41e3a;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;border:2px solid #c41e3a;">✉ E-posta</a></td>'
    + '</tr></table>'
    + gclidRow
    + '</td></tr>'

    // --- Alt bant (Kırmızı) ---
    + '<tr><td style="background:#c41e3a;padding:12px 28px;border-radius:0 0 8px 8px;">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td style="font-size:10px;color:#fff;">Bu bildirim container.pekcon.com teklif formundan otomatik oluşturulmuştur.</td>'
    + '<td align="right"><a href="https://container.pekcon.com" style="font-size:10px;color:#fff;text-decoration:underline;white-space:nowrap;">container.pekcon.com</a></td>'
    + '</tr></table>'
    + '</td></tr>'

    + '</table>'  // kart
    + '</td></tr></table>'  // dış tablo
    + '</body></html>';

  return html;
}

// ============================================================
// doPost
// ============================================================
function doPost(e) {
  try {
    var d = e.parameter;

    // Sheets'e kaydet
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Tarih','İşlem Türü','Ürün/Yapı','Konteyner','Adet','Bölge','Ad Soyad','Telefon','E-posta','GCLID']);
      sheet.getRange(1,1,1,10).setFontWeight('bold');
    }
    sheet.appendRow([
      new Date(),
      getLabel(ISLEM_LABELS, d.transactionType),
      getLabel(URUN_LABELS,  d.productCategory),
      getVal(d.cargoType),
      getVal(d.containerQuantity),
      getVal(d.deliveryRegion),
      getVal(d.userName),
      getVal(d.userPhone),
      getVal(d.userEmail),
      getVal(d.gclid_field)
    ]);

    // E-posta gönder
    var subject = '🏗 Yeni Teklif – ' + getVal(d.userName) + ' / ' + getVal(d.deliveryRegion);
    MailApp.sendEmail({
      to:       NOTIFY_EMAIL,
      subject:  subject,
      htmlBody: buildEmailHtml(d)
    });

    return ContentService
      .createTextOutput(JSON.stringify({result:'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({result:'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('PEKCON Teklif Script – Aktif ✓').setMimeType(ContentService.MimeType.TEXT);
}
