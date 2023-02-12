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
  const newSheet = ss.insertSheet(sheetName, 1, {template: original});

  // 日付と曜日を設定する
  const [ROW_START, CLM_START, CLM_NUM] = [10, 2, 8];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dateRange = newSheet.getRange(ROW_START, CLM_START, monthEnd, CLM_NUM);
  const days = "日月火水木金土".split("");
  const dateValues = [];
  for (let i = 0; i < monthEnd; i++) {
    if(today.getDay()=== 0 || today.getDay() === 6) {
      // 土日の場合は開始終了休憩時間に0:00を設定する
      dateValues.push([today.getDate(), days[today.getDay()], null, "0:00", "0:00", null, null, "0:00"]);
    } else {
      // 平日の場合は日付と曜日以外は設定しない
      dateValues.push([today.getDate(), days[today.getDay()], null, null, null, null, null, null]);
    }
    today.setDate(today.getDate() + 1);
  }
  dateRange.setValues(dateValues);
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