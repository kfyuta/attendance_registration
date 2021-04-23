// 勤務表の列番
const [DAYOFF, START_WORK, END_WORK, BREAK] = [3, 4, 5, 8];

// 作業工数表のスプレッドシート
const workSchedule = SpreadsheetApp.openById(SPREADSHEET_ID);

// 最新(当月)のシートを取得
const currentSheet = workSchedule.getSheets().splice(-1)[0];
// 入力領域を取得
const dateRange = currentSheet.getRange(10, 2, 31, 8);
const today = new Date().getDate();

// 命令と処理を定義するオブジェクト
const commands = {
  "出勤": data => {
    Logger.log("出勤登録開始");
    dateRange.getCell(today, START_WORK).setValue(data);
    Logger.log("出勤登録終了");
  },
  "休憩": data => {
    Logger.log("休憩登録開始");
    dateRange.getCell(today, BREAK).setValue(data);
    Logger.log("休憩登録終了");
  },
  "退勤": data => {
    Logger.log("退勤登録開始")
    dateRange.getCell(today, END_WORK).setValue(data);
    Logger.log("退勤登録終了");
  },
  "休日": () => {
    Logger.log("休日登録開始");
    dateRange.getCell(today, START_WORK).setValue("0:00");
    dateRange.getCell(today, BREAK).setValue("0:00");
    dateRange.getCell(today, END_WORK).setValue("0:00");
    Logger.log("休日登録終了");
  },
  "有給": () => {
    dateRange.getCell(today, DAYOFF).setValue("○");
    dateRange.getCell(today, START_WORK).setValue("0:00");
    dateRange.getCell(today, BREAK).setValue("0:00");
    dateRange.getCell(today, END_WORK).setValue("0:00");
  },
  "振休": () => {
    dateRange.getCell(today, DAYOFF).setValue("◎");
    dateRange.getCell(today, START_WORK).setValue("0:00");
    dateRange.getCell(today, BREAK).setValue("0:00");
    dateRange.getCell(today, END_WORK).setValue("0:00");
  },
  "特別休暇": () => {
    dateRange.getCell(today, DAYOFF).setValue("☆");
    dateRange.getCell(today, START_WORK).setValue("0:00");
    dateRange.getCell(today, BREAK).setValue("0:00");
    dateRange.getCell(today, END_WORK).setValue("0:00");
  },
}