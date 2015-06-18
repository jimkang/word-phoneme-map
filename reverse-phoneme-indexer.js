var createLevelTree = require('basic-level-tree');
var callNextTick = require('call-next-tick');

function createReversePhonemeIndexer(opts, createDone) {
  var db;
  var root;

  if (opts) {
    db = opts.db;
  }

  if (!db) {
    createDone(new Error('Cannot create reverse indexer without db.'));
    return;
  }

  var levelTree = createLevelTree(
    {
      db: db,
      treeName: 'reverse-phonemes',
      root: 'END'
    },
    passBackMethod
  );

  function passBackMethod(error, levelTreeRoot) {
    if (error) {
      createDone(error);
    }
    else {
      root = levelTreeRoot;
      createDone(error, indexWordByReversePhonemes);
    }
  }

  function indexWordByReversePhonemes(word, phonemesInOrder, done) {
    mapToTree(root, word, phonemesInOrder.reverse(), done);
  }

  // Maps the phonemes to the tree, using one node for each phoneme. When it 
  // gets to the last phoneme, it stores the word in that node.
  function mapToTree(node, word, phonemes, done) {
    if (phonemes.length < 1) {
      callNextTick(done);
    }
    else {
      node.addChildIfNotThere(
        {
          value: {
            phoneme: phonemes[0]
          },
          equalityFn: nodeValuesAreEqual
        },
        updateChild
      );
    }

    function updateChild(error, child) {
      if (error) {
        done(error);
      }
      else if (phonemes.length === 1) {
        if (child.value.words === undefined) {
          child.value.words = [];
        }
        child.value.words.push(word);
        child.save(done);
      }
      else {
        mapToTree(child, word, phonemes.slice(1), done);
      }
    }
  }

  return indexWordByReversePhonemes;
}

function nodeValuesAreEqual(a, b) {
  return a.phoneme === b.phoneme;
}

module.exports = createReversePhonemeIndexer;
