var rewire = require('rewire'),
  expect = require('chai').expect,
  sinon = require('sinon'),
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
      .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('pending', 'Build Pending'));
  });

  it("'started' defaults", function () {
    var params = { message_type: "started" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "yellow",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('started', 'Build Started'));
  });

  it("'succeeded' defaults", function () {
    var params = { message_type: "succeeded" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "green",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('succeeded', 'Build Successful'));
  });

  it("'failed' defaults", function () {
    var params = { message_type: "failed" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "red",
      notify: true,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('failed', 'Build Failed!'));
  });

  it("'aborted' defaults", function () {
    var params = { message_type: "aborted" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "purple",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('aborted', 'Build Aborted'));
  });

  it("'pr_pending' defaults", function () {
    var params = { message_type: "pr_pending" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "gray",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('pending', 'Pull Request Build Pending'));
  });

  it("'pr_started' defaults", function () {
    var params = { message_type: "pr_started" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "yellow",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('started', 'Pull Request Build Started'));
  });

  it("'pr_succeeded' defaults", function () {
    var params = { message_type: "pr_succeeded" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "green",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('succeeded', 'Pull Request Build Successful'));
  });

  it("'pr_failed' defaults", function () {
    var params = { message_type: "pr_failed" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "red",
      notify: true,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('failed', 'Pull Request Build Failed!'));
  });

  it("'pr_aborted' defaults", function () {
    var params = { message_type: "pr_aborted" };

    sut.injectOpinionatedDefaults(params);

    expect(params).to.include({
      color: "purple",
      notify: false,
    }).and.to.have.property('message')
        .that.equals(EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR('aborted', 'Pull Request Build Aborted'));
  });
});

const SPACE = '&nbsp;';
const SPACE_DOUBLE = SPACE + SPACE;
const NEWLINE = '<br>';
const EXPECTED_PEOPLE_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/baseline-people-24px.svg" alt="" width="16" height="16">';
const EXPECTED_TEAM_LINK = '<a href="${ATC_EXTERNAL_URL}/?search=team: ${BUILD_TEAM_NAME}"><b>${BUILD_TEAM_NAME}</b></a>';
const EXPECTED_PIPELINE_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-breadcrumb-pipeline.svg" alt="" width="16" height="16">';
const EXPECTED_PIPELINE_LINK = '<a href="${ATC_EXTERNAL_URL}/teams/${BUILD_TEAM_NAME}/pipelines/${BUILD_PIPELINE_NAME}"><b>${BUILD_PIPELINE_NAME}</b></a>';
const EXPECTED_JOB_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-breadcrumb-job.svg" alt="" width="16" height="16">';
const EXPECTED_JOB_LINK = '<a href="${ATC_EXTERNAL_URL}/teams/${BUILD_TEAM_NAME}/pipelines/${BUILD_PIPELINE_NAME}/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}"><b>${BUILD_JOB_NAME} #${BUILD_NAME}</b></a>';
const EXPECTED_RIGHT_ARROW_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/baseline-keyboard-arrow-right-24px.svg" alt="" width="16" height="16">';
const EXPECTED_TERMINAL_ICON = '<img src="${ATC_EXTERNAL_URL}/public/images/ic-terminal.svg" alt="" width="16" height="16">';

const EXPECTED_HEADER_SIMPLE = EXPECTED_PEOPLE_ICON + EXPECTED_TEAM_LINK + SPACE_DOUBLE +
                               EXPECTED_PIPELINE_ICON + EXPECTED_PIPELINE_LINK + SPACE_DOUBLE +
                               EXPECTED_JOB_ICON + EXPECTED_JOB_LINK +
                               EXPECTED_RIGHT_ARROW_ICON;

const EXPECTED_DETAILS_MESSAGE = '<i>To watch this build in your terminal using</i>&nbsp;<code><b>fly</b></code>';
const EXPECTED_DETAILS_FLY_DL_MAC = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=darwin"><img src="${ATC_EXTERNAL_URL}/public/images/apple-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const EXPECTED_DETAILS_FLY_DL_WINDOWS = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=windows"><img src="${ATC_EXTERNAL_URL}/public/images/windows-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const EXPECTED_DETAILS_FLY_DL_LINUX = '<a href="${ATC_EXTERNAL_URL}/api/v1/cli?arch=amd64&platform=linux"><img src="${ATC_EXTERNAL_URL}/public/images/linxus-logo-grey-ic.svg" alt="" width="16" height="16"></a>';
const EXPECTED_DETAILS_FLY_LOGIN = '<code>fly -t ${BUILD_TEAM_NAME} login ${ATC_EXTERNAL_URL} -n ${BUILD_TEAM_NAME} --insecure</code>';
const EXPECTED_DETAILS_FLY_WATCH = '<code>fly -t ${BUILD_TEAM_NAME} watch -b ${BUILD_ID}</code>';

const EXPECTED_DETAILS_SIMPLE = EXPECTED_DETAILS_MESSAGE + SPACE_DOUBLE +
                                EXPECTED_DETAILS_FLY_DL_MAC +
                                EXPECTED_DETAILS_FLY_DL_WINDOWS +
                                EXPECTED_DETAILS_FLY_DL_LINUX + NEWLINE +
                                EXPECTED_TERMINAL_ICON + SPACE + EXPECTED_DETAILS_FLY_LOGIN + NEWLINE +
                                EXPECTED_TERMINAL_ICON + SPACE + EXPECTED_DETAILS_FLY_WATCH;

/**
 * This is the expected value for our "opinionated" 'message'.
 *
 * @param favicon The icon that gets rendered first on the line, directly associated with the 'message_type'.
 * @param message The message that will be rendered with our opinionated markup (either user-defined or our default).
 * @returns {string} An html string concatenation of the original 'message' (or our default) marked up with our opinionated dressing.
 */
function EXPECTED_MESSAGE_MARKUP_SIMPLE_FOR(favicon, message) {
  return '<img src="${ATC_EXTERNAL_URL}/public/images/favicon-' + favicon + '.png" alt="" width="24" height="24">' +
        EXPECTED_HEADER_SIMPLE + message + NEWLINE + EXPECTED_DETAILS_SIMPLE;
}