var app = function(app, http) {
    var TelegramBot = require('node-telegram-bot-api'),
        // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
        telegram = new TelegramBot("340965091:AAHNKChTKxpwOZXBgkoCO99gS6Z2DH_6QyU", {
            polling: true
        });

    var identifyAssets = function(msg) {
            return new Promise(function(resolve, reject) {
                if (msg != null) {
                    // Test if the user has specified the stop and service number with the use of Regular Expressions(Regex).
                    const busObj = new Object();
                    busObj.bus = "";
                    busObj.stop = "";
                    let words = msg.split(" "),
                        _stopPattern = /^\d{5}$/
                    _busPattern = /^[a-zA-Z]*\d{1,3}(?!\w)$|^\d{1,3}[a-zA-Z]{1}$/;
                    for (let i = 0; i < words.length; i++) {
                        if (_stopPattern.test(words[i]) === true) {
                            busObj.stop = words[i];
                        } else if (_busPattern.test(words[i]) === true) {
                            busObj.bus = words[i];
                        }
                    }
                    if (busObj.bus != "" && busObj.stop != "") {
                        resolve(busObj);
                    } else {
                        resolve(null);
                    }
                }
            });
        },
        httpGetAsync = function(root, path, callback) {
            var options = {
                    host: root,
                    path: path,
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        AccountKey: 'VfAAnVl4S4q+i1l4KzlLQg=='
                    }
                },
                req = http.request(options, function(res) {
                    res.on('data', function(data) {
                        callback(data);
                    });
                });

            req.on('error', function(e) {
                console.log('ERROR: ' + e.message);
            });

            req.end();
        }

    telegram.on("text", (message) => {
        let msg = message.text.toLowerCase(),
            decision = new Promise((resolve, reject) => {
                if (msg.indexOf("/hellobot") === 0) {
                    resolve("Hello " + message.chat.first_name + ". How many I help you?");
                } else if (msg.indexOf("/start") === 0) {
                    resolve("Let us begin! Specify the stop and service number. Example: \"Bus 15 at 83139\".");
                } else if (msg.indexOf("/location") === 0) {
					var option = {
					        "parse_mode": "Markdown",
					        "reply_markup": {
					            "one_time_keyboard": true,
					            "keyboard": [[{
					                text: "My location",
					                request_location: true
					            }], ["Cancel"]]
					        }
					    };
				    telegram.sendMessage(message.chat.id, "where are you?", option).then(() => {
						// Handle location
						telegram.once("location",(msg)=>{
					    	telegram.sendMessage(msg.chat.id, "Recieved location: " + [MSG.location.longitude,msg.location.latitude].join(";"));
						});
				    });
				} else {
                    identifyAssets(msg).then(function(res) {
                        if (res !== null) {
                            let root = "datamall2.mytransport.sg",
                                path = "/ltaodataservice/BusArrivalv2?BusStopCode=" + res.stop + "&ServiceNo=" + res.bus;
                            httpGetAsync(root, path, function(data) {
                                let result = JSON.parse(data),
                                    services = result.Services;
                                    console.log(result);
									if(services.length > 0) {
										// Retrieving the respective estimated bus timings
		                                for (let i = 0; i < services.length; i++) {
											let service = services[i],
												now = new Date();
											const busTimings = new Object();
											busTimings.nextBus = new Date(service.NextBus.EstimatedArrival);
											busTimings.nextBus2 = new Date(service.NextBus2.EstimatedArrival);
											resolve("Bus 15 - Next bus: " + Math.round((((busTimings.nextBus - now) % 86400000) % 3600000) / 60000) + " min, "
											+ "Subsequent bus: " + Math.round((((busTimings.nextBus2 - now) % 86400000) % 3600000) / 60000) + " min");
		                                }
									} else {
										resolve("Unable to retreive bus data. Check if the bus/stop number is correct and that the bus operating hours is still valid.");
									}
                            });
                        } else {
                            // Other queries that has not been catered to.
                            resolve("Type /timings to begin.");
                        }
                    });
                }
            });

        decision.then((res) => {
            telegram.sendMessage(message.chat.id, res);
        });
    });
}


module.exports = app;
