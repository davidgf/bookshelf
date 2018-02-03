var Promise = require('../lib/base/promise').default;

Promise.longStackTraces();
Promise.onPossiblyUnhandledRejection(function (err) {
  throw err;
});

global.testPromise = Promise;
var testQueryCache = global.testQueryCache = [];
var oldIt = it;

it = function() {
  testQueryCache = [];
  return oldIt.apply(this, arguments);
};

// http://bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
process.on("unhandledRejection", function(reason, promise) {
    console.error(reason);
});

var Bookshelf = require('../bookshelf');
var base = require('./base');
global.sinon = require('sinon');
var chai = global.chai = require('chai');
var databaseConnections;

chai.use(require('sinon-chai'));
chai.should();

global.expect         = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion      = chai.Assertion;
global.assert         = chai.assert;

after(function() {
  return databaseConnections.forEach(function(connection) {
    return connection.knex.destroy();
  })
});

describe('Bookshelf', function () {
  it('VERSION should equal version number in package.json', function() {
    var Knex = require('knex');
    var bookshelf = Bookshelf(Knex({client: 'sqlite3', useNullAsDefault: true}));
    var p = require('../package.json');

    expect(p.version).to.equal(bookshelf.VERSION);

    return bookshelf.knex.destroy()
  });
});

// Unit test all of the abstract base interfaces
describe('Unit Tests', function () {
  base.Collection();
  base.Events();

  require('./unit/sql/sync')();
  require('./unit/sql/model')();
});

describe('Integration Tests', function () {
  databaseConnections = require('./integration')(Bookshelf);
});
