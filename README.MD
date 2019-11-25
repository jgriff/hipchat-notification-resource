# HipChat Notification Resource

Send notification messages to HipChat using a string message or templated message.

* `check`: no-op
* `in`: not supported
* `out`: send message to HipChat

## Usage

```yaml
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
* `room_id`: The room to send notifications to (*Required* when not specified in the `hipchat_server_url`)
* `skip_ssl_verification`:  *Optional.*  Skips ssl verification (useful if your HipChat is running under a self-signed certificate)

## Parameters

### Required
* `message`: *Required.* (string) Text to send to the HipChat room.  Can contain tokens in the format `${key}` that will be replaced at runtime by values defined in the `tokens` parameter.

### Optional
* `message_format`: *Optional.* Message format, either `"html"` or `"text"` (default is `"html"`).
* `tokens` *Optional.* (list) Custom keys/values to replace in `message`. Can start with `file://` to get a value from a file. By default, automatically includes all [build metadata variables](https://concourse-ci.org/implementing-resource-types.html#resource-metadata) (such as `{ATC_EXTERNAL_URL}`).
* `from`: *Optional.* Name of the system sending the notification.  Note that HipChat will render the message as being sent by the user the auth `token` (from the **source configuration**) was created under.  So if that user is your "Concourse" user, this likely isn't needed.
* `color`: *Optional.* One of `"yellow"`, `"red"`, `"green"`, `"purple"`, `"gray"`, or `"random"` (default: `"yellow"`).
* `notify`: *Optional.* If the message should trigger a notification to people in the room, either `true` or `false` (default is `false`).


### Opinionated Parameters

For simpler configurations, this resource can provide an opinionated message scheme by simply setting the `message_type` parameter.

* `message_type`: *Optional.* Opinionated message type, providing default configuration for other parameters.

Choose from one of the following values for `message_type` to get the associated defaults in the table below:

| `message_type`   | default `color` | default `notify` | default `message`                |
| ---------------- | --------------- | ---------------- | -------------------------------- |
| `"pending"`      | `"gray"`        | `false`          | "Build Pending."                 |
| `"started"`      | `"yellow"`      | `false`          | "Build Started."                 |
| `"succeeded"`    | `"green"`       | `false`          | "Build Successful."              |
| `"failed"`       | `"red"`         | `true`           | "Build Failed!"                  |
| `"aborted"`      | `"purple"`      | `false`          | "Build Aborted."                 |
| `"pr_pending"`   | `"gray"`        | `false`          | "Pull Request Build Pending."    |
| `"pr_started"`   | `"yellow"`      | `false`          | "Pull Request Build Started."    |
| `"pr_succeeded"` | `"green"`       | `false`          | "Pull Request Build Successful." |
| `"pr_failed"`    | `"red"`         | `true`           | "Pull Request Build Failed!"     |
| `"pr_aborted"`   | `"purple"`      | `false`          | "Pull Request Build Aborted."    |

You can override any of the defaults (in the table above) by specifying the parameter value yourself.

For example, to turn on notifications for `succeeded` messages:

```yaml
- put: hipchat
  params:
    message_type: succeeded
    notify: true
```

#### Opinionated Behavior

In addition to setting defaults listed in the table above, the `message` is also enhanced to be:

```
[propeller] [pipeline_info] > [message] [git_info (committer)]
[git_info (commit message)]
[fly_info]
``` 

where:
* `[propeller]` - The Concourse "propeller" **build status** icon matching the `message_type`.
* `[pipeline_info]` - A "status" line that contains individually hyperlinked components for:
   * the **team name** of the build
   * **pipeline name** of the build
   * build **job name** and number
* `[message]` - The value of the `message` param (with `tokens` substituted).
* `[git_info]` - A short message that includes the committer email and commit message (on a new line).
    ```
    Changes by ${GIT_COMMITTER}.
    - [${GIT_SHORT_REF}] ${GIT_COMMIT_MESSAGE}
    ```
* `[fly_info]` - A message providing hints for watching the build with `fly`.
    ```
    To watch this build in your terminal using fly <mac_icon> <windows_icon> <linux_icon>
    >_ fly -t ${BUILD_TEAM_NAME} login ${ATC_EXTERNAL_URL} -n ${BUILD_TEAM_NAME}
    >_ fly -t ${BUILD_TEAM_NAME} watch -b ${BUILD_ID}
    ```
   * The `<mac_icon>`, `<windows_icon>`, and `<linux_icon>` are hyperlinked for direct download of `fly` from the ATC.
 
#### Configuring the Opinionated Message

You can also tweak the individual components of the opinionated message type under a `message_type_config` param,
which can contain:

* `pipeline_info`: *Optional.* Choice of:
  * `enabled` - show the default text for the `[pipeline_info]` segment (default).
  * `disabled` - omit the `[pipeline_info]` segment from the message.
  * custom text - any other text value will be used in place for the `[pipeline_info]` segment.
* `git_info`: *Optional.* Choice of:
  * `enabled` - show the default text for the `[git_info]` segment (default).
  * `disabled` - omit the `[git_info]` segment from the message.
  * custom text - any other text value will be used in place for the `[fly_info]` segment.
* `fly_info`: *Optional.* Choice of:
  * `enabled` - show the default text for the `[fly_info]` segment (default).
  * `disabled` - omit the `[fly_info]` segment from the message.
  * custom text - any other text value will be used in place for the `[fly_info]` segment.

```yaml
- put: hipchat
  params:
    message_type: succeeded
    message_type_config:
      pipeline_info: [enabled | disabled | <custom text to display>] (default is 'enabled')
      git_info: [enabled | disabled | <custom text to display>] (default is 'enabled')
      fly_info: [enabled | disabled | <custom text to display>] (default is 'enabled')
```

##### Configuring the Git Info

By default, it will look in a `src` directory of the job for the following files and for each one found, set its respective token
value in `params.tokens` so its value can be read during normal token substitution.

Note that these files are [implicitly created by the standard `git-resource` during a clone](https://github.com/concourse/git-resource#additional-files-populated).

|  File Location        |  Token Key           | Token Value |
| --------------------- | -------------------- | ----------- |
| `src/.git/committer`      | `GIT_COMMITTER`      | `file://src/.git/committer` |
| `src/.git/short_ref`      | `GIT_SHORT_REF`      | `file://src/.git/short_ref` |
| `src/.git/commit_message` | `GIT_COMMIT_MESSAGE` | `file://src/.git/commit_message` |

This also means you can override any/all of these if your git details are not in these default files.

For example, if your sources are instead in a nested directory `sources/project-a`:

```yaml
- put: hipchat
  params:
    message_type: succeeded
    tokens:
      GIT_COMMITTER: "file://sources/project-a/.git/committer"
      GIT_SHORT_REF: "file://sources/project-a/.git/short_ref"
      GIT_COMMIT_MESSAGE: "file://sources/project-a/.git/commit_message"
```

## Examples

### Write Your Own Template

```yaml
- put: hipchat-notification
  params:
    color: green
    from: "Concourse CI"
    message: "${PR-TITLE} Build Successful - <a href='${ATC_EXTERNAL_URL}/pipelines/${BUILD_PIPELINE_NAME}/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}'>Build Logs</a>"
    tokens:
      PR-TITLE: file://output-directory/pr-title
```

### Opinionated Messages

#### Fully Opinionated
A fully configured opinionated "success" message for pull requests:

```yaml
- put: hipchat-notification
  params: {message_type: pr_succeeded}
```

#### Custom Message
If you want to craft your own message with some files produced as part of your build, but still leverage the
opinionated template for the rest: 

```yaml
- put: hipchat-notification
  params: 
    message_type: pr_succeeded
    message: "${PR-TITLE} Pull Request Successful"
    tokens:
      PR-TITLE: file://output-directory/pr-title
```

#### Custom Pipeline Status Info

To change the pipeline status line to simply display the build number instead:

```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      pipeline_info: "Build #${BUILD_ID}"
```

Or to **disable** the segment all together:

```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      pipeline_info: disabled
```

#### Custom Git Info

Put all git info on one line, and exclude the commit message.

```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      git_info: "Changes by ${GIT_COMMITTER} [${GIT_SHORT_REF}]."
```

Or to **disable** the segment all together:

```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      git_info: disabled
```


#### Custom Fly Info

Print your own fly message.
```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      fly_info: "Say this about fly instead"
```

Or to **disable** the segment all together:

```yaml
- put: hipchat-notification
  params:
    message_type: pr_succeeded
    message_type_config:
      fly_info: disabled
```

## Development

### Running the Tests

To run the mocha [tests](scripts/test):
```
cd scripts
npm test
```
