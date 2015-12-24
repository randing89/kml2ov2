const fs = require('fs');
const path = require('path');
const xml2json = require('xml2json');
const ov2 = require('furkot-tomtom-ov2');
const argv = require('minimist')(process.argv.slice(2));

// Check filename
if (!argv.in) {
    console.log(`Usage: node ./index.js --in input_path.kml.xml [--out output_path]`);
    process.exit(0);
}

var fileName = path.basename(argv.in, path.extname(argv.in));
var filePath = path.resolve(argv.in);
var outputPath = path.resolve(argv.out || `./${fileName}.ov2`);

if (!fs.existsSync(filePath)) {
    console.error(`Can not file KML file in ${filePath}`);
    process.exit(0);
}

// Write to ov2 file
console.log(`Writing to file ${outputPath}`);
fs.writeFileSync(outputPath, convert(fs.readFileSync(filePath)));

/**
 * Convert KML to ov2
 *
 * @param {String|Buffer} kml KML file content
 * @returns {Buffer} OV2 file content
 */
function convert(kml) {
    var json = JSON.parse(xml2json.toJson(kml));
    var places = ((json.kml || {}).Document || {}).Placemark || [];

    // Convert POIs
    var steps = [];
    places.forEach(place => {
        if (place.LineString) {
            // Exclude line data
            return;
        }

        var name = place.name;
        var coordinates = place.Point.coordinates.split(',').map(s => { return s.trim() });
        var longitude =  Number(coordinates[0]);
        var latitude = Number(coordinates[1]);

        steps.push(newStep(name, longitude, latitude));
    });

    return ov2({routes: [{points: steps}]});
}

// Helpers
function newStep(name, longitude, latitude) {
    return {
        name: name,
        coordinates: {
            lon: longitude,
            lat: latitude
        }
    }
}

module.exports = convert;