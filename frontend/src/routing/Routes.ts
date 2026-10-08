import App from '@/App';
import { StaticLinks } from '@/config/StaticLinks';
import { ForecastPage } from '@/pages/ForecastPage';
import { HomePage } from '@/pages/HomePage';
import { SchemaPage } from '@/pages/SchemaPage';
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: StaticLinks.home,
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: StaticLinks.forecast, Component: ForecastPage },
      { path: StaticLinks.schema, Component: SchemaPage },
    ],
  },
]);

export default router;
