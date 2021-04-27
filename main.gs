/**
 * Lineに投稿されたときに呼ばれる関数
 * @param {object} 
 * @return {void}
 */
function doPost(e) {
  Logger.log("メッセージ受信: 処理開始")
  // LINEから受信したJSONデータをパースする
  const data = JSON.parse(e.postData.contents);
  // dataからメッセージ部分のみを取り出す
  const msg = data.events[0].message.text;
  // メッセージをパースし命令に応じた処理を実行する
  const result = parseCSV(msg);
  // 結果に応じてメッセージを送信する
  if (result) {
    replySuccessMsg(data.events[0]) 
  } else {
    replyFailedMsg(data.events[0]);
  }
  Logger.log("メッセージ送信： 処理終了");
}

/**
 * 処理成功時のメッセージを送信する
 * @param {object} Lineから受信したイベントオブジェクト
 */
function replySuccessMsg(e) {
  const [cmd, data, ...opts] = e.message.text.split(',');
  const message = {
    replyToken: e.replyToken,
    messages: [
      {
        "type": "text",
        "text": `${cmd} ${data ? data : ""} を登録しました`,
      } 
    ]
  };
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
 * 処理失敗時のメッセージを送信する
 * @param {object} Lineから受信したイベントオブジェクト
 */
function replyFailedMsg(e) {
  const message = {
    replyToken: e.replyToken,
    messages: [
      {
        "type": "text",
        "text": `無効な文字列です`,
      } 
    ]
  };
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
 * @return {boolean} 実行結果 
 */
function parseCSV(csv) {
  let [cmd, data, ...options] = csv.split(',');
  // 命令部のスペースを除去
  cmd = cmd.trim();
  // データフォーマットが異なる場合
  if (data && !isValidData(data)) {
    return false;
  }
  // commandsに存在しないコマンド名の場合、falseを返却して処理終了
  if (!commands[cmd]) {
    Logger.log("[FAILED]: Invalid Command");
    return false;
  } else {
    Logger.log("命令を開始");
    commands[cmd](data);
    Logger.log("命令を終了");
    return true;
  }
}


/**
 * 引数のフォーマットが正しいかチェックする
 * @param {string}
 * @return {boolean}
 */
function isValidData(data) {
  // データが5文字以上のとき
  if (data.length > 5) {
    Logger.log("Invalid Data. Length is over 5.");
    return false;
  }
  // データに「半角数字と:」以外の文字が含まれていたとき
  if (data.match(/[^0-9:]/)) {
    Logger.log("Invalid Data. Data includes invalid character.");
    return false;
  }
  // hh:mm形式のフォーマットではないとき
  if (!data.match(/\d{1,2}:\d{1,2}/)) {
    Logger.log("Invalid Data. Format is invalid.")
    return false;
  }
  return true;
}

/**
 * 登録したい時間と現在時刻の前後関係を調べる。現在時刻よりも前ならtrue,それ以外はfalse。
 * @param {object} 登録したい時間 Date Object
 * @param {object} 現在時刻 Date Object
 * @retrun {boolean}
 */
function isInputTimeValid(inputTime, now) {
  // 引数がDateオブジェクトでない場合
  if (!inputTime instanceof Date || !now instanceof Date) {
    return false;
  }
  if (inputTime > now) {
    return false;
  }
  if (inputTime <= now) {
    return true;
  }
}