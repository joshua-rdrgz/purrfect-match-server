const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AppError = require('./error/appError');
const catchAsync = require('./error/catchAsync');

exports.getRoboflowPrediction = catchAsync(async (req, res, next) => {
  console.log('imageName:', req.params.imageName);
  const image = fs.readFileSync(`./uploads/${req.params.imageName}`, {
    encoding: 'base64',
  });

  const response = await axios({
    method: 'POST',
    url: 'https://classify.roboflow.com/purrfect-match-model/1',
    params: {
      api_key: process.env.ROBOFLOW_API_KEY,
    },
    data: image,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  res.status(200).json({
    status: 'success',
    data: response.data,
  });
});

exports.uploadImageFile = (req, res) => {
  console.log('hello from uploadImageFile');
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, req.file.path);

  console.log('tempPath:', tempPath);
  console.log('targetPath:', targetPath)

  if (path.extname(req.file.originalname).toLowerCase() === '.jpg') {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) return new AppError(err.message, err.statusCode);

      res.status(200).json({
        status: 'success',
        message: 'File Uploaded!',
        imageName: tempPath.split('/').at(-1),
      });
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return new AppError(err.message, err.statusCode);

      res.status(403).json({
        status: 'fail',
        message: 'Only .jpg files are allowed!',
      });
    });
  }
};
