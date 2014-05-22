var assert = require("assert");
var sql = require('../js/sql-api.js');

console.log("Testing database creation...");
// Create a database
var db = new sql.Database();

// Execute some sql
sqlstr = "CREATE TABLE alphabet (letter, code);";
db.exec(sqlstr);

var result = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
assert.deepEqual(result, [{columns:['name'], values:[['alphabet']]}]);

console.log("Testing prepared statements...")
// Prepare a statement to insert values in tha database
var stmt = db.prepare("INSERT INTO alphabet (letter,code) VALUES (?,?)");
console.log("Testing Statement.run()");
// Execute the statement several times
stmt.run(['a',1]);
stmt.run(['b',2]);

console.log("Testing statement.free()");
// Free the statement
stmt.free();

var result = db.exec("SELECT * FROM alphabet");
assert.deepEqual(result, [{columns:['letter', 'code'], values:[['a',1],['b',2]]}]);

// Prepare an sql statement
var stmt = db.prepare("SELECT * FROM alphabet WHERE code BETWEEN ? AND ?");
// Bind values to the parameters
stmt.bind([0, 256]);
// Execute the statement
stmt.step();
// Get one row of result
var result = stmt.get();
assert.deepEqual(result, ['a',1]);
// Fetch the next row of result
stmt.step();
var result = stmt.get();
assert.deepEqual(result, ['b',2]);

// Reset and reuse at once
stmt.get([2, 2]);
assert.deepEqual(result, ['b',2]);

assert.throws(function(){
  stmt.bind([1,2,3]);
}, "Binding too many parameters should throw an exception");
// free the memory used by the statement
stmt.free();
// You can not use your statement anymore once it has been freed.
// But not freeing your statements causes memory leaks. You don't want that.

// Export the database to an Uint8Array containing the SQLite database file
var binaryArray = db.export();
assert(String.fromCharCode.apply(null,binaryArray.slice(0,6)) === 'SQLite',
        "The first 6 bytes of an SQLite database should form the word 'SQLite'");
