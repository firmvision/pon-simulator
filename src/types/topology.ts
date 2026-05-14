import type { OLT, ONU, Splitter, ODF, FiberSegment, EndDevice, EthernetLink } from './network';
import type { DBAProfile } from './protocol';

export interface ProjectFile {
  version: '1.0';
  metadata: {
    name: string;
    description: string;
    author: string;
    createdAt: string;
    modifiedAt: string;
  };
  olts: OLT[];
  onus: ONU[];
  splitters: Splitter[];
  odfs: ODF[];
  fibers: FiberSegment[];
  endDevices: EndDevice[];
  ethernetLinks: EthernetLink[];
  dbaProfiles: DBAProfile[];
  viewport: { x: number; y: number; zoom: number };
}
