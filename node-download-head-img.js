var https = require('https');
var fs = require('fs');

var contacts = JSON.parse(fs.readFileSync('./data/wx-contacts.json')).MemberList; // 读取好友数据

var cookie = '登录状态下才能从微信服务器获取头像图片，把wx.qq.com的Cookie放在这里';

contacts.forEach((contact) => {
    makeRequest(contact);
});

function makeRequest(contact) {
    var contactName = contact.RemarkName || contact.NickName; // 有备注使用备注，没有备注使用昵称
    if (contactName.indexOf('<') >= 0) return; // 带有表情符号，手机联系人中不可能存在，直接略过
    var options = {
        host: 'wx.qq.com',
        port: 443,
        path: contact.HeadImgUrl,
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch, br',
            'Accept-Language': 'zh-CN,zh;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Cookie': cookie
        }
    };
    var req = https.get(options, res => {
        res.setEncoding("binary");
        var imgData = '';
        res.on('data', chunk => {
            imgData += chunk;
        });
        res.on('end', () => {
            if (imgData.length > 0) {
                // 发现response header里的content-type都是image/jpeg，为了简化代码，文件后缀名就写死了
                fs.writeFile(`images/${contactName}.jpg`, imgData, "binary");
                if (contact.retry) {
                    console.log(`Download ${contactName} succeeded!`);
                }
            } else {
                // 网络不稳定下载失败，重新下载
                console.log(`Download ${contactName} failed! Retry...`);
                contact.retry = true;
                makeRequest(contact);
            }
        });
    });
    req.end();
}