var queue = require('queue-async');
var basicSubleveler = require('basic-subleveler');
var phonemeTypes = require('phoneme-types');
var callNextTick = require('call-next-tick');

function createPhonemeIndexer(opts) {
   var db = basicSubleveler.setUpSubleveledDB({
    dbLocation: opts.dbLocation,
    valueEncoding: 'json',
    sublevels: {
      words: 'w',
      phonemes: 'p'
    }
  });

  function index(word, cmuDictPhonemeString, done) {
    var phonemeString = phonemeTypes.stripStressor(cmuDictPhonemeString);
    var phonemes = phonemeString.split(' ');
    phonemeString = phonemes.join('_');

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
    var cleanedWord = stripOrdinal(word);
    var wordLevel = db.words.sublevel(cleanedWord);
    q.defer(wordLevel.put, phonemeString, phonemes);

    // Index by phoneme string.
    var phonemeLevel = db.phonemes.sublevel(phonemeString);

    q.defer(phonemeLevel.put, cleanedWord, cleanedWord);

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

var ordinalRegex = /\(\d\)/;

function stripOrdinal(word) {
  return word.replace(ordinalRegex, '');
}


module.exports = createPhonemeIndexer;
