// Store/createAppStore.ts
import { configureStore } from '@reduxjs/toolkit';
import createReducers, { defaultState } from 'Store/Actions/createReducers';
import middlewares from 'Store/Middleware/middlewares';
import createPersistState from 'Store/Middleware/createPersistState'; // Import directly

export function createAppStore() {
  const store = configureStore({
    reducer: createReducers(),
    preloadedState: defaultState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Disable the check that's causing the errors
        serializableCheck: false,
        // You might also want to disable this if you pass functions in actions
        immutableCheck: false,
      }).concat(middlewares()),
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat(createPersistState()),
    devTools: process.env.NODE_ENV !== 'production',
  });

  return store;
}


export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
// Redux 5/RTK 2.x uses UnknownAction which is more strict than redux-actions' Action type.
// We merge in a more permissive signature to allow existing redux-actions without casting every call site.
export type AppDispatch = AppStore['dispatch'] & ((action: any) => any);