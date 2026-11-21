// Recebe os leads da LP Black Week (https://3dubitencourt.github.io/lp-plinio-black/)
// e grava uma linha por lead na aba "Leads".
var ABA = 'Leads';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site) return ok_();                       // campo escondido: robô de spam
  var nome = limpar_(p.nome, 120);
  var fone = String(p.whatsapp || '').replace(/\D/g, '').slice(0, 13);
  if (!nome || fone.length < 10) return ok_();
  var completo = fone.length <= 11 ? '55' + fone : fone;

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var aba = SpreadsheetApp.getActive().getSheetByName(ABA);
    aba.appendRow([
      new Date(),
      nome,
      "'" + formatar_(fone),
      'https://wa.me/' + completo,
      'Novo',
      limpar_(p.utm_source, 100),
      limpar_(p.utm_medium, 100),
      limpar_(p.utm_campaign, 150),
      limpar_(p.utm_content, 150),
      limpar_(p.utm_term, 150),
      limpar_(p.pagina, 300)
    ]);
    aba.getRange(aba.getLastRow(), 1).setNumberFormat('dd/MM/yyyy HH:mm');
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

function doGet() { return ok_(); }

function ok_() { return ContentService.createTextOutput('ok'); }

// Corta o tamanho e impede que o texto vire fórmula na planilha.
function limpar_(v, max) {
  var s = String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function formatar_(d) {
  if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
  if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return d;
}
