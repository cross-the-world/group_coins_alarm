'use strict';

const fs                         = require('fs');
const path                       = require('path');
const _                          = require('underscore');
const moment                     = require('moment');

const logger                     = require('./winston')(__filename);
const debug                      = require('debug')('app:FileOperation');

const helpers                    = require('./helpers');

class FileOperation {

    constructor() {
        this.frontendDir = '../configs/';
    }

    readDirAsync(dirname) {
        return new Promise(function(resolve, reject) {
            fs.readdir(dirname, function(err, filenames) {
                if (err)
                    reject(err);
                else
                    resolve(filenames);
            });
        });
    }

    getRecentFile(dir, files) {
        return _.max(files, function (f) {
            const fullpath = path.join(dir, f);
            // ctime = creation time is used
            // replace with mtime for modification time
            return fs.statSync(fullpath).mtime;
        });
    }

    getMostRecentFileName(dir) {
        return new Promise( (resolve, reject) => {
            this.readDirAsync(dir)
                .then(files => {
                    const file = this.getRecentFile(dir, files);
                    resolve( file );
                })
                .catch( err => reject(err) );
        });
    }

    getFileNameByDate(dir, date) {
        return new Promise( (resolve, reject) => {
            this.readDirAsync(dir)
                .then(files => {
                    debug("%s: %j", date, files);
                    let foundFiles = (date)
                         ? _.filter(files, function (f) {
                               const fullpath = path.join(dir, f);
                               const fdt = moment( fs.statSync(fullpath).mtime.getTime() ).format( helpers.datePattern() );
                               return fdt === date;
                           })
                         : files;
                    debug("Found: %j, %j", foundFiles);
                    foundFiles = foundFiles || [];
                    const isArray = Array.isArray(foundFiles);
                    const file = isArray ? this.getRecentFile(dir, foundFiles) : foundFiles;
                    resolve( file );
                })
                .catch( err => reject(err) );
        });
    }

    readFilesAsync(filename, enc) {
        return new Promise(function(resolve, reject) {
            fs.readFile(filename, enc, function(err, data) {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    getFile(filename, dir) {
        return this.readFilesAsync(dir ? path.join(dir, filename) : filename, 'utf8');
    }

    writeFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, function(err) {
                if (err)
                    reject(err);
                else
                    resolve({path: path, data: data});
            });
        });
    }

    writeFileFromStream(path, stream) {
        return new Promise((resolve, reject) => {
            let b = fs.createWriteStream(path);

            stream.pipe(b);
            stream.on('error', reject);
            b.on('finish', resolve);
            b.on('error', reject);

        });
    }

    unlink(path) {
        return new Promise((resolve, reject) => {
            if (!path) {
                return resolve();
            }
            fs.unlink(path, (err) => {
                if (err) {
                    logger.error('%j', helpers.parseError(err));
                    reject(err);
                } else {
                    logger.info('removed %s', path);
                    resolve();
                }
            });
        });
    }

    unlinks(paths) {
        debug('Un-Linking: %j', paths);
        return Promise.all(paths.filter(p => p).map(p => this.unlink(p)))
            .then(() => debug('un-lined!!!'))
            .catch( err => logger.error('%j', helpers.parseError(err)) );
    }

}

module.exports = new FileOperation();
