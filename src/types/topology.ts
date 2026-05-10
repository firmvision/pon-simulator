import type { OLT, ONU, Splitter, ODF, FiberSegment } from './network';
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
  dbaProfiles: DBAProfile[];
  viewport: { x: number; y: number; zoom: number };
}
