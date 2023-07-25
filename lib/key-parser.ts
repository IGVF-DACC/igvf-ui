// Based on the example at https://github.com/GregRos/parjs/blob/master/src/examples/json.ts
// This will parse a JSON string into any containing keys it has.
// If there are no keys or the JSON is not an object type an empty
// array will be returned.

import { anyCharOf, noCharOf, string, stringLen, whitespace } from "parjs";
import { between, many, map, or, qthen, stringify, then, thenq } from "parjs/combinators";

const escapes = {
  '"': `"`,
  "\\": "\\",
  "/": "/",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
};

// Parser that detects an escape char and maps to the escaped version
// in the escapes object above
const escapeChar = anyCharOf(Object.keys(escapes).join()).pipe(
  map((char) => escapes[char] as string),
);

// A unicode escape sequence is "u" followed by exactly 4 hex digits
const escapeUnicode = string("u").pipe(
  qthen(
    stringLen(4).pipe(
      map((str) => parseInt(str, 16)),
      map((x) => String.fromCharCode(x)),
    ),
  ),
);

// Any escape sequence begins with a \
const escapeAny = string("\\").pipe(qthen(escapeChar.pipe(or(escapeUnicode))));

// A string is made up of characters or escaped chars
const charOrEscape = escapeAny.pipe(or(noCharOf('"')));

// A sequence of characters or escaped characters between double quotes is a full string
export const jsonString = charOrEscape.pipe(many(), stringify(), between('"'));

// An object property is a string key, and then a value, separated by : and whitespace around it
// Plus, whitespace around the property
let objectKey = jsonString.pipe(
  then(
      string(":").pipe(
          between(
              whitespace()
          )
      )
  ),
  then(
      pJsonValue
  ),
  between(
      whitespace()
  ),
  map(([name, value]) => {
      return new JsonObjectProperty(name, value);
  })
);