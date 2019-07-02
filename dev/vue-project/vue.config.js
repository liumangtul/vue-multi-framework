// npm run build demo/v1.0.0 打包到branches下
// npm run build demo/v1.0.0 prod 打包到trunks下
// npm run serve demo/v1.0.0 热更新

var path = require('path');

var args = process.argv.splice(2);
var environment = args[0];
var sourcePath = environment == 'build' ? args[3] : args[2];
console.log('----Arguments----',args,sourcePath)
var inputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');
var dir = inputPath.split('/')[0];
console.log('------inputPath------',inputPath);

var enviromentPath = environment == 'build' ? ( args.length == 5 && args[4] == 'prod' ? '../../trunks/assets/app/vue/'+ inputPath : '../../branches/assets/app/vue/'+ inputPath ) : '../../branches/vue/'+ inputPath ;

var config = {
    outputDir:enviromentPath,
    publicPath:'/assets/app/vue/'+inputPath+'/',
    indexPath :  'index.html',
    assetsDir : '',
    filenameHashing : false,
    lintOnSave : true,
    runtimeCompiler : true,
    pages : {
        [dir] : {
            entry:'src/'+sourcePath+'/main.js',
            template:'src/'+sourcePath+'/public/index.html',
            filename : 'index.html',
            chunks : ['chunk-vendors', 'chunk-common', dir] 
        }
    },
    devServer : {
        historyApiFallback: true, 
        hot: true, 
        inline: true, 
        progress:true 
    },
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    }
};
console.log('************************************')

console.log(JSON.stringify(config))

console.log('****************OVER********************')

console.log('输出路径---->',path.resolve(enviromentPath));

module.exports = config;