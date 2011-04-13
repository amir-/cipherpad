var app = app || {};  /* namespace */

/*
 * Updates the color ("red", "green", etc) and text of the status <span>.
 */
app.setStatus = function(color, text)
{
  app.status.innerHTML = '<span style="color:' + color + ';">' + text + '</span>';
};

/*
 * Flag that we flip to "true" whenever there changes to be saved.
 */
app.changes_to_save = false;

/*
 * Returns the blob URL currently implied by the page.
 */
app.makeBlobUrl = function()
{
  var userhash = hex_md5(app.username.value);
  var filehash = hex_md5(app.filename.value);
  return "/blob/" + userhash + "/" + filehash;
};

/*
 * Invoked when the "save" button is clicked.
 */
app.onSaveClick = function()
{
  var cryp = new myAES(/* password */ app.client_secret.value);
  var url = app.makeBlobUrl();

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
	       app.changes_to_save = false;
	     } else {
	       app.setStatus("red", "error");
	       // TODO: actually handle error.
	     }
	   });
};

/*
 * Invoked when the "load" button is clicked.
 */
app.onLoadClick = function()
{
  var cryp = new myAES(/* password */ app.client_secret.value);
  var url = app.makeBlobUrl();

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
	       app.changes_to_save = false;
	     } else {
	       app.setStatus("red", "error");
	       // TODO: actually handle the error.
	     }
	   });
};

/*
 * Invoked when pressing the 'clear' button.
 * All state in the page is cleared.
 */
app.onClearClick = function()
{
  app.changes_to_save = false;
  app.server_secret.value = "";
  app.client_secret.value = "";
  app.username.value = "";
  app.filename.value = "";
  app.textarea.value = "";
  app.setStatus("green", "cleared");
};

/*
 * Invoked when the <textarea> receives 'oninput' event, which
 * happens on each keystroke that goes to the textarea.
 */
app.onTextInput = function()
{
  app.setStatus("red", "changed");
  app.changes_to_save = true;
};

/*
 * Invoked when the text has changed, but usually not fired
 * until focus is lost.
 */
app.onTextChange = function()
{
  app.setStatus("red", "changed");
  app.changes_to_save = true;
};

/*
 * Called on <body> load.
 */
app.onBodyLoad = function()
{
  // Get DOM nodes once and for all.
  app.server_secret = document.getElementById("server_secret_id");
  app.client_secret = document.getElementById("client_secret_id");

  app.username = document.getElementById("username_id");
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
};
