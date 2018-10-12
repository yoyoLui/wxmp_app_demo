var CryptoJS = require('./aes.js'); //引用AES源码js
var key = CryptoJS.enc.Utf8.parse("24ReoosAdrdAplpe"); //十六位十六进制数作为秘钥
var iv = CryptoJS.enc.Utf8.parse('E-24-Reoo-Sritng'); //十六位十六进制数作为秘钥偏移量
//解密方法
function Decrypt(word) {
    var decrypt = CryptoJS.AES.decrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
//加密方法
function Encrypt(word) {
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

//暴露接口
module.exports.Decrypt = Decrypt;
module.exports.Encrypt = Encrypt;
