/**
 *@fileOverview devServerProxy.js
 *@Author wangyan15@leju.com
 *@Date 2019-07-17 17:48
 *@template
 */
let proxy = {
    '/api': {
        target: 'http://test.m.news.leju.com/api',
        changeOrigin: true,
        ws: true,
        secure:false,
        pathRewrite: {
            '^/api': ''
        }
    }
};

module.exports = proxy;