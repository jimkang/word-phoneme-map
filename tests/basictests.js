var test = require('tape');
var indexWordsAndPhonemes = require('../index-words-and-phonemes');
var createWordPhonemeMap = require('../word-phoneme-map');
var fs = require('fs');
var rimraf = require('rimraf');

test('Try map without db', function noDb(t) {
  t.plan(1);

  t.throws(createMapWithNoDb);

  function createMapWithNoDb() {
    createWordPhonemeMap({
      dbLocation: null
    });
  }
});

test('Create and use map', function typicalCase(t) {
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


  t.plan(2 + expectedWordsForSequences.length * 4);

  var indexOpts = {
    dbLocation: __dirname + '/test.db',
    numberOfLinesToIndex: 6000
  };

  rimraf.sync(indexOpts.dbLocation);

  indexWordsAndPhonemes(indexOpts, checkDb);

  function checkDb(error) {
    t.ok(!error, 'No error occurred while indexing.');
    t.ok(fs.existsSync(indexOpts.dbLocation), 'Database file was created.');
    testMap();
  }

  function testMap() {
    var wordPhonemeMap = createWordPhonemeMap({
      dbLocation: indexOpts.dbLocation
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
  }

  
});

