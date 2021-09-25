const express=require("express");
const fs=require("fs");
const path=require("path");
const admZip=require("adm-zip");
const multer=require("multer");
const { maxHeaderSize } = require("http");
const { kMaxLength } = require("buffer");

const port=4000;

const app=express()

const staticPath=path.join(__dirname,"./public");
app.use(express.static(staticPath));

app.set("view engine","hbs");

app.get("/",(req,res)=>{
    res.render("index");
})


// setting disk storage and file name to upload
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public/upload");
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname));
    },
});


// compression of uploaded files
var compressfilesupload=multer({storage:storage,limits:{fileSize:kMaxLength}});


// post method on button click
app.post("/",compressfilesupload.array("file",100),(req,res)=>{

    var zip=new admZip();
    
    // zip file name setting
    var outputfilepath=Date.now()+"output.zip";

    // adding of compressed files into zip file
    if(req.files){
        req.files.forEach((file)=>{
            console.log(file.path);
            zip.addLocalFile(file.path)
        });
    
        // adding zip file name to the zip file
    fs.writeFileSync(outputfilepath,zip.toBuffer());

    // downloading zip file
    res.download(outputfilepath,(err)=>{
        if(err){
            // deleting all uploaded files and zip file
            req.files.forEach((file)=>{
                fs.unlinkSync(file.path)
            });
            fs.unlinkSync(outputfilepath)
        }

        // deleting all uploaded files and zip file
        req.files.forEach((file)=>{
            fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputfilepath)
    })
    }
});




app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
});