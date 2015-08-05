module.exports = {
  isLoggedIn: function(req, res, next) {
    if ( req.session.token ) {
      return next();
    }

    return res.sendStatus(403);
  }
};
