# LAN-Party Manager
Tested on Windows 10/11 and Linux Debian 11/Ubuntu 22.04

- [Features](#Features)
- [Requirements](#Requirements)
- [Required config](#Required-config)
- [Installation](#Installation)
- [API](#API)
	- [WebServer](#WebServer)
	- [PlugServer](#PlugServer)
	- [WebSocket](#WebSocket)
- [Permissions](#Permissions)
- [NPM Scripts](#NPM-Scripts)
- [PDF Generator](#PDF-Generator)

## Features
- Member regestration & administration
- Powerplug monitoring & administration
- Buffet Buying & Managment
- Advanced permission and group managment with custom groups
- Pushnotifications
- Dynamic cost calculation by user
- [WIP] LAN Guests can add sub-users to their account with custom permissions and budget
- Food order managment
- Fully translated
- Build in monitoring, will notify if something is wrong with web, telegram or plugclients.
- Realtime Logs available via websocket
- [WIP] Invoices
- InfluxDB support for powerplug statistics, you can use it to create fancy graphs
- Donations

## Requirements
- NodeJS 16 or above
- PostgreSQL
- PM2 Process Manager
- InfluxDB 2.0 (Optional)

## Required config
There are multiple configs available in the config folder. You have to modify some of them to get the application running.
mainconfig.json
```js
{
    "SudoUser": "206921999", // Telegram Userid where some permission checks are skipped
    "LanName": "Sommerlan 2021", // Name of the LAN-Party (Or whatever you use this project for)
    "LanDauer": 8, // Duration of the LAN-Party in days
    "RegTokenLength": 32, // Leave it as is, its good enoth for 2022
    "WebTokenLength": 64, // Leave it as is, its good enoth for 2022
    "KontoInhaber": "Viktor", // Name of the account holder
    "KontoIban": "AT....", // IBAN of the account
    "KontoBank": "Österreichische Bank lol", // Name of the bank
    "Verwendungszweg": "Lan2021", // Purpose of the payment
    "LanChat": -1001675639034 // Telegram Chatid where all users are in (Notification Chat)
}
```
Please do NOT use float values in your prices, use integers instead.  
preisliste.json
```js
{   
    "FixKostenProTag": 1875, // Price that will be added per day of the stay to pay in advance. (In cents)
    "PauschalKosten": {
        "Wasser": {
            "Preis": 100, // Extra costs for water the user used to shower / toilet (In cents)
            "Beschreibung": "Wasserpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Strom": {
            "Preis": 500, // Extra costs for electricity the user used for light (In cents)
            "Beschreibung": "Strompauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Verbrauchsgüter": {
            "Preis": 400, // Extra costs for consumables (Toiletpaper, Soap, etc) the user used (In cents)
            "Beschreibung": "Verbrauchsgüterpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Netzwerk": {
            "Preis": 500, // Extra costs for the network the user used (In cents)
            "Beschreibung": "Netzwerkpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "StromKWH": {
            "Preis": 1000, // Cost per kwh thats used by his powerplug (In cents)
            "Beschreibung": "KostenKWH" // Key for the translator, only modify if you know what you are doing
        }
    },
    "SnackBar": {
		//Add as many items as you like, those are part of your buffet (Like a snack and minibar)
	"Spende": {
            "Name": "Spende", // Name of the item
            "Hersteller": "EBG.PW", // Manufacturer of the item
            "Preis": 100, // Price of the item (per item, in cents)
            "Menge": 500 // Amount of items available
        }
	}
}
```
List all your powerplugs here, you can define as many controlers as you like with any amount of plugs.  
Requirements: IP adresses MUST be available buy the software called plugclient.  
The token is used to authenticate the plugclient!  
plugsconfig.json
```js
{
    "conrolpers": [
        {
            "ControlerName": "Home",
            "token": "HomeTs",
            "Plugs": [
                {
                    "IP": "192.168.5.55"
                },
                {
                    "IP": "192.168.5.56"
                },
                {
                    "IP": "192.168.5.57"
                },
                {
                    "IP": "192.168.5.58"
                },
                {
                    "IP": "192.168.10.101"
                }
            ]
        }
    ]
}
```


## Installation
- Clone this repo
- Check the "Required config" section of the readme
- Run `npm run install` to install all dependencies & pm2 setup if you like
- Register via the TG Bot
- Run `/loadplugs` in Telegram as admin
- Run `/loadprices` in Telegram as admin
- Build the plugclient (Or use the prebuild one)
- Run the plugclient `plugclient -t <token> ` or use `plugclient -h` for more options

## API

### WebServer
| Methode | Route | Permissions | Parameter | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| POST | /check | - | - | Will check if your token is valid |

### PlugServer
| Methode | Route | Permissions | Parameter | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| GET | / | - | - | Show Stats of the Relay |
| GET | /raw | - | - | Show Raw Data of the Relay |

### WebSocket
You can subscribe to the following events without any authentification:  
Route `/webuser`, Payload: `{"event": "subscribe_totalpower", "data_payload": {}}` this will push you total power usage.  
You can subscribe to the applications log with your webtoken as authentication:  
Router `/webuser`, Payload `{"event": "subscribe_logs", "data_payload": {"webtoken": "Your Admin Webtoken"}}` you can also add the ID parameter to subscribe to a specific pm2_process log.  

## Permissions
Every route or group of routes got a set permission, a list is here:
Admin:
| Permission | Description |
| ------------- | ------------- |
|admin_all| Permissions to everything|
|admin_bestellungen| Can manage group food orders|
|admin_finanzen| Can see money related information|
|admin_inventory| Can see the entire inventora and donations made|
|admin_strom| Can set the state of every plug and can request them|
|admin_user| Can manage users|
|admin_permissions| Can manage permissions|
|admin_plugs| Can manage plugs|

User:
| Permission | Description |
| ------------- | ------------- |
|user_bestellungen| Can order food if got the orderid|
|user_finanzen| Can see his own money|
|user_inventory| Can see inventory and donations|
|user_strom| Can see his own powerusage|
|user_user| Can see other party members|
|user_subadmin| Can manage his guests|
|sub_user| To track if its a subuser, do not give this to normal users!|

## NPM Scripts
| Script | Description |
| ------------- | ------------- |
| install | Install all dependencies and setup pm2 |
| addadmin | Give the mainconfig.superuser his admin permissions |
| location | Add a plug location (SHOULD BE DONE VIA CONFIG!) |

## PDF Generator
You can use the PDF Generator to generate a PDF by following the struct:
```v
struct PDFTemplate {
	username string [required]
	userid string [required]
	headline string [required]
	date string [required]
	items []struct {
		artikel string [required]
		priceper string [required]
		amount string [required]
		price string [required]
	} [required]
}
```
You need to generate config.json in the same direcotry as the binary. 
The first element of the items[] will be used as the header of the table.
The last 3 will be used as the footer of the table. (Sum, Tax, etc)
