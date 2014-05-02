'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../..');

var assetDir = path.join(rootPath, '/../media')

module.exports = {
    env: 'pi',
    height: 120,
    width: 50,
    port: process.env.PORT || 8000,

    poweronConfig:              rootPath + "/config/_config.json",
    settingsFile:               rootPath + "/config/_settings.json",
    server:                     "pisignage.com"
}
