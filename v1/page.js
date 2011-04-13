var app = app || {};  /* namespace */

app.setStatus = function(color, text)
{
  app.status.innerHTML = '<span style="color:' + color + ';">' + text + '</span>';
}

app.onSaveClick = function()
{
  var cryp = new myAES(/* password */ app.client_secret.value);
  var url = "/" + app.filename.value;

  var text = app.textarea.value;
  var bytes = cryp.encrypt(text);
  var hex = bytesToHex(stringToPoints(bytes));

  // console.log('text', text.length, text);
  // console.log('bytes', bytes.length, bytes);
  // console.log('hex', hex.length, hex);

  app.setStatus("blue", "RPC...");
  saveBlob(url, hex,
	   function(ok) {
	     if (ok) {
	       app.setStatus("green", "saved");
	     } else {
	       app.setStatus("red", "error");
	       // TODO: actually handle error.
	     }
	   });
}

app.onLoadClick = function()
{
  var cryp = new myAES(/* password */ app.client_secret.value);
  var url = "/" + app.filename.value;

  app.setStatus("blue", "RPC...");
  loadBlob(url,
	   function(hex) {
	     if (hex != null) {
	       var bytes = pointsToString(hexToBytes(hex));
	       var text = cryp.decrypt(bytes);

	       // console.log('hex', hex.length, hex);
	       // console.log('bytes', bytes.length, bytes);
	       // console.log('text', text.length, text);

	       app.textarea.value = text;
	       app.setStatus("green", "loaded");
	     } else {
	       app.setStatus("red", "error");
	       // TODO: actually handle the error.
	     }
	   });
}

/*
 * Invoked when pressing the 'clear' button.
 * All state in the page is cleared.
 */
app.onClearClick = function()
{
  app.server_secret.value = "";
  app.client_secret.value = "";
  app.filename.value = "";
  app.textarea.value = "";
  app.setStatus("green", "cleared");
}

/*
 * Invoked when the <textarea> receives 'oninput' event, which
 * happens on each keystroke that goes to the textarea.
 */
app.onTextInput = function()
{
  console.log("text input");
  app.setStatus("red", "changed");
}

app.onTextChange = function()
{
  console.log("text change");
  app.setStatus("red", "changed");
}

/*
 * Called on <body> load.
 */
app.onBodyLoad = function()
{
  // Get DOM nodes once and for all.
  app.server_secret = document.getElementById("server_secret_id");
  app.client_secret = document.getElementById("client_secret_id");
  app.filename = document.getElementById("filename_id");
  app.load_button = document.getElementById("load_button_id");
  app.save_button = document.getElementById("save_button_id");
  app.clear_button = document.getElementById("clear_button_id");
  app.status = document.getElementById("status_id");
  app.textarea = document.getElementById("textarea_id");

  app.load_button.onclick = app.onLoadClick;
  app.save_button.onclick = app.onSaveClick;
  app.clear_button.onclick = app.onClearClick;

  app.setStatus("blue", "ready");

  app.textarea.oninput = app.onTextInput;  // delivered on each keystrokes.
  app.textarea.onchange = app.onTextChange;  // delivered on loss of focus.

  window.onbeforeunload = function(e) {
    // Clear the page before leaving, to make sure that going back
    // does not reveal the information on the page. Could also make
    // this auto-save or suggest saving unsaved changes.
    app.onClearClick();
    return null;
    // if (true) {
    //   return "leave page?";
    // } else {
    //   return null;
    // }
  };
}
