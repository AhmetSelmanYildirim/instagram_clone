const multer = require('multer');
const path = require('path');

const profilePictureStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, path.join(__dirname,"../uploads/avatars"));
    },

    filename: (req,file,cb)=>{
        cb(null, req.user.email+""+path.extname(file.originalname));
    }

});

const photosStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, path.join(__dirname,"../uploads/photos/"+req.user.email))
    },

    filename: (req,file,cb)=>{
        cb(null, file.originalname)
    }
})

const imageFileFilter = (req,file,cb)=>{
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true);
    }else{
        cb(null,false);
    }
}


const uploadImage = multer({storage:profilePictureStorage, fileFilter:imageFileFilter});
const uploadPhoto = multer({storage:photosStorage, fileFilter:imageFileFilter});

module.exports = {
    uploadImage,
    uploadPhoto
}
