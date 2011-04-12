// XMLHttpRequest
//
// http://www.w3.org/TR/XMLHttpRequest/
// http://dev.w3.org/2006/webapi/XMLHttpRequest (draft)

/*
 * Send an HTTP request (PUT, GET, POST) with a body and retrieve
 * the response body. The callback is invoked on both success and
 * failure.
 *
 *   success: callback(res_body)
 *   failure: callback(null)
 */
function sendRPC(verb, url, req_body, callback)
{
  var rpc = new XMLHttpRequest();
  rpc.open(verb, url, /* async */ true);
  rpc.setRequestHeader('content-type', 'application/octet-stream');
  //rpc.setRequestHeader('content-length', bytes.length.toString());
  rpc.onreadystatechange = function() {
    //var state_str = {
    //  0: "UNSENT",
    //  1: "OPENED",
    //  2: "HEADERS_RECEIVED",
    //  3: "LOADING",
    //  4: "DONE",
    //};
    var state = rpc.readyState;
    // var str = state_str[state];
    // console.log("state: " + state + " = " + str + " = " + XMLHttpRequest[str]);

    if (state == XMLHttpRequest.DONE) {
      // console.log("finished RPC: " + rpc.status);
      if (rpc.status == 200) {
	var res_body = rpc.responseText;
	callback(res_body);
      } else {
	callback(null);  // error
      }
    }
  };

  rpc.send(req_body);
}

/*
 * Initiates a PUT request for the given URL.
 * On completion the callback is invoked with 'true'.
 * On error the callback is invoked with 'false'.
 *
 * 'bytes' is a DOMString.
 */
function saveBlob(url, bytes, callback)
{
  sendRPC("PUT", url, bytes, function(x) {
	    callback((x != null) ? true : false);
	  });
}

/*
 * Initiates a GET request for the given URL.
 * On completion the callback is invoked with the response body (a string).
 * On error the callback is invoked with 'null'.
 *
 * 'bytes' is a DOMString.
 */
function loadBlob(url, callback)
{
  sendRPC("GET", url, "", callback);
}
