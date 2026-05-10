import type { Station, TrackMetadata } from '../types'
import * as radiofrance from './radiofrance'
import * as tsfjazz from './tsfjazz'
import * as grrif from './grrif'
import * as kexp from './kexp'
import * as kcrwEclectic24 from './kcrw-eclectic24'
import * as lofi247 from './247-lofi-radio'

export interface Adapter {
  fetchMetadata(station: Station): Promise<TrackMetadata>
}

export const adapters = {
  radiofrance,
  tsfjazz,
  grrif,
  kexp,
  'kcrw-eclectic24': kcrwEclectic24,
  '247-lofi-radio': lofi247,
} satisfies Record<string, Adapter>

export type AdapterName = keyof typeof adapters
