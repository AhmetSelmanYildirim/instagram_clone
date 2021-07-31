const User = require('../model/user_model');
const Photo = require('../model/photo_model');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const showHomePage = async (req, res, next) => {

    const users = await User.find({emailActive: true})
    const usersNames = users.map(name => name.username)
    const followingUserNames = req.user.following.map(e => e.username)
    const notFollowingUserNames = usersNames.filter(n => !followingUserNames.includes(n))
    notFollowingUserNames.splice(notFollowingUserNames.indexOf(req.user.username), 1)


    const photos = await Photo.find({isActive: true})
    const sortedPhotos = await photos.map(photo => {
        return {
            like: photo.like,
            description: photo.description,
            email: photo.email,
            name: photo.name,
            username: photo.username,
            time: photo.timestamp,
            createdAt: photo.createdAt,
            id: photo._id,
            avatar: photo.avatar

        }
    })
        .sort((a, b) => {
            return b.createdAt - a.createdAt
        })


    res.render('homepage', {layout: './layout/manage_layout.ejs', title: 'Homepage', user: req.user, sortedPhotos, notFollowingUserNames})
}

const showProfilePage = (req, res, next) => {
    const photoCount = fs.readdirSync(path.join(__dirname, "../uploads/photos/" + req.user.email)).length
    const photoNames = fs.readdirSync(path.join(__dirname, "../uploads/photos/" + req.user.email)).map(file => {
        return file
    })


    const photos = fs.readdirSync(path.join(__dirname, "../uploads/photos/" + req.user.email)).map(photo => {
        return {
            name: photo,
            time: fs.statSync(path.join(__dirname, "../uploads/photos/" + req.user.email + "/" + photo)).mtime
        }
    })
        .sort((a, b) => {
            return b.time - a.time;
        })
        .map(function (v) {
            return v.name;
        });


    res.render('profile', {
        user: req.user,
        layout: './layout/manage_layout.ejs',
        title: 'Profile Page',
        photos
    })
}

const showMessages = async (req, res, next) => {

    const me = await User.findById(req.user.id);
    const messagers = me.messages;


    res.render('messages', {layout: './layout/manage_layout.ejs', title: 'Messages', user:req.user, messagers})
}
const newMessage = async (req,res,next)=>{

    const username = req.body.messageTo
    const _user = await User.findOne({username: username})
    const userObj = {username: username, email:_user.email}
    const myInfo = {username:req.user.username, email:req.user.email }



    //Add username and email to database
    const messaged = await User.findById(req.user.id)

    const result = await messaged.messages.find(e=>{
        if(e.username === username) return true
    })

    if(!result){
        await User.findByIdAndUpdate(req.user.id,{$push:{messages:userObj}}, {useFindAndModify: false})
        await User.findByIdAndUpdate(_user.id,{$push:{messages:myInfo}}, {useFindAndModify:false})
    }

}

const showProfileUpdatePage = (req, res, next) => {
    res.render('profile_update',
        {user: req.user, layout: './layout/manage_layout.ejs', title: 'Update Profile'})
}
const updateProfile = async (req, res, next) => {

    const currentInfo = {

    }

    try {
        if (req.file) {
            currentInfo.avatar = req.file.filename
            await sharp(path.join(__dirname, "../uploads/avatars/" + req.file.filename)).resize(400, 400)
                .jpeg({quality: 80})
                .toFile(path.join(__dirname, "../uploads/avatars/av-" + req.file.filename))
                .then(() => fs.unlinkSync(path.join(__dirname, "../uploads/avatars/" + req.file.filename)))

        }

        const result = await User.findByIdAndUpdate(req.user.id, currentInfo);

        if (result) {
            console.log('update completed')
            res.redirect('/manage/profile')
        }
    } catch (e) {
        console.log('An error occured in update profile' + e)
    }

}

const showPhotoUpload = (req, res, next) => {
    res.render('upload_photo', {layout: './layout/manage_layout.ejs', title: 'Photo Upload'})
}
const uploadPhoto = async (req, res, next) => {

    try {
        if (req.file) {
            await sharp(path.join(__dirname, "../uploads/photos/" + req.user.email + "/" + req.file.filename))
                .jpeg({quality: 80})
                .toFile(path.join(__dirname, "../uploads/photos/" + req.user.email + "/photo-" + req.file.filename))
                .then(() => fs.unlinkSync(path.join(__dirname, "../uploads/photos/" + req.user.email + "/" + req.file.filename)))
        }

        const newPhotoInUser = {
            email: req.user.email,
            name: req.file.filename,
            username: req.user.username,
            description: req.body.description,
        }


        const isPhotoNameExist = await Photo.findOne({name:req.file.filename})

        if(isPhotoNameExist){
            console.log("Photo already uploaded")
        }
        else{

            await User.findByIdAndUpdate(req.user.id, {$push: {photos: newPhotoInUser}}, {useFindAndModify: false});

            //Creating new photo
            const newPhoto = new Photo({
                email: req.user.email,
                name: req.file.filename,
                username: req.user.username,
                description: req.body.description,
            });
            await newPhoto.save();
            console.log('Photo Created');
        }


        if (!isPhotoNameExist) {
            console.log('update completed')
            res.redirect('/manage/profile')
        }
        else{

            req.flash('validation_error', [{ msg: 'Photo already uploaded'}])
            res.redirect('/manage/upload-photo');
        }
    } catch (e) {
        console.log('An error occured in update profile: ' + e)
    }

}

const like = async (req, res, next) => {


    const photo = await Photo.findOne({_id: req.body.photoID})

    try {

        const likersInfoDB = await photo.likers.map(em => {
            return em
        })
        const likersInfoServer = await likersInfoDB.find(em => {
            if (req.user.email === em.email) {
                return em
            }
        })

        if (likersInfoServer) {

            if (likersInfoServer.isLiked === true) {
                const removeLike = {
                    _id: likersInfoServer._id,
                    email: likersInfoServer.email,
                    isLiked: true
                };

                await Photo.findByIdAndUpdate(req.body.photoID, {$pull: {likers: removeLike}}, {useFindAndModify: false})
                const addLike = {
                    _id: likersInfoServer._id,
                    email: req.user.email,
                    isLiked: false
                }
                await Photo.findByIdAndUpdate(req.body.photoID, {$push: {likers: addLike}}, {useFindAndModify: false})
                await Photo.findByIdAndUpdate(req.body.photoID, {$inc :{ like : -1}}, {useFindAndModify: false})


            }

            //If likersInfoServe isliked:false -> true
            else if (likersInfoServer.isLiked === false) {
                const removeLike = {
                    _id: likersInfoServer._id,
                    email: likersInfoServer.email,
                    isLiked: false
                };

                await Photo.findByIdAndUpdate(req.body.photoID, {$pull: {likers: removeLike}}, {useFindAndModify: false})
                const addLike = {
                    _id: likersInfoServer._id,
                    email: req.user.email,
                    isLiked: true
                }
                await Photo.findByIdAndUpdate(req.body.photoID, {$push: {likers: addLike}}, {useFindAndModify: false}).then(console.log("Like eklendi"))
                await Photo.findByIdAndUpdate(req.body.photoID, {$inc :{ like : 1}}, {useFindAndModify: false})

            }
        }

        // If email in session isn't exist add and like=true
        else if (!likersInfoServer) {
            const addLike = {
                email: req.user.email,
                isLiked: true
            }
            await Photo.findByIdAndUpdate(req.body.photoID, {$push: {likers: addLike}}, {useFindAndModify: false});
            await Photo.findByIdAndUpdate(req.body.photoID, {$inc :{ like : 1}}, {useFindAndModify: false});
        }

    } catch (e) {
        console.log(e)
    }
}
const comment = async (req,res,next)=>{

    try {

        const addComment = {
            username : req.user.username,
            email: req.user.email,
            commentText: req.body.commentText
        }
        await Photo.findByIdAndUpdate(req.body.photoID, {$push: {comments: addComment}}, {useFindAndModify: false}).then(console.log("Comment eklendi")).then(res.redirect("/manage/p/"+req.body.photoID))

    }catch (e) {
        console.log('An error occured while comment: '+e)
    }

}

const showPhotoPage = async (req,res,next)=>{

    const photoID = req.params.photoID;
    const photo = await Photo.findById(photoID)
    const folder = photo.email;
    const file = photo.name;
    const username = photo.username;
    const email = photo.email;
    const likeCount = photo.like;


    const sortedComments = await photo.comments.map(photoEl => {
        return {
            email: photoEl.email,
            username:photoEl.username,
            commentText : photoEl.commentText,
            timestamp: photoEl.timestamp,

        }
    })
        .sort((a, b) => {
            return b.timestamp - a.timestamp
        })

    //console.log(sortedComments)


    res.render('photo', {layout: './layout/manage_layout.ejs', title: 'Photo', folder, file, username, email, photoID, likeCount, sortedComments})


}
const showUserPage = async (req,res,next)=>{

    const usernamee = req.params.usernamee;

    try{

        const _thisUser = await User.findOne({username: usernamee})

        const photos = fs.readdirSync(path.join(__dirname, "../uploads/photos/" + _thisUser.email)).map(photo => {
            return {
                name: photo,
                time: fs.statSync(path.join(__dirname, "../uploads/photos/" + _thisUser.email + "/" + photo)).mtime
            }
        })
            .sort((a, b) => {
                return b.time - a.time;
            })
            .map(function (v) {
                return v.name;
            });


        const sessionUser = await User.findById(req.user.id)

        const isFollowing = sessionUser.following.find(e=>{
            if(e.username === usernamee){
                return true
            }
        })




        res.render('other_profile', {
            user: _thisUser,
            layout: './layout/manage_layout.ejs',
            title: 'Profile Page',
            photos,
            isFollowing
        })

    }catch(e)
    {
        console.log(e)
    }

}

const addFriend = async (req,res,next) => {

    const followingUsername = req.body.friendUsername;

    const following = await User.findOne({username:followingUsername});
    const followingEmail = following.email;
    const followingID = following._id;


    try {

        const currentUserInfo = {
            username: req.user.username,
            email: req.user.email
        }

        const newFollowing = {
            username: followingUsername,
            email: followingEmail
        }

        await User.findByIdAndUpdate(req.user.id, {$push: {following: newFollowing}}, {useFindAndModify: false});
        await User.findByIdAndUpdate(followingID, {$push: {followers: currentUserInfo}}, {useFindAndModify: false});

    }catch (e) {
        console.log("An error occured while adding friend: " +e)
    }
}
const removeFriend = async (req,res,next) => {

    const followerUsername = req.body.friendUsername;
    const follower = await User.findOne({username:followerUsername});
    const followerEmail = follower.email;
    const followerID = follower._id;

    try {

        const currentUserInfo = {
            username: req.user.username,
            email: req.user.email
        }

        const willRemoveUser = {
            username: followerUsername,
            email: followerEmail
        }

        await User.findByIdAndUpdate(req.user.id, {$pull: {following: willRemoveUser}}, {useFindAndModify: false});
        await User.findByIdAndUpdate(followerID, {$pull: {followers: currentUserInfo}}, {useFindAndModify: false});

    }catch (e) {
        console.log("An error occured while adding friend: " +e)
    }
}

module.exports = {
    showHomePage,
    showProfilePage,
    updateProfile,
    showMessages,
    showProfileUpdatePage,
    showPhotoUpload,
    uploadPhoto,
    like,
    comment,
    showPhotoPage,
    showUserPage,
    addFriend,
    removeFriend,
    newMessage
}