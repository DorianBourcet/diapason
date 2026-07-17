import type { Station, TrackMetadata } from '../types'
import * as radiofrance from './radiofrance'
import * as tsfjazz from './tsfjazz'
import * as grrif from './grrif'
import * as kexp from './kexp'
import * as kcrwEclectic24 from './kcrw-eclectic24'
import * as lofi247 from './247-lofi-radio'
import * as radioclassique from './radioclassique'
import * as nova from './nova'
import * as rts from './rts'
import * as jazzradio from './jazzradio'
import * as radioplayer from './radioplayer'
import * as ouifm from './ouifm'
import * as classic21 from './classic21'

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
  radioclassique,
  nova,
  rts,
  jazzradio,
  radioplayer,
  ouifm,
  classic21,
} satisfies Record<string, Adapter>

export type AdapterName = keyof typeof adapters
