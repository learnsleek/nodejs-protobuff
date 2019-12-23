var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let publicFolderName = 'public';
let modelFolderName = 'models';
let ProtoBuf = require('protobufjs');
const port = 3000
var cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var api = require(process.cwd() + '/src/controller/controller.js');

var app = express();
app.use(express.static(publicFolderName))
app.use(cors())
app.use(awsServerlessExpressMiddleware.eventContext())

let builder = ProtoBuf.loadProtoFile(
  path.join(__dirname,
  modelFolderName,
  'colors.proto')
)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use (function(req, res, next) {
  if (!req.is('application/octet-stream')) return next()
  var data = [] // List of Buffer objects
  req.on('data', function(chunk) {
      data.push(chunk) // Append Buffer object
  })
  req.on('end', function() {
    if (data.length <= 0 ) return next()
    data = Buffer.concat(data) // Make one large Buffer of it
    console.log('Received buffer', data)
    req.raw = data
    next()
  })
})

let Message = builder.build('Message')
let messages = [
  {text: 'hey', lang: 'english'},
  {text: 'isänme', lang: 'tatar'},
  {text: 'hej', lang: 'swedish'}
]
let ColorsList = builder.build('ColorsList')

app.get('/api/messages', (req, res, next)=>{
  let msg = new Message(messages[Math.round(Math.random()*2)])
  console.log('Decoded :: ',
    Message.decode(msg.encode().toBuffer()))
  console.log('Buffer we are sending: ', msg.encode().toBuffer())
  // res.end(msg.encode().toBuffer(), 'binary') // alternative
  res.send(msg.encode().toBuffer());
  // res.end(Buffer.from(msg.toArrayBuffer()), 'binary') // alternative
})

app.post('/api/messages', (req, res, next)=>{
  console.log("Data :: ", req.body)
  if (req.raw) {
    try {
        // Decode the Message
      var msg = Message.decode(req.raw)
      console.log('Received "%s" in %s', msg.text, msg.lang)
    } catch (err) {
      console.log('Processing failed:', err)
      next(err)
    }
  } else {
    console.log("Not binary data")
  }
})

app.post('/api/colors', (req, res, next)=>{
  console.log("Data :: ", req.raw);
  var resp = null;
  if (req.raw) {
    try {
        // Decode the Message
      var msg = ColorsList.decode(req.raw);
      console.log('Received "%s" in %s', msg.colorReq)
        api.controller().then(respon => {
          console.log(respon);
          if( msg.colorReq == 'All'){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(ColorsList.encode(respon).toBuffer());
            res.end();
          }else {
            respon = JSON.stringify({ "state": msg.colorReq });          
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(ColorsList.encode(respon).toBuffer());
            res.end();
          }
          
      });
    } catch (err) {
      console.log('Processing failed:', err)
      next(err)
    }
  } else {
    console.log("Not binary data")
  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app;
