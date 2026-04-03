import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import actions from 'Store/Actions';

const defaultState = {};
const reducers = {};

actions.forEach((action) => {
  const section = action.section;

  defaultState[section] = action.defaultState;
  reducers[section] = action.reducers;
});

export { defaultState };

// 1. Remove the 'history' argument as it is no longer needed here
export default function () {
  return enableBatching(combineReducers({
    ...reducers
    // 2. Removed 'router: connectRouter(history)'
  }));
}
