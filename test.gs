function test() {
  console.log("No1", parseCSV("出勤,09:00"));
  console.log("No2", parseCSV("休憩,1:00"));
  console.log("No3", parseCSV("退勤,18:00"));
  console.log("No4", parseCSV("休日"));
  console.log("No5", parseCSV(" 出勤 ,10:00"));
  console.log("No6", parseCSV(" 休憩 ,1:30"));
  console.log("No7", parseCSV(" 退勤 ,20:00"));
  console.log("No8", parseCSV(" 休日 "));
  console.log("No9", parseCSV(" 出勤 ,09: 00"));
  console.log("No10", parseCSV(" 休憩 ,1 :00"));
  console.log("No11", parseCSV(" 退勤 ,18 : 00"));
  console.log("No12", parseCSV(" 休日, 0: 00"));
  console.log("No13", parseCSV("出勤, 9時"));
  console.log("No14", parseCSV("退勤, 18時"));
  console.log("No15", parseCSV("休憩, 1時間"));
  console.log("No16", parseCSV("休日, 9時"));
  console.log("No17", parseCSV("出勤, 09: 00"));
  console.log("No18", parseCSV("退勤, 1 8:30"));
  console.log("No19", parseCSV("休憩, 1.0:30"));
  console.log("No20", parseCSV("出勤, 09:　00"));
  console.log("No21", parseCSV("退勤, 1　8:30"));
  console.log("No22", parseCSV("休憩, 1.0:30"));
  console.log("No23", parseCSV("出勤,12345"));
  console.log("No24", parseCSV("出勤, 9:00"));
}