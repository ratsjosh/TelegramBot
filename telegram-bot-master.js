var TelegramBotMaster = function(app, http) {
        // Require protocol module to handle HTTP request(s)
    var _protocols = require('./functions/http.js'),
        protocols = new _protocols(http),
        
        // Require fs module to async read files in local project
        _fs = require('fs'),

        // Require bus module to init. and utilize function(s) related to a bus object
        _bus = require('./models/bus.js'),
        
        // Require messageFactory to produce the appropriate message for the respective request(s)
        _messageFactory = require('./factories/messageFactory.js'),
        
        // Require telegram-bot-api module to handle telegram request(s)
        TelegramBot = require('node-telegram-bot-api'),
        // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
        // Debug bot: 420264755:AAHcfQag15DYw58cgFpouwyEqP5UNEKVasY
        // Hosted bot: 393548032:AAF8Nb8zwj5vP92pF1xwP9D0piF5AUBbK9U
        telegram = new TelegramBot("393548032:AAF8Nb8zwj5vP92pF1xwP9D0piF5AUBbK9U", {
            polling: true
        });

        busStops = [];

    var populateBusStops = function() {
        _fs.readFile('./data/bus-stops.json', 'utf8', function (err, data) {
            if (err) {
                throw err; 
            }
            busStops = JSON.parse(data);
        });
    }

    populateBusStops();

    // Handle location
    telegram.on("location", (msg) => {
        telegram.sendMessage(msg.chat.id, "Recieved location: " + [msg.location.longitude, msg.location.latitude].join(";"));
        
    });

    telegram.on("text", (message) => {
        // A simple check in case busStops array has not been poplated.
        if(busStops.length == 0) {
            console.log("Bus stops unprepared popluation process initiated.");
            populateBusStops();
        }
        let msg = message.text.toLowerCase(),
            decision = new Promise((resolve, reject) => {
                if (msg.indexOf("/hellobot") === 0) {
                    resolve("Hello " + message.chat.first_name + ". How many I help you?");
                } else if (msg.indexOf("/start") === 0) {
                    resolve("Let us begin! Specify the service and stop number. Example: \"Bus 15 at 83139\".");
                } else if (msg.indexOf("/search") === 0) {
                    _bus.identifyAssets(msg.replace("/search", "").trim()).then(function(res) {
                        if (res !== undefined && res.stop !== undefined && res.service !== undefined) {
                            let root = "datamall2.mytransport.sg",
                                path = "/ltaodataservice/BusArrivalv2?BusStopCode=" + res.stop + "&ServiceNo=" + res.service,
                                headers = {accept: 'application/json', AccountKey: 'VfAAnVl4S4q+i1l4KzlLQg=='};   
                            protocols.httpGetAsync(root, path, headers, function(data) {
                                	let stopNo = data.BusStopID,
                                        services = data.Services;
                                if (services.length > 0) {
                                    // Retrieving the respective estimated bus timings
                                    let service = services[0],
                                        bus = {};
                                    if(service.NextBus.EstimatedArrival.length > 0 && service.NextBus2.EstimatedArrival.length > 0) {
                                        bus = new _bus(res.stop, service.ServiceNo, new Date(service.NextBus.EstimatedArrival), new Date(service.NextBus2.EstimatedArrival));
                                    } else {
                                        bus = new _bus(res.stop, service.ServiceNo, null, null);
                                    }
                                    resolve(_messageFactory.formulateBusTiming(bus));
                                } else {
                                    resolve(_messageFactory.formulateError());
                                }
                            });
                        } else if(res !== undefined && res.stop !== undefined) {
                            let root = "datamall2.mytransport.sg",
                                path = "/ltaodataservice/BusArrivalv2?BusStopCode=" + res.stop,
                                headers = {accept: 'application/json', AccountKey: 'VfAAnVl4S4q+i1l4KzlLQg=='};   
                            protocols.httpGetAsync(root, path, headers, function(data) {
                                let stopNo = data.BusStopID,
                                    services = data.Services,
                                    buses = [];
                                if (services.length > 0) {
                                    // Retrieving the respective estimated bus timings
                                    for (let i = 0; i < services.length; i++) {
                                        let service = services[i],
                                            bus = {};
                                        if(service.NextBus.EstimatedArrival.length > 0 && service.NextBus2.EstimatedArrival.length > 0) {
                                            bus = new _bus(res.stop, service.ServiceNo, new Date(service.NextBus.EstimatedArrival), new Date(service.NextBus2.EstimatedArrival));
                                        } else {
                                            bus = new _bus(res.stop, service.ServiceNo, null, null);
                                        }
                                        buses.push(bus);
                                    }
                                    resolve(_messageFactory.formulateBusTimings(buses)); 
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