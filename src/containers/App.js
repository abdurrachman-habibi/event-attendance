import update from 'react-addons-update';
import merge from 'lodash.merge';

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import LightRawTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import {blueGrey600} from 'material-ui/styles/colors';

import Header from '../components/Header';

import {checkAuth, logout} from '../actions/auth';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);

    this.state = {
      muiTheme: getMuiTheme(LightRawTheme)
    };
  }

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  }

  componentWillMount() {
    this.props.checkAuth();

    const newPalette = merge(this.state.muiTheme.baseTheme.palette, { accent1Color: blueGrey600 });
    const muiTheme = getMuiTheme(update(this.state.muiTheme.baseTheme, { palette: { $set: newPalette } }));

    this.setState({ muiTheme });
  }

  handleLogout(e) {
    e.preventDefault();

    this.props.logout();
    this.context.router.push('/login');
  }

  render() {
    return this.props.isAuthChecked ? (
      <div data-layout-fill>
        <div className="header">
          <Header
            isLoggedIn={this.props.isLoggedIn} isSuperUser={this.props.isSuperUser} handleLogout={this.handleLogout} />
        </div>
        <div className="content">
          {this.props.children}
        </div>
      </div>
    ) : <div>Loading...</div>;
  }
}

App.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};

App.childContextTypes = {
  muiTheme: React.PropTypes.object
};

App.propTypes = {
  isAuthChecked: React.PropTypes.bool,
  isLoggedIn: React.PropTypes.bool,
  isSuperUser: React.PropTypes.bool,
  children: React.PropTypes.element,
  checkAuth: React.PropTypes.func,
  logout: React.PropTypes.func
};

function mapStateProps(state) {
  const {auth} = state;
  return {
    isAuthChecked: auth.isAuthChecked,
    isLoggedIn: auth.user !== null && auth.user !== undefined,
    isSuperUser: auth.user && auth.user.isSuperUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    checkAuth: () => {
      dispatch(checkAuth());
    },

    logout: () => {
      dispatch(logout());
    }
  };
}

export default connect(mapStateProps, mapDispatchToProps)(App);
