import React, { Component } from 'react';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import CustomFormatsConnector from './CustomFormats/CustomFormatsConnector';

class CustomFormatSettingsConnector extends Component {

  //
  // Render

  render() {
    return (
      <PageContent title={translate('CustomFormatSettings')}>
        <SettingsToolbarConnector
          showSave={false}
        />

        <PageContentBody>
          <DndProvider options={HTML5toTouch}>
            <CustomFormatsConnector />
          </DndProvider>
        </PageContentBody>
      </PageContent>
    );
  }
}

export default CustomFormatSettingsConnector;

