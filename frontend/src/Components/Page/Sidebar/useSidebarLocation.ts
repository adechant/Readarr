import { useLocation } from 'react-router-dom';
import { getActiveParent, getCleanPathname } from './sidebarUtils';

/**
 * useSidebarLocation Hook
 * 
 * Provides location-related data for the PageSidebar, compatible with Redux 9.x 
 * and React Router 7.
 */
export const useSidebarLocation = () => {
  const location = useLocation();

  // Calculate pathname relative to urlBase
  const pathname = getCleanPathname(location.pathname);

  // Identify the active sidebar parent (primary tab)
  const activeParent = getActiveParent(pathname);

  return {
    location,
    pathname,
    activeParent,
  };
};

export default useSidebarLocation;
