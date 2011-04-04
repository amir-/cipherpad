// example: "1fa0" -> [31, 160]
function hexStringToBytes(hexString)
{
    function n2i(x) { return "0123456789abcdef".indexOf(x); }
    var nibbles = hexString.split('').map(n2i);  // 0 to 15
    var byteArray = new Array();
    for (var i = 0; 2*i < nibbles.length; ++i) {
        byteArray[i] = 16*nibbles[2*i] + nibbles[2*i+1];
    }
    return byteArray;
}

// We pad the byte array with 1 to 16 bytes, using the last byte to encode
// the number of added bytes. Example:
// |****************|****************|                | -> |****************|****************|+++++++++++++++0
// |****************|****************|***             | -> |****************|****************|***++++++++++++3
// |****************|****************|*************** | -> |****************|****************|***************f
// where * means an original byte, + means a padding byte and 0, 3, f etc are bytes.length % 16.
function padBytes(a)
{
    var remainder = a.length % 16;
    var padding = [0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0,
                   remainder].slice(remainder);
    return a.concat(padding);
}

function unpadBytes(b) 
{
    var remainder = b[b.length - 1];
    return b.slice(0, -(16 - remainder));
}

function testPadBytes(len)
{
    var a = [];
    for (var i = 0; i < len; ++i)
        a[i] = Math.floor(Math.random() * 256);
    var b = padBytes(a);
    var c = unpadBytes(b);
    console.log(a);
    console.log(b);
    console.log(c);
}

function encrypt(password, string)
{
    var key_hex = SHA256(password);  // 64 lower case hex digits, 256 bits.
    var key_bytes = hexStringToBytes(key_hex);  // 32 bytes
    var key_expanded = key_bytes.slice();
    var string_utf8 = Utf8.encode(string);
    var bytes = string_utf8.split('').map(function(s) { return s.charCodeAt(); });
    var blocks = padBytes(bytes);
    AES_Init();
    AES_ExpandKey(key_expanded);  // now 240 ints
    for (var i = 0; i < blocks.length; i += 16)
    {
        var block = blocks.slice(i, i + 16);
        AES_Encrypt(block, key_expanded);
        for (var j = 0; j < 16; ++j)
        {
            blocks[i + j] = block[j];
        }
    }
    AES_Done();
    return blocks;
}

function decrypt(password, blocks)
{
    var key_hex = SHA256(password);  // 64 lower case hex digits, 256 bits.
    var key_bytes = hexStringToBytes(key_hex);  // 32 bytes
    var key_expanded = key_bytes.slice();
    AES_Init();
    AES_ExpandKey(key_expanded);  // now 240 ints
    for (var i = 0; i < blocks.length; i += 16)
    {
        var block = blocks.slice(i, i + 16);
        AES_Decrypt(block, key_expanded);
        for (var j = 0; j < 16; ++j)
        {
            blocks[i + j] = block[j];
        }
    }
    AES_Done();
    var bytes = unpadBytes(blocks);
    var string_utf8 = bytes.map(function(b){return String.fromCharCode(b);}).join("");
    var string = Utf8.decode(string_utf8);
    return string;
}

var pw = "fred";
var str = "This is the winter of our discontent.";
var enc = encrypt(pw, str);
var dec = decrypt(pw, enc);
