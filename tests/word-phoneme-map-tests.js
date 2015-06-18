// Depends on indexing-tests having been run first, unfortunately.

var test = require('tape');
var createWordPhonemeMap = require('../word-phoneme-map');
var callNextTick = require('call-next-tick');

var dbLocation = __dirname + '/test.db';

test('Create and use map', function fullPhonemeSequenceMatch(t) {
  var expectedWordsForSequences = [
    {
      sequences: [
        ['AA', 'R', 'K']
      ],
      words: ['ARC', 'ARK']
    },
    {
      sequences: [
        ['AE', 'B', 'N', 'AO', 'R', 'M', 'AH', 'L', 'IY']
      ],
      words: ['ABNORMALLY']
    },
    {
      sequences: [
        ['EY', 'B', 'AH', 'L', 'ER'],
        ['EY', 'B', 'L', 'ER']
      ],
      words: ['ABLER']
    }
  ];


  t.plan(expectedWordsForSequences.length * 4 + 1);

  var wordPhonemeMap = createWordPhonemeMap({
    dbLocation: dbLocation
  });

  expectedWordsForSequences.forEach(runWordsForSequenceTest);

  function runWordsForSequenceTest(pair) {
    wordPhonemeMap.wordsForPhonemeSequence(pair.sequences[0], checkWords);

    function checkWords(error, words) {
      t.ok(!error, 'No error occured while looking for words.');
      t.deepEqual(words, pair.words, 'Expected words are returned.');
    }
  }

  expectedWordsForSequences.forEach(runSequencesForWordsTest);

  function runSequencesForWordsTest(pair) {
    wordPhonemeMap.phonemeSequencesForWord(pair.words[0], checkSequences);

    function checkSequences(error, sequences) {
      t.ok(!error, 'No error occured while looking for sequence.');
      t.deepEqual(
        sequences, pair.sequences, 'Expected sequence is returned.'
      );
    }
  }

  wordPhonemeMap.close(checkClose);

  function checkClose(error) {
    t.ok(!error, 'Database closes successfully.');
  }
});

test('Partial matching from end', function matchingFromEnd(t) {
  var expectedWordsForSequences = [
    {
      sequence: ['AA', 'R', 'K'],
      words: ['ARC', 'ARK']
    },
    {
      sequence: ['AH', 'L', 'IY'],
      words: ['ABNORMALLY']
    },
    {
      sequence: ['L', 'ER'],
      words: ['ABLER']
    }
  ];

  t.plan(expectedWordsForSequences.length * 2 + 1);

  var wordPhonemeMap = createWordPhonemeMap({
    dbLocation: dbLocation
  });

  expectedWordsForSequences.forEach(runReverseMatchTest);

  function runReverseMatchTest(pair) {
    debugger;
    wordPhonemeMap.wordsForPhonemeEndSequence(pair.sequence, checkWords);

    function checkWords(error, words) {
      console.log('words!', words);
      t.ok(!error, 'No error occured while looking for words.');
      t.deepEqual(words, pair.words, 'Expected words are returned.');
    }
  }

  wordPhonemeMap.close(checkClose);

  function checkClose(error) {
    t.ok(!error, 'Database closes successfully.');
  }
});
