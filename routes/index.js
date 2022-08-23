var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use((req,res,next)=>{
  console.log("in the index router")
  next()
})
router.get('/bio',
  (req,res,next)=>{
    res.render('bio')
   }
  )
  router.get('/login',
   (req,res,next) => {
     res.render('login')
   }
  )
  router.get('/work',
   (req,res,next) => {
     res.render('work')
   }
  )

module.exports = router;
