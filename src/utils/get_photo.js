const fs = require('fs');

const getPhoto = (dir) =>{
    const photos = fs.readdirSync(dir).map(photo => {
        return {
            name: photo,
            time: fs.statSync(dir).mtime
        }
    })
        .sort((a, b) => {
            return b.time - a.time;
        })
        .map(function (v) {
            return v.name;
        });
    console.log(dir)
    console.log(photos)
    return photos
}


module.exports = getPhoto