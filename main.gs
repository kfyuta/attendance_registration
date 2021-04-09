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
  } else if (msg.startsWith("休日")) {
    for (let i = 0; i < dateRangeValues.length; i++) {
      if (today === dateRangeValues[i][0]) {
        dateRange.getCell(i + 1, START_WORK).setValue("0:00");
        dateRange.getCell(i + 1, END_WORK).setValue("0:00");
        dateRange.getCell(i + 1, BREAK).setValue("0:00");
        break;
      }
    }
  } else {
    return false;
  }
  return true;
}

/**
 * @param {string} LINEから送られたメッセージ
 * @param {array} 走査する矩系領域
 * @param {number} 日
 * @return {boolean} 登録を行えばtrue, 行わなかった場合はfalse
 */
function filterMessageUseQuery(msg, dateRange, today) {
  const querySheet = workSchedule.getSheetByName("QUERY");
  const currentSheet = workSchedule.getSheets().splice(-1)[0];
  const query = `=query('${currentSheet.getName()}'!B10:J40, "select * where B = ${today}")`;
  querySheet.getRange('A2').setFormula(query);
  const result = querySheet.getDataRange().getValues();

  // resultはヘッダ部も含むため0にはならない
  if (result.length < 2) {
    return false;
  }

  const command = msg.substring(0, 2);
  const data = msg.substring(2);
  switch (command) {
    case "出勤":
      dateRange.getCell(today - 1, START_WORK).setValue(data);
      break;
    case "退勤":
      dateRange.getCell(today - 1, END_WORK).setValue(data);
      break;
    case "休憩":
      dateRange.getCell(today - 1, BREAK).setValue(data);
      break;
    case "休日":
      dateRange.getCell(today - 1, START_WORK).setValue("0:00");
      dateRange.getCell(today - 1, END_WORK).setValue("0:00");
      dateRange.getCell(today - 1, BREAK).setValue("0:00");
      break;
    default:
      return false;
  }
  return true;
}

/**
 * 記録内容を返信する
 * @param {boolean} reply実行判定用
 * @param {object} LINEから受信したイベントオブジェクト
 * @return {void}
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

/**
 * Send push message from line platform.
 * @param messages: array which has object.
 * @return void
 */
function pushMessage(messages) {
  const body = {messages};
  const pushMsg = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "payload": JSON.stringify(body)
  }
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast", pushMsg);
}

/**
 * 登録がまだのとき勤怠登録をリマインドする。
 * 実行はトリガーが行う。
 */
function remind() {
  const now = new Date();
  const checkInput = checkInputTime(now);
  if (now.getHours() === 10 && !checkInput.start) {
    const messages = [
      {
        type: 'text',
        text: '出勤時間の登録がまだです。' 
      }
    ];
    pushMessage(messages);
  } else if (now.getHours() === 14 && !checkInput.break) {
    const messages = [
      {
        type: 'text',
        text: '休憩時間の登録がまだです。' 
      }
    ];
    pushMessage(messages);
  }　else if (now.getHours() === 21 && !checkInput.end) {
    const messages = [
      {
        type: 'text',
        text: '退勤時間の登録がまだです。' 
      }
    ];
    pushMessage(messages);    
  } else {
    return;
  }
}

/**
 * 勤務開始、終了、休憩の入力状況を返却する
 * @param {object} Date型
 * @return {object} start: boolean, break: boolean, end: boolean
 */
function checkInputTime(now) {
  const currentMonthSheet = workSchedule.getSheets().splice(-1)[0];
  const dataRange = currentMonthSheet.getRange(10, 5, 31, 5).getValues();
  const checkResult = {};
  checkResult.start = dataRange[now.getDate() - 1][0] !== '';
  checkResult.break = dataRange[now.getDate() - 1][4] !== '';
  checkResult.end = dataRange[now.getDate() - 1][1] !== '';
  return checkResult;
}