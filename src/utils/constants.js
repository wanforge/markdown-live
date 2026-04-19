import packageJson from '../../package.json';

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? packageJson.version;

export const BRAND = {
  name: 'MarkDown Live',
  slogan: 'Free Forever. No Tracking. Built Together.',
  owner: 'WanForge',
  ownerUrl: 'https://wanforge.asia',
  repoUrl: 'https://github.com/wanforge/markdown-live',
};

// Palette extracted from icon.svg.
export const PALETTE = {
  primary: '#003D99',
  accent: '#80B3FF',
  white: '#FFFFFF',
};
