var assert = require('assert');

assert.ok(hasPrefix("/static/file.txt", "/static/"));
assert.ok(!hasPrefix("/static/file.txt", "static/"));
assert.ok(hasSuffix("/static/file.txt", ".txt"));
assert.ok(!hasSuffix("/static/file.txt", "txt."));

assert.equal(guessMimetype("style.css"), "text/css");
assert.equal(guessMimetype("page.html"), "text/html");
assert.equal(guessMimetype("script.js"), "text/javascript");
assert.equal(guessMimetype("file.txt"), "text/plain");
assert.equal(guessMimetype("photo.jpg"), "image/jpeg");
assert.equal(guessMimetype("image.png"), "image/png");
assert.equal(guessMimetype("content.dat"), "application/octet-stream");
