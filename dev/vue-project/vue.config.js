// npm run build demo/v1.0.0 打包到trunks下
// npm run watch demo/v1.0.0 打包到branches下
// npm run serve demo/v1.0.0 热更新

var path = require('path');
var fs = require('fs');
const SpritesmithPlugin = require("webpack-spritesmith"); //引入雪碧图
const resolve = dir => path.join(__dirname, dir);


var args = process.argv.splice(2);
var environment = args[0];
var sourcePath = environment == 'build' ? args[5] : args[2];
// console.log('----Arguments----',args,sourcePath)
var inputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');
var dir = inputPath.split('/')[0];
// console.log('------inputPath------',inputPath);

var enviroment = environment == 'build' ? ( args.length == 6 && args[4] == 'prod' ? 'prod' : 'dev' ) : 'dev';
// 打包根目录名
const rootDir = enviroment == 'prod' ? 'trunk' : 'branches';

let dirs = [];
let isScss = fs.readdirSync(path.resolve(__dirname,`src/${sourcePath}/assets`)).indexOf('scss')!=-1;
if(isScss){
    let url = path.resolve(__dirname,`src/${sourcePath}/assets/scss`);
    let files = fs.readdirSync(url);
    files.forEach(file=>{
        let fileName = path.resolve(url, file);
        let stat = fs.statSync(fileName);
        if(stat.isFile() && /^\S+\.common.scss$/img.test(file)){
            dirs.push(fileName);
        }
    });
}
// console.log('scss----',path.join(__dirname,`src/${sourcePath}`));
// console.log('全局scss',dirs);
require(path.resolve(__dirname,`src/${sourcePath.split('/')[0]}/webpack.config.js`))
var config = {
    outputDir:`../../${rootDir}/assets/app/vue/${inputPath}`,
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
        //添加别名
        config.resolve.alias
            .set("@", resolve(`src/${sourcePath}`))
            .set("assets", resolve(`src/${sourcePath}/assets`))
            .end();

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

        let targetPlatform = global.targetPlatform || ['original', 'mobile', 'pc'];
        console.log('----=====targetPlatform====----',targetPlatform);
        // sprites
        // 模板 for pc
        const generateSpritePX = function (data) {
            let sheet = data.spritesheet;
            // 拼接class名
            let basename = path.basename(sheet.escaped_image, '.png');
            let mArr = basename.match(/-(\d+)x$/);
            let x = mArr ? mArr[1] : 1;


            let escapedImage = sheet.escaped_image;
            escapedImage = `/assets/app/vue/${inputPath}/img/${basename}.png`;
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

            let escapedImage = sheet.escaped_image;
            escapedImage = `/assets/app/vue/${inputPath}/img/${basename}.png`;
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

        ;(()=> {
            let spritesDirs = fs.readdirSync(path.resolve(__dirname, `src/${sourcePath}/sprites`));
            if (spritesDirs.length > 0) {
                let confs = [];
                spritesDirs.forEach(filename => {
                    let stat = fs.statSync(path.resolve(__dirname, `src/${sourcePath}/sprites`, filename));
                    if (stat.isDirectory()) {
                        let conf = generateSpritesmith(filename, args);
                        confs.push(conf[0]);
                        ;((conf)=>{
                            config
                                .plugin(`spritesmith_${filename}`)
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
        })();

        function generateSpritesmith(filename, args){
                let cwd = path.resolve(__dirname, `src/${sourcePath}/sprites/${filename}`);
                let target = {
                    image: path.resolve(__dirname, `../../${rootDir}/assets/app/vue/${inputPath}/img/sprite_${filename}.png`),
                    css: []
                };
                if (targetPlatform.indexOf('original') !== -1) {
                    target.css.push(
                        // 默认生成的文件
                        [path.resolve(__dirname, `src/${sourcePath}/assets/scss/sprite_${filename}o.scss`)]
                    );
                }
                if (targetPlatform.indexOf('mobile') !== -1) {
                    target.css.push(
                        // rem scss
                        [path.resolve(__dirname, `src/${sourcePath}/assets/scss/sprite_${filename}.rem.scss`), { format: 'generateSpriteREM' }]
                    );
                }
                if (targetPlatform.indexOf('pc') !== -1) {
                    target.css.push(
                        // pc scss
                        [path.resolve(__dirname, `src/${sourcePath}/assets/scss/sprite_${filename}.px.scss`), { format: 'generateSpritePX' }],
                    );
                }
                let conf = {
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
                    },
                };
                return [conf];
            }

    }
};


// console.log(JSON.stringify(config))

console.log('输出路径---->',path.resolve(`../../${rootDir}/assets/app/vue/${inputPath}`));

module.exports = config;