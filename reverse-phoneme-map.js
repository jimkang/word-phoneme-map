var createLevelTree = require('basic-level-tree');
var collectWordsFromPhonemeSubtree = require('./collect-words-from-phoneme-subtree');

function createReversePhonemeMap(opts, createDone) {
  var db;
  var root;

  if (opts) {
    db = opts.db;
  }

  if (!db) {
    createDone(new Error('Cannot create reverse phonemes map without db.'));
    return;
  }

  var levelTree = createLevelTree(
    {
      db: db,
      treeName: 'reverse-phonemes'
    },
    passBackMethod
  );

  function passBackMethod(error, levelTreeRoot) {
    if (error) {
      createDone(error);
    }
    else {
      root = levelTreeRoot;
      createDone(error, wordsForPhonemeEndSequence);
    }
  }

  function wordsForPhonemeEndSequence(phonemesInOrder, done) {
    root.getSubtreeAtPath(phonemesInOrder.slice().reverse(), gatherWords);

    function gatherWords(error, subtree) {
      if (error) {
        done(error);
      }
      else {
        var words = collectWordsFromPhonemeSubtree(subtree);
        if (words) {
          done(error, words);
        }
        else {
          done(error);
        }
      }
    }
  }
}

module.exports = createReversePhonemeMap;
