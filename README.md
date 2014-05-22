# SQLite compiled to javascript

This is my fork of sql.js, by kripken. Try it online here: http://lovasoa.github.io/sql.js/GUI/

sql.js is a port of SQLite to JavaScript, by compiling the SQLite C code with Emscripten.
no C bindings or node-gyp compilation here.

SQLite is public domain, sql.js is MIT licensed.

## Usage

```javascript
var sql = require('./js/sql-api.js');
// or sql = window.SQL if you are in a browser

// Create a database
var db = new sql.Database();
// NOTE: You can also use new sql.Database(data) where
// data is an Uint8Array representing an SQLite database file

// Execute some sql (as understood by sqlite: http://www.sqlite.org/lang.html)
sqlstr = "CREATE TABLE test (number, letter);";
db.exec(sqlstr);

// Prepare an SQL statement
var insertstmt = db.prepare("INSERT INTO test (number, letter) VALUES (?,?)");
insertstmt.run([1, 'a']); // Will run insert the row (1,'a') in the table test
insertstmt.run([2, 'b']); // statement.run can be called multiple times with different values
insertstmt.run([3, 'c']);

// free the memory used by the statement
stmt.free();
// You can not use your statement anymore once it has been freed.
// But not freeing your statements causes memory leaks. You don't want that.


// Prepare a second sql statement
var stmt = db.prepare("SELECT * FROM test WHERE number BETWEEN ? AND ?");

// Bind values to the parameters
stmt.bind([1, 1]);

// Fetch the results of the query
while (stmt.step()) console.log(stmt.get()); // Will print [1, 'a']

// Resets the statement, so it can be used again with other parameters
stmt.reset();

// Bind other values
stmt.bind([2, 3]);
while (stmt.step()) console.log(stmt.get()); // Will print [2, 'b'] and [3,'c']

// free the memory used by the statement
stmt.free();

// Export the database to an Uint8Array containing the bytes of the SQLite database file
var binaryArray = db.export();
```

## Differences from the original sql.js
 * Support for prepared statements
 * Cleaner API
 * More recent version of SQLite (3.8.4)
 * Compiled to asm.js (should be faster, at least on firefox)
 * Changed API. Results now have the form <code>[{'columns':[], values:[]}]</code>
 * Improved GUI of the demo. It now has :
   * syntax highlighting
   * nice HTML tables to display results
   * ability to load and save sqlite database files

## Related

* [In-Browser/Client-Side Demo](http://lovasoa.github.io/sql.js/GUI/)

