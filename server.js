const fs = require('fs')
const path = require('path')
const stream = require("stream/promises")
const express = require('express')
const multer = require('multer')
const cors = require('cors')

const PORT = process.env.PORT || 8080
const app = express()

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,path.join(__dirname, '/tmp', '/uploads'))
    },
    filename: (req,file,cb) =>{
        const date = Date.now()
        const name = `${date}-${file.originalname}`
        cb(null, name)
    }
})

// 10E7 is 10 exponent of 7 and multiplied by 2 // to allow only total of 200MB of fileSize
const upload = multer({
    storage: storage,
    fileFilter: (req,file,cb)=>{
        const fileType = file.mimetype.split('/').at(-1)
        if(fileType === 'mp5'){
            cb(null,true)
        }else{
            cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
        }
    }
})
// const upload = multer({dest: 'tmp/uploads'})
app.use(cors({
    origin: "*"
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req,res) =>{
    res.status(200).json({hello: "world"})
})

app.post('/addVideo',upload.single('video'),(req,res)=>{
    console.log(req.file)
    res.status(200).json({status: 'success'})
})

app.all("*",(req,res,next)=>{
    const err = new Error("Invalid Route")
    next(err)
})

app.use((err,req,res,next)=>{
    if(err instanceof multer.MulterError){
        if(err.code === 'LIMIT_UNEXPECTED_FILE'){
             res.status(400).json({status: 'fail', message: "Error"})
        }
    }else{
        res.status(400).json({status: 'fail', message: err.message})
    }
})

app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`))