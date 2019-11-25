var rewire = require('rewire'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  os = require('os'),
  fsify = require('fsify')({
    cwd: os.tmpdir(),
    persistent: false,
    force: true
  }),
  uuid = require('uuid/v4'),
  sut = rewire('../opinionatedMessages');

describe('Opinionated Messages', function () {

  it("should not alter the message if 'message_type' is not specified", function () {
    var params = {};

    sut.injectOpinionatedDefaults(params);

    expect(params).to.be.empty
  });

  it("should preserve user-provided 'color' value", function () {
    var params = {
      message_type: "started",
      color: "purple"
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({color: "purple"})
  });

  it("should preserve user-provided 'message' value", function () {
    var params = {
      message_type: "started",
      message: "Say this instead"
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.have.property('message').that.match(/Say this instead/);
  });

  it("should preserve user-provided 'notify' value", function () {
    var params = {
      message_type: "started",
      notify: true
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({notify: true})
  });

  it("should fail with error for unknown 'message_type'", function () {
    var originalConsole = sut.__get__('console');
    var mockConsole = {
      error: sinon.stub()
    };

    sut.__set__({
      'console': mockConsole
    });

    var params = { message_type: "something_unknown" };

    try {
      sut.injectOpinionatedDefaults(params);
      expect(mockConsole.error.calledWith("Unsupported value for 'message_type':", 'something_unknown'))
        .to.be.true
    } finally {
      sut.__set__({
        'console': originalConsole
      });
    }
  });

  it("'pending' defaults", function () {
    var params = { message_type: "pending" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("'started' defaults", function () {
    var params = { message_type: "started" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "yellow",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('started', 'Build Started.'));
  });

  it("'succeeded' defaults", function () {
    var params = { message_type: "succeeded" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "green",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('succeeded', 'Build Successful.'));
  });

  it("'failed' defaults", function () {
    var params = { message_type: "failed" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "red",
      notify: true,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('failed', 'Build Failed!'));
  });

  it("'aborted' defaults", function () {
    var params = { message_type: "aborted" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "purple",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('aborted', 'Build Aborted.'));
  });

  it("'pr_pending' defaults", function () {
    var params = { message_type: "pr_pending" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('pending', 'Pull Request Build Pending.'));
  });

  it("'pr_started' defaults", function () {
    var params = { message_type: "pr_started" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "yellow",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('started', 'Pull Request Build Started.'));
  });

  it("'pr_succeeded' defaults", function () {
    var params = { message_type: "pr_succeeded" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "green",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('succeeded', 'Pull Request Build Successful.'));
  });

  it("'pr_failed' defaults", function () {
    var params = { message_type: "pr_failed" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "red",
      notify: true,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('failed', 'Pull Request Build Failed!'));
  });

  it("'pr_aborted' defaults", function () {
    var params = { message_type: "pr_aborted" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "purple",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(expected_message_markup('aborted', 'Pull Request Build Aborted.'));
  });

  // -------------------------------------------------------------------------------------------------------------------
  // custom configuration tests
  // -------------------------------------------------------------------------------------------------------------------

  it("[pipeline_info] should use default pipeline markup when 'message_type_config.pipeline_info' is omitted (enabled by default)", function () {
    var params = {
      message_type: "pending"
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[pipeline_info] should use default pipeline markup when 'message_type_config.pipeline_info=enabled'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        pipeline_info: "enabled"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[pipeline_info] should use default pipeline markup when 'message_type_config.pipeline_info=ENABLED'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        pipeline_info: "ENABLED"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[pipeline_info] should omit pipeline markup when 'message_type_config.pipeline_info=disabled'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        pipeline_info: "disabled"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', ''));
  });

  it("[pipeline_info] should omit pipeline markup when 'message_type_config.pipeline_info=DISABLED'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        pipeline_info: "DISABLED"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', ''));
  });

  it("[pipeline_info] should use pipeline text verbatim when 'message_type_config.pipeline_info' has any other value", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        pipeline_info: "some other pipeline info"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', 'some other pipeline info'));
  });

  it("[fly_info] should use default fly markup when 'message_type_config.fly_info' is omitted (enabled by default)", function () {
    var params = {
      message_type: "pending"
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[fly_info] should use default fly markup when 'message_type_config.fly_info=enabled'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        fly_info: "enabled"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[fly_info] should use default fly markup when 'message_type_config.fly_info=ENABLED'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        fly_info: "ENABLED"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.'));
  });

  it("[fly_info] should omit fly markup when 'message_type_config.fly_info=disabled'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        fly_info: "disabled"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, ''));
  });

  it("[fly_info] should omit fly markup when 'message_type_config.fly_info=DISABLED'", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        fly_info: "DISABLED"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, ''));
  });

  it("[fly_info] should use fly text verbatim when 'message_type_config.fly_info' has any other value", function () {
    var params = {
      message_type: "pending",
      message_type_config: {
        fly_info: "some other fly info"
      }
    };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false
    }).and.to.have.property('message')
      .that.equals(expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, NEWLINE + 'some other fly info'));
  });

  it("[git_info] should use default git markup when 'message_type_config.git_info' is omitted and default 'src' directory exists (enabled by default)", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should use default git markup when 'message_type_config.git_info=enabled' and default 'src' directory exists", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        message_type_config: {
          git_info: "enabled"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should use default git markup when 'message_type_config.git_info=ENABLED' and default 'src' directory exists ", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        message_type_config: {
          git_info: "ENABLED"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should omit git markup when 'message_type_config.git_info=disabled'", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        message_type_config: {
          git_info: "disabled"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, ''))
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should omit git markup when 'message_type_config.git_info=DISABLED'", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        message_type_config: {
          git_info: "DISABLED"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, ''))
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should use git text verbatim when 'message_type_config.git_info' has any other value", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        message_type_config: {
          git_info: "Say this about the git details instead with any ${PARAMS} you ${WISH}."
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, "Say this about the git details instead with any ${PARAMS} you ${WISH}."))
        // we should not have added any param tokens (let the user have full control)
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should omit default git markup if 'src' directory doesn't contain a .git directory", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src'
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;
      console.log("tempdir is: " + rootDir)

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, ''))
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should omit default git markup if 'src/.git' directory doesn't contain ANY of the required files", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [ ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;
      console.log("tempdir is: " + rootDir)

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, ''))
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.not.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should substitute 'unknown' for missing committer file", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              // {
              //   type: fsify.FILE,
              //   name: 'committer',
              //   contents: 'john.doe@nowhere.io'
              // },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', '<unknown>')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should substitute 'unknown' for missing short_ref file", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              // {
              //   type: fsify.FILE,
              //   name: 'short_ref',
              //   contents: 'abc123'
              // },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', '<unknown>')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should substitute 'unknown' for missing commit_message file", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              }//,
              // {
              //   type: fsify.FILE,
              //   name: 'commit_message',
              //   contents: "I hope this doesn't break anything!"
              // }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending"
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', '<unknown>');
    });
  });

  it("[git_info] should not override GIT_COMMITTER if user specified it already in param.tokens", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        tokens: {
          GIT_COMMITTER: "file://some/other/committer"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://some/other/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should not override GIT_SHORT_REF if user specified it already in param.tokens", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        tokens: {
          GIT_SHORT_REF: "file://some/other/short_ref"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://some/other/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://src/.git/commit_message');
    });
  });

  it("[git_info] should not override GIT_COMMIT_MESSAGE if user specified it already in param.tokens", function () {
    let mockRootDir = inRandomDir([
      {
        type: fsify.DIRECTORY,
        name: 'src',
        contents: [
          {
            type: fsify.DIRECTORY,
            name: '.git',
            contents: [
              {
                type: fsify.FILE,
                name: 'committer',
                contents: 'john.doe@nowhere.io'
              },
              {
                type: fsify.FILE,
                name: 'short_ref',
                contents: 'abc123'
              },
              {
                type: fsify.FILE,
                name: 'commit_message',
                contents: "I hope this doesn't break anything!"
              }
            ]
          }
        ]
      }
    ]);

    return fsify(mockRootDir).then((files) => {
      const rootDir = files[0].name;

      var params = {
        message_type: "pending",
        tokens: {
          GIT_COMMIT_MESSAGE: "file://some/other/commit_message"
        }
      };

      sut.injectOpinionatedDefaults(params, rootDir);

      return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://src/.git/committer')
       &&    expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://src/.git/short_ref')
       &&    expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://some/other/commit_message');
    });
  });

  it("[git_info] should not bother checking for git files if user specified ALL required param.tokens", function () {
    // we don't even need to specify the rootDir, since we shouldn't even look at it
    var rootDir = null;

    var params = {
      message_type: "pending",
      tokens: {
        GIT_COMMITTER: "file://some/other/committer",
        GIT_SHORT_REF: "file://some/other/short_ref",
        GIT_COMMIT_MESSAGE: "file://some/other/commit_message"
      }
    };

    sut.injectOpinionatedDefaults(params, rootDir);

    return expect(params).to.have.property('message', expected_message_markup('pending', 'Build Pending.', DEFAULT_PIPELINE_INFO, DEFAULT_FLY_INFO, DEFAULT_GIT_INFO))
      && expect(params).to.have.nested.property('tokens.GIT_COMMITTER', 'file://some/other/committer')
      && expect(params).to.have.nested.property('tokens.GIT_SHORT_REF', 'file://some/other/short_ref')
      && expect(params).to.have.nested.property('tokens.GIT_COMMIT_MESSAGE', 'file://some/other/commit_message');
  });
});

const SPACE = '&nbsp;';
const SPACE_DOUBLE = SPACE + SPACE;
const NEWLINE = '<br>';

const PIPELINE_INFO_PEOPLE_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/baseline-people-24px.svg" alt="" width="16" height="16">';
const PIPELINE_INFO_TEAM_LINK = '<a href="${ATC_EXTERNAL_URL}/?search=team: ${BUILD_TEAM_NAME}"><b>${BUILD_TEAM_NAME}</b></a>';
const PIPELINE_INFO_PIPELINE_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-breadcrumb-pipeline.svg" alt="" width="16" height="16">';
const PIPELINE_INFO_PIPELINE_LINK = '<a href="${ATC_EXTERNAL_URL}/teams/${BUILD_TEAM_NAME}/pipelines/${BUILD_PIPELINE_NAME}"><b>${BUILD_PIPELINE_NAME}</b></a>';
const PIPELINE_INFO_JOB_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-breadcrumb-job.svg" alt="" width="16" height="16">';
const PIPELINE_INFO_JOB_LINK = '<a href="${ATC_EXTERNAL_URL}/teams/${BUILD_TEAM_NAME}/pipelines/${BUILD_PIPELINE_NAME}/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}"><b>${BUILD_JOB_NAME} #${BUILD_NAME}</b></a>';
const PIPELINE_INFO_RIGHT_ARROW_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/baseline-keyboard-arrow-right-24px.svg" alt="" width="16" height="16">';

const DEFAULT_PIPELINE_INFO = PIPELINE_INFO_PEOPLE_ICON + PIPELINE_INFO_TEAM_LINK + SPACE_DOUBLE +
                               PIPELINE_INFO_PIPELINE_ICON + PIPELINE_INFO_PIPELINE_LINK + SPACE_DOUBLE +
                               PIPELINE_INFO_JOB_ICON + PIPELINE_INFO_JOB_LINK +
                               PIPELINE_INFO_RIGHT_ARROW_ICON;

const GIT_INFO_CHANGES_BY = "Changes by ${GIT_COMMITTER}.";
const GIT_INFO_COMMIT_DETAILS = "[${GIT_SHORT_REF}] ${GIT_COMMIT_MESSAGE}";

const DEFAULT_GIT_INFO = GIT_INFO_CHANGES_BY + NEWLINE + "- " + GIT_INFO_COMMIT_DETAILS;


const FLY_INFO_MESSAGE = '<i>To watch this build in your terminal using</i>&nbsp;<code><b>fly</b></code>';
const FLY_INFO_DL_MAC = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=darwin"><img src="${ATC_EXTERNAL_URL}/public/images/apple-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const FLY_INFO_DL_WINDOWS = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=windows"><img src="${ATC_EXTERNAL_URL}/public/images/windows-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const FLY_INFO_DL_LINUX = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=linux"><img src="${ATC_EXTERNAL_URL}/public/images/linxus-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const FLY_INFO_LOGIN = '<code>fly -t ${BUILD_TEAM_NAME} login ${ATC_EXTERNAL_URL} -n ${BUILD_TEAM_NAME} --insecure</code>';
const FLY_INFO_WATCH = '<code>fly -t ${BUILD_TEAM_NAME} watch -b ${BUILD_ID}</code>';
const FLY_INFO_TERMINAL_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-terminal.svg" alt="" width="16" height="16">';

const DEFAULT_FLY_INFO = NEWLINE + FLY_INFO_MESSAGE + SPACE_DOUBLE +
                                FLY_INFO_DL_MAC +
                                FLY_INFO_DL_WINDOWS +
                                FLY_INFO_DL_LINUX + NEWLINE +
                                FLY_INFO_TERMINAL_ICON + SPACE + FLY_INFO_LOGIN + NEWLINE +
                                FLY_INFO_TERMINAL_ICON + SPACE + FLY_INFO_WATCH;

/**
 * Formulates the expected final markup for our "opinionated" 'message'.
 *
 * @param favicon The icon that gets rendered first on the line, directly associated with the 'message_type'.
 * @param message The message that will be rendered with our opinionated markup (either user-defined or our default).
 * @param pipeline_info (optional) custom rendering for the pipeline_info segment (defaults to our expected default rendering).
 * @param fly_info (optional) custom rendering for the fly_info segment (defaults to our expected default rendering).
 * @param git_info (optional) custom rendering for the git_info segment (defaults to empty string since git info can only be rendered if there are git dir details available).
 * @returns {string} An html string concatenation of the original 'message' (or our default) marked up with our opinionated dressing.
 */
function expected_message_markup(favicon, message, pipeline_info = DEFAULT_PIPELINE_INFO, fly_info = DEFAULT_FLY_INFO, git_info = '') {
  return '<img src="${ATC_EXTERNAL_URL}/public/images/favicon-' + favicon + '.png" alt="" width="24" height="24">' +
        pipeline_info + message + (git_info ?  ("  " + git_info) : git_info) + fly_info;
}

/**
 * Wraps a fsify directory structure object in an outer directory whose name is random.  This helps to isolate tests
 * in their own directories (under the system temp dir).
 *
 * @param fsifyStructure the directory structure to wrap
 * @returns {{contents: *, name: string, type: *}[]}
 */
function inRandomDir(fsifyStructure) {
    return [
      {
        type: fsify.DIRECTORY,
        name: uuid(),
        contents: fsifyStructure
      }
    ];
}