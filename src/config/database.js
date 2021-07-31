const mongoose = require('mongoose');

mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
})
    .then(() => console.log('Connected to Database'))
    .catch(e => {
        console.log('An error occured while connecting to database: ' + e)
    })