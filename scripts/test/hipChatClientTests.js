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
  rewire = require('rewire'),
  sinon = require('sinon'),
  HipChatNotifier = rewire('../hipChatClient');

describe('HipChat notifier client', function (done) {
  var originalConsole;

  before(function () {
    originalConsole = HipChatNotifier.__get__('console');
  });

  it("should check for argument value", function () {
    var mockConsole = {
      error: sinon.stub()
    };

    HipChatNotifier.__set__({
      'console': mockConsole
    });

    try {
      new HipChatNotifier().checkArgument('name');
      mockConsole.error.calledWith('Please provide a value for', 'name')
          .should.equal(true);
    } finally {
      HipChatNotifier.__set__({
        'console': originalConsole
      });
    }
  });

  it("Should exit(0) if response code is not 200 and fail_on_error is false", function () {
    var mockConsole = {
        error: sinon.stub(),
        log: sinon.stub()
      },
      mockProcess = {
        'exit': sinon.stub()
      },
      mockRequest = sinon.stub().callsArgWith(1, null, {
        statusCode: 400,
        body: "BAD REQUEST"
      });

    HipChatNotifier.__set__({
      console: mockConsole,
      process: mockProcess,
      request: mockRequest
    });

    try {
      new HipChatNotifier().run({
        'hipchat_server_url': 'https://api.hipchat.com',
        'token': 'token',
        'room_id': 12456,
        'fail_on_error': false
      }, {
        'message': 'Building',
        'from': 'Concourse CI',
        'color': 'Yellow'
      });
      mockRequest.calledWith({
        url: 'https://api.hipchat.com/v2/room/12456/notification?auth_token=token',
        method: 'POST',
        json: {
          room_id: 12456,
          from: 'Concourse CI',
          message: 'Building',
          color: 'Yellow'
        }
      }).should.equal(true);

      mockProcess.exit.calledWith(0).should.equal(true);
    } finally {
      HipChatNotifier.__set__({
        'console': originalConsole
      });
    }
  });

  it("Should exit(1) if response code is not 200 and fail_on_error is undefined", function () {
    var mockConsole = {
        error: sinon.stub(),
        log: sinon.stub()
      },
      mockProcess = {
        'exit': sinon.stub()
      },
      mockRequest = sinon.stub().callsArgWith(1, null, {
        statusCode: 400,
        body: "BAD REQUEST"
      });

    HipChatNotifier.__set__({
      console: mockConsole,
      process: mockProcess,
      request: mockRequest
    });

    try {
      new HipChatNotifier().run({
        'hipchat_server_url': 'https://api.hipchat.com',
        'token': 'token',
        'room_id': 12456
      }, {
        'message': 'Building',
        'from': 'Concourse CI',
        'color': 'Yellow'
      });
      mockRequest.calledWith({
        url: 'https://api.hipchat.com/v2/room/12456/notification?auth_token=token',
        method: 'POST',
        json: {
          room_id: 12456,
          from: 'Concourse CI',
          message: 'Building',
          color: 'Yellow'
        }
      }).should.equal(true);

      mockProcess.exit.calledWith(1).should.equal(true);
    } finally {
      HipChatNotifier.__set__({
        'console': originalConsole
      });
    }
  });


});