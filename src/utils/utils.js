const utils = (username, message) =>{
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    getMessage: utils
}