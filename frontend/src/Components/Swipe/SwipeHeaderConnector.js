import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Added
import { createSelector } from 'reselect';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import SwipeHeader from './SwipeHeader';

function createMapStateToProps() {
  return createSelector(
    createDimensionsSelector(),
    (dimensions) => ({
      isSmallScreen: dimensions.isSmallScreen
    })
  );
}

// 1. Access 'navigate' from the component's props
function createMapDispatchToProps(dispatch, { navigate }) {
  return {
    onGoTo(url) {
      // 2. Call navigate directly instead of dispatching push
      navigate(`${window.Readarr.urlBase}${url}`);
    }
  };
}

class SwipeHeaderConnector extends Component {
  render() {
    return (
      <SwipeHeader
        {...this.props}
      />
    );
  }
}

SwipeHeaderConnector.propTypes = {
  onGoTo: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired // Added
};

// 3. Create the connected component
const ConnectedSwipeHeader = connect(
  createMapStateToProps,
  createMapDispatchToProps
)(SwipeHeaderConnector);

// 4. Use the wrapper to provide the hook
export default function SwipeHeaderWrapper(props) {
  const navigate = useNavigate();
  return <ConnectedSwipeHeader {...props} navigate={navigate} />;
}
