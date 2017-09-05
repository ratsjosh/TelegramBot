class Bus {
	constructor() {
		this.stop = null;
		this.service = null;
   	}

   	time(_nextBus, _nextBus2) {
        let now = new Date();
		this.nextBus = Math.round((((_nextBus - now) % 86400000) % 3600000) / 60000);
		this.nextBus2 = Math.round((((_nextBus2 - now) % 86400000) % 3600000) / 60000);
		return this;
   	}

	identifyAssets(msg) {
        return new Promise(function(resolve, reject) {
            if (msg != null) {
                // Test if the user has specified the stop and service number with the use of Regular Expressions(Regex).
                let words = msg.split(" "),
	                _stopPattern = /^\d{5}$/,
	                _busPattern = /^[a-zA-Z]*\d{1,3}(?!\w)$|^\d{1,3}[a-zA-Z]{1}$/,
	                busObj = new Object();
                for (let i = 0; i < words.length; i++) {
                    if (_stopPattern.test(words[i]) === true) {
                        busObj.stop = words[i];
                    } else if (_busPattern.test(words[i]) === true) {
                        busObj.service = words[i];
                    }
                }
                if (busObj.service != "" && busObj.stop != "") {
                    resolve(busObj);
                } else {
                    resolve(undefined);
                }
            }
        });
    }
}
module.exports = Bus;