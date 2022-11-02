require('dotenv').config()
// we use md5 for hashing the password// 


const express = require('express')
const app = express()
const ejs = require('ejs')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
// there is one npm packed also passport local but we dont need to require that
const mongoose = require('mongoose')
const bodyparser = require('body-parser')

const port = 3000
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
// all way we have to set app.use(session) top of the mongoose.connect
app.use(session({
    secret: 'nilesh is a good coder.',
    resave: false,
    saveUninitialized: false,

}))

// second we have to set passport.initialize() and passport.session ()
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://127.0.0.1:27017/userdb', { useNewUrlParser: true })

const userschema = new mongoose.Schema({
    email: String,
    password: String

})
// we use passportLocalMongoose for hashing and salting in passport
userschema.plugin(passportLocalMongoose);



const User = mongoose.model('User', userschema)
passport.use(User.createStrategy());
// serializeuser provide a unique id to the  user 
//deserializeuser take that id and give user post or information that user want
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/secrets',(req,res)=>{
if(req.isAuthenticated()){
    res.render('secrets')
}else{
    res.redirect('/login')
}
})
app.get('/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.get('/register', (req, res) => {
  res.render('register')
})
app.post('/register', (req, res) => {
    // we use register() method only with the help of passport-local-mongoose no need to crete new user beacaue it is a middleware
User.register({username:req.body.username},req.body.password,(err,user)=>{
if(err){
    console.log(err)
    res.redirect('/register')
}else{
    // if we get user back then we will authenticate that user with passport.authenticate() method
    passport.authenticate('local')(req,res,()=>{
        // if user come in this mean that user successfully authenticte than we redirect to secrect page
        res.redirect('/secrets')
    })
}
})
});


app.post('/login', (req, res) => {
    const user=new User({
        username:req.body.username,
        password:req.body.password
    })
// we use req.login method for log in 
    req.login(user,(err)=>{
if(err){
    console.log(err)
}else{
    passport.authenticate('local')(req,res,()=>{
        // if user come in this mean that user successfully authenticte than we redirect to secrect page
        res.redirect('/secrets')
    })
}
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})