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
  t.plan(2);

  var indexOpts = {
    dbLocation: __dirname + '/test.db',
    numberOfLinesToIndex: 300
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
    // wordPhonemeMap.wordsFor
  }
});

// http://www.geedew.com/2012/10/24/remove-a-directory-that-is-not-empty-in-nodejs/
function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      }
      else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

