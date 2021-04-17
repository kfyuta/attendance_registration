function doPost(e) {
  // LINEから受信したJSONデータをパースする
  const data = JSON.parse(e.postData.contents);
  // dataからメッセージ部分のみを取り出す
  const msg = data.events[0].message.text;
  // メッセージをパースし命令に応じた処理を実行する
  const result = parseCSV(msg);
  // 結果に応じてメッセージを送信する
  reply(result, data.events[0]);
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
    const [cmd, data, ...opts] = e.message.text.split(',');
    message.messages = [
        {
          "type": "text",
          "text": `${cmd} ${data} を登録しました`,
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

/**
 * 受信したメッセージを解析し、commandを実行する
 * @param {string} csvテキスト
 */
function parseCSV(csv) {
  const [cmd, data, ...options] = csv.split(',');
  // commandsに存在しないコマンド名の場合、falseを返却して処理終了
  if (!commands[cmd]) {
    Logger.log("[FAILED]: Invalid Command");
    return false;
  } else {
    commands[cmd](data);
    return true;
  }
}

function test() {
  console.log(parseCSV("休日0:00"));
  console.log(parseCSV("休日"));
}