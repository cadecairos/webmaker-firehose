var request = require('request');

module.exports = function(apiSettings) {
  return {
    find: function(req, res) {
      var page = req.query.p;
      
      request.get({
        url: apiSettings.URI + '/projects?count=100&page=' + page
      }, function(err, response, body) {
        if (err) {
          return res.status(500).send(err);
        }

        res.json(body);
      });
    },

    feature: function(req, res) {
      request.patch({
        url: apiSettings.URI + '/users/' + req.body.user + '/projects/' + req.body.project + '/feature',
        headers: {
          'Authorization': 'token ' + req.session.token
        }
      }, function(err, response, body) {
        if (err) {
          return res.status(500).send(err);
        }

        res.json(body);
      });
    },

    trash: function(req, res) {
      request.del({
        url: apiSettings.URI + '/users/' + req.body.user + '/projects/' + 'req.body.project',
        headers: {
          'Authorization': 'token ' + req.session.token
        }
      }, function(err, response, body) {
        if (err) {
          return res.status(500).send(err);
        }

        res.json(body);
      });
    }
  };
};
