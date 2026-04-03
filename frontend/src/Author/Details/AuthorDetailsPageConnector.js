import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // Added
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import NotFound from 'Components/NotFound';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AuthorDetailsConnector from './AuthorDetailsConnector';
import styles from './AuthorDetails.css';

// 1. Updated Selector: 'match' is no longer passed automatically in v6
function createMapStateToProps() {
  return createSelector(
    (state, props) => props.params, // Use params from our wrapper
    (state) => state.authors,
    (params, authors) => {
      const titleSlug = params.titleSlug;
      const { isFetching, isPopulated, error, items } = authors;

      const authorIndex = _.findIndex(items, { titleSlug });

      if (authorIndex > -1) {
        return { isFetching, isPopulated, titleSlug };
      }

      return { isFetching, isPopulated, error };
    }
  );
}

class AuthorDetailsPageConnector extends Component {
  componentDidUpdate() {
    // 2. Use the navigate prop instead of Redux push
    if (!this.props.titleSlug) {
      this.props.navigate(`${window.Readarr.urlBase}/`);
    }
  }

  render() {
    const { titleSlug, isFetching, isPopulated, error } = this.props;

    if (isFetching && !isPopulated) {
      return (
        <PageContent title={translate('Loading')}>
          <PageContentBody><LoadingIndicator /></PageContentBody>
        </PageContent>
      );
    }

    if (!isFetching && !!error) {
      return (
        <div className={styles.errorMessage}>
          {getErrorMessage(error, 'Failed to load author from API')}
        </div>
      );
    }

    if (!titleSlug) {
      return <NotFound message={translate('SorryThatAuthorCannotBeFound')} />;
    }

    return <AuthorDetailsConnector titleSlug={titleSlug} />;
  }
}

AuthorDetailsPageConnector.propTypes = {
  titleSlug: PropTypes.string,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  params: PropTypes.object.isRequired, // Updated
  navigate: PropTypes.func.isRequired   // Updated
};

// 3. Create a wrapper to bridge Hooks to the Class Component
const ConnectedComponent = connect(createMapStateToProps)(AuthorDetailsPageConnector);

export default function AuthorDetailsPageWrapper(props) {
  const navigate = useNavigate();
  const params = useParams();
  return <ConnectedComponent {...props} navigate={navigate} params={params} />;
}
