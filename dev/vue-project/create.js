/**
 * node create.js [项目名称]/[版本号]
 *  example
 *          node create.js demo/v1.0.0
 * */

const fs = require('fs');
const path = require('path');

const args = process.argv.splice(2);
const basePath = path.resolve(__dirname,'src/');
const dirs = args[0];
const files = ['webpack.config.js','createpage.js','devServerProxy.js',{
    common:['js/api.js']
}];
const plist = ['common/scss','pages','common/js'];

if(!/^([0-9a-zA-Z-_]+\/)[vV]([0-9])[0-9.]{0,}$/img.test(dirs)){
    console.error('目录格式有误',dirs);
}else{
    plist.forEach(dir=>{
        mkdir(path.resolve(basePath,dirs,dir));
    });
    mkdir(path.resolve(basePath,dirs,'pages'),()=>{
        files.forEach(file=>{
            if(typeof file == 'string'){
                writeFile(
                    path.resolve(basePath,dirs.split('/')[0],file),
                    fs.readFileSync(path.resolve(__dirname,'tmpl/',file))
                );
            }else{
                for(let key in file){
                    if(key == 'common'){
                        file[key].forEach(item=>{
                            writeFile(
                                path.resolve(basePath,dirs,key,item),
                                fs.readFileSync(path.resolve(__dirname,'tmpl/',key,item))
                            );
                        });
                    }
                }
            }
        })
    });
}


function mkdir(
    url,
    cb,
    opt = {
        recursive : true
    }){
    fs.mkdir(
        url,
        {recursive:opt.recursive},
        err => {
            if ( err ) {
                console.error('创建项目目录失败',err);
                return false;
            }
            console.log('---dirs---',dirs);
            cb && cb(url,err);
        }
    );
}

function writeFile(
    url,
    file = '',
    cb
){
    fs.readFile(
        url,
        (err,data) => {
            if(err){
                fs.writeFile(
                    url,
                    file,
                    err=>{
                        if(err){
                            console.error('写入文件失败',url,err);
                            return false;
                        }
                        cb && cb(url,file,err);
                    });
            }else{
                console.error('【WAR】写入被忽略:',url,'文件已存在')
            }
        }
    )
}
