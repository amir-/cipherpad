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
  crypto: require("crypto"),
  fs: require("fs"),
  http: require("http"),
  stream: require("stream"),
  url: require("url"),
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
 * Serves a PUT request, writing the body to a file.
 * TODO: handle errors.
 *
 * To exercise it:
 *   $ curl -T <filename> <url>
 */
function httpPutFile(filename, req, res) {
  res.writeHead(200, { "Content-Type": "application/octet-stream" });
  var src = req;  // the request is a stream.
  var opt = {/* encoding:"binary" */};
  var dst = mod.fs.createWriteStream(filename, opt);
  src.on("end", function() { res.end(); });
  src.pipe(dst, {end: false});
  src.resume();
}

/*
 * Serves a GET request, sending back a file.
 * TODO: handle errors.
 *
 * To exercise it:
 *   $ curl -o <filename> <url>
 */
function httpGetFile(filename, mimetype, req, res) {
  res.writeHead(200, { "Content-Type": mimetype });
  var opt = {/* encoding:"binary" */};
  var src = mod.fs.createReadStream(filename, opt);
  var dst = res;  // the response is a stream.
  src.on("end", function() { res.end(); });
  src.pipe(dst, {end: false});
  src.resume();
}

// Some pathnames are mapped to special static files.
var static_files = {
  /* pathname:      filename */
  "/jsaes.js":      "../3rdparty/point-at-infinity.org/jsaes.js",
  "/jssha256.js":   "../3rdparty/point-at-infinity.org/jssha256.js",
  "/utf8.js":       "../3rdparty/www.movable-type.co.uk/utf8.js",
  "/test.js":       "../client-fred/test.js",
  "/aes-crypto.js": "../client-fred/aes-crypto.js",
  "/rpc.js":        "../client-fred/rpc.js",
  "/rpc-test.html": "../client-fred/rpc-test.html",
  "/page.html":     "../client-fred/page.html",
  "/page.css":      "../client-fred/page.css",
  "/page.js":       "../client-fred/page.js",
};

/*
 * Handles each HTTP request.
 */
function handleRequest(req, res) {
  console.log(req.method + " " + req.url);
  // console.log(req.headers);

  // Parse the URL
  // href: /.../..?...
  // pathname: /.../..
  // search: ?...
  // query: ...
  var parsed = mod.url.parse(req.url);

  try {
    // GET /path/name
    if ((req.method == "GET") && static_files[parsed.pathname]) {
      var filename = static_files[parsed.pathname];
      var mimetype = guessMimetype(filename);
      httpGetFile(filename, mimetype, req, res);
      return;
    }

    if (true /* TODO: isBlobPath(..) */) {
      // Hash the pathname to avoid ..s and slashes.
      var hash = mod.crypto.createHash("md5").update(parsed.pathname).digest("hex");
      var filename = kBlobDirectory + hash;

      // PUT a blob?
      if (req.method == "PUT") {
	httpPutFile(filename, req, res);
	return;
      }

      // GET a blob?
      if (req.method == "GET") {
	httpGetFile(filename, "application/octet-stream", req, res);
	return;
      }
    }
  } catch (ex) {
    console.log("*** unhandled exception ***");
  }

  // Anything else is an error.
  emptyReply(/* Bad Request */ 400, req, res);
}

/*
 * Command line parameters.
 */
var port = 8124;
if (process.argv.length >= 3)
  port = parseInt(process.argv[2]);
console.log("listening on port", port);

kBlobDirectory = "blobdir/";
if (process.argv.length >= 4)
  kBlobDirectory = process.argv[3];
console.log("storing blobs in", kBlobDirectory);

/*
 * Start service.
 */
var server = mod.http.createServer(handleRequest);
server.listen(port);
console.log("ready");
