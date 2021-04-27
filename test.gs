function testParseCSV() {
  console.log("No1", parseCSV("出勤,09:00") ? "SUCCESS" : "FAILED");
  console.log("No2", parseCSV("休憩,1:00") ? "SUCCESS" : "FAILED");
  console.log("No3", parseCSV("退勤,18:00") ? "SUCCESS" : "FAILED");
  console.log("No4", parseCSV("休日") ? "SUCCESS" : "FAILED");
  console.log("No5", parseCSV(" 出勤 ,10:00") ? "SUCCESS" : "FAILED");
  console.log("No6", parseCSV(" 休憩 ,1:30") ? "SUCCESS" : "FAILED");
  console.log("No7", parseCSV(" 退勤 ,20:00") ? "SUCCESS" : "FAILED");
  console.log("No8", parseCSV(" 休日 ") ? "SUCCESS" : "FAILED");
  console.log("No9", parseCSV(" 出勤 ,09: 00") ? "FAILED" : "SUCCESS");
  console.log("No10", parseCSV(" 休憩 ,1 :00") ? "FAILED" : "SUCCESS");
  console.log("No11", parseCSV(" 退勤 ,18 : 00") ? "FAILED" : "SUCCESS");
  console.log("No12", parseCSV(" 休日, 0: 00") ? "FAILED" : "SUCCESS");
  console.log("No13", parseCSV("出勤, 9時") ? "FAILED" : "SUCCESS");
  console.log("No14", parseCSV("退勤, 18時") ? "FAILED" : "SUCCESS");
  console.log("No15", parseCSV("休憩, 1時間") ? "FAILED" : "SUCCESS");
  console.log("No16", parseCSV("休日, 9時") ? "FAILED" : "SUCCESS");
  console.log("No17", parseCSV("出勤, 09: 00") ? "FAILED" : "SUCCESS");
  console.log("No18", parseCSV("退勤, 1 8:30") ? "FAILED" : "SUCCESS");
  console.log("No19", parseCSV("休憩, 1.0:30") ? "FAILED" : "SUCCESS");
  console.log("No20", parseCSV("出勤, 09:　00") ? "FAILED" : "SUCCESS");
  console.log("No21", parseCSV("退勤, 1　8:30") ? "FAILED" : "SUCCESS");
  console.log("No22", parseCSV("休憩, 1.0:30") ? "FAILED" : "SUCCESS");
  console.log("No23", parseCSV("出勤,12345") ? "FAILED" : "SUCCESS");
  console.log("No24", parseCSV("出勤, 9:00") ? "FAILED" : "SUCCESS");
};

function testAddedCommands() {
  commands["有給"]();
  commands["振休"]();
  commands["特別休暇"]();
}

function testIsInputTimeValid() {
  console.log("登録時間 > 現在時刻 is False.", isInputTimeValid("09:00", "08:30"));
  console.log("登録時間 = 現在時刻 is True.", isInputTimeValid("09:00", "09:00"));
  console.log("登録時間 < 現在時刻 is True.", isInputTimeValid("09:00", "09:30"));
}