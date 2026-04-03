import React from 'react';
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // Updated import
import { DndProvider } from 'react-dnd-multi-backend';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import DelayProfilesConnector from './Delay/DelayProfilesConnector';
import MetadataProfilesConnector from './Metadata/MetadataProfilesConnector';
import QualityProfilesConnector from './Quality/QualityProfilesConnector';
import ReleaseProfilesConnector from './Release/ReleaseProfilesConnector';

// Converted to a functional component for React 19 compatibility
const Profiles = () => {
  return (
    <PageContent title={translate('Profiles')}>
      <SettingsToolbarConnector showSave={false} />

      <PageContentBody>
        {/* The DndProvider manages the drag-and-drop context for all child connectors */}
        <DndProvider options={HTML5toTouch}>
          <QualityProfilesConnector />
          <MetadataProfilesConnector />
          <DelayProfilesConnector />
          <ReleaseProfilesConnector />
        </DndProvider>
      </PageContentBody>
    </PageContent>
  );
};

export default Profiles;
