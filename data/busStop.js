const fs = require('fs'),
    _protocols = require('../functions/http.js'),
    // Require messageFactory to produce the appropriate message for the respective request(s)
    _messageFactory = require('../factories/messageFactory.js'),
    _bus = require('../models/bus.js');

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

    createBusReply: (onPremiseBusStops, callback) => {
        let root = "datamall2.mytransport.sg",
            busApiPath = "/ltaodataservice/BusArrivalv2?BusStopCode=",
            headers = {
                accept: 'application/json',
                AccountKey: 'VfAAnVl4S4q+i1l4KzlLQg=='
            },
            message = '';

        for (let j = 0; j < onPremiseBusStops.length; j++) {
            _protocols.httpGetAsync(root, busApiPath + onPremiseBusStops[j].no, headers, function(data) {
                let stopNo = data.BusStopID,
                    services = data.Services,
                    buses = [];
                if (services.length > 0) {
                    // Retrieving the respective estimated bus timings
                    for (let i = 0; i < services.length; i++) {
                        let service = services[i],
                            bus = {};
                        if (service.NextBus.EstimatedArrival.length > 0 && service.NextBus2.EstimatedArrival.length > 0) {
                            bus = new _bus(onPremiseBusStops[j].no, service.ServiceNo, new Date(service.NextBus.EstimatedArrival), new Date(service.NextBus2.EstimatedArrival));
                        } else {
                            bus = new _bus(onPremiseBusStops[j].no, service.ServiceNo, null, null);
                        }
                        buses.push(bus);
                    }
                    message += _messageFactory.formulateBusTimings(onPremiseBusStops[j], buses);
                }
                if(j + 1 == onPremiseBusStops.length) {
                    callback(message);
                }
            });
        }
    },

    // Source: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    distance: (position1, position2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = toRadians(position2.lat - position1.lat); // deg2rad below
        var dLon = toRadians(position2.lng - position1.lng);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(position1.lat)) * Math.cos(toRadians(position2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }
}