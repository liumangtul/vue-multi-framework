var fs = require('fs');
var pathLib = require('path');
var basePath = pathLib.resolve(__dirname,'src/');
const dirs = ['assets','components','public','views'];
const files = ['App.vue','main.js','router.js','store.js','../webpack.config.js'];

var path = process.argv.splice(2)[0];
var pathReg = /^([0-9a-zA-Z-_]+\/)[vV]([0-9])[0-9.]{0,}$/img;
if(!pathReg.test(path)){
    console.error('目录格式有误',path);
}else{
    console.log('----path----',path)
    mkdir(pathLib.resolve(basePath,path),()=>{

        dirs.forEach(dir=>{
            mkdir(pathLib.resolve(basePath,path,dir),()=>{
                console.log('---dir---',dir)
                if(dir === 'public'){
                    writeFile(
                        pathLib.resolve(basePath,path,dir,'index.html'),
                        fs.readFileSync(pathLib.resolve(__dirname,'tmpl/','public.html'))
                    );
                }
            });
        })
        files.forEach(file=>{
            writeFile(
                pathLib.resolve(basePath,path,file),
                fs.readFileSync(pathLib.resolve(__dirname,'tmpl/',file))
            );
        })
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
                        console.error('写入'+file+'文件失败',err);
                        return false;
                    }
                    cb && cb(url,file,err);
                });
        }else{
            console.error('【WAR】写入文件失败:'+url.slice(url.lastIndexOf('/')+1)+'文件已存在')
        }
    })
}
