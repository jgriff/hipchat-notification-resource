module.exports = {
  /**
   * Default token interceptor that accepts all token replacements.
   *
   * @param key token key (without surrounding "${}").
   * @param value value to replace all occurrences of token key in message.
   * @param accept callback for the interceptor to accept the token key/value for replacement in the message.  Callback args: (key,value)
   * @param reject callback for the interceptor to reject token replacement for the given key.  Any/all occurrences of the
   * key will be removed from the final message.  Callback args: (key)
   */
  defaultInterceptor: function (key, value, accept, reject) {
    accept(key, value);
  },

  /**
   * Token interceptor that truncates some token values.  This interceptor truncates based on two criterion:<br>
   *   1) Truncate at first newline (\n) character for the following token keys:
   *     * <code>GIT_COMMIT_MESSAGE</code>
   *   2) Truncate at 75 characters for the following token keys:
   *     * <code>GIT_COMMIT_MESSAGE</code>
   *
   * Once any truncating is performed, handling of the (potentially) truncated token is then deferred to {@link defaultInterceptor}.
   *
   * @param key token key (without surrounding "${}").
   * @param value value to replace all occurrences of token key in message.
   * @param accept callback for the interceptor to accept the token key/value for replacement in the message.  Callback args: (key,value)
   * @param reject callback for the interceptor to reject token replacement for the given key.  Any/all occurrences of the
   * key will be removed from the final message.  Callback args: (key)
   * @see defaultInterceptor
   */
  truncatingInterceptor: function (key, value, accept, reject) {
    if (key && value && typeof key === 'string' && typeof value === 'string') {
      const AT_NEWLINE_TOKENS = ["GIT_COMMIT_MESSAGE"];
      const AT_LENGTH_TOKENS = ["GIT_COMMIT_MESSAGE"];

      if (value.includes("\n")) {
        AT_NEWLINE_TOKENS.some(function (token) {
          if (token === key) {
            value = value.substring(0, value.indexOf("\n"));
            return true;
          }
        });
      }

      if (value.length > 75) {
        AT_LENGTH_TOKENS.some(function (token) {
          if (token === key) {
            value = value.substring(0, 75) + "...";
            return true;
          }
        })
      }
    }

    module.exports.defaultInterceptor(key, value, accept, reject);
  }
};