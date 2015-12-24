# kml2vo2
Convert Google KML file to Tomtom VO2 POI format

Support convert KML exported form https://www.google.com/maps/d/ to Tomtom Mydrive .ov2 POI format

## Commandline usage
```
node ./index.js --in input_path.kml.xml [--out output_path]
```

## Library usage
```
const kml2vo2 = require('kml2vo2');
var ov2Buffer = kml2vo2(kmlContentStringOrBuffer);
```