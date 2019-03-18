const glob = require('glob');
const fs = require('fs');

glob('./README.md', {}, function (er, file) {
  const destination = './projects/ff-position/',
    src = './';

  let destinationFile = destination + file[0].replace(src, ''),
    fileDir = destinationFile.substring(0, destinationFile.lastIndexOf('/')),
    exists = fs.existsSync(fileDir);
  if (!exists) {
    fs.mkdirSync(fileDir);
  }
  fs.copyFile(file[0], destinationFile, (err) => {
    if (err) {
      throw err;
    }
    console.log(file + " was copied to : ", destinationFile);
  });
});
