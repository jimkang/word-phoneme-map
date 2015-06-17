var queue = require('queue-async');
var level = require('level');
var basicSubleveler = require('basic-subleveler');
var phonemeTypes = require('phoneme-types');
var callNextTick = require('call-next-tick');
var createLevelTree = require('basic-level-tree');

function createPhonemeIndexer(opts, done) {
  var db = level(
    opts.dbLocation,
    {
      valueEncoding: 'json'
    }
  );

  var db = basicSubleveler.setUpSubleveledDB({
    db: db,
    sublevels: {
      words: 'w',
      phonemes: 'p'
    }
  });

  var reversePhonemesRoot;

  var levelTree = createLevelTree(
    {
      db: db,
      treeName: 'reverse-phonemes',
      root: 'END'
    },
    passBackMethods
  );

  function passBackMethods(error, root) {
    if (error) {
      done(error);
    }
    else {
      reversePhonemesRoot = root;
      var indexerMethods = {
        index: index,
        closeDb: db.close.bind(db)
      };
      done(error, indexerMethods);
    }
  }

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
}

function stringIsEmpty(s) {
  return (typeof s !== 'string' || s.length < 1);
}

var ordinalRegex = /\(\d\)/;

function stripOrdinal(word) {
  return word.replace(ordinalRegex, '');
}


module.exports = createPhonemeIndexer;
