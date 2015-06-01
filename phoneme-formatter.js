var exportMethods = require('export-methods');
var spaceRe = / /g;

function sequenceStringToDbString(sequenceString) {
  return sequenceString.replace(spaceRe, '_');
}

module.exports = exportMethods(
  sequenceStringToDbString
);
