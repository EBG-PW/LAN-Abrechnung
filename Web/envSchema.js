module.exports = {
    "APPLICATION": {
        "type": "string",
        "validation": "min:0||max:24"
    },
    "LOG_LEVEL": {
        "section": "Logging",
        "type": "number",
        "validation": "required||min:0||max:4",
        "default": 3,
        "discription": "0 = error, 1 = warning, 2 = info, 3 = debug, 4 = system"
    },
    "LOG_TYPE": {
        "type": "string",
        "validation": "required||custom_list:console,stdout",
        "default": "console",
        "discription": "console or stdout"
    },
    "LOG_COLOR": {
        "type": "string",
        "validation": "required||custom_list:true,false",
        "default": "true",
        "discription": "true or false"
    },
    "LOG_TEMPLATE": {
        "type": "string",
        "validation": "min:0||max:255",
        "default": "",
        "discription": "leave empty for default or enter a custom template"
    },
    "LOG_STACK": {
        "type": "string",
        "validation": "required||custom_list:true,false",
        "default": "false",
    },
    "WebPanelURL": {
        "section": "Web Server",
        "type": "string",
        "validation": "required",
        "default": "http://localhost:3000",
        "discription": "URL to access the web panel"
    },
    "PORT": {
        "type": "number",
        "validation": "required||min:0||max:65535",
        "default": 3000,
        "discription": "Port to run the web server on"
    },
    "SALT_ROUNDS": {
        "type": "number",
        "validation": "required||min:0||max:20",
        "default": 10,
        "discription": "Number of rounds to use when hashing passwords"
    },
    "DB_USER": {
        "section": "Database PG",
        "type": "string",
        "validation": "required||min:0||max:255",
    },
    "DB_PASSWORD": {
        "type": "string",
        "validation": "required||min:0||max:255",
    },
    "DB_HOST": {
        "type": "string",
        "validation": "required||ipv4",
    },
    "DB_PORT": {
        "type": "number",
        "validation": "required||min:0||max:65535",
    },
    "DB_NAME": {
        "type": "string",
        "validation": "required||min:0||max:255",
    },
    "REDIS_USER": {
        "section": "Database Redis (Cache)",
        "type": "string",
        "validation": "min:0||max:255",
    },
    "REDIS_PASSWORD": {
        "type": "string",
        "validation": "min:0||max:255",
    },
    "REDIS_HOST": {
        "type": "string",
        "validation": "ipv4",
    },
    "REDIS_PORT": {
        "type": "number",
        "validation": "min:0||max:65535",
    },
    "REDIS_DB": {
        "type": "string",
        "validation": "min:0||max:255",
    },
    "CACHE_DRIVER": {
        "section": "Cache",
        "type": "string",
        "validation": "required||custom_list:local,redis",
        "default": "local"
    },
    "DAFULT_DECREASEPERMIN": {
        "type": "number",
        "validation": "required||min:0||max:1000000",
        "default": 30
    },
}