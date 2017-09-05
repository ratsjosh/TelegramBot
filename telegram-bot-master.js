var TelegramBotMaster = function(app, http) {
    var TelegramBot = require('node-telegram-bot-api'),
        _protocols = require('./functions/http.js'),
        protocols = new _protocols(http),
        _bus = require('./models/bus.js'),
        bus = new _bus(),
        // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
        // Debug bot: 420264755:AAHcfQag15DYw58cgFpouwyEqP5UNEKVasY
        // Hosted bot: 393548032:AAF8Nb8zwj5vP92pF1xwP9D0piF5AUBbK9U
        telegram = new TelegramBot("393548032:AAF8Nb8zwj5vP92pF1xwP9D0piF5AUBbK9U", {
            polling: true
        });

    // Handle location
    telegram.on("location", (msg) => {
        telegram.sendMessage(msg.chat.id, "Recieved location: " + [msg.location.longitude, msg.location.latitude].join(";"));
        
    });

    telegram.on("text", (message) => {
        let msg = message.text.toLowerCase(),
            decision = new Promise((resolve, reject) => {
                if (msg.indexOf("/hellobot") === 0) {
                    resolve("Hello " + message.chat.first_name + ". How many I help you?");
                } else if (msg.indexOf("/start") === 0) {
                    resolve("Let us begin! Specify the service and stop number. Example: \"Bus 15 at 83139\".");
                } else if (msg.indexOf("/search") === 0) {
                    bus.identifyAssets(msg.replace("/search", "").trim()).then(function(res) {
                        if (res !== undefined) {
                            let root = "datamall2.mytransport.sg",
                                path = "/ltaodataservice/BusArrivalv2?BusStopCode=" + res.stop + "&ServiceNo=" + res.service,
                                headers = {accept: 'application/json', AccountKey: 'VfAAnVl4S4q+i1l4KzlLQg=='};   
                            protocols.httpGetAsync(root, path, headers, function(data) {
                                let result = JSON.parse(data),
                                	stopNo = result.BusStopID,
                                    services = result.Services;
                                if (services.length > 0) {
                                    // Retrieving the respective estimated bus timings
                                    for (let i = 0; i < services.length; i++) {
                                        let service = services[i],
                                            now = new Date(),
                                            busTimes = bus.time(new Date(service.NextBus.EstimatedArrival), new Date(service.NextBus2.EstimatedArrival)),
                                            nextBus = Math.round((((busTimes.nextBus - now) % 86400000) % 3600000) / 60000),
                                            subBus = Math.round((((busTimes.nextBus2 - now) % 86400000) % 3600000) / 60000);
                                        nextBus = nextBus <= 1 ? "Arriving" : nextBus += " min";
                                        subBus = subBus <= 1 ? "Arriving" : subBus += " min";
                                        resolve("Bus " + service.ServiceNo + " - Next bus: " + nextBus + ", " +
                                            "Subsequent bus: " + subBus);
                                    }
                                } else {
                                    resolve("Unable to retreive bus data. Check if the bus/stop number is correct and that the bus operating hours is still valid.");
                                }
                            });
                        } else {
                            // Other queries that has not been catered to.
                            resolve("Type /start to begin.");
                        }
                    });
                }
            });
        decision.then((res) => {
            var option = {
                "parse_mode": "Markdown",
                "reply_markup": {
                    "resize_keyboard": true,
                    "keyboard": [
                        [{
                            text: "My location",
                            request_location: true
                        }]
                    ]
                }
            };
            telegram.sendMessage(message.chat.id, res, option);
        });
    });
}


module.exports = TelegramBotMaster;