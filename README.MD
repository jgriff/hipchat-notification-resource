# HipChat Notification Resource

Send notification messages to HipChat using a string message or templated message.

## Building
RUN:
```
$ ./src/ci/build.sh
$ docker build -t dockerhub-username/dockerhub-repository .
$ docker push dockerhub-username/dockerhub-repository
```

## Installing

```
resource_types:
- name: hipchat-notification-resource
  type: docker-image
  source:
    repository: dockerhub-username/dockerhub-repository
```

## Source Configuration

* `hipchat_server_url`: *Required.* https://api.hipchat.com OR https://api.hipchat.com/v2/room/12456 (see room_id below)
* `token`: *Required.* token to authenticate with HipChat server
* `room_id`: The room to send notifications to (Required when not specified in the hipchat_server_url)
* `skip_ssl_verification`:  *Optional.*  Skips ssl verification by setting `rejectUnauthorized: false` in the request `https.Agent`.

#### `out`: Sends message to HipChat room

Send message to specified HipChat Room, with the configured parameters

#### Parameters
* `from`: *Required.* Name of the system sending the notification
* `message`: *Required.* (string) Text to send to the HipChat room
* `message`: *Required.* (object)
  + `template` *Required.* Template string with values to replace from params in the format ${param_key}
  + `params` *Required.* Key and values to use to replace in template. Can start with file:// to get a value from a file. By default includes environment variables available in: https://concourse.ci/implementing-resources.html#resource-metadata
* `color`: *Optional.* One of "yellow", "red", "green", "purple", "gray", or "random". (default: yellow)
* `message_format`: *Optional.* Message format, either html or text (default: html)
* `notify`: *Optional.* If the message should trigger a notification to people in the room. 0 = false, 1 = true (default: 0)

## Example

### Check
```
---
resources:
- name: hipchat-notification
  type: hipchat-notification-resource
  source:
    hipchat_server_url: https://api.hipchat.com
    token: 14376e01-3152-4710-a830-aaf77e48c047
    room_id: 1
```

### In

*Not supported*

### Out

```
---
- put: hipchat-notification
  params:
    color: green
    from: "Concourse CI"
    message:
      template: "${PR-TITLE} Build Successful - <a href='${ATC_EXTERNAL_URL}/pipelines/${BUILD_PIPELINE_NAME}/jobs/${BUILD_JOB_NAME}/builds/${BUILD_NAME}'>Build Logs</a>"
      params:
        PR-TITLE: file://output-directory/pr-title
```
