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
stmt.run(['b',2.2]);
stmt.run(['c']); // The second parameter will be bound to NULL

console.log("Testing statement.free()");
// Free the statement
stmt.free();

result = db.exec("SELECT * FROM alphabet");
assert.deepEqual(result, [{columns:['letter', 'code'], values:[['a','1'],['b','2.2'],['c','']]}]);

console.log("Testing getting data...");
// Prepare an sql statement
var stmt = db.prepare("SELECT * FROM alphabet WHERE code BETWEEN :start AND :end ORDER BY code");
// Bind values to the parameters
stmt.bind([0, 256]);
// Execute the statement
stmt.step();
// Get one row of result
result = stmt.get();
assert.deepEqual(result, ['a',1]);
// Fetch the next row of result
result = stmt.step();
assert.equal(result, true);
result = stmt.get();
assert.deepEqual(result, ['b',2.2]);

// Reset and reuse at once
result = stmt.get([0, 1]);
assert.deepEqual(result, ['a',1]);

// Pass objects to get() and bind() to use named parameters
console.log("Testing named parameters...");
result = stmt.get({':start':1, ':end':1});
assert.deepEqual(result, ['a',1]);

assert.throws(function(){
  stmt.bind([1,2,3]);
}, "Binding too many parameters should throw an exception");
// free the memory used by the statement
stmt.free();
// You can not use your statement anymore once it has been freed.
// But not freeing your statements causes memory leaks. You don't want that.

console.log("Testing database export...");
// Export the database to an Uint8Array containing the SQLite database file
var binaryArray = db.export();
assert(String.fromCharCode.apply(null,binaryArray.slice(0,6)) === 'SQLite',
        "The first 6 bytes of an SQLite database should form the word 'SQLite'");

var db2 = new SQL.Database(binaryArray);
result = db2.exec("SELECT * FROM alphabet");
assert.deepEqual(result, [{columns:['letter', 'code'], values:[['a','1'],['b','2.2'],['c','']]}],
                "Exporting and re-importing the database should lead to the same values");
