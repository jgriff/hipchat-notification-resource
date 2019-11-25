#! /usr/bin/node

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

var HipChatClient = require('./hipChatClient'),
  opinions = require('./opinionatedMessages'),
  tokenReplacer = require('./tokenReplacement'),
  stdin = process.stdin,
  inputChunks = [];

stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  inputChunks.push(chunk);
});

stdin.on('end', function () {
  var inputJSON = inputChunks.join("");

  var parsedData = JSON.parse(inputJSON.toString());
  opinions.injectOpinionatedDefaults(parsedData.params);

  tokenReplacer.replaceTokens(parsedData.params.message, parsedData.params.tokens, process.argv[2], function (error, newMessage) {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    parsedData.params.message = newMessage;

    new HipChatClient().run(parsedData.source, parsedData.params);
  });
});


process.on('uncaughtException', (error) => {
  console.error("An unexpected error occured ", error);
});