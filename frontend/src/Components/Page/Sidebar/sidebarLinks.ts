import React from 'react';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import QueueStatusConnector from 'Activity/Queue/Status/QueueStatusConnector';
import HealthStatusConnector from 'System/Status/Health/HealthStatusConnector';

export interface SidebarLink {
  iconName?: any;
  title: () => string;
  to: string;
  alias?: string;
  statusComponent?: React.ComponentType<any>;
  children?: SidebarLink[];
}

export const links: SidebarLink[] = [
  {
    iconName: icons.AUTHOR_CONTINUING,
    title: () => translate('Library'),
    to: '/',
    alias: '/authors',
    children: [
      {
        title: () => translate('Authors'),
        to: '/authors'
      },
      {
        title: () => translate('Books'),
        to: '/books'
      },
      {
        title: () => translate('AddNew'),
        to: '/add/search'
      },
      {
        title: () => translate('Bookshelf'),
        to: '/shelf'
      },
      {
        title: () => translate('UnmappedFiles'),
        to: '/unmapped'
      }
    ]
  },

  {
    iconName: icons.CALENDAR,
    title: () => translate('Calendar'),
    to: '/calendar'
  },

  {
    iconName: icons.ACTIVITY,
    title: () => translate('Activity'),
    to: '/activity/queue',
    children: [
      {
        title: () => translate('Queue'),
        to: '/activity/queue',
        statusComponent: QueueStatusConnector
      },
      {
        title: () => translate('History'),
        to: '/activity/history'
      },
      {
        title: () => translate('Blocklist'),
        to: '/activity/blocklist'
      }
    ]
  },

  {
    iconName: icons.WARNING,
    title: () => translate('Wanted'),
    to: '/wanted/missing',
    children: [
      {
        title: () => translate('Missing'),
        to: '/wanted/missing'
      },
      {
        title: () => translate('CutoffUnmet'),
        to: '/wanted/cutoffunmet'
      }
    ]
  },

  {
    iconName: icons.SETTINGS,
    title: () => translate('Settings'),
    to: '/settings',
    children: [
      {
        title: () => translate('MediaManagement'),
        to: '/settings/mediamanagement'
      },
      {
        title: () => translate('Profiles'),
        to: '/settings/profiles'
      },
      {
        title: () => translate('Quality'),
        to: '/settings/quality'
      },
      {
        title: () => translate('CustomFormats'),
        to: '/settings/customformats'
      },
      {
        title: () => translate('Indexers'),
        to: '/settings/indexers'
      },
      {
        title: () => translate('DownloadClients'),
        to: '/settings/downloadclients'
      },
      {
        title: () => translate('ImportLists'),
        to: '/settings/importlists'
      },
      {
        title: () => translate('Connect'),
        to: '/settings/connect'
      },
      {
        title: () => translate('Metadata'),
        to: '/settings/metadata'
      },
      {
        title: () => translate('Tags'),
        to: '/settings/tags'
      },
      {
        title: () => translate('General'),
        to: '/settings/general'
      },
      {
        title: () => translate('Ui'),
        to: '/settings/ui'
      }
    ]
  },

  {
    iconName: icons.SYSTEM,
    title: () => translate('System'),
    to: '/system/status',
    children: [
      {
        title: () => translate('Status'),
        to: '/system/status',
        statusComponent: HealthStatusConnector
      },
      {
        title: () => translate('Tasks'),
        to: '/system/tasks'
      },
      {
        title: () => translate('Backup'),
        to: '/system/backup'
      },
      {
        title: () => translate('Updates'),
        to: '/system/updates'
      },
      {
        title: () => translate('Events'),
        to: '/system/events'
      },
      {
        title: () => translate('LogFiles'),
        to: '/system/logs/files'
      }
    ]
  }
];
