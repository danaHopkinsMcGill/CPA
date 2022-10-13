var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios');

const auth = require('./routes/auth');
const session = require("express-session"); 
const MongoDBStore = require('connect-mongodb-session')(session);



// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/DHM?retryWrites=true&w=majority' //this is what u have commented when ur not doing local host
//const mongodb_URI = process.env.mongodb_URI

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true} );
// fix deprecation warnings
//mongoose.set('useFindAndModify', false); 
//mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});

// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();


var store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});
// Catch errors
store.on('error', function(error) {
  console.log(error);

});

app.use(require('express-session')({
  secret: 'This is a secret 7f89a789789as789f73j2krklfdslu89fdsjklfds',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(layouts)
app.use(auth)
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/meals',(req,res,next) => {
  res.render('meals')
})

app.post('/meals',
  async (req,res,next) => {
    const letter = req.body.letter;
    const url="https://www.themealdb.com/api/json/v1/1/search.php?f="+ letter
    const response = await axios.get(url)
    console.dir(response.data)
    res.locals.letter = letter
    res.locals.meals = response.data.meals || []
    res.render('showMeals')
  })
  app.get('/breed',
    (req,res,next) => {
      res.render('breed')
    }
  )
  app.post('/breed',
    async(req,res,next) => {
      const breed = req.body.breed;
      const url ="https://dog.ceo/api/breed/" + breed+ "/images" 
      const response = await axios.get(url)
      console.dir(response.data)
      res.locals.breed = breed
      //res.locals.url = url
      res.locals.breeds = response.data|| []
      res.render('showBreed')
    }
  )

  
  



const DailyLog = require('./models/DailyLog');
app.get('/dailyLog', 
  isLoggedIn,
  async (req, res, next)  => {
    const userId = res.locals.user._id;
    res.locals.logItems= await DailyLog.find({userId});
    res.render('dailyLog');
});

app.post('/dailyLog',
  isLoggedIn,
  async (req,res,next) => {
    try{
    
        const {speciesName,url,comment} = req.body;
        const userId = res.locals.user._id;
        
        const logItem = 
          new DailyLog(
            {speciesName,url,comment,userId,createdAt:new Date()});
        await logItem.save();

        res.redirect('/dailyLog')

    } catch(e){
        next(e)
    }
  })
  app.get('/showDailyLog',
        isLoggedIn,
  async (req,res,next) => {
   try {
    const logitems = await DailyLog.find({userId:res.locals.user._id});
    res.locals.logitems = logitems
    res.render('showDailyLog')
    //res.json(todoitems);
   }catch(e){
    next(e);
   }
  }
)
app.get('/deleteDailyLogItem/:itemId',
    isLoggedIn,
    async (req,res,next) => {
      try {
        const itemId = req.params.itemId;
        await DailyLog.deleteOne({_id:itemId});
        res.redirect('/showDailyLog');
      } catch(e){
        next(e);
      }
    }
)
  



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
