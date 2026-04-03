import { createRoot } from "react-dom/client";
import { createBrowserHistory } from 'history';
import React from 'react';
import { createAppStore } from 'Store/createAppStore';
import App from './App/App';

import 'Diag/ConsoleApi';

export async function bootstrap() {
  const history = createBrowserHistory();
  const store = createAppStore();

  // Add the ! at the end to tell TS the element definitely exists
  const container = document.getElementById('root')!;

  const root = createRoot(container);
  root.render(<App store={store} history={history} />);
}
