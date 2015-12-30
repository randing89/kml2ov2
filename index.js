#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const xml2json = require('xml2json');
const ov2 = require('furkot-tomtom-ov2');
const sanitize = require("sanitize-filename");
const argv = require('minimist')(process.argv.slice(2));

// Check filename
if (!argv.in) {
    console.log(`Usage: kml2ov2 --in input_path.kml.xml [--out output_path]`);
    process.exit(0);
}

var kmlFilePath = path.resolve(argv.in);
if (!fs.existsSync(kmlFilePath)) {
    console.error(`Can not find KML file at ${kmlFilePath}`);
    process.exit(0);
}

// Convert to OV2
try {
    convertFile(JSON.parse(xml2json.toJson((fs.readFileSync(kmlFilePath)))), path.resolve(argv.out || path.dirname(kmlFilePath)));
} catch (e) {
    console.error('Not a valid KML file: ' + e.message);
    process.exit(0);
}

/**
 * Write KML to OV2
 *
 * @param {JSON} json JSON representation of KML
 * @param {string} outputBasePath
 */
function convertFile(json, outputBasePath) {
    convert(json).forEach(ov2 => {
        var outputPath = path.join(outputBasePath, sanitize(`${ov2.name}.ov2`, {replacement: '-'}));

        // Write to ov2 file
        console.log(`Writing to file: ${outputPath}`);
        fs.writeFileSync(outputPath, ov2.content);
    });
}

/**
 * Get name from KML document
 *
 * @param {JSON} document
 * @returns {string}
 */
function getName(document) {
    return document.name || 'Unnamed Document';
}

/**
 * @typedef {OV2} OV2
 * @property name Name of the layer
 * @property content Content of ov2 file
 */
/**
 * Convert KML to OV2
 *
 * @param json JSON representation of KML
 * @return {OV2[]} ov2 files
 */
function convert(json) {
    var kml = json.kml || {};
    var document = kml.Document;
    if (!document) {
        throw new Error('XML must contain at least 1 document');
    }

    var documents = document.Folder || [];
    if (!documents.length) {
        // KML only contains single layer
        documents.push(document);
    }

    return documents.map(document => {
        return {
            name: getName(document),
            content: convertDocument(document)
        }
    });
}

/**
 * Convert KML document to ov2
 *
 * @param {JSON} document KML document
 * @returns {Buffer} OV2 file content
 */
function convertDocument(document) {
    var places = document.Placemark || [];

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
/**
 * Generate a step
 *
 * @param {string} name POI name
 * @param {number} longitude
 * @param {number} latitude
 * @returns {{name: string, coordinates: {lon: number, lat: number}}}
 */
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