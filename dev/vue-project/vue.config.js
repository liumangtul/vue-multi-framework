/**
 * 打包
 *      npm run build demo 打包到trunks下
        npm run watch demo 打包到branches下
        npm run serve demo 热更新
 * */


const path = require('path');
const fs = require('fs');
const SpritesmithPlugin = require("webpack-spritesmith");
const Utils = require('./webpack/utils');



const resolve = dir => path.join(__dirname, dir);

const args = process.argv.splice(2);

//环境
const environment = args[0] == 'build' ?
    ( args.length == 6 && args[4] == 'prod' ? 'prod' : 'dev' ) :
    'local';
console.log('arguments-----',args)
const projectName = environment == 'local' ?
                    args[2] :
                    args[args.length - 1];

require(path.resolve(__dirname,`src/${projectName}/webpack.config.js`))

//vx.x.x
const version = global.pversion || new Utils().init(path.resolve(__dirname,`src/${projectName}`)).version;

//打包相对目录 example => demo/v1.0.0
const sourcePath = `${projectName}/v${version}`;

//输出相对目录 example => demo/v1
const outputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');

// 打包开发根目录
const rootDir = environment == 'prod' ?
    'trunk' :
    'branches';

//打包根域名
const rootDomain = environment == 'prod' ?
    'http://test.trunk.abc.com' :
    ( environment == 'dev' ? 'http://test.bch.abc.com' : '' );

//项目输出目录根目录
const outputDir = `../../${rootDir}/assets/app/vue/${outputPath}`;

const PAGES = 'pages';
const COMMON = 'common';

let pages = {};
const pagesDir = fs.readdirSync(path.resolve(__dirname,`src/${sourcePath}/${PAGES}`));

pagesDir.forEach(pageName=>{
    let pagePath = path.resolve(__dirname,`src/${sourcePath}/${PAGES}`,pageName);
    console.log('pageName',path.resolve(__dirname,`src/${sourcePath}/${PAGES}`,pageName))
    let stat = fs.statSync(pagePath);
    if(stat && stat.isDirectory()){
        pages[pageName] = {
            entry:`src/${sourcePath}/${PAGES}/${pageName}/main.js`,
            template:`src/${sourcePath}/${PAGES}/${pageName}/public/index.html`,
            filename : `${pageName}.html`,
            title:pageName,
            chunks : ['chunk-vendors', 'chunk-common', pageName]//,
            // subpage:`src/${sourcePath}/${PAGES}/${pageName}/subpage/main.js`
        };
    }
});
console.log('ppppages-',JSON.stringify(pages));
var config = {
    outputDir,
    publicPath:`${rootDomain}/assets/app/vue/${outputPath}/`,
    indexPath :  'index.html',
    assetsDir : '',
    filenameHashing : false,
    lintOnSave : true,
    runtimeCompiler : true,
    devServer: {
    },
    pages,
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
        //添加别名
        config.resolve.alias
            .set("@", resolve(`src/${sourcePath}`))
            .set("pages", resolve(`src/${sourcePath}/${PAGES}`))
            .set("common", resolve(`src/${sourcePath}/common`))
            .end();

        //resource-sass-loader 预处理的sass文件
        //sass目录
        const dirSass = path.resolve(__dirname,`src/${sourcePath}/${COMMON}/scss`);
        let resourceSassFiles = [];
        if(fs.readdirSync(path.resolve(__dirname,`src/${sourcePath}/${COMMON}`)).indexOf('scss')!=-1){
            let files = fs.readdirSync(dirSass);
            files.forEach(file=>{
                const fileName = path.resolve(dirSass, file);
                let stat = fs.statSync(fileName);
                if(stat.isFile() && /^\S+\.common.scss$/im.test(file)){
                    resourceSassFiles.push(fileName);
                }
            });
        }
        if(resourceSassFiles.length>0){
            // 配置全局scss
            const oneOfsMap = config.module.rule('scss').oneOfs.store;
            //insert loader
            oneOfsMap.forEach(item => {
                item
                    .use('sass-resources-loader')
                    .loader('sass-resources-loader')
                    .options({
                        resources: resourceSassFiles
                    })
                    .end()
            })
        }

        let targetPlatform = global.targetPlatform || ['original', 'mobile', 'pc'];
        // sprites
        // 模板 for pc
        const generateSpritePX = function (data) {
            let sheet = data.spritesheet;
            // 拼接class名
            let basename = path.basename(sheet.escaped_image, '.png');
            let mArr = basename.match(/-(\d+)x$/);
            let x = mArr ? mArr[1] : 1;


            escapedImage = sheet.escaped_image;
            escapedImage = `${rootDomain}/assets/app/vue/${outputPath}/img/${basename}.png`;
            sheet.escaped_image = escapedImage;
            console.log('pc(px)',basename, x + 'x','雪碧图图片路径:',sheet.escaped_image);

            let shared = `@charset "utf-8";
                @function spx($px){
                    @return $px+px
                }
                .${basename} {
                    background-image: url(${sheet.escaped_image});
                    background-repeat: no-repeat;
                    background-size:spx(${sheet.width / x}) auto;
                }`;
            let perSprite = data.sprites.map(function (sprite) {
                return `.${basename}-${sprite.name} {
                    @extend .${basename};
                    width: spx(${sprite.width / x});
                    height: spx(${sprite.height / x});
                    background-position: spx(${sprite.offset_x / x}) spx(${sprite.offset_y / x});
                }`;
            }).join('\n');
            return (shared + '\n' + perSprite).replace(/ {4}/g, '');
        };
        // 模板 for mobile
        const generateSpriteREM = function (data) {
            let sheet = data.spritesheet;
            // 拼接class名
            let basename = path.basename(sheet.escaped_image, '.png');
            let mArr = basename.match(/-(\d+)x$/);
            let x = mArr ? mArr[1] : 1;

            escapedImage = sheet.escaped_image;
            escapedImage = `${rootDomain}/assets/app/vue/${outputPath}/img/${basename}.png`;
            sheet.escaped_image = escapedImage;
            console.log('mobile(rem)',basename, x + 'x','雪碧图图片路径:',sheet.escaped_image);

            let shared = `@charset "utf-8";
                /* res.leju.com/resources/rem.js */
                @function srem($px){
                    @return $px*(1/50)*1rem
                }
                .${basename} {
                    background-image: url("${sheet.escaped_image}");
                    background-repeat: no-repeat;
                    background-size:srem(${sheet.width / x}) auto;
                }`;
            let perSprite = data.sprites.map(function (sprite) {
                return `.${basename}-${sprite.name} {
                            @extend .${basename};
                            width: srem(${sprite.width / x + 8});
                            height: srem(${sprite.height / x + 8});
                            background-position: srem(${sprite.offset_x / x + 4}) srem(${sprite.offset_y / x + 4});
                        }`;
            }).join('\n');
            return (shared + '\n' + perSprite).replace(/ {4}/g, '');
        };

        //[ 'page1', 'page2', 'page3' ]
        pagesDir.forEach(pageName=>{
            //雪碧图
            let spritesDirs = fs.readdirSync(path.resolve(__dirname, `src/${sourcePath}/${PAGES}/${pageName}/sprites`));
            if (spritesDirs.length > 0) {
                let confs = [];
                console.log('spritesDirsspritesDirsspritesDirs',spritesDirs)
                spritesDirs.forEach(filename => {
                    let stat = fs.statSync(path.resolve(__dirname, `src/${sourcePath}/${PAGES}/${pageName}/sprites`, filename));
                    if (stat.isDirectory()) {
                        let conf = generateSpritesmith(filename,pageName);
                        confs.push(conf[0]);
                        ;((conf)=>{
                            config
                                .plugin(`spritesmith_${pageName}_${filename}`)
                                .use(SpritesmithPlugin)
                                .tap(args=>{
                                    return conf;
                                })
                                .end();
                        })(conf);
                    }
                });
                fs.writeFileSync(path.resolve(__dirname,`log.json`),JSON.stringify(confs));
            }
       });

        //输出文件
        config.module
            .rule('images')
            .use('url-loader')
            .tap(options => {
                return {
                    limit: 4096,
                    fallback: {
                        loader: 'file-loader',
                        options: {
                            name: resourcePath => {
                                let path = 'img/';
                                if(resourcePath.indexOf(`${sourcePath}/${COMMON}/images/`)!= -1){
                                    var rpath=resourcePath.replace(new RegExp(`^\\S+${sourcePath}\\/(${COMMON})\\/images\\/([^\\.]+\\/)?([^\\.^\\/]+\\.[^\\.^\\/]+)$`,'img'),'$2').replace(/[\/]{1,}/img,'_');
                                    console.log('ssssssssssss',rpath)
                                    path += COMMON+'/'+rpath;
                                }else if(resourcePath.indexOf(`${sourcePath}/${PAGES}`)!= -1){
                                    path += PAGES+'/';

                                    pagesDir.forEach(pageName => {
                                        if(resourcePath.indexOf(`${sourcePath}/${PAGES}/${pageName}`) != -1){
                                            var rpath=resourcePath.replace(new RegExp(`^\\S+${sourcePath}\\/(${PAGES})\\/(${pageName})\\/([^\\.]+\\/)?([^\\.^\\/]+\\.[^\\.^\\/]+)$`,'img'),'$2/$3');
                                            rpath = rpath.replace(/^(\S+\/)images\/$/img,'$1').replace(/[\/]{1,}/img,'_');
                                            console.log('')
                                            console.log('pagespagespages-----',rpath)
                                            console.log('aa-',resourcePath)
                                            console.log('')
                                            path += rpath;
                                        }
                                    });
                                }else{
                                    path += 'assets/'
                                }
                                // console.log('dddddddd',resourcePath);
                                console.log('');

                                return `${path}[name].[ext]`
                            }
                        }
                    }
                };
            })

        function generateSpritesmith(filename,pageName){
            let cwd = path.resolve(__dirname, `src/${sourcePath}/${PAGES}/${pageName}/sprites/${filename}`);
            let target = {
                image: path.resolve(__dirname, outputDir, `img/sprite_${pageName}_${filename}.png`),
                css: []
            };
            //sass目录
            const dirSass = path.resolve(__dirname,`src/${sourcePath}/${PAGES}/${pageName}/assets/scss`);
            console.log('saas dir',dirSass)
            if (targetPlatform.indexOf('original') !== -1) {
                target.css.push(
                    // 默认生成的文件
                    [path.resolve(dirSass, `sprite_${pageName}_${filename}.o.scss`)]
                );
            }
            if (targetPlatform.indexOf('mobile') !== -1) {
                target.css.push(
                    // rem scss
                    [path.resolve(dirSass, `sprite_${pageName}_${filename}.rem.scss`), { format: 'generateSpriteREM' }]
                );
            }
            if (targetPlatform.indexOf('pc') !== -1) {
                target.css.push(
                    // pc scss
                    [path.resolve(dirSass, `sprite_${pageName}_${filename}.px.scss`), { format: 'generateSpritePX' }],
                );
            }
            return [{
                // 输入
                src: {
                    cwd,
                    glob: "*.png"
                },
                // 输出（css，sprites.png）
                target,
                customTemplates: { generateSpritePX, generateSpriteREM },
                // 样式文件中调用雪碧图地址写法
                // apiOptions: {
                //     cssImageRef: `src/${sourcePath}/assets/images/sprite_${filename}.png`
                // },
                spritesmithOptions: {
                    algorithm: "binary-tree",
                    padding:20
                }
            }];
        }
    }
};
let proxy = require(path.resolve(__dirname,`src/${projectName}/devServerProxy.js`));
console.log('proxy-----',proxy)
if(Object.keys(proxy).length>0)config.devServer.proxy = proxy;

console.log('输出路径---->',path.resolve(`../../${rootDir}/assets/app/vue/${outputPath}`));

module.exports = config;