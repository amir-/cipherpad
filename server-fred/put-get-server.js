/*
 * Basic PUT/GET blob server.
 *
 * PUT /file          saves to kBlobDirectory/file
 * GET /file          fetches kBlobDirectory/file
 *
 * Anything else is an error.
 *
 * To run it:
 *   $ node put-get-server.js [port [blobdir]]
 */

/*
 * Module imports.
 */
var mod = {
  // TODO: crypto: require('crypto'),
  fs: require('fs'),
  http: require('http'),
  stream: require('stream'),
  url: require('url'),
};

/*
 * This is where we keep the blobs.
 */
var kBlobDirectory = null;

/*
 * Sends back empty response with HTTP status code 'num' (204, 400, 404 etc).
 *
 * See this page: http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
function emptyReply(num, req, res) {
  res.writeHead(num, { /* no headers */ });
  res.end();
}

/*
 * Verifies that the given string is a valid filename for keeping blobs in.
 * Mostly this is about security, since blobs are kept in a sub-directory,
 * so we need to avoid things like ../../../etc/passwd as file names.
 */
function isValidFile(file) {
  // TODO: sanitize better.
  return file.indexOf('..') == -1;
}

/*
 * Handles PUT request for blobs.
 *
 * To exercise it:
 *   $ curl -T <filename> <url>
 */
function putFile(file, req, res) {
  if (isValidFile(file)) {
    var src = req;  // the request is a stream.
    var dst = mod.fs.createWriteStream(kBlobDirectory + file);
    dst.on('close', function() { res.end(); });
    src.resume();
    src.pipe(dst);
  } else {
    emptyReply(/* Not Found */ 404, req, res);
  }
}

/*
 * Handles GET request for blobs.
 *
 * To exercise it:
 *   $ curl -o <filename> <url>
 */
function getFile(file, req, res) {
  if (isValidFile(file)) {
    var src = mod.fs.createReadStream(kBlobDirectory + file);
    var dst = res;  // the response is a stream.
    dst.on('close', function() { res.end(); });
    src.resume();
    src.pipe(dst);
  } else {
    emptyReply(/* Bad Request */ 400, req, res);
  }
}

/*
 * Handles each HTTP request.
 */
function handleRequest(req, res) {
  console.log(req.method + " " + req.url);

  // Parse the URL
  // href: /.../..?...
  // pathname: /.../..
  // search: ?...
  // query: ...
  var parsed = mod.url.parse(req.url);

  if (req.method == "PUT") {
    putFile(parsed.pathname, req, res);
    return;
  }

  if (req.method == "GET") {
    getFile(parsed.pathname, req, res);
    return;
  }

  // Anything else is an error.
  res.writeHead(/* Bad Request */ 400, {'Content-Type': 'text/plain'});
  res.write('Only GET and PUT are supported\n', /* encoding */ 'utf8');
  res.end();
}

/*
 * Command line parameters.
 */
var port = 8124;
if (process.argv.length >= 3)
  port = parseInt(process.argv[2]);
console.log('listening on port', port);

kBlobDirectory = "blobdir/";
if (process.argv.length >= 4)
  kBlobDirectory = process.argv[3];
console.log('storing blobs in', kBlobDirectory);

/*
 * Start service.
 */
var server = mod.http.createServer(handleRequest);
server.listen(port);
console.log('ready');
