# LAN-Party Manager
Tested under Windows 10/11 and Linux Debian 11/Ubuntu 22.04

- [Features](#Features)
- [Requirements](#Requirements)
- [Required config](#Required-config)
- [Installation](#Installation)
- [Telegram Commands](#Telegram-Commands)
    - [User Commands](#User)
    - [Admin Commands](#Admin)
- [API](#API)
	- [WebServer](#WebServer)
	- [PlugServer](#PlugServer)
	- [WebSocket](#WebSocket)
- [Permissions](#Permissions)
- [NPM Scripts](#NPM-Scripts)
- [PDF Generator](#PDF-Generator)

## Features
- Member registration & management
- Power plug monitoring & management
- Buffet purchase & management
- Advanced rights & group management with custom groups
- Pushnotifications
- Dynamic cost calculation by user
- WIP] LAN guests can add sub-users to their account with custom permissions and budget
- Food order management
- Fully translated
- Built-in monitoring, notifies when something is wrong with web, telegram or plug clients.
- Real-time logs available via websocket
- WIP] Invoices
- InfluxDB support for Powerplug statistics, so you can create fancy charts
- Donate
## Requirements
- NodeJS 16 or higher
- PostgreSQL
- PM2 Process Manager
- InfluxDB 2.0 (Optional)

## Required config
TThere are several configurations in the config folder. You need to change some of them to get the application running.
mainconfig.json
```js
{
    "SudoUser": "206921999", // Telegram userid where some permission checks are skipped
    "LanName": "Sommerlan 2021", // name of the LAN party (or whatever you use this project for)
    "LanDauer": 8, // Duration of the LAN-Party in days
    "RegTokenLength": 32, // Leave it as is, its good enough for 2022
    "WebTokenLength": 64, // Leave it as is, its good enough for 2022
    "KontoInhaber": "Viktor", // Name of the account owner
    "KontoIban": "AT....", // IBAN of the account
    "KontoBank": "Österreichische Bank lol", // Name of the bank
    "Verwendungszweg": "Lan2021", // Purpose of payment
    "LanChat": -1001675639034 // Telegram ChatID where all users are located (notification chat)
}
```
Please DO NOT use float values in your prices, use integers instead.  
preisliste.json
```js
{   
    "FixKostenProTag": 1875, // Price charged per day of stay for prepayment. (In cents)
    "PauschalKosten": {
        "Wasser": {
            "Preis": 100, // Additional cost for water used by the user for showering/WC (In cents)
            "Beschreibung": "Wasserpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Strom": {
            "Preis": 500, // Additional cost for electricity used by user for light (in cents)
            "Beschreibung": "Strompauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Verbrauchsgüter": {
            "Preis": 400, //  Additional cost of consumables (toilet paper, soap, etc.) used by the user (in cents)
            "Beschreibung": "Verbrauchsgüterpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "Netzwerk": {
            "Preis": 500, //  Additional cost for the network used by the user (in cents).
            "Beschreibung": "Netzwerkpauschale" // Key for the translator, only modify if you know what you are doing
        },
        "StromKWH": {
            "Preis": 1000, // Cost per kWh consumed by the power plug (in cents).
            "Beschreibung": "KostenKWH" // Key for the translator, only modify if you know what you are doing
        }
    },
    "SnackBar": {
		//Add as many items as you want, these are part of your buffet (like a snack and a minibar)
	"Spende": {
            "Name": "Spende", // name of the item
            "Hersteller": "EBG.PW", // manufacturer of the item
            "Preis": 100, // price of the item (per item, in cents)
            "Menge": 500 // amount of items available
        }
	}
}
```
List all your sockets here. You can define as many controllers with as many plugs as you want.  
Prerequisites: IP addresses MUST be available to the plugclient software.  
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
- Run `npm run install` and follow the instructions
- Run `/loadplugs` in Telegram as admin
- Run `/loadprices` in Telegram as admin
- Build the plugclient (Or use the prebuild one)
- Run the plugclient `plugclient -t <token> ` or use `plugclient -h` for more options

## Telegram Commands
### User
- `/start` - Start the registration process
- `/hauptmenu` - Show the main menu

### Admin
- `/admin [add/rem/list]` - Add, remove or list admins
- `/loadplugs` - Load all powerplugs from the config
- `/loadprices` - Load all prices from the config
- `/geninvoices` - Generate invoices for all users

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
You can subscribe to the following events without authentication:  
Route `/webuser`, Payload: `{"event": "subscribe_totalpower", "data_payload": {}}` This will give you the total power consumption.  
You can subscribe to the application log using your webtoken as authentication:  
Router `/webuser`, Payload `{"event": "subscribe_logs", "data_payload": {"webtoken": "Your Admin Webtoken"}}` you can also add the ID parameter to subscribe to a specific pm2_process log

## Permissions
Each route or group of routes has a specific permission, a list can be found here:
Admin:
| Permission | Description |
| ------------- | ------------- |
|admin_all| Permissions for everything|
|admin_bestellungen| Can manage collective food orders|
|admin_finanzen| Can see money related information|
|admin_inventory| Can view all inventory and donations made|
|admin_strom|  Can set and query the status of each connector|
|admin_user| Can manage users|
|admin_permissions| Can manage permissions|
|admin_plugs| Can manage plugs|

User:
| Permission | Description |
| ------------- | ------------- |
|user_bestellungen| Can order food if he has the order number|
|user_finanzen| Can see his own money|
|user_inventory| Can see inventory and donations|
|user_strom| Can see his own power consumption|
|user_user| Can see other party members|
|user_subadmin| Can manage his guests|
|sub_user| To track if this is a subuser, do not give this to normal users!|

## NPM Scripts
| Script | Description |
| ------------- | ------------- |
| install | Install all dependencies and sets up pm2 |
| addadmin | Give the superuser mainconfig.superuser its admin rights |
| location | Add a plug location (SHOULD be done BY CONFIG!)) |

## PDF Generator
You can use the PDF generator to create a PDF by following the structure::
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
You must create config.json in the same directory as the binary file. 
The first element of the items[] will be used as the header of the table.
The last 3 are used as the footer of the table. (total, tax, etc.)
