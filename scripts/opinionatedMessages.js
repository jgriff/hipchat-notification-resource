module.exports = {
  injectOpinionatedDefaults: function (params) {
    if (!params.message_type) {
      return;
    }

    params.message = messageTypeDefaults(params.message_type, function (defaultColor, defaultNotify, defaultMessage) {
      if (!params.color) {
        params.color = defaultColor;
      }

      if (!params.notify) {
        params.notify = defaultNotify;
      }

      if (!isString(params.message)) {
        params.message = defaultMessage;
      }

      // assemble the final message markup
      return assembleMessageMarkup(params);
    });
  }
};

function messageTypeDefaults(messageType, done) {
  switch (messageType) {
    case "pending":      return done("gray",   false, "Build Pending");
    case "started":      return done("yellow", false, "Build Started");
    case "succeeded":    return done("green",  false, "Build Successful");
    case "failed":       return done("red",    true,  "Build Failed!");
    case "aborted":      return done("purple", false, "Build Aborted");
    case "pr_pending":   return done("gray",   false, "Pull Request Build Pending");
    case "pr_started":   return done("yellow", false, "Pull Request Build Started");
    case "pr_succeeded": return done("green",  false, "Pull Request Build Successful");
    case "pr_failed":    return done("red",    true,  "Pull Request Build Failed!");
    case "pr_aborted":   return done("purple", false, "Pull Request Build Aborted");
    default:
      console.error("Unsupported value for 'message_type':", messageType);
      return done(null, null, null, null);
  }
}

function assembleMessageMarkup(params) {
  return propeller(params) + pipelineInfo(params) + params.message + flyInfo(params);
}

function propeller(params) {
  var type = params.message_type;

  // there are no "pr_" icons, so remove the 'pr_' prefix to use the same icon as the "normal" (ex: 'pr_succeeded' --> 'succeeded')
  if (type.startsWith("pr_")) {
    type = type.substring("pr_".length);
  }

  return imgConcoursePublic("favicon-" + type + ".png", 24);
}

function pipelineInfo(params) {
  if (params.message_type_config && params.message_type_config.pipeline_info && isString(params.message_type_config.pipeline_info)) {
    var customPipelineInfo = params.message_type_config.pipeline_info;
    if (stringIs(customPipelineInfo, "enabled")) {
      return defaultPipelineInfo();
    } else if (stringIs(customPipelineInfo, "disabled")) {
      return '';
    } else {
      return customPipelineInfo;
    }
  }

  return defaultPipelineInfo();
}

function defaultPipelineInfo() {
  return  imgConcoursePublic("baseline-people-24px.svg", 16) + href(bold("${BUILD_TEAM_NAME}"), urlToTeam()) + space(2) +
          imgConcoursePublic("ic-breadcrumb-pipeline.svg", 16) + href(bold("${BUILD_PIPELINE_NAME}"), urlToPipeline()) + space(2) +
          imgConcoursePublic("ic-breadcrumb-job.svg", 16) + href(bold("${BUILD_JOB_NAME} #${BUILD_NAME}"), urlToJob()) +
          imgConcoursePublic("baseline-keyboard-arrow-right-24px.svg", 16);
}

function flyInfo(params) {
  if (params.message_type_config && params.message_type_config.fly_info && isString(params.message_type_config.fly_info)) {
    var customFlyInfo = params.message_type_config.fly_info;
    if (stringIs(customFlyInfo, "enabled")) {
      return newline() + defaultFlyInfo();
    } else if (stringIs(customFlyInfo, "disabled")) {
      return '';
    } else {
      return newline() + customFlyInfo;
    }
  }

  return newline() + defaultFlyInfo();
}

function defaultFlyInfo() {
  return emphasis("To watch this build in your terminal using") + space(1) + code(bold("fly")) + space(2) +
         href(imgConcoursePublic("apple-logo-grey-ic.svg", 16), urlToFlyDownloadMac()) +
         href(imgConcoursePublic("windows-logo-grey-ic.svg", 16), urlToFlyDownloadWindows()) +
         href(imgConcoursePublic("linxus-logo-grey-ic.svg", 16), urlToFlyDownloadLinux()) + newline() +
         imgConcoursePublic("ic-terminal.svg", 16) + space(1) + code("fly -t ${BUILD_TEAM_NAME} login ${ATC_EXTERNAL_URL} -n ${BUILD_TEAM_NAME} --insecure") + newline() +
         imgConcoursePublic("ic-terminal.svg", 16) + space(1) + code("fly -t ${BUILD_TEAM_NAME} watch -b ${BUILD_ID}");
}

// ---------------------------------------------------------------------------------------------------------------------
// support functions
// ---------------------------------------------------------------------------------------------------------------------

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

function imgConcoursePublic(name, size) {
  return '<img src="${ATC_EXTERNAL_URL}/public/images/' + name + '" alt="" width="' + size + '" height="' + size + '">';
}

function stringIs(toTest, expectedVal) {
  if (isString(toTest) && isString(expectedVal)) {
    return toTest.toLowerCase() === expectedVal.toLowerCase();
  }
  return false;
}

function isString(toTest) {
  return toTest && typeof toTest === "string";
}