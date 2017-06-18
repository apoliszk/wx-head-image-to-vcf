# 把微信好友头像同步到手机通讯录
参阅http://blog.csdn.net/github_39212680/article/details/73409960

步骤：
1. 登录微信网页版，将联系人列表请求响应存入文件`data/wx-contacts.json`
2. 修改`download-head-img.js`中的`cookie`变量，为发往微信网页版服务器请求的`cookie`
3. 运行`node download-head-img.js`，程序将下载所有微信好友的头像，并以好友的备注作为文件名
4. 手机导出联系人到vcf文件，拷贝该文件到`data/contacts.vcf`
5. 运行`node add-head-img-to-vcard.js`，程序将输出一个vcf文件到`output/contacts.vcf`
6. 将`output/contacts.vcf`导入到手机
