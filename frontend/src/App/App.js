import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'; // [1]
import PageConnector from 'Components/Page/PageConnector';
import ApplyTheme from './ApplyTheme';
import AppRoutes from './AppRoutes';

function App({ store, history }) {
  return (
    <Provider store={store}>
      {/* React 19 will automatically hoist this <title> to the document <head> */}
      <title>{window.Readarr.instanceName}</title>

      <HistoryRouter history={history}>
        <ApplyTheme>
          <PageConnector>
            <AppRoutes app={App} />
          </PageConnector>
        </ApplyTheme>
      </HistoryRouter>
    </Provider>
  );
}

App.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default App;
