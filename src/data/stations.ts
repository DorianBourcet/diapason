import type { Station } from '../types'

export const stations: Station[] = [
  {
    id: '247-lofi-radio',
    name: '24/7 Lofi Radio',
    streamUrl: 'https://ec3.yesstreaming.net:3755/stream',
    adapter: '247-lofi-radio',
    adapterConfig: {
      serverId: '10',
    },
  },
  {
    id: 'chyz',
    name: 'CHYZ',
    streamUrl: 'https://ecoutez.chyz.ca/proxy/chyz943/stream',
  },
  {
    id: 'ckia',
    name: 'CKIA',
    streamUrl: 'https://stream2.statsradio.com/8148/stream',
  },
  {
    id: 'ckrl',
    name: 'CKRL',
    streamUrl: 'https://arcq.streamb.live/SB00262',
  },
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
    id: 'kcrw-eclectic24',
    name: 'KCRW Eclectic24',
    streamUrl: 'https://streams.kcrw.com/e24_mp3',
    adapter: 'kcrw-eclectic24',
    adapterConfig: {},
  },
  {
    id: 'kexp',
    name: 'KEXP',
    streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
    adapter: 'kexp',
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
