const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const appController = require('./appController');

const AppError = require('./error/appError');
const globalErrorHandler = require('./error/errorController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // will log to the console info about the request.
}

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.get('/', express.static(path.join(__dirname, './public')));
app.post('/upload', upload.single('image'), appController.uploadImageFile);
app.post('/roboflow/:imageName', appController.getRoboflowPrediction);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
