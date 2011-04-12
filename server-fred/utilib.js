/*
 * Utility library.
 */

/*
 * These test whether 'str' begins/ends with 'sub'.
 */
function hasPrefix(str, sub) {
  return str.substr(0, sub.length) == sub;
}
function hasSuffix(str, sub) {
  return str.substr(- sub.length) == sub;
}

/*
 * Guesses the MIME type of content from a filename.
 *   *.html -> text/html
 *   *.js   -> text/javascript
 * and so on.
 */
function guessMimetype(filename) {
  var tab = {
    ".css":  "text/css",
    ".html": "text/html",
    ".js":   "text/javascript",
    ".txt":  "text/plain",
    ".jpg":  "image/jpeg",
    ".png":  "image/png",
  };
  for (var suffix in tab) {
    if (hasSuffix(filename, suffix))
      return tab[suffix];
  }
  // punt
  return "application/octet-stream";
}
