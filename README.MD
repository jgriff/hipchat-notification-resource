# HipChat Notification Resource

Send notification messages to HipChat using a string message or templated message.

* `check`: no-op
* `in`: not supported
* `out`: send message to HipChat

## Usage

```
resource_types:
- name: hipchat-notification
  type: docker-image
  source:
    repository: jgriff/hipchat-notification-resource

resources:
  - name: hipchat
    type: hipchat-notification
    source:
      hipchat_server_url: https://your-hipchat-server.com
      token: <hipchat-auth-token>
      room_id: 1

jobs:
  - name: some-job
    plan:
      - put: hipchat
        params: {message_type: started}
      ...
    on_success:
      put: hipchat
      params: {message_type: success}
    on_failure:
      put: hipchat
      params: {message_type: failed}
    on_abort:
      put: hipchat
      params: {message_type: aborted}
```

## Source Configuration

* `hipchat_server_url`: *Required.* https://api.hipchat.com OR https://api.hipchat.com/v2/room/12456 (see room_id below)
* `token`: *Required.* token to authenticate with HipChat server
* `room_id`: The room to send notifications to (Required when not specified in the hipchat_server_url)
* `skip_ssl_verification`:  *Optional.*  Skips ssl verification by setting `rejectUnauthorized: false` in the request `https.Agent`.

## Parameters

* `from`: *Required.* Name of the system sending the notification
* `message`: *Required.* (string) Text to send to the HipChat room
* `message`: *Required.* (object)
  + `template` *Required.* Template string with values to replace from params in the format ${param_key}
  + `params` *Optional.* Key and values to use to replace in template. Can start with file:// to get a value from a file. By default includes [build metadata variables](https://concourse-ci.org/implementing-resource-types.html#resource-metadata).
* `color`: *Optional.* One of `"yellow"`, `"red"`, `"green"`, `"purple"`, `"gray"`, or `"random"` (default: `"yellow"`).
* `message_format`: *Optional.* Message format, either `"html"` or `"text"` (default: `"html"`)
* `notify`: *Optional.* If the message should trigger a notification to people in the room (`true` or `false`, default `false`).
* `message_type`: *Optional.* Provides opinionated defaults for the above parameters for simplified usage (see below).

#### Opinionated Parameters
For simpler configurations, this resource can provide an opinionated message scheme by simply setting the `message_type` parameter.

Choose from one of the following values for `message_type` to get the associated defaults in the table below:

| `message_type`   | default `from`   | default `color` | default `notify` | default `message.template`      |
| ---------------- | ---------------- | --------------- | ---------------- | ------------------------------- |
| `"pending"`      | `"Concourse CI"` | `"gray"`        | `false`          | "Build Pending"                 |
| `"started"`      | `"Concourse CI"` | `"yellow"`      | `false`          | "Build Started"                 |
| `"succeeded"`    | `"Concourse CI"` | `"green"`       | `false`          | "Build Successful"              |
| `"failed"`       | `"Concourse CI"` | `"red"`         | `true`           | "Build Failed!"                 |
| `"aborted"`      | `"Concourse CI"` | `"purple"`      | `false`          | "Build Aborted"                 |
| `"pr_pending"`   | `"Concourse CI"` | `"gray"`        | `false`          | "Pull Request Build Pending"    |
| `"pr_started"`   | `"Concourse CI"` | `"yellow"`      | `false`          | "Pull Request Build Started"    |
| `"pr_succeeded"` | `"Concourse CI"` | `"green"`       | `false`          | "Pull Request Build Successful" |
| `"pr_failed"`    | `"Concourse CI"` | `"red"`         | `true`           | "Pull Request Build Failed!"    |
| `"pr_aborted"`   | `"Concourse CI"` | `"purple"`      | `false`          | "Pull Request Build Aborted"    |

The `message.template` is prepended with

```
<icon> [${BUILD_TEAM_NAME}] ${BUILD_PIPELINE_NAME} / ${BUILD_JOB_NAME}#${BUILD_ID} >
```

where `<icon>` is the associated Concourse icon for the build status, hosted on your Concourse server
at `${ATC_EXTERNAL_URL}/public/images/favicon-<message_type>.png`.  Additionally, each component will
be individually hyperlinked to their respective ATC urls.

## Examples

### Write Your Own Template

```
- put: hipchat-notification
  params:
    color: green
    from: "Concourse CI"
    message:
      template: "${PR-TITLE} Build Successful - <a href='${ATC_EXTERNAL_URL}/pipelines/${BUILD_PIPELINE_NAME}/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}'>Build Logs</a>"
      params:
        PR-TITLE: file://output-directory/pr-title
```

### Usage Opinionated Messages

```
- put: hipchat-notification
  params: {message_type: succeeded}
```

You can still override any standard parameter to deviate from the above opinions.  If you provide a value for `message`
or `message.template`, it will be appended to the opinionated prefix.  This means you can customize the message appearing after
the opinionated prefix:

```
message_type: pr_succeeded
message:
  template: "${PR-TITLE} Pull Request Successful"
  params:
    PR-TITLE: file://output-directory/pr-title
```

will have an effective template value of:

```
<icon> [${BUILD_TEAM_NAME}] ${BUILD_PIPELINE_NAME} / ${BUILD_JOB_NAME}#${BUILD_ID} > ${PR-TITLE} Pull Request Successful
```