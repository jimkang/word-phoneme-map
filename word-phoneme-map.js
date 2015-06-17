var basicSubleveler = require('basic-subleveler');
var level = require('level');

function createWordPhonemeMap(opts) {
  if (!opts || !opts.dbLocation) {
    throw new Error('Cannot create wordPhonemeMap without dbLocation.');
  }

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

  function wordsForPhonemeSequence(sequence, done) {
    var sequenceString = sequence.join('_');
    var seqLevel = db.phonemes.sublevel(sequenceString);
    basicSubleveler.readAllValuesFromSublevel(seqLevel, done);
  }

  function wordsForPhonemeEndSequence(endSequence, done) {

  }

  function phonemeSequencesForWord(word, done) {
    var wordLevel = db.words.sublevel(word);
    basicSubleveler.readAllValuesFromSublevel(wordLevel, done);
  }

  return {
    wordsForPhonemeSequence: wordsForPhonemeSequence,
    phonemeSequencesForWord: phonemeSequencesForWord,
    wordsForPhonemeEndSequence: wordsForPhonemeEndSequence,
    close: db.close.bind(db)
  };
}

module.exports = createWordPhonemeMap;
