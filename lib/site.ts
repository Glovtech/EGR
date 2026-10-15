// Canonical site details shared by metadata, sitemap, robots and structured data
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.evergreenremedyghana.com').replace(/\/$/, '');
export const SITE_NAME = 'Evergreen Remedy Ghana';
export const SITE_TITLE = 'Forever Arctic Sea Omega-3 for Kids in Ghana | Evergreen Remedy Ghana';
export const SITE_DESCRIPTION =
  'Everyday Omega-3 support for your child’s growing brain. Forever Arctic Sea gives children DHA and EPA. Free delivery on 2+ bottles, pay on delivery in Accra, Kumasi, Takoradi & Tamale.';

// Google Analytics 4 measurement ID (G-XXXXXXXXXX); analytics stay off until it's set
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
