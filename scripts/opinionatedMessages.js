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

module.exports = {
  injectOpinionatedDefaults: function (params) {
    if (!params.message_type) {
      return;
    }

    const defaultFrom = "Concourse CI";
    var messageTemplatePrefix =
        " [" + href("${BUILD_TEAM_NAME}", urlToTeam()) + "] " +
        href("${BUILD_PIPELINE_NAME}", urlToPipeline()) + " / " +
        href("${BUILD_JOB_NAME} #${BUILD_NAME}", urlToJob()) + " > ";

    var defaultColor = "yellow";
    var defaultNotify = false;
    var defaultMessageTemplate = "";

    switch (params.message_type) {
      case "pending":
        defaultColor = "gray";
        messageTemplatePrefix = img("started") + messageTemplatePrefix;
        defaultMessageTemplate = "Build Pending";
        break;
      case "started":
        defaultColor = "yellow";
        messageTemplatePrefix = img("started") + messageTemplatePrefix;
        defaultMessageTemplate = "Build Started";
        break;
      case "succeeded":
        defaultColor = "green";
        messageTemplatePrefix = img("succeeded") + messageTemplatePrefix;
        defaultMessageTemplate = "Build Successful";
        break;
      case "failed":
        defaultColor = "red";
        defaultNotify = true;
        messageTemplatePrefix = img("failed") + messageTemplatePrefix;
        defaultMessageTemplate = "Build Failed!";
        break;
      case "aborted":
        defaultColor = "purple";
        messageTemplatePrefix = img("aborted") + messageTemplatePrefix;
        defaultMessageTemplate = "Build Aborted";
        break;
      case "pr_pending":
        defaultColor = "gray";
        messageTemplatePrefix = img("pending") + messageTemplatePrefix;
        defaultMessageTemplate = "Pull Request Build Pending";
        break;
      case "pr_started":
        defaultColor = "yellow";
        messageTemplatePrefix = img("started") + messageTemplatePrefix;
        defaultMessageTemplate = "Pull Request Build Started";
        break;
      case "pr_succeeded":
        defaultColor = "green";
        messageTemplatePrefix = img("succeeded") + messageTemplatePrefix;
        defaultMessageTemplate = "Pull Request Build Successful";
        break;
      case "pr_failed":
        defaultColor = "red";
        defaultNotify = true;
        messageTemplatePrefix = img("failed") + messageTemplatePrefix;
        defaultMessageTemplate = "Pull Request Build Failed!";
        break;
      case "pr_aborted":
        defaultColor = "purple";
        messageTemplatePrefix = img("aborted") + messageTemplatePrefix;
        defaultMessageTemplate = "Pull Request Build Aborted";
        break;
      default:
        return;
    }

    if (!params.from) {
      params.from = defaultFrom;
    }

    if (!params.color) {
      params.color = defaultColor;
    }

    if (!params.notify) {
      params.notify = defaultNotify;
    }

    if (!params.message) {
      params.message = {
        template: messageTemplatePrefix + defaultMessageTemplate
      };
    } else if (typeof params.message === "string") {
      params.message = {
        template: messageTemplatePrefix + params.message
      };
    } else if (!params.message.template) {
      params.message = {
        template: messageTemplatePrefix + defaultMessageTemplate
      };
    } else if (typeof params.message.template === "string") {
      params.message.template = messageTemplatePrefix + params.message.template;
    } else {
      params.message.template = messageTemplatePrefix + defaultMessageTemplate;
    }
  }
};

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

function img(type) {
    return '<img src="${ATC_EXTERNAL_URL}/public/images/favicon-' + type + '.png" alt="favicon-' + type + '.png" width="16" height="16">';
}