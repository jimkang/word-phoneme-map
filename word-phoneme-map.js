var basicSubleveler = require('basic-subleveler');

function createWordPhonemeMap(opts) {
  if (!opts || !opts.dbLocation) {
    throw new Error('Cannot create wordPhonemeMap without dbLocation.');
  }

  var db = basicSubleveler.setUpSubleveledDB({
    dbLocation: opts.dbLocation,
    valueEncoding: 'json',
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
    close: db.close
  };
}

module.exports = createWordPhonemeMap;
