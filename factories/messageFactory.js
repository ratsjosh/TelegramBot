var message = {
	formulateBusTimings: function(busStop, buses) {
		let msg = "\u{1F68F}" + busStop.name + " - *" + busStop.no + "*\n";
		for(let i = 0; i < buses.length; i++) {
			let bus = buses[i],
				nextBus = "Not in operation",
				nextBus2 = "Not in operation",
		        serviceNo = bus.service;
			if(bus.nextBus != null && bus.nextBus2 != null) {
				nextBus = bus.nextBus <= 1 ? "_Arr_" : bus.nextBus += " min",
		        subBus = bus.nextBus2 <= 1 ? "_Arr_" : bus.nextBus2 += " min";
	        }
	        msg += "\u{1F68C} *Bus " + serviceNo + "*: " + nextBus + " | " + subBus + "\n";
		}
		return msg + "\n\n";
	},
	formulateBusTiming: function(bus) {
		let nextBus = "Not in operation",
			nextBus2 = "Not in operation",
			serviceNo = bus.service;
		if(bus.nextBus != null && bus.nextBus2 != null) {
			nextBus = bus.nextBus <= 1 ? "_Arr_" : bus.nextBus += " min",
	        subBus = bus.nextBus2 <= 1 ? "_Arr_" : bus.nextBus2 += " min";
        }
		return "\u{1F68C} *Bus " + serviceNo + "*: " + nextBus + " | " + subBus + "\n\n";
	},

	formulateError: function() {
		return "Unable to retreive bus data. Check if the bus/stop number is correct and that the bus operating hours is still valid.";
	}
}
module.exports = message;