var express = require("express"),
    cookieSession = require("cookie-session"),
    path = require("path"),
    nunjucks = require("nunjucks"),
    bodyParser = require("body-parser"),
    compression = require("compression"),
    csrf = require("csurf"),
    WebmakerAuth = require("webmaker-auth"),
    Habitat = require("habitat"),
    helmet = require("helmet"),
    routes = require("./routes"),
    app = express();

var nunjucksEnv = new nunjucks.Environment(
                    new nunjucks.FileSystemLoader(
                      path.join( __dirname, "../firehose/public" )
                    ), { autoescape: true }
                  );

nunjucksEnv.express( app );

Habitat.load();
Habitat.load("server/config/defaults.env");
Habitat.load("server/config/staging.env");
Habitat.load("server/config/production.env");

var env = new Habitat();

var webmakerAuth = new WebmakerAuth({
  loginURL: env.get("LOGIN_URL"),
  authLoginURL: env.get("AUTH_LOGIN_URL"),
  loginHost: env.get("LOGIN_HOST_ADDRESS"),
  secretKey: env.get("SECRET_KEY"),
  forceSSL: env.get("FORCE_SSL"),
  domain: env.get("DOMAIN")
});

// some housekeeping:
app.disable("x-powered-by");
app.use(helmet());

if (env.get("FORCE_SSL")) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
}

app.use(compression());
app.use(bodyParser.json());
app.use(cookieSession({
  name: "Firehose:Login",
  secret: env.get("SECRET_KEY"),
  expires: false,
  secure: env.get("FORCE_SSL"),
  secureProxy: env.get("FORCE_SSL"),
  domain: env.get("DOMAIN")
}));
app.use(csrf());

// make bower components universally findable by
// pretending we have our own CDN running:
app.use("/cdn", express.static(__dirname + "/../firehose/vendor"));
app.use("/cdn", express.static(__dirname + "/../node_modules"));

// bind API routes
routes.setup(app, env, webmakerAuth);

app.use("/", express.static(__dirname + "/../firehose/public"));

var server = app.listen(env.get("PORT"), function() {
  console.log("API server listening on http://localhost:%d",
    server.address().port);
});
