var request = require('request');

module.exports = function(oauthSettings) {
	return function oauthCallback(req, res) {
		if (req.query.logout) {
			req.session = null;
			return res.redirect(301, '/');
		}

	   if (!req.query.code) {
	    return res.status(401).send({ message: 'OAUTH: Code required' });
	  }

	  if (!req.cookies.state || !req.query.state) {
	    return res.status(401).send({ message: 'OAUTH: State required' });
	  }

	  if (req.cookies.state !== req.query.state) {
	    return res.status(401).send({ message: 'OAUTH: Invalid state' });
	  }

	  if (req.query.client_id !== oauthSettings.client_id) {
	    return res.status(401).send({ message: 'OAUTH: Invalid client credentials' });
	  }

	      // First, fetch the token
	  request.post({
	    url: oauthSettings.URI + '/login/oauth/access_token',
	    form: {
	      client_id: oauthSettings.CLIENT_ID,
	      client_secret: oauthSettings.CLIENT_SECRET,
	      grant_type: 'authorization_code',
	      code: req.query.code
	    }
	  }, function(err, response, body) {
	    if (err) {
	      console.log('Request error: ', err, ' Body: ', body);
	      return res.status(500).send({ message: 'Internal server error. See logs for details' });
	    }

	    if (response.statusCode !== 200) {
	      console.log('Code ' + response.statusCode + '. Error getting access token: ', body);
	      return res.status(response.statusCode).send({ message: body });
	    }

	    try {
	      body = JSON.parse(body);
	    } catch(e) {
	      return res.status(500).send({ err: e });
	    }

	    var accessToken = body.access_token;

	    // Next, fetch user data
	    request.get({
	      url: oauthSettings.URI + '/user',
	      headers: {
	        'Authorization': 'token ' + accessToken
	      }
	    }, function(err, response, body) {
	      if (err) {
	        console.log('Request error: ', err, ' Body: ', body);
	        return res.status(500).send({ message: 'Internal server error. See logs for details' });
	      }

	      if (response.statusCode !== 200) {
	        console.log('Code ' + response.statusCode + '. Error getting user data: ', body);
	        return res.status(response.statusCode).send({ status: response.statusCode, message: body });
	      }

	      try {
	        req.session.user = JSON.parse(body);
	      } catch(e) {
	        return res.status(500).send({err: e});
	      }

	      // TODO: Check for moderator flag

	      req.session.token = accessToken;
	      res.redirect(301, '/');
	    });
	  });
	};
};