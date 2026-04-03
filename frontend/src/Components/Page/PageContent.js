import PropTypes from 'prop-types';
import React from 'react';
import ErrorBoundary from 'Components/Error/ErrorBoundary';
import PageContentError from './PageContentError';
import styles from './PageContent.css';

function PageContent(props) {
  const { className = styles.content, title, children } = props;

  // Define the dynamic title string
  const fullTitle = title
    ? `${title} - ${window.Readarr.instanceName}`
    : window.Readarr.instanceName;

  return (
    <ErrorBoundary errorComponent={PageContentError}>
      {/* React 19 Native Metadata: Automatically hoisted to <head> */}
      <title>{fullTitle}</title>

      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

PageContent.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node.isRequired
};


export default PageContent;
