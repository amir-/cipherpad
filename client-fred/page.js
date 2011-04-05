/* javascript */

/*
 * Extend the byte array a by 16 - (a.length % 16) bytes, adding the value
 * a.length % 16 at the end.
 */
function pad16(a)
{
  // |****************|                | -> |****************|0000000000000000|
  // |****************|***             | -> |****************|***0000000000003|
  // |****************|*************** | -> |****************|***************f|
  var n = a.length % 16;
  return a.concat([0, 0, 0, 0, 0,
		   0, 0, 0, 0, 0,
		   0, 0, 0, 0, 0,
		   n].slice(n));
}

/*
 * Undo the effect of pad16().
 */
function unpad16(b)
{
  var n = b[b.length - 1];  // n = a.length % 16
  return b.slice(0, b.length - (16 - n));
}

/*
 * Unittest for pad16() and unpad16().
 */
function testPad16()
{
  for (var n = 0; n <= 100; ++n) {
    var a = new Array(n);
    for (var i = 0; i < n; ++i)
      a[i] = Math.floor(Math.random() * 256);
    var b = pad16(a);
    test.assertEqual(b.length % 16, 0);
    var c = unpad16(b);
    for (var i = 0; i < n; ++i)
      test.assertEqual(a[i], c[i]);
  }
}

/*
 * Convert a string to an array of code points.
 */
function stringToPoints(s)
{
  return s.split('').map(function(b) { return b.charCodeAt(0); });
}
/*
 * Convert an array of code points to a string.
 */
function pointsToString(c)
{
  return c.map(function(x) { return String.fromCharCode(x); }).join('');
}

/*
 * Unittest for stringToPoints() and pointsToString().
 */
function testStringToPoints()
{
  var s = "ABC abc";
  var c = stringToPoints(s);
  var t = pointsToString(c);
  test.assertEqualArray(s, t);
}

window.AES_xtime || AES_Init();  // one-time init.

/*
 * Constructor for AES encode/decoder taking a string password.
 */
function myAES(password)
{
  // Use SHA256 to generate an expanded key from the password.
  SHA256_init();
  SHA256_write(password);
  this.hash = SHA256_finalize();  // array of 32 bytes (256 bits).
  AES_ExpandKey(this.hash);       // now it is an array of 240 bytes.
}
/*
 * 'blocks' should be an array of bytes of length divisible by 16.
 * It is modified in-place.
 */
myAES.prototype.encrypt_bytes = function(blocks)
{
  for (var i = 0; i < blocks.length; i += 16) {
    var block = blocks.slice(i, i + 16);
    AES_Encrypt(block, this.hash);
    for (var j = 0; j < 16; ++j)
      blocks[i + j] = block[j];
  }
};
myAES.prototype.decrypt_bytes = function(blocks)
{
  for (var i = 0; i < blocks.length; i += 16) {
    var block = blocks.slice(i, i + 16);
    AES_Decrypt(block, this.hash);
    for (var j = 0; j < 16; ++j)
      blocks[i + j] = block[j];
  }
};
/*
 * string-to-string
 */
myAES.prototype.encrypt = function(message)
{
  var bytes = pad16(stringToPoints(Utf8.encode(message)));
  this.encrypt_bytes(bytes);
  return pointsToString(bytes);
};
myAES.prototype.decrypt = function(message)
{
  var bytes = stringToPoints(message);
  this.decrypt_bytes(bytes);
  return Utf8.decode(pointsToString(unpad16(bytes)));
};

////////////////////////////////////////////////////////////////////////////////

function testTranscryption()
{
  var key = "fred";
  var str = "This is the winter of our discontent.";

  var aes = new myAES(key);

  var bytes = pad16(stringToPoints(Utf8.encode(str)));
  // console.log("bytes", bytes.length, bytes.slice());
  aes.encrypt_bytes(bytes);
  //console.log("bytes", bytes.length, bytes.slice());
  var enc = pointsToString(bytes);
  aes.decrypt_bytes(bytes);
  // console.log("bytes", bytes.length, bytes.slice());
  var out = Utf8.decode(pointsToString(unpad16(bytes)));
  test.assertEqual(str, out);

  var tmp = aes.encrypt(str);
  test.assertEqual(tmp, enc);
  tmp = aes.decrypt(tmp);
  test.assertEqual(tmp, str);
}
