var createLevelTree = require('basic-level-tree');

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
    root.getSubtreeAtPath(phonemesInOrder.reverse(), gatherWords);

    function gatherWords(error, subtree) {
      if (error) {
        done(error);
      }
      else {
        var words = collectWordsFromSubtree(subtree);
        done(error, words);
      }
    }
  }

  function collectWordsFromSubtree(subtree) {
    var collected = [];
    var currentNodes = [subtree];
    var nextNodes = [];

    while (currentNodes.length > 0) {
      currentNodes.forEach(visitCurrentNode);
      currentNodes = nextNodes.slice();
      nextNodes.length = 0;
    }

    function visitCurrentNode(node) {
      if (node.value.words) {
        collected = collected.concat(node.value.words);
      }
      nextNodes = nextNodes.concat(node.children);
    }
    
    return collected;
  }
}

module.exports = createReversePhonemeMap;
