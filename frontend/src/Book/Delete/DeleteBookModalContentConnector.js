import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Added
import { createSelector } from 'reselect';
import { deleteBook } from 'Store/Actions/bookActions';
import createBookSelector from 'Store/Selectors/createBookSelector';
import DeleteBookModalContent from './DeleteBookModalContent';

function createMapStateToProps() {
  return createSelector(
    createBookSelector(),
    (book) => book
  );
}

// 1. Removed 'push' from mapDispatchToProps
const mapDispatchToProps = {
  deleteBook
};

class DeleteBookModalContentConnector extends Component {
  onDeletePress = (deleteFiles, addImportListExclusion) => {
    this.props.deleteBook({
      id: this.props.bookId,
      deleteFiles,
      addImportListExclusion
    });

    this.props.onModalClose(true);

    // 2. Use this.props.navigate instead of this.props.push
    this.props.navigate(`${window.Readarr.urlBase}/author/${this.props.authorSlug}`);
  };

  render() {
    return (
      <DeleteBookModalContent
        {...this.props}
        onDeletePress={this.onDeletePress}
      />
    );
  }
}

DeleteBookModalContentConnector.propTypes = {
  bookId: PropTypes.number.isRequired,
  authorSlug: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired, // Updated
  onModalClose: PropTypes.func.isRequired,
  deleteBook: PropTypes.func.isRequired
};

// 3. Create the wrapper to inject the navigate hook
const ConnectedComponent = connect(createMapStateToProps, mapDispatchToProps)(DeleteBookModalContentConnector);

export default function DeleteBookModalWrapper(props) {
  const navigate = useNavigate();
  return <ConnectedComponent {...props} navigate={navigate} />;
}
