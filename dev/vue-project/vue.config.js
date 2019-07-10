// npm run build demo/v1.0.0 打包到trunks下
// npm run watch demo/v1.0.0 打包到branches下
// npm run serve demo/v1.0.0 热更新

var path = require('path');
var fs = require('fs');
var SpritesmithPlugin = require("webpack-spritesmith");

const resolve = dir => path.join(__dirname, dir);

const args = process.argv.splice(2);

//环境
const environment = args[0] == 'build' ?
    ( args.length == 6 && args[4] == 'prod' ? 'prod' : 'dev' ) :
    'local';

//打包相对目录 example => demo/v1.0.0
const sourcePath = environment == 'local' ?
    args[2] :
    args[5];

//输出相对目录 example => demo/v1
const outputPath = sourcePath.replace(/^(\S+\/)[vV]([0-9])[0-9.]{0,}$/img,'$1v$2');

const projectName = outputPath.split('/')[0];

//sass目录
const dirSass = path.resolve(__dirname,`src/${sourcePath}/assets/scss`);

// 打包开发根目录
const rootDir = environment == 'prod' ?
    'trunk' :
    'branches';
//打包根域名
const rootDomain = environment == 'prod' ?
    'http://test.bch.abc.com' :
    ( environment == 'dev' ? 'http://test.trunk.abc.com' : '' );
const outputDir = `../../${rootDir}/assets/app/vue/${outputPath}`;

require(path.resolve(__dirname,`src/${sourcePath.split('/')[0]}/webpack.config.js`))
var config = {
    outputDir,
    publicPath:`${rootDomain}/assets/app/vue/${outputPath}/`,
    indexPath :  'index.html',
    assetsDir : '',
    filenameHashing : false,
    lintOnSave : true,
    runtimeCompiler : true,
    pages : {
        [projectName] : {
            entry:'src/'+sourcePath+'/main.js',
            template:'src/'+sourcePath+'/public/index.html',
            filename : 'index.html',
            chunks : ['chunk-vendors', 'chunk-common', projectName]
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

        //resource-sass-loader 预处理的sass文件
        let resourceSassFiles = [];
        if(fs.readdirSync(path.resolve(__dirname,`src/${sourcePath}/assets`)).indexOf('scss')!=-1){
            let files = fs.readdirSync(dirSass);
            files.forEach(file=>{
                const fileName = path.resolve(dirSass, file);
                let stat = fs.statSync(fileName);
                if(stat.isFile() && /^\S+\.common.scss$/img.test(file)){
                    resourceSassFiles.push(fileName);
                }
            });
        }
        if(resourceSassFiles.length>0){
            // 配置全局scss
            const oneOfsMap = config.module.rule('scss').oneOfs.store
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


            let escapedImage = sheet.escaped_image;
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

            let escapedImage = sheet.escaped_image;
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

        ;(()=> {
            let spritesDirs = fs.readdirSync(path.resolve(__dirname, `src/${sourcePath}/sprites`));
            if (spritesDirs.length > 0) {
                let confs = [];
                spritesDirs.forEach(filename => {
                    let stat = fs.statSync(path.resolve(__dirname, `src/${sourcePath}/sprites`, filename));
                    if (stat.isDirectory()) {
                        let conf = generateSpritesmith(filename);
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

        function generateSpritesmith(filename){
            let cwd = path.resolve(__dirname, `src/${sourcePath}/sprites/${filename}`);
            let target = {
                image: path.resolve(__dirname, outputDir, `img/sprite_${filename}.png`),
                css: []
            };
            if (targetPlatform.indexOf('original') !== -1) {
                target.css.push(
                    // 默认生成的文件
                    [path.resolve(dirSass, `sprite_${filename}o.scss`)]
                );
            }
            if (targetPlatform.indexOf('mobile') !== -1) {
                target.css.push(
                    // rem scss
                    [path.resolve(dirSass, `sprite_${filename}.rem.scss`), { format: 'generateSpriteREM' }]
                );
            }
            if (targetPlatform.indexOf('pc') !== -1) {
                target.css.push(
                    // pc scss
                    [path.resolve(dirSass, `sprite_${filename}.px.scss`), { format: 'generateSpritePX' }],
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

console.log('输出路径---->',path.resolve(`../../${rootDir}/assets/app/vue/${outputPath}`));

module.exports = config;