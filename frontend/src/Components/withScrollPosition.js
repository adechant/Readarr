import React from 'react';
import { useNavigationType, useLocation } from 'react-router-dom';
import scrollPositions from 'Store/scrollPositions';

function withScrollPosition(WrappedComponent, scrollPositionKey) {
  function ScrollPosition(props) {
    const navigationType = useNavigationType();
    const location = useLocation();

    const scrollTop = navigationType === 'POP' || (location.state && location.state.restoreScrollPosition) ?
      scrollPositions[scrollPositionKey] :
      0;

    return (
      <WrappedComponent
        {...props}
        scrollTop={scrollTop}
      />
    );
  }

  return ScrollPosition;
}

export default withScrollPosition;
