var React = require("react");
var webmakerLoginUxMixin = require("./../../mixins/WebmakerUXMixin");

var WebmakerLoginUX = React.createClass({
  mixins: [
    webmakerLoginUxMixin
  ],
  render: function() {
    var handler = this.login,
        label = this.props.signInLabel;
    if (this.props.loggedIn) {
      handler = this.logout;
      label = this.props.signOutLabel;
    }
    return(
      <button
        className="btn btn-primary webmaker-login-ux"
        onClick={handler}>{label}
      </button>
    );
  }
});

module.exports = WebmakerLoginUX;
