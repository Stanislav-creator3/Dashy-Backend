import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';
import type { SessionMetadata } from '../types/session-metadata.types';
import { IS_DEV_ENV } from './is-dev.util';

import DeviceDetector = require('device-detector-js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getSessionMetadata(
  req: Request,
  userAgent: string,
): SessionMetadata {
  const ip = IS_DEV_ENV
    ? '83.220.236.105'
    : Array.isArray(req.headers['cf-connecting-ip'])
      ? req.headers['cf-connecting-ip'][0]
      : req.headers['cf-connecting-ip'] ||
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0]
          : req.ip);

  const locations = lookup(ip);
  const device = new DeviceDetector().parse(userAgent);

  return {
    location: {
      country: countries.getName(locations.country, 'en') || 'Неизвестно',
      city: locations.city || 'Неизвестно',
      latitude: locations.ll[0] || 0,
      longitude: locations.ll[1] || 0,
    },
    device: {
      browser: device.client.name,
      os: device.os.name,
      type: device.device.type,
    },
    ip,
  };
}
