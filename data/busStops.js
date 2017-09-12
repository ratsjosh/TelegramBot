const fs = require('fs');

// let bus_stops;

// module.exports = class BusStops {
//     init() {
//         fs.readFile('./data/bus-stops.json', 'utf8', function (err, data) {
//         if (err) {
//                 throw err; 
//             }
//             bus_stops = JSON.parse(data);
//         });
//     }

//     getBusStops() {
//         if(this.bus_stops.length == 0) {
//             this.populateBusStops();
//         }
//         else {
//             return bus_stops;
//         }
//     }
// }

let bus_stops = [];

module.exports = {
    init: () => {
        fs.readFile('./data/bus-stops.json', 'utf8', function (err, data) {
        if (err) {
                throw err; 
            }
            bus_stops = JSON.parse(data);
        });
    },

    getBusStops: () => {
        return bus_stops;
    }
}