var middleware = require("../lib/middleware");

module.exports = {
  setup: function (app, env) {
    var API = require("../lib/API")(env.get("API"));

    app.post(
      "/feature",
      middleware.isLoggedIn,
      API.feature
    );

    app.post(
      "/trash",
      middleware.isLoggedIn,
      API.trash
    );

    app.get(
      "/find",
      middleware.isLoggedIn,
      API.find
    );

    app.get("/", function(req, res) {
      res.render("index.html", {
        csrf: req.csrfToken()
      });
    });

    app.get(
      "/oauth2/callback",
      require("../lib/oauth")(env.get("OAUTH2"))
    );
  }
};
