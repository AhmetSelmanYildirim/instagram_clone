const express = require('express')
const app = express();
const env = require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const Message = require('./src/model/messages_model');

//view imports
const path = require('path');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

//db
require('./src/config/database');
const MongoDBStore = require('connect-mongodb-session')(session);

const sessionStore = new MongoDBStore({
    uri: process.env.DB_CONNECTION,
    collection: 'sessions'
});

//session and flash message
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },              // Cookie resets everyday
        store: sessionStore
    },
))

app.use(flash())
app.use((req,res,next)=>{
    res.locals.validation_error = req.flash('validation_error');
    res.locals.success_message = req.flash('success_message')
    res.locals.email = req.flash('email')
    res.locals.fullname = req.flash('fullname')
    res.locals.username = req.flash('username')
    res.locals.password = req.flash('password')
    res.locals.repassword = req.flash('repassword')

    res.locals.login_error = req.flash('error');

    next();
});

app.use(passport.initialize());
app.use(passport.session());

//routers
const authRouter = require('./src/routers/auth_router');
const manageRouter = require('./src/routers/manage_router')

//for datas from form
app.use(express.urlencoded({ extended:true }));

//middlewares
app.use(expressLayouts);
app.use(express.static('public'));
app.use("/uploads",express.static(path.join(__dirname,"/src/uploads")));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './src/views'));

app.use('/', authRouter);
app.use('/manage',manageRouter)


//Socket IO

const http = require('http').createServer(app);
const io = require('socket.io')(http)
// const io = socketIO(server)
//create body parser instance
const bodyParser = require("body-parser");

//enable URL encoded for POST requests
app.use(bodyParser.urlencoded({extended:false}));

//enable headers required for POST request
app.use((req,res,next)=>{

    res.setHeader("Access-Control-Allow-Origin","*")

    next();
})

//create api to return all messages
app.post("/get_messages", (req,res)=>{

    Message.find({$or:[{$and:[{sender:req.body.sender}, {receiver: req.body.receiver}]},{$and:[{sender:req.body.receiver}, {receiver: req.body.sender}]} ]},function(error,messages){
        //response will be in JSON
        res.end(JSON.stringify(messages))
    })


})

let users = []
io.on("connection", (socket) =>{
    console.log("User Connected "+ socket.id)

    socket.on("user_connected",(username)=>{
        users[username] = socket.id

        io.emit("user_connected",username)
    })

    socket.on("send_message",data=>{
        const socketID = users[data.receiver];
        io.to(socketID).emit("new_message",data)

        //Database
        addToDatabase(data.sender, data.receiver, data.message)
            .then(()=> console.log("Message added"))
            .catch(e => console.log("An error occured while adding message to database: "+ e))
    })
})

const addToDatabase = async (sender,receiver,message)=>{
    const newMessage = new Message({
        sender,
        receiver,
        message,
    });
    await newMessage.save();

}

http.listen(process.env.PORT,()=>{console.log(`${process.env.PORT} listening`)});
