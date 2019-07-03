// npm run build demo/v1.0.0 打包到branches下
// npm run build demo/v1.0.0 prod 打包到trunks下
// npm run serve demo/v1.0.0 热更新

var path = require('path');
var fs = require('fs');

var args = process.argv.splice(2);
var environment = args[0];
var sourcePath = environment == 'build' ? args[4] : args[3];
// console.log('----Arguments----',args,sourcePath)
var inputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');
var dir = inputPath.split('/')[0];
// console.log('------inputPath------',inputPath);

var enviromentPath = environment == 'build' ? ( args.length == 6 && args[5] == 'prod' ? '../../trunks/assets/app/vue/'+ inputPath : '../../branches/assets/app/vue/'+ inputPath ) : '../../branches/vue/'+ inputPath ;

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
    // pluginOptions: {
    //     'style-resources-loader': {
    //       'patterns': [
    //         path.resolve(__dirname, `src/${sourcePath}/assets/scss/_base.scss`),
    //       ]
    //     }
    // },
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    },
    css: {
        loaderOptions: {
            sass: {
                data: (async ()=>{
                    var tdata = [];
                    let promise = async function(){
                        console.log('-----22222----')
                        return await new Promise(async (resolve,reject)=>{
                            let dirs = [];
                            let url = path.resolve(__dirname,`src/${sourcePath}/assets/scss`);
                            var p2 = ()=>{
                                return new Promise(resolve=>{
                                    fs.readdir(url,async function(err, files){
                                        console.log('----333');
                                        await (async function iterator(i){
                                            if(i == files.length) {
                                                console.log('----OVER---',dirs)
                                                var tdata = [];
                                                console.log('-----44444---',dirs)
                                                dirs.forEach(val=>{
                                                    tdata.push( `@import "${val}";`)
                                                });
                                                console.log('-----FIN----',tdata)
                                                await resolve(dirs);
                                            }
                                            if(!!files[i]){
                                                let fileName = path.resolve(url, files[i]);
                                                console.log('errrrrrrrr',url, files,i)                                                
                                                fs.stat(fileName,function(err, data){     
                                                    if(data.isFile()){               
                                                        console.log('----listen',fileName)
                                                        dirs.push(fileName);
                                                    }
                                                    iterator(i+1);
                                                }); 
                                            }  
                                        })(0);
                                    })
                                })
                            };
                            let d = await p2();
                        });
                    };
                    console.log('-----------11111-------')
                    await promise().then(res=>{
                        console.log('-----F3333IN----',tdata)
                    });
                    console.log('-----FIN2222----',tdata)
                    
                    
                    return await tdata;
                })()
                // data:[
                //     `@import "'/Users/yan/Documents/github/vue-multi-framework/dev/vue-project/src/demo/v1.0.0/assets/scss/_base.scss'";`
                // ]
            }
        }
    }
};

// console.log('************************************',path.resolve(__dirname, `./src/${sourcePath}/assets/scss/_base.scss`))

// console.log(JSON.stringify(config))

console.log('****************OVER********************')

// console.log('输出路径---->',path.resolve(enviromentPath));

module.exports = config;