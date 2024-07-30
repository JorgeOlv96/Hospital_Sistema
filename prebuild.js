const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'index.html');
const homepage = 'http://hospitalssq.org';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  const result = data.replace(/\/static\//g, `${homepage}/static/`);

  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) return console.log(err);
  });
});
