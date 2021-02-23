const fs = require('fs');
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err1, filediscriptor) => {
        if (!err1 && filediscriptor) {
            const stringData = JSON.stringify(data);
            fs.writeFile(filediscriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(filediscriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('cound not close file');
                        }
                    });
                } else {
                    callback('could not write file');
                }
            });
        } else {
            callback('could not exists file');
        }
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err1, filediscriptor) => {
        if (!err1 && filediscriptor) {
            const strinData = JSON.stringify(data);
            fs.ftruncate(filediscriptor, (err2) => {
                if (!err2) {
                    fs.writeFile(filediscriptor, strinData, (err3) => {
                        if (!err3) {
                            fs.close(filediscriptor, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback('colud not close file');
                                }
                            });
                        } else {
                            callback('could not write file');
                        }
                    });
                } else {
                    callback('could not empty file');
                }
            });
        } else {
            callback('could not exixts file');
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err, data) => {
        callback(err, data);
    });
};

lib.list = (dir, callback) => {
    fs.readdir(`${lib.baseDir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFileName = [];
            fileNames.forEach((filename) => {
                trimmedFileName.push(filename.replace('.json', ''));
            });
            callback(false, trimmedFileName);
        } else {
            callback('Error not read directory');
        }
    });
};

module.exports = lib;
