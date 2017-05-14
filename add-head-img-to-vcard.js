/*
* 程序用到了第三方的库解析vcf文件 https://github.com/jhermsmeier/node-vcf
*
* 有两个文件被我修改过，所以删除了package.json
* node_modules/foldline/foldline.js 
* 原来逻辑是一行超过75个字符要截断换行，但发现截断换行后手机导入会失败，所以改为不截断换行
*
* node_modules/vcf/lib/property.js
* 对比转换前后文件的差异，发现手机导出的文件field为type时候会略去field，并且value都是大写
* 所以修改这里的逻辑，保证程序输出的和手机导出的文件内容一样
*/
var fs = require('fs');

const OUTPUT_VCARD_PATH = 'output/contacts.vcf'; // 程序执行完毕后输出的vcf文件
const INPUT_VCARD_PATH = 'data/contacts.vcf'; // 手机导出的vcf文件
const INPUT_IMG_PATH = 'images/'; // 存放微信好友头像的目录

var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

// 解析vcf文件生成联系人对象数组
var vCard = require('vcf');
var vcfData = fs.readFileSync(INPUT_VCARD_PATH, 'utf-8');
var cards = vCard.parseMultiple(vcfData); // 联系人对象数组

var output = '';
var totalCount = 0;
var hasImgCount = 0;
cards.forEach((card) => {
    totalCount++;
    // 联系人姓名fullName，中文的话是用UTF8 QUOTED-PRINTABLE编码的，需要解码
    var fullName = card.get('fn')._data;
    if (card.get('fn').encoding == 'QUOTED-PRINTABLE') {
        fullName = decodeQuotedPrintable(card.get('fn')._data);
    }

    // 根据联系人姓名查看是否下载过对应的微信头像图片
    var imgPath = INPUT_IMG_PATH + fullName + '.jpg';
    if (fs.existsSync(imgPath)) {
        // 有微信头像图片，设置给联系人的photo
        var imgData = fs.readFileSync(imgPath);
        var dataStr = imgData.toString('base64');
        card.set('photo', dataStr, {
            encoding: 'BASE64',
            type: 'JPEG'
        });
        hasImgCount++;
        console.log(`${fullName} has a head image.`);
    } else {
        console.log(`${fullName} does not have a head image.`);
    }
    output += card.toString('2.1') + '\r\n'; // 2.1表示vcf文件的标准
});

fs.writeFileSync(OUTPUT_VCARD_PATH, output, 'utf-8'); // 输出新的vcf文件
console.log(`\n\nHas Image Count / Total: ${hasImgCount} / ${totalCount}\nSave to "${OUTPUT_VCARD_PATH}" over!!!\n`);

// 解码UTF8 QUOTED-PRINTABLE字符串
function decodeQuotedPrintable(str) {
    var arr = str.split('=').slice(1);
    var byteArr = [];
    arr.forEach(str => {
        byteArr.push(parseInt('0x' + str));
    });
    var cent = Buffer.from(byteArr);
    return decoder.write(cent);
}