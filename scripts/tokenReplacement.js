// (c) Copyright 2016 Hewlett Packard Enterprise Development LP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var async = require('async'),
  fs = require('fs'),
  url = require('url');

module.exports = {
  replaceTokens: function (message, rootDir, done) {

    if (typeof message === "string") {
      done(null, message);
      return;
    } else if (!message.template) {
      console.error('message param must be a string or contain a template property');
      process.exit(1);
    }

    var buildTokens = {
      "${BUILD_ID}": process.env.BUILD_ID,
      "${BUILD_NAME}": process.env.BUILD_NAME,
      "${BUILD_TEAM_ID}": process.env.BUILD_TEAM_ID,
      "${BUILD_TEAM_NAME}": process.env.BUILD_TEAM_NAME,
      "${BUILD_JOB_ID}": process.env.BUILD_JOB_ID,
      "${BUILD_JOB_NAME}": process.env.BUILD_JOB_NAME,
      "${BUILD_PIPELINE_ID}": process.env.BUILD_PIPELINE_ID,
      "${BUILD_PIPELINE_NAME}": process.env.BUILD_PIPELINE_NAME,
      "${ATC_EXTERNAL_URL}": process.env.ATC_EXTERNAL_URL
    };

    for (var t in buildTokens) {
      message.template = message.template.replaceAll(t, buildTokens[t]);
    }

    if (!message.params || message.params.length === 0) {
      done(null, message.template);
      return;
    }

    var tokenParams = {};

    async.forEachOf(message.params,
      function iterator(item, key, iteratorCallback) {
        if (isFilePath(item)) {
          readFileContents(rootDir, item, function (err, result) {
            if (err) {
              console.error(err);
              process.exit(1);
            }
            tokenParams[key] = result;
            iteratorCallback(null);
          });
        } else {
          tokenParams[key] = item
          iteratorCallback(null);
        }
      },
      function complete(err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        for (var t in tokenParams) {
          message.template = message.template.replaceAll('${' + t + '}', tokenParams[t]);
        }

        done(null, message.template);
      }
    );
  }
};

String.prototype.replaceAll = function (search, replacement) {
  var self = this;
  return self.split(search).join(replacement);
};

function isFilePath(value) {
  var parsedPath = url.parse(value);
  return parsedPath.protocol === 'file:';
}

function readFileContents(rootDir, filePath, done) {
  var parsedUrl = url.parse(filePath),
    pathName = rootDir + '/' + parsedUrl.hostname + parsedUrl.pathname;
  async.waterfall([
    function checkIfFileExists(callback) {
      fs.exists(pathName, function (exists) {
        if (exists) {
          return callback(null, pathName);
        }

        console.error("file at path [" + pathName + "] does not exist");
        process.exit(1);
      });
    },
    function readFileText(filePath, callback) {
      return fs.readFile(filePath, 'utf8', callback)
    }
  ], done);
};