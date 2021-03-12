// 勤務表の列番
const [START_WORK, END_WORK, BREAK] = [4, 5, 8];
const workSchedule = SpreadsheetApp.openById(SPREADSHEET_ID);

function doPost(e) {
  const currentSheet = workSchedule.getSheets().splice(-1)[0];
  const dateRange = currentSheet.getRange(10, 2, 31, 8);
  const data = JSON.parse(e.postData.contents);
  const msg = data.events[0].message.text;
  const today = new Date().getDate();
  const result = filterMessage(msg, dateRange, today);
  reply(result, data.events[0]);
}


function filterMessage(msg, dateRange, today) {
  const dateRangeValues = dateRange.getValues();
  if (msg.startsWith("出勤")) {
    for (let i = 0; i < dateRangeValues.length; i++) {
      if (today === dateRangeValues[i][0]) {
        dateRange.getCell(i + 1, START_WORK).setValue(msg.substring(2));
        break;
      }
    }
  } else if (msg.startsWith("退勤")) {
    for (let i = 0; i < dateRangeValues.length; i++) {
      if (today === dateRangeValues[i][0]) {
        dateRange.getCell(i + 1, END_WORK).setValue(msg.substring(2));
        break;
      }
    }
  } else if (msg.startsWith("休憩")) {
    for (let i = 0; i < dateRangeValues.length; i++) {
      if (today === dateRangeValues[i][0]) {
        dateRange.getCell(i + 1, BREAK).setValue(msg.substring(2));
        break;
      }
    }
  } else {
    return false;
  }
  return true;
}

/*
 * 記録内容を返信する
 */
function reply(result, e) {
  const message = {};
  if (result) {
    message.replyToken = e.replyToken;
    message.messages = [
        {
          "type": "text",
          "text": `${e.message.text.substring(0, 2)} ${e.message.text.substring(2)} を登録しました`,
        } 
    ]
  } else {
    message.replyToken = e.replyToken;
    message.messages = [
        {
          "type": "text",
          "text": "無効な文字列です",
        } 
    ]
  }
  // 送信のための諸準備
  const replyData = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "payload": JSON.stringify(message)
  };
  // JSON形式でAPIにポスト
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", replyData);
}