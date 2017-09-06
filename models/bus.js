class Bus {
    constructor(_stop, _service, _nextBus, _nextBus2) {
        this.stop = _stop !== null ? _stop : null;
        this.service = _service;
        let now = new Date();
		this.nextBus = _nextBus != null ? Math.round((((_nextBus - now) % 86400000) % 3600000) / 60000) : null;
		this.nextBus2 = _nextBus2 != null ? Math.round((((_nextBus2 - now) % 86400000) % 3600000) / 60000) : null;
		return this;
   	}

	static identifyAssets(msg) {
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