const fs = require('fs');

let bus_stops = [],
    bus_stops_map;

function toRadians(value) {
    return value * Math.PI / 180;
}

module.exports = {
    init: () => {
        bus_stops = JSON.parse(fs.readFileSync('./data/bus-stops.json', 'utf8'));
        bus_stops_map = new Map(bus_stops.map((i) => [i.no, i]));
    },

    getBusStops: () => {
        return bus_stops;
    },

    getBusStopsMap: () => {
         return bus_stops_map;
    },

    distance: (position1, position2) => {
        const lat1 = position1.lat,
            lat2 = position2.lat,
            lon1 = position1.lng,
            lon2 = position2.lng,
            R = 6371000, // metres
            φ1 = toRadians(lat1),
            φ2 = toRadians(lat2),
            Δφ = toRadians(lat2 - lat1),
            Δλ = toRadians(lon2 - lon1);

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        var d = R * c;
        return d;
    }
}