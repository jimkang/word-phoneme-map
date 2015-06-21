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


  t.plan(expectedWordsForSequences.length * 4 + 2);

  createWordPhonemeMap(
    {
      dbLocation: dbLocation
    },
    useMap
  );

  function useMap(error, wordPhonemeMap) {
    t.ok(!error, 'No error while creating map.');

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
  }

  function checkClose(error) {
    t.ok(!error, 'Database closes successfully.');
  }
});

var expectedWordsForSequences = [
  {
    sequence: ['AA', 'R', 'K'],
    words: ['ARC', 'ARK', 'AARDVARK', '?QUESTION-MARK']
  },
  {
    sequence: ['AH', 'L', 'IY'],
    words: ['ALLEE', 'AMALIE', 'ACTUALLY', 'ANOMALY', 'ACTUALLY', 'ANNUALLY', 'ANGRILY', 'ARTFULLY', 'ABYSMALLY', 'ADDITIONALLY', 'ABNORMALLY', 'ADDITIONALLY', 'ANECDOTALLY', 'ANECDOTALLY', 'ACCIDENTALLY', 'ARTIFICIALLY', 'ANENCEPHALY', 'ACCIDENTALLY', 'ARBITRARILY', 'AGRICULTURALLY', 'ARCHITECTURALLY', 'AGRICULTURALLY', 'ARCHITECTURALLY']
  },
  {
    sequence: ['L', 'ER'],
    words: ['AILOR', 'ALLER', 'ALLOR', 'ABLER', 'ADLER', 'AGLER', 'ABLER', 'AMBLER', 'ANDLER', 'ANGLER', 'AKSLER', 'AMSLER', 'ANTLER', 'ANNULAR', 'ALACHLOR', 'ALTSCHILLER', 'ALTSCHULER', 'ALTSHULER', 'ALVEOLAR', 'ANGULAR', 'ALTSCHULER', 'ALTSHULER', 'APPENZELLER']
  }
];

expectedWordsForSequences.forEach(runReverseMatchTest);

function runReverseMatchTest(pair) {
  test('Partial matching from end', function matchingFromEnd(t) {
    t.plan(4);

    createWordPhonemeMap(
      {
        dbLocation: dbLocation
      },
      useMap
    );

    function useMap(error, wordPhonemeMap) {
      t.ok(!error, 'No error while creating map.');
      wordPhonemeMap.wordsForPhonemeEndSequence(pair.sequence, checkWords);

      function checkWords(error, words) {
        // console.log('words!', words);
        t.ok(!error, 'No error occured while looking for words.');
        t.deepEqual(words, pair.words, 'Expected words are returned.');

        wordPhonemeMap.close(checkClose);
      }
    }

    function checkClose(error) {
      t.ok(!error, 'Database closes successfully.');
    }
  });
}
