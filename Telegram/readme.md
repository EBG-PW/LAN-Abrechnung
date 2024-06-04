# Lanparty Finazen - Telegram Interface
  This software will handle all communication between the telegram app, database and webbackend  
  
## Installation
   ```sh
   git clone https://github.com/EBG-PW/LAN-Abrechnung.git
   cd ./LAN-Abrechnung/Telegram && npm i
   nano .env
   node ./index.js
   ```
   .env
   ```env
   Telegram_Bot_Token=
Sprache=./lang
Config=./config
DB_USER=lan
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=
WebPanelURL=https://lan.ebg.pw
   ```
   
## Commands
### Admin
__/loadprice__ - Will update the products table from the file preisliste.json  
__/admin [Action]__ - Add/Remove/List users with admin permissions of the project  
### User
__/start__ - Displays welcome message and button to register  
__/hauptmenu__ - Will show the main menue with all buttons  