# kml2vo2
Convert Google KML file to Tomtom VO2 POI format

Support convert KML exported form https://www.google.com/maps/d/ to Tomtom Mydrive .ov2 POI format

## Command line usage

```
npm install kml2vo2 -g
```
```
kml2vo2 --in input_path.kml.xml [--out output_path]
```

## Library usage

```
npm install kml2vo2
```

```javascript
const kml2vo2 = require('kml2vo2');

/**
 * @typedef {OV2} OV2
 * @property name Name of the layer
 * @property content Content buffer of ov2 file
 */
/**
 * Convert KML to OV2
 *
 * @param json JSON representation of KML
 * @return {OV2[]} ov2 files
 */
var ov2BufferArray = kml2vo2(json);
```