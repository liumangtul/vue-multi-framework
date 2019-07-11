/**
 * @fileOverview  webpack配置辅助
 * @date  2016.03.09 17:10:49
 */
var fs = require('fs');
var path = require('path');

function Utils() {
    this.dir = process.cwd();
    this.version = '0.0.0'; //版本
};

Utils.prototype = {
    init: function (dir) {
        if (dir) this.dir = dir;
        var ls = this._walk();
        this.version = global.version || this._version(ls);
        return this;
    },
    //查询当前目录 v:查询version f:查询js
    _walk: function () {
        var arr = [];
        let that  =this;
        var list = fs.readdirSync(this.dir);
        list.forEach(function (file) {
            file = path.join(that.dir, file);
            var stat = fs.statSync(file);
            if(stat && !stat.isFile()){
                if (stat && stat.isDirectory()) {
                    arr.push(file);
                }
            }
        });
        return arr;
    },
    //版本号比较
    _max: function (ver1, ver2) {
        ver1 = ver1 || "0.0.0";
        ver2 = ver2 || "0.0.0";
        if (ver1 == ver2) return ver1;
        var verArr1 = ver1.split(".");
        var verArr2 = ver2.split(".");
        var len = Math.max(verArr1.length, verArr2.length);
        for (var i = 0; i < len; i++) {
            var v1 = ~~verArr1[i],
                v2 = ~~verArr2[i];
            if (v2 < v1) {
                return ver1;
            } else if (v2 > v1) {
                return ver2;
            }
        }
        return '0.0.0';
    },
    _version: function (dirs) {
        var dirs = dirs;
        var ver1, ver2;
        var that = this;
        dirs.forEach(function (item, i) {
            ver2 = item.split(/\\|\//).slice(-1)[0].replace('v','');
            ver1 = that._max(ver1, ver2);
        });
        console.log('vvvv',ver1,ver2)
        return ver1;
    }
};

module.exports = Utils;
