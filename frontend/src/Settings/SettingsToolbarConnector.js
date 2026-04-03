import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleAdvancedSettings } from 'Store/Actions/settingsActions';
import SettingsToolbar from './SettingsToolbar';
import withRouter from 'Helpers/Hooks/withRouter';

function mapStateToProps(state) {
  return {
    advancedSettings: state.settings.advancedSettings
  };
}

const mapDispatchToProps = {
  toggleAdvancedSettings
};

class SettingsToolbarConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      nextLocation: null,
      nextLocationAction: null,
      confirmed: false
    };

    this._unblock = null;
  }

  componentDidMount() {
    // Note: React Router v6 (used in your withRouter) does not support history.block.
    // To fix the crash, this is commented out. 
    // this._unblock = this.props.router.navigate.block(this.routerWillLeave);
  }

  componentWillUnmount() {
    if (this._unblock) {
      this._unblock();
    }
  }

  //
  // Control

  routerWillLeave = (nextLocation, nextLocationAction) => {
    if (this.state.confirmed) {
      this.setState({
        nextLocation: null,
        nextLocationAction: null,
        confirmed: false
      });

      return true;
    }

    if (this.props.hasPendingChanges) {
      this.setState({
        nextLocation,
        nextLocationAction
      });

      return false;
    }

    return true;
  };

  //
  // Listeners

  onAdvancedSettingsPress = () => {
    this.props.toggleAdvancedSettings();
  };

  onConfirmNavigation = () => {
    const {
      nextLocation,
      nextLocationAction
    } = this.state;

    // Use navigate from the router prop instead of history
    const { navigate } = this.props.router;

    const path = `${nextLocation.pathname}${nextLocation.search}`;

    this.setState({
      confirmed: true
    }, () => {
      if (nextLocationAction === 'PUSH') {
        navigate(path);
      } else {
        // v6 uses navigate(-1) for back navigation
        navigate(-1);
      }
    });
  };

  onCancelNavigation = () => {
    this.setState({
      nextLocation: null,
      nextLocationAction: null,
      confirmed: false
    });
  };

  //
  // Render

  render() {
    const hasPendingLocation = this.state.nextLocation !== null;

    return (
      <SettingsToolbar
        hasPendingLocation={hasPendingLocation}
        onSavePress={this.props.onSavePress}
        onAdvancedSettingsPress={this.onAdvancedSettingsPress}
        onConfirmNavigation={this.onConfirmNavigation}
        onCancelNavigation={this.onCancelNavigation}
        {...this.props}
      />
    );
  }
}

// Updated to match the shape provided by your custom withRouter
const routerShape = {
  location: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired
};

SettingsToolbarConnector.propTypes = {
  hasPendingChanges: PropTypes.bool.isRequired,
  router: PropTypes.shape(routerShape).isRequired,
  onSavePress: PropTypes.func,
  toggleAdvancedSettings: PropTypes.func.isRequired
};

SettingsToolbarConnector.defaultProps = {
  hasPendingChanges: false
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SettingsToolbarConnector));
