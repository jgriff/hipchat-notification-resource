module.exports = {
  injectOpinionatedDefaults: function (params) {
    if (!params.message_type) {
      return;
    }

    var messageHeaderSimple = headerSimple();

    var defaultColor = "yellow";
    var defaultNotify = false;
    var defaultMessage = "";

    switch (params.message_type) {
      case "pending":
        defaultColor = "gray";
        messageHeaderSimple = imgBuildStatus("pending") + messageHeaderSimple;
        defaultMessage = "Build Pending";
        break;
      case "started":
        defaultColor = "yellow";
        messageHeaderSimple = imgBuildStatus("started") + messageHeaderSimple;
        defaultMessage = "Build Started";
        break;
      case "succeeded":
        defaultColor = "green";
        messageHeaderSimple = imgBuildStatus("succeeded") + messageHeaderSimple;
        defaultMessage = "Build Successful";
        break;
      case "failed":
        defaultColor = "red";
        defaultNotify = true;
        messageHeaderSimple = imgBuildStatus("failed") + messageHeaderSimple;
        defaultMessage = "Build Failed!";
        break;
      case "aborted":
        defaultColor = "purple";
        messageHeaderSimple = imgBuildStatus("aborted") + messageHeaderSimple;
        defaultMessage = "Build Aborted";
        break;
      case "pr_pending":
        defaultColor = "gray";
        messageHeaderSimple = imgBuildStatus("pending") + messageHeaderSimple;
        defaultMessage = "Pull Request Build Pending";
        break;
      case "pr_started":
        defaultColor = "yellow";
        messageHeaderSimple = imgBuildStatus("started") + messageHeaderSimple;
        defaultMessage = "Pull Request Build Started";
        break;
      case "pr_succeeded":
        defaultColor = "green";
        messageHeaderSimple = imgBuildStatus("succeeded") + messageHeaderSimple;
        defaultMessage = "Pull Request Build Successful";
        break;
      case "pr_failed":
        defaultColor = "red";
        defaultNotify = true;
        messageHeaderSimple = imgBuildStatus("failed") + messageHeaderSimple;
        defaultMessage = "Pull Request Build Failed!";
        break;
      case "pr_aborted":
        defaultColor = "purple";
        messageHeaderSimple = imgBuildStatus("aborted") + messageHeaderSimple;
        defaultMessage = "Pull Request Build Aborted";
        break;
      default:
        console.error("Unsupported value for 'message_type':", params.message_type);
        return;
    }

    if (!params.color) {
      params.color = defaultColor;
    }

    if (!params.notify) {
      params.notify = defaultNotify;
    }

    if (params.message && typeof params.message === "string") {
      // if the user supplied their own message, use it
      params.message = messageHeaderSimple + params.message + newline() + detailsSimple();
    } else {
      // otherwise, use our default message
      params.message = messageHeaderSimple + defaultMessage + newline() + detailsSimple();;
    }
  }
};

function headerSimple() {
  return  imgConcoursePublic("baseline-people-24px.svg", 16) + href(bold("${BUILD_TEAM_NAME}"), urlToTeam()) + space(2) +
          imgConcoursePublic("ic-breadcrumb-pipeline.svg", 16) + href(bold("${BUILD_PIPELINE_NAME}"), urlToPipeline()) + space(2) +
          imgConcoursePublic("ic-breadcrumb-job.svg", 16) + href(bold("${BUILD_JOB_NAME} #${BUILD_NAME}"), urlToJob()) +
          imgConcoursePublic("baseline-keyboard-arrow-right-24px.svg", 16);
}

function detailsSimple() {
  return emphasis("To watch this build in your terminal using") + space(1) + code(bold("fly")) + space(2) +
         href(imgConcoursePublic("apple-logo-grey-ic.svg", 16), urlToFlyDownloadMac()) +
         href(imgConcoursePublic("windows-logo-grey-ic.svg", 16), urlToFlyDownloadWindows()) +
         href(imgConcoursePublic("linxus-logo-grey-ic.svg", 16), urlToFlyDownloadLinux()) + newline() +
         imgConcoursePublic("ic-terminal.svg", 16) + space(1) + code("fly -t ${BUILD_TEAM_NAME} login ${ATC_EXTERNAL_URL} -n ${BUILD_TEAM_NAME} --insecure") + newline() +
         imgConcoursePublic("ic-terminal.svg", 16) + space(1) + code("fly -t ${BUILD_TEAM_NAME} watch -b ${BUILD_ID}");
}

function newline() {
  return '<br>';
}

function space(count) {
  return '&nbsp;'.repeat(count);
}

function bold(text) {
  return "<b>" + text + "</b>";
}

function emphasis(text) {
  return "<i>" + text + "</i>";
}

function code(text) {
  return "<code>" + text + "</code>";
}

function href(text, url) {
  return '<a href="' + url + '">' + text + '</a>';
}

function urlToTeam() {
  return '${ATC_EXTERNAL_URL}/?search=team: ${BUILD_TEAM_NAME}';
}

function urlToPipeline() {
  return '${ATC_EXTERNAL_URL}/teams/${BUILD_TEAM_NAME}/pipelines/${BUILD_PIPELINE_NAME}';
}

function urlToJob() {
  return urlToPipeline() + '/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}';
}

function urlToFlyDownloadMac() {
  return urlToFlyDownload('amd64', 'darwin');
}

function urlToFlyDownloadWindows() {
  return urlToFlyDownload('amd64', 'windows');
}

function urlToFlyDownloadLinux() {
  return urlToFlyDownload('amd64', 'linux');
}

function urlToFlyDownload(arch, platform) {
  return '${ATC_EXTERNAL_URL}/api/v1/cli?arch=' + arch + '&platform=' + platform;
}

function imgBuildStatus(status) {
  return imgConcoursePublic("favicon-" + status + ".png", 24);
}

function imgConcoursePublic(name, size) {
  return '<img src="${ATC_EXTERNAL_URL}/public/images/' + name + '" alt="" width="' + size + '" height="' + size + '">';
}