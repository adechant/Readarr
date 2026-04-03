import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import LogFilesConnector from './Files/LogFilesConnector';
import UpdateLogFilesConnector from './Updates/UpdateLogFilesConnector';

class Logs extends Component {

  //
  // Render

  render() {
    return (
      <Routes>
        <Route
          exact={true}
          path="/system/logs/files"
          component={LogFilesConnector}
        />

        <Route
          path="/system/logs/files/update"
          component={UpdateLogFilesConnector}
        />
      </Routes>
    );
  }
}

export default Logs;
