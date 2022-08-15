# LAN-Party Manager
Tested on Windows 10/11 and Linux Debian 11/Ubuntu 22.04

# Features
- Member Regestration
- Member Administration
- Powerplug Monitoring
- Powerplug Administration
- Buffet Managment
- Buying from Buffets
- Pushnotifications
- Fully Translated
- Invoices
- Donations

# Requirements
- NodeJS 16 or above
- PostgreSQL
- PM2 Process Manager
- InfluxDB 2.0 (Optional)

# Installation
- Clone this repo
- Run `node install.js`
- 
# API

### WebServer
| Methode | Route | Permissions | Parameter | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| POST | /check | - | - | Will check if your token is valid |

### PlugServer
| Methode | Route | Permissions | Parameter | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| GET | / | - | - | Show Stats of the Relay |