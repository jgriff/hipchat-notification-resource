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

var request = require('request');
const https = require('https');

function HipChatClient() {
  this.sourceProperties = [
    {
      name: "hipchat_server_url",
      optional: false
    },
    {
      name: "token",
      optional: false
    },
    {
      name: "room_id",
      optional: true
    },
    {
      name: "skip_ssl_verification",
      optional: true
    }
  ];
  this.paramProperties = [
    {
      name: "color",
      optional: true
    },
    {
      name: "from",
      optional: true
    },
    {
      name: "message",
      optional: false
    },
    {
      name: "message_format",
      optional: true
    },
    {
      name: "notify",
      optional: true
    },
    {
      name: "message_type",
      optional: true
    }
  ];
  this.validInput = true;
  this.failOnError = true;
}

HipChatClient.prototype.checkArgument = function (argumentName, argumentValue) {
  if (!argumentValue || argumentValue.length === 0) {
    console.error("Please provide a value for", argumentName);
    this.validInput = false;
  }
};

HipChatClient.prototype.sendMessage = function (source, params, done) {
  var requestUrl = `${source.hipchat_server_url}/v2/room/${source.room_id}/notification?auth_token=${source.token}`,
    hipChatMessage = {
      room_id: source.room_id,
      message: params.message
    },
    requestOptions = {
      url: requestUrl,
      method: "POST",
      json: hipChatMessage
    };

  if (source.skip_ssl_verification) {
    requestOptions.agent = new https.Agent({ rejectUnauthorized: false })
  }

  if (params.from) {
    hipChatMessage.from = params.from;
  }

  if (params.color) {
    hipChatMessage.color = params.color;
  }

  if (params.message_format) {
    hipChatMessage.message_format = params.message_format;
  }

  if (params.notify) {
    hipChatMessage.notify = params.notify;
  }

  request(requestOptions, (err, response) => {
    if (err || response.statusCode > 200) {
      return done(err || response.body)
    }

    return done(err);
  });
};

HipChatClient.prototype.checkProperties = function (values, properties) {
  for (property of properties) {
    if (!property.optional) {
      this.checkArgument(property.name, values[property.name]);
    }
  }
};

HipChatClient.prototype.run = function (source, params) {
  var self = this;
  if (source.fail_on_error === undefined) {
    source.fail_on_error = true;
  }

  self.failOnError = source.fail_on_error;
  self.validInput = true;

  self.checkProperties(source, this.sourceProperties);
  self.checkProperties(params, this.paramProperties);

  if (!source.room_id) {
    var re = /((?:http|https):\/\/.*)\/v2\/room\/(\d+)/;
    if (re.test(source.hipchat_server_url)) {
      var matches = source.hipchat_server_url.match(re);
      source.hipchat_server_url = matches[1];
      source.room_id = parseInt(matches[2], 10);
    } else {
      self.validInput = false;
      console.error("Room id must be included in hipchat_server_url when not specified in the source (https://api.hipchat.com/v2/room/12456)");
    }
  }

  if (!self.validInput) {
    console.error("Please provide valid input and try again");
    return process.exit(1);
  }

  self.sendMessage(source, params, (error, result) => {
    if (error) {
      console.error(`Error sending notification. Fail on error: ${self.failOnError}`);
      console.error(error);
      if (self.failOnError) {
        process.exit(1);
      }
    }

    // Concourse expects this output from stdout, do not use console.dir
    console.log(JSON.stringify({
      version: {
        ref: "none"
      }
    }));
    process.exit(0);
  });
}

module.exports = HipChatClient;