import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import createAllAuthorSelector from 'Store/Selectors/createAllAuthorsSelector';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import createTagsSelector from 'Store/Selectors/createTagsSelector';
import AuthorSearchInput from './AuthorSearchInput';

/**
 * 1. Define Selectors Outside the Component
 * We instantiate the specific selectors once at the module level.
 * This ensures the references are stable and defined before connect() runs.
 */
const selectCleanAuthors = createCleanAuthorSelector();
const selectCleanBooks = createCleanBookSelector();

const selectCombinedItems = createDeepEqualSelector(
  // Use the instances directly as functions
  selectCleanAuthors,
  selectCleanBooks,
  (authors, books) => ({
    items: [...authors, ...books]
  })
);

/**
 * 2. Standard mapStateToProps
 * We move away from the factory pattern (function returning a function)
 * to a standard function for better compatibility with Redux v6+.
 */
const mapStateToProps = (state, ownProps) => {
  return selectCombinedItems(state, ownProps);
};

/**
 * 3. Standard mapDispatchToProps
 * Note: 'navigate' is passed via 'ownProps' from the Wrapper below.
 */
const mapDispatchToProps = (dispatch, { navigate }) => {
  return {
    onGoToAuthor(titleSlug) {
      navigate(`${window.Readarr.urlBase}/author/${titleSlug}`);
    },
    onGoToBook(titleSlug) {
      navigate(`${window.Readarr.urlBase}/book/${titleSlug}`);
    },
    onGoToAddNewAuthor(query) {
      navigate(`${window.Readarr.urlBase}/add/search?term=${encodeURIComponent(query)}`);
    }
  };
};

/**
 * 4. Connect the Component
 */
const ConnectedAuthorSearchInput = connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthorSearchInput);

/**
 * 5. Functional Wrapper
 * This bridges the 'useNavigate' hook to the connected component.
 */
export default function AuthorSearchInputWrapper(props) {
  const navigate = useNavigate();
  return <ConnectedAuthorSearchInput {...props} navigate={navigate} />;
}

// --- Helper Selectors (Kept at the bottom to avoid temporal dead zone issues) ---
function createCleanAuthorSelector() {
  /* Replace with your original logic if it differs, 
     but ensure it returns a (state) => data function */
  return createAllAuthorSelector();
}

function createCleanBookSelector() {
  /* Replace with your original logic */
  return (state) => state.books?.items || [];
}
