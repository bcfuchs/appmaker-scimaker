/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.create = function (makeApiUrl, id, secret) {
  if (makeApiUrl) {
    var makeapiClient = new (require('makeapi-client'))({
      apiURL: makeApiUrl,
      hawk: {
        key: secret,
        id: id,
        algorithm: 'sha256'
      }
    });

    var REMIX_PREFIX = process.env.ASSET_HOST + '/designer?';

    return {
      publish: function(publishOptions, callback) {
        var makeOptions = {
          url: publishOptions.url,
          contenturl: publishOptions.url,
          remixurl: REMIX_PREFIX + 'remix=' + publishOptions.remix,
          editurl: REMIX_PREFIX + 'edit=' + encodeURIComponent(publishOptions.title),
          thumbnail: publishOptions.thumbnail,
          tags: publishOptions.appTags.split(/\s*,\s*/),
          description: publishOptions.appDescription,
          title: publishOptions.title,
          email: publishOptions.email,
          author: publishOptions.author,
          contentType: 'Appmaker',
          locale: publishOptions.locale || 'en_US'
        };
        var publish = publishOptions.id ? makeapiClient.update.bind(makeapiClient, publishOptions.id) : makeapiClient.create.bind(makeapiClient);
        var remixedFromUrl = publishOptions.remixedFrom;
        if (remixedFromUrl) {
          remixedFromUrl = remixedFromUrl.replace(/app$/, "install");
          makeapiClient.url(remixedFromUrl).then(function(error, make) {
            if (!error && make[0]) {
              makeOptions.remixedFrom = make[0].id;
            }
            publish(makeOptions, function (err, make) {
              callback(err, make);
            });
          });
        } else {
          publish(makeOptions, function (err, make) {
            callback(err, make);
          });
        }
      },
      remove: function(id, callback) {
        makeapiClient.remove(id, callback);
      }
    };
  }
  else {
    return {
      publish: function(publishOptions, callback) {
        callback(null);
      },
      remove: function(id, callback) {
        callback(null);
      }
    };
  }
};
