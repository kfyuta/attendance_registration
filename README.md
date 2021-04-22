# OverView
The attendance registration script with GoogleAppScript and LINE Messaging API.

# Dependencies
You need to read files in the following order.
1. appscript.json  
2. property.gs (This file contains secret infomation. I don't push this.)  
3. globalVariable.gs  
4. main.gs  
5. createNextReport.gs  
6. test.gs (You don't need to read this file if you won't do test.)   

# Usage
## Preparation
1. git clone git@github.com:kfyuta/attendance_registration.git
2. Create Line Messaging API, and get CHANNEL ACCESS TOKEN.
3. Create property.gs, you can decide this file name. File name isn't important.
4. Declear "const CHANNEL_ACCESS_TOKEN = {You get the CHANNEL ACCESS TOKEN}".
5. Declear "const SPREADSHEET_ID = {Your spreadsheet id which you will write your attendance info.}"
## How to Use
1. Send message to LINE Channel which you have just created.
2. This message is CSV format, for eaxmple, "出勤,09:00", "退勤,18:00".
3. First column is command and second column is data.
