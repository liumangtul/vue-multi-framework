/**
 *@fileOverview compile
 *@Author wangyan15@leju.com
 *@Date 2019-07-10 20:23
 *@template
 */
var Utils = require('../../webpack/utils.js');

const args = process.argv.splice(2);


const version = global.pversion || new Utils().init().version;