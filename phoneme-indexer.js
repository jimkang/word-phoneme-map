var queue = require('queue-async');
var basicSubleveler = require('../basic-subleveler');
var phonemeTypes = require('phoneme-types');
var callNextTick = require('call-next-tick');

function createPhonemeIndexer(opts) {
   var db = basicSubleveler.setUpSubleveledDB({
    dbLocation: opts.dbLocation,
    sublevels: {
      words: 'w',
      phonemes: 'p'
    }
  });

  function index(word, phonemeString, done) {
    phonemeString = phonemeTypes.stripStressor(phonemeString);
    if (stringIsEmpty(word)) {
      callNextTick(done, new Error('Missing word.'));
      return;
    }
    if (stringIsEmpty(phonemeString)) {
      callNextTick(done, new Error('Missing phonemeString.'));
      return;
    }
    
    var q = queue();

    // Index by word.
    q.defer(db.words.put, word, phonemeString);

    // Index by phoneme string.
    var phonemeLevel = db.phonemes.sublevel(phonemeString);

    q.defer(phonemeLevel.put, word, word);

    q.awaitAll(done);
  }

  return {
    index: index,
    closeDb: db.close
  };
}


function stringIsEmpty(s) {
  return (typeof s !== 'string' || s.length < 1);
}

module.exports = createPhonemeIndexer;
