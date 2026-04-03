import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom'; // Added
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import NotFound from 'Components/NotFound';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { fetchBookBySlug } from 'Store/Actions/bookActions';
import translate from 'Utilities/String/translate';
import BookDetailsConnector from './BookDetailsConnector';

function createMapStateToProps() {
  return createSelector(
    (state, props) => props.params, // Use params from wrapper
    (state) => state.books,
    (state) => state.authors,
    (params, books, author) => {
      const titleSlug = params.titleSlug;
      const isFetching = books.isFetching || author.isFetching;
      const isPopulated = books.isPopulated && author.isPopulated;

      if (!isFetching && isPopulated) {
        const bookIndex = _.findIndex(books.items, { titleSlug });
        if (bookIndex === -1) {
          return { books, isFetching, isPopulated };
        }
      }

      return { titleSlug, books, isFetching, isPopulated };
    }
  );
}

const mapDispatchToProps = {
  fetchBookBySlug
};

class BookDetailsPageConnector extends Component {
  constructor(props) {
    super(props);
    this.state = { hasMounted: false };
  }

  componentDidMount() {
    this.setState({ hasMounted: true });
    this.fetchBookIfNeeded();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.titleSlug !== this.props.titleSlug && this.props.titleSlug) {
      this.fetchBookIfNeeded();
    }
  }

  fetchBookIfNeeded = () => {
    const { titleSlug, books, fetchBookBySlug: fetchBookBySlugProp } = this.props;
    const book = books?.items?.find((b) => b.titleSlug === titleSlug);
    if (!book && books && !books.isFetching) {
      fetchBookBySlugProp({ titleSlug });
    }
  };

  render() {
    const { titleSlug, isFetching, isPopulated } = this.props;

    if (!titleSlug) {
      return <NotFound message={translate('SorryThatBookCannotBeFound')} />;
    }

    if ((isFetching || !this.state.hasMounted) || (!isFetching && !isPopulated)) {
      return (
        <PageContent title={translate('Loading')}>
          <PageContentBody><LoadingIndicator /></PageContentBody>
        </PageContent>
      );
    }

    return <BookDetailsConnector titleSlug={titleSlug} />;
  }
}

BookDetailsPageConnector.propTypes = {
  titleSlug: PropTypes.string,
  books: PropTypes.object,
  params: PropTypes.object.isRequired, // Updated from match
  navigate: PropTypes.func.isRequired, // Added
  fetchBookBySlug: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired
};

// Wrapper to bridge Hooks to the Class Component
const ConnectedComponent = connect(createMapStateToProps, mapDispatchToProps)(BookDetailsPageConnector);

export default function BookDetailsPageWrapper(props) {
  const params = useParams();
  const navigate = useNavigate();
  return <ConnectedComponent {...props} params={params} navigate={navigate} />;
}
