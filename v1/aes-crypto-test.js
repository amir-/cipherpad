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
