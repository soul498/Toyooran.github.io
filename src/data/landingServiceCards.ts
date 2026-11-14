import { Building2, Factory, Fan, FlaskConical, Pill, RefreshCw } from '../icons';
import { SERVICE_PAGES, servicePagePath } from './servicePages';

/**
 * Service cards on the home page and /services: the six services (user request, 14 Nov 2026),
 * each linking to its own page. Titles and order come from src/data/servicePages.ts.
 * The card shows the icon and title over a decorative photo (ServiceCard in components/Hero.tsx).
 */
const ICONS = [Building2, Fan, Factory, Pill, RefreshCw, FlaskConical];

export const LANDING_SERVICE_CARDS = SERVICE_PAGES.map((page, i) => ({
  serviceId: page.slug,
  to: servicePagePath(page),
  title: page.title,
  icon: ICONS[i],
  bgImage: page.cardImage,
}));
