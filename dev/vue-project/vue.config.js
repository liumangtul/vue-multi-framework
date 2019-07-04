// npm run build demo/v1.0.0 打包到trunks下
// npm run watch demo/v1.0.0 prod 打包到branches下
// npm run serve demo/v1.0.0 热更新

var path = require('path');
var fs = require('fs');

var args = process.argv.splice(2);
var environment = args[0];
var sourcePath = environment == 'build' ? args[5] : args[2];
console.log('----Arguments----',args,sourcePath)
var inputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');
var dir = inputPath.split('/')[0];
// console.log('------inputPath------',inputPath);

var enviromentPath = environment == 'build' ? ( args.length == 6 && args[4] == 'prod' ? '../../trunk/assets/app/vue/'+ inputPath : '../../branches/assets/app/vue/'+ inputPath ) : '../../branches/vue/'+ inputPath ;


let dirs = [];
let isScss = fs.readdirSync(path.resolve(__dirname,`src/${sourcePath}/assets`)).indexOf('scss')!=-1;
if(isScss){
    let url = path.resolve(__dirname,`src/${sourcePath}/assets/scss`);
    let files = fs.readdirSync(url);
    console.log(files)
    ;(function iterator(i){
        if(!!files[i]){
            let fileName = path.resolve(url, files[i]);
            let stat = fs.statSync(fileName);
            if(stat.isFile() && /^\S+\.module.scss$/img.test(files[i])) dirs.push(fileName);
            iterator(i+1);
        }
    })(0);
}

console.log('全局scss',dirs);

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
        if(dirs.length>0){
            // 配置全局scss
            const oneOfsMap = config.module.rule('scss').oneOfs.store
            //insert loader
            oneOfsMap.forEach(item => {
                item
                    .use('sass-resources-loader')
                    .loader('sass-resources-loader')
                    .options({
                        resources: dirs
                    })
                    .end()
            })
        }

    }
};


console.log(JSON.stringify(config))

console.log('输出路径---->',path.resolve(enviromentPath));

module.exports = config;