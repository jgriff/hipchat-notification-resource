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

var should = require('should'),
  sinon = require('sinon'),
  rewire = require('rewire'),
  path = require('path'),
  os = require('os'),
  fsify = require('fsify')({
    cwd: os.tmpdir(),
    persistent: false,
    force: true
  }),
  opinions = rewire('../opinionatedMessages'),
  sut = rewire('../tokenReplacement');

describe('Token replacements', function (done) {

  it("should replace build tokens", function () {
    var userTokens = null;
    let buildTokens = {
      BUILD_ID: 1,
      BUILD_NAME: 2,
      BUILD_TEAM_ID: 3,
      BUILD_TEAM_NAME: 4,
      BUILD_JOB_ID: 5,
      BUILD_JOB_NAME: 6,
      BUILD_PIPELINE_ID: 7,
      BUILD_PIPELINE_NAME: 8,
      ATC_EXTERNAL_URL: 9
    };
    let files = null;

    return doTokenReplacement("${BUILD_ID}, ${BUILD_NAME}, ${BUILD_TEAM_ID}, ${BUILD_TEAM_NAME}, " +
      "${BUILD_JOB_ID}, ${BUILD_JOB_NAME}, ${BUILD_PIPELINE_ID}, ${BUILD_PIPELINE_NAME}, ${ATC_EXTERNAL_URL}",
      userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("1, 2, 3, 4, 5, 6, 7, 8, 9"));
  });

  it("should replace all instances of the same build token", function () {
    let userTokens = null;
    let buildTokens = {
      BUILD_ID: 12,
      BUILD_JOB_NAME: 'Super-Job'
    };
    let files = null;

    return doTokenReplacement("${BUILD_ID} Job Name: ${BUILD_JOB_NAME} Build Id: ${BUILD_ID}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("12 Job Name: Super-Job Build Id: 12"));
  });

  it("should replace all instances of a param token", function () {
    let userTokens = {
      PR_URL: 'http://www.google.com/',
      PR_NUMBER: '1'
    };

    let buildTokens = {
      BUILD_ID: 12,
      BUILD_JOB_NAME: 'Super-Job'
    };

    let files = null;

    return doTokenReplacement("${PR_URL} Pull Request # ${PR_NUMBER}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("http://www.google.com/ Pull Request # 1"));
  });

  it("should replace all instances of the same param token", function () {
    let userTokens = {
      PR_URL: 'http://www.google.com/',
      PR_NUMBER: '1'
    };

    let buildTokens = {
      BUILD_ID: 12,
      BUILD_JOB_NAME: 'Super-Job'
    };

    let files = null;

    return doTokenReplacement("PR: ${PR_NUMBER} - ${PR_URL} Pull Request # ${PR_NUMBER}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("PR: 1 - http://www.google.com/ Pull Request # 1"));
  });

  it('should replace a file token [file at the base of the root directory]', function () {
    let userTokens = {
      BUILD_SHA: 'file://sha'
    };

    let buildTokens = null;

    let files = [
      {
        type: fsify.FILE,
        name: 'sha',
        contents: 'abc123'
      }
    ];

    return doTokenReplacement("The sha is ${BUILD_SHA}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("The sha is abc123"));
  });

  it('should replace a file token [file in subdirectory]', function () {
    let userTokens = {
      BUILD_SHA: 'file://build_info/sha'
    };

    let buildTokens = null;

    let files = [
      {
        type: fsify.DIRECTORY,
        name: 'build_info',
        contents: [
          {
            type: fsify.FILE,
            name: 'sha',
            contents: 'abc123'
          }
        ]
      }
    ];

    return doTokenReplacement("The sha is ${BUILD_SHA}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("The sha is abc123"));
  });

  it('should replace both build and file tokens together', function () {
    let userTokens = {
      TOKEN_A: 'file://file_a',
      TOKEN_B: 'file://some_dir/file_b'
    };

    let buildTokens = {
      BUILD_NAME: 'C'
    };

    let files = [
      {
        type: fsify.FILE,
        name: 'file_a',
        contents: 'A'
      },
      {
        type: fsify.DIRECTORY,
        name: 'some_dir',
        contents: [
          {
            type: fsify.FILE,
            name: 'file_b',
            contents: 'B'
          }
        ]
      }
    ];

    return doTokenReplacement("Token A: ${TOKEN_A}, Token B: ${TOKEN_B}, Token C: ${BUILD_NAME}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("Token A: A, Token B: B, Token C: C"));
  });

  it('should safely skip missing file', function () {
    let userTokens = {
      TOKEN_A: 'file://file_a',
      TOKEN_MISSING: 'file://file_missing',
      TOKEN_B: 'file://some_dir/file_b'
    };

    let buildTokens = null;

    let files = [
      {
        type: fsify.FILE,
        name: 'file_a',
        contents: 'A'
      },
      {
        type: fsify.DIRECTORY,
        name: 'some_dir',
        contents: [
          {
            type: fsify.FILE,
            name: 'file_b',
            contents: 'B'
          }
        ]
      }
    ];

    // swallow console errors since they are expected for the missing file
    originalConsole = sut.__get__('console');
    sut.__set__({'console': {error: sinon.stub()}});
    return doTokenReplacement("Token A: ${TOKEN_A}, Token B: ${TOKEN_B}, Token MISSING: ${TOKEN_MISSING}", userTokens, buildTokens, files)
      .then(newMessage => newMessage.should.equal("Token A: A, Token B: B, Token MISSING: ${TOKEN_MISSING}"))
      .then(ignore => sut.__set__({'console': originalConsole}));
  });

  it("should be able to replace tokens in opinionated messages", function () {
    var params = {message_type: 'pending'};

    opinions.injectOpinionatedDefaults(params);

    let buildTokens = {
      BUILD_ID: 248,
      BUILD_NAME: 'build-name',
      BUILD_TEAM_ID: '100',
      BUILD_TEAM_NAME: 'main',
      BUILD_JOB_ID: '8',
      BUILD_JOB_NAME: 'dummy',
      BUILD_PIPELINE_ID: '200',
      BUILD_PIPELINE_NAME: 'test',
      ATC_EXTERNAL_URL: 'https://ci.northropgrumman.com'
    };
    let files = null;

    return doTokenReplacement(params.message, params.tokens, buildTokens, files)
      .then(newMessage => newMessage.should.match(/https:\/\/ci\.northropgrumman\.com/));
  });
});

function doTokenReplacement(message, userTokens, buildTokens, files) {
  function invokeSut(message, userTokens, rootDir) {
    return new Promise(function (resolve, reject) {
      sut.replaceTokens(message, userTokens, rootDir, function (error, newMessage) {
        resolve(newMessage);
      });
    });
  }

  if (buildTokens) {
    sut.__set__({'process': {env: buildTokens}});
  }

  if (files) {
    return fsify(files).then((files) => {
      const rootDir = path.dirname(files[0].name);
      return invokeSut(message, userTokens, rootDir);
    });
  } else {
    return invokeSut(message, userTokens, null);
  }
}