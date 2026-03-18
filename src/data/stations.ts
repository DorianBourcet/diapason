import type { Station } from '../types'

export const stations: Station[] = [
  {
    id: 'fip',
    name: 'FIP',
    streamUrl: 'https://icecast.radiofrance.fr/fip-hifi.aac',
    adapter: 'radiofrance',
    adapterConfig: {
      stationId: 'fip',
    },
  },
  {
    id: 'francemusique',
    name: 'France Musique',
    streamUrl: 'https://icecast.radiofrance.fr/francemusique-hifi.aac',
    adapter: 'radiofrance',
    adapterConfig: {
      stationId: 'francemusique',
    },
  },
  {
    id: 'grrif',
    name: 'GRRIF',
    streamUrl: 'https://grrif.ice.infomaniak.ch/grrif-128.aac',
    adapter: 'grrif',
    adapterConfig: {},
  },
  {
    id: 'tsfjazz',
    name: 'TSF Jazz',
    streamUrl: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3',
    adapter: 'tsfjazz',
    adapterConfig: {},
  },
]
