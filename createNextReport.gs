/**
 * 毎月1日に実行
 * 原本をコピーして新しい勤務表を作成する。
 */
function createNextMonthReport() {
  // 新しいシートを作成する
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allSheets = ss.getSheets(); 
  const original = allSheets[0];
  const today = new Date();
  const sheetName = setSheetName(today);
  const newSheet = ss.insertSheet(sheetName, allSheets.length, {template: original});

  // 日付と曜日を設定する
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dateRange = newSheet.getRange(10, 2, monthEnd, 2);
  const days = "日月火水木金土".split("");
  const values = [];
  for (let i = 0; i < monthEnd; i++) {
    values.push([today.getDate(), days[today.getDay()]]);
    today.setDate(today.getDate() + 1);
  }
  dateRange.setValues(values);
  newSheet.getRange(4, 2, 1, 2).setValues([[sheetName.substring(0, 2), sheetName.substring(2)]]);
}

/**
 * 呼出時点の日付を取得しシート名を返却する
 * return: ex) today="2021年3月1日" => 2103
 */
function setSheetName(date) {
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1).toString() : `0${(date.getMonth() + 1).toString()}`;
  return `${year}${month}`;
}