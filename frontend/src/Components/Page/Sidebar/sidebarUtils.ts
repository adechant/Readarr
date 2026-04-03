import _ from 'lodash';
import { SidebarLink, links } from './sidebarLinks';

/**
 * Strips the urlBase from the current location pathname.
 */
export function getCleanPathname(pathname: string) {
  const urlBase = (window as any).Readarr?.urlBase;
  return urlBase ? pathname.substring(urlBase.length) || '/' : pathname;
}

/**
 * Identifies the primary sidebar section (parent) that corresponds to the current path.
 */
export function getActiveParent(currentPath: string) {
  let activeParent = links[0].to;

  links.forEach((link) => {
    if (link.to && link.to === currentPath) {
      activeParent = link.to;
      return false;
    }

    const children = link.children;

    if (children) {
      children.forEach((childLink) => {
        if (currentPath.startsWith(childLink.to)) {
          activeParent = link.to;
          return false;
        }
      });
    }

    if (
      (link.to !== '/' && currentPath.startsWith(link.to)) ||
      (link.alias && currentPath.startsWith(link.alias))
    ) {
      activeParent = link.to;
      return false;
    }
  });

  return activeParent;
}

/**
 * Checks if a sidebar link has an active child.
 */
export function hasActiveChildLink(link: SidebarLink, currentPath: string) {
  const children = link.children;

  if (!children || !children.length) {
    return false;
  }

  return _.some(children, (child) => {
    return child.to === currentPath;
  });
}
