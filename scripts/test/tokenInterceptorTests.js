var rewire = require('rewire'),
  sinon = require('sinon'),
  sut = rewire('../tokenInterceptors');

describe('Default Token Interceptor', function () {
  it('should accept tokens "as-is" (no-op)', function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    sut.defaultInterceptor("some_key", "some_value", acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, "some_key", "some_value");

    sinon.assert.notCalled(rejectSpy);
  });

  it('should accept null tokens', function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    sut.defaultInterceptor(null, null, acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, null, null);

    sinon.assert.notCalled(rejectSpy);
  });
});

describe('Truncating Token Interceptor', function () {
  it("should truncate value for token GIT_COMMIT_MESSAGE at first line break", function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    sut.truncatingInterceptor("GIT_COMMIT_MESSAGE", "This is the summary statement for the commit\n\nThat has much more content on newlines.", acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, "GIT_COMMIT_MESSAGE", "This is the summary statement for the commit");

    sinon.assert.notCalled(rejectSpy);
  });

  it("should truncate value for token GIT_COMMIT_MESSAGE at 75 characters", function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    const reallyLongMessage = "A".repeat(100) + "\n\n" + "B".repeat(50);

    sut.truncatingInterceptor("GIT_COMMIT_MESSAGE", reallyLongMessage, acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, "GIT_COMMIT_MESSAGE", "A".repeat(75) + "...");

    sinon.assert.notCalled(rejectSpy);
  });

  it('should accept all other tokens "as-is" (no-op)', function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    sut.truncatingInterceptor("some_key", "some_value\nwhere newlines are accepted", acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, "some_key", "some_value\nwhere newlines are accepted");

    sinon.assert.notCalled(rejectSpy);
  });

  it('should accept null tokens', function () {
    var acceptSpy = sinon.spy();
    var rejectSpy = sinon.spy();

    sut.truncatingInterceptor(null, null, acceptSpy, rejectSpy);

    sinon.assert.calledOnce(acceptSpy);
    sinon.assert.calledWith(acceptSpy, null, null);

    sinon.assert.notCalled(rejectSpy);
  });
});