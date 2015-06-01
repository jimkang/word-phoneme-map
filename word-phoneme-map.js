var exportMethods = require('export-methods');
var basicSubleveler = require('basic-subleveler');
// var callNextTick = require('call-next-tick');

function createWordPhonemeMap(opts) {
  if (!opts || !opts.dbLocation) {
    throw new Error('Cannot create wordPhonemeMap without dbLocation.');
  }

  var db = basicSubleveler.setUpSubleveledDB({
    dbLocation: opts.dbLocation,
    sublevels: {
      words: 'w',
      phonemes: 'p'
    }
  });

  function wordsForPhonemeSequence(sequence, done) {
    var sequenceString = sequence.join('_');
    var seqLevel = db.phonemes.sublevel(sequenceString);
    basicSubleveler.readAllValuesFromSublevel(seqLevel, done);
  }

  return exportMethods(wordsForPhonemeSequence);
}

module.exports = createWordPhonemeMap;
