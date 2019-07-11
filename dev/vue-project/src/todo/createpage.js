/**
 * 创建项目多页应用
 * @example
 *          node createpage.js page
 *          node createpage.js page1,page2,...
 * */
var fs = require('fs');
var path = require('path');
var Utils = require('../../webpack/utils.js');

const dirs = ['assets','components','public','views','sprites'];
const files = ['App.vue','main.js','router.js','store.js'];
const args = process.argv.splice(2);
const pageName = args[0].split(',');
const basePath = `./v${new Utils().init().version}`;
const PAGES = 'pages';

const version = global.pversion || new Utils().init().version;
console.log(version)

const pageReg = /^[_\-0-9a-zA-Z]+$/im;

if( !pageName.every( item => (pageReg.test(item)) ) ){
    console.error('目录格式有误',basePath,pageName);
    return false;
}
pageName.forEach(item=>{
    createPage(item);
});


function createPage(pageName){
    console.log('----basePath----',basePath);
    dirs.forEach(dir=>{
        mkdir(path.resolve(__dirname,basePath,PAGES,pageName,dir),()=>{
            console.log('---dir---',dir)
            if(dir === 'public'){
                writeFile(
                    path.resolve(__dirname,basePath,PAGES,pageName,dir,'index.html'),
                    fs.readFileSync(path.resolve(__dirname,'../../tmpl/','public.html'))
                );
            }
        });
    });
    files.forEach(file=>{
        writeFile(
            path.resolve(__dirname,basePath,PAGES,pageName,file),
            fs.readFileSync(path.resolve(__dirname,'../../tmpl/',file))
        );
    });
}


function mkdir(
    url,
    cb,
    opt = {
        recursive : true
    }){
    fs.mkdir(url,{
        recursive:opt.recursive
    },err=>{
        if(err){
            console.error('创建目录失败',err);
            return false;
        }
        cb && cb(url,err);
    });
}

function writeFile(
    url,
    file = '',
    cb
){
    fs.readFile(url,(err,data)=>{
        if(err){
            fs.writeFile(
                url,
                file,
                err=>{
                    if(err){
                        console.error('写入',url,'文件失败',err);
                        return false;
                    }
                    cb && cb(url,file,err);
                });
        }else{
            console.error('【WAR】写入文件失败:'+url.slice(url.lastIndexOf('/')+1)+'文件已存在')
        }
    })
}
