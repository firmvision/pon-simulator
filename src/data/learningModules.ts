export interface LabObjective {
  id: string;
  text: string;
  checker: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface TheorySection {
  heading: string;
  body: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
}

import { NEW_MODULES } from './newModules';

export interface LearningModule {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  estimatedMinutes: number;
  theory: TheorySection[];
  lab: {
    topologyId: string | null;
    intro: string;
    objectives: LabObjective[];
  };
  quiz: QuizQuestion[];
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'pon-fundamentals',
    title: 'PON Fundamentals',
    icon: '🌐',
    subtitle: 'Architecture, components, and standards',
    estimatedMinutes: 10,
    theory: [
      {
        heading: 'What is a Passive Optical Network?',
        body: 'A PON is a point-to-multipoint fiber access technology where the optical distribution network (ODN) between the OLT and ONUs contains only passive components — no power is required in the field. Optical splitters divide the signal from one feeder fiber into multiple drop fibers serving individual subscribers.',
        bullets: [
          'OLT (Optical Line Terminal): Central Office equipment. Aggregates PON traffic to the core network.',
          'Splitter: Passive 1:N optical coupler. No electricity needed — just glass.',
          'ONU/ONT: Customer Premises Equipment. Converts optical to Ethernet/WiFi for end users.',
          'ODN: Everything between OLT and ONU — feeder, splitters, distribution, and drop cables.',
        ],
      },
      {
        heading: 'PON Standards Comparison',
        body: 'Three generations of PON are in active deployment. Each doubles or quadruples the capacity of its predecessor while sharing the same ODN infrastructure.',
        table: {
          headers: ['Standard', 'Downstream', 'Upstream', 'Down λ', 'Up λ', 'Max ONUs'],
          rows: [
            ['GPON', '2.488 Gbps', '1.244 Gbps', '1490 nm', '1310 nm', '64'],
            ['XG-PON', '9.953 Gbps', '2.488 Gbps', '1577 nm', '1270 nm', '128'],
            ['XGS-PON', '9.953 Gbps', '9.953 Gbps', '1577 nm', '1270 nm', '128'],
          ],
        },
      },
      {
        heading: 'Key Advantage: Shared Infrastructure',
        body: 'The same ODN (splitters and fiber) can be reused across all three generations. An operator can install GPON today and upgrade only the OLT cards and ONU devices to XGS-PON without touching the outside plant — a major CAPEX saving.',
        bullets: [
          'Downstream: OLT broadcasts to all ONUs simultaneously (time-division broadcast)',
          'Upstream: ONUs transmit in assigned time slots (TDMA — no collisions)',
          'Security: AES-128 encryption on downstream to prevent eavesdropping',
        ],
      },
    ],
    lab: {
      topologyId: 'simple-gpon',
      intro: 'In this lab you will load a standard GPON topology and explore the three key components: OLT, optical splitter, and ONUs. No simulation needed yet — just explore the canvas.',
      objectives: [
        { id: 'f-has-olt', text: 'Load the Simple GPON sample topology (toolbar → Simple GPON)', checker: 'has-olt' },
        { id: 'f-has-onu', text: 'Confirm 8 ONUs appear on the canvas (Status bar shows ONUs: 8)', checker: 'has-8-onus' },
        { id: 'f-olt-selected', text: 'Click the blue OLT node to select it and view its properties', checker: 'olt-selected' },
        { id: 'f-onu-selected', text: 'Click any green ONU node to view subscriber properties', checker: 'onu-selected' },
      ],
    },
    quiz: [
      {
        id: 'q1-1',
        question: 'What does "passive" mean in Passive Optical Network?',
        choices: [
          'The network is read-only and cannot be configured',
          'No active electronics (amplifiers, switches) are needed in the ODN',
          'The ONU does not transmit upstream',
          'The OLT is powered off when no traffic flows',
        ],
        answer: 1,
        explanation: 'Passive refers to the optical distribution network (ODN) — all components between OLT and ONU (splitters, fiber, connectors) are purely passive and require no power in the field.',
      },
      {
        id: 'q1-2',
        question: 'What is the maximum downstream capacity of XGS-PON?',
        choices: ['2.488 Gbps', '9.953 Gbps (10G)', '1.244 Gbps', '25 Gbps'],
        answer: 1,
        explanation: 'XGS-PON (ITU-T G.9807.1) provides symmetric 10 Gbps — 9.953 Gbps downstream and 9.953 Gbps upstream, making it ideal for business and next-generation residential services.',
      },
      {
        id: 'q1-3',
        question: 'Which wavelength does GPON use for downstream (OLT → ONU) transmission?',
        choices: ['1310 nm', '1270 nm', '1490 nm', '1577 nm'],
        answer: 2,
        explanation: '1490 nm is the GPON downstream wavelength. 1310 nm is used for GPON upstream. The different wavelengths allow bidirectional transmission on a single fiber using WDM (Wavelength Division Multiplexing).',
      },
    ],
  },

  {
    id: 'onu-registration',
    title: 'ONU Registration',
    icon: '🔌',
    subtitle: 'PLOAM state machine and ranging process',
    estimatedMinutes: 12,
    theory: [
      {
        heading: 'The PLOAM Protocol',
        body: 'PLOAM (Physical Layer Operations, Administration and Maintenance) is an OAM channel embedded in the PON frame. It handles ONU discovery, ranging, serial number exchange, and alarm reporting. The OLT broadcasts PLOAM messages downstream continuously; ONUs respond in assigned upstream windows.',
      },
      {
        heading: 'O-State Machine',
        body: 'Every ONU progresses through a series of standardised states before it can carry subscriber traffic. Watch these states in the Event Log when you start the simulation.',
        table: {
          headers: ['State', 'Name', 'Duration', 'Action / Trigger'],
          rows: [
            ['O1', 'Initial', '—', 'ONU powered on, searching for downstream signal'],
            ['O2', 'Standby', '~200 ms', 'Downstream frame sync acquired; ONU listens for grants'],
            ['O3', 'Serial Number', '~100 ms', 'ONU transmits its serial number in quiet window'],
            ['O4', 'Ranging', '~300 ms', 'OLT measures RTD; assigns EqD and ONU-ID'],
            ['O5', 'Operational', 'Steady', 'OMCI channel up; GEM ports and VLANs provisioned'],
            ['O6', 'POPUP', '—', 'Loss of Signal (LOS) or Loss of Frame (LOF) detected'],
          ],
        },
      },
      {
        heading: 'Why Ranging Matters',
        body: 'ONUs can be anywhere from 0 to 20 km from the OLT. Without synchronisation, each ONU\'s upstream burst would arrive at a different time and collide with others. The OLT measures the round-trip delay (RTD) to each ONU and assigns an Equalization Delay (EqD) so that all upstream bursts arrive at the OLT in their assigned time slot — like a conductor timing each instrument.',
        bullets: [
          'RTD measured during O4 (Ranging) state',
          'EqD compensates for different fiber lengths',
          'TDMA upstream: each ONU transmits in a pre-assigned burst window',
          'ONU-ID: a 2-byte identifier (0–253) assigned during ranging',
        ],
      },
    ],
    lab: {
      topologyId: 'simple-gpon',
      intro: 'Observe the complete ONU registration sequence. Load the topology, then start the simulation and watch the Event Log as each ONU progresses from O1 (dark/grey) to O5 (green) state.',
      objectives: [
        { id: 'r-loaded', text: 'Load the Simple GPON topology', checker: 'has-olt' },
        { id: 'r-started', text: 'Click ▶ Start to begin the simulation', checker: 'sim-running' },
        { id: 'r-events', text: 'Observe state transitions in the Event Log (O1→O2→O3→O4→O5)', checker: 'events-logged' },
        { id: 'r-all-reg', text: 'Wait until all 8 ONUs are registered (Status bar: Registered: 8)', checker: 'all-registered' },
      ],
    },
    quiz: [
      {
        id: 'q2-1',
        question: 'In which state does the OLT measure round-trip delay and assign the ONU-ID?',
        choices: ['O2 — Standby', 'O3 — Serial Number', 'O4 — Ranging', 'O5 — Operational'],
        answer: 2,
        explanation: 'O4 (Ranging) is where the OLT measures RTD, calculates the Equalization Delay (EqD), and assigns the ONU-ID. Only after this can the ONU transmit in its assigned upstream time slot.',
      },
      {
        id: 'q2-2',
        question: 'What causes an ONU to transition from O5 to O6?',
        choices: [
          'The ONU receives too much traffic',
          'Loss of Signal (LOS) or Loss of Frame (LOF)',
          'The ONU-ID changes',
          'A software upgrade is triggered',
        ],
        answer: 1,
        explanation: 'O6 (POPUP) is entered when the ONU detects LOS (Loss of Signal — physical fiber cut or OLT TX off) or LOF (Loss of Frame — sync lost). The OLT raises a critical alarm and attempts automatic restoration.',
      },
      {
        id: 'q2-3',
        question: 'What does EqD (Equalization Delay) achieve in a PON system?',
        choices: [
          'Equalises the optical power level at each ONU',
          'Synchronises upstream burst timing so all ONUs arrive correctly at the OLT',
          'Limits the maximum bandwidth per ONU',
          'Provides encryption key exchange',
        ],
        answer: 1,
        explanation: 'EqD compensates for the different distances between the OLT and each ONU. By adding a precise delay to each ONU\'s upstream transmission, all bursts arrive at the OLT in their assigned time slots, preventing collisions in the TDMA upstream channel.',
      },
    ],
  },

  {
    id: 'optical-budget',
    title: 'Optical Link Budget',
    icon: '📡',
    subtitle: 'Loss sources, margin calculation, and link viability',
    estimatedMinutes: 15,
    theory: [
      {
        heading: 'Link Budget Fundamentals',
        body: 'The optical link budget defines the maximum tolerable signal loss between OLT transmitter and ONU receiver. If total path loss exceeds the budget, the ONU cannot lock and will stay in O1/O2 state.',
        bullets: [
          'Budget (dB) = OLT TX Power (dBm) − ONU RX Sensitivity (dBm)',
          'GPON Class B+: TX = +1.5 to +5 dBm, RX sensitivity = −28 dBm → ~29–33 dB budget',
          'Margin = RX Power − RX Sensitivity; minimum recommended: 3 dB',
          'RX Power (dBm) = TX Power (dBm) − Total Path Loss (dB)',
        ],
      },
      {
        heading: 'Loss Sources in the ODN',
        body: 'Every component in the optical path introduces loss. Engineers must sum all contributions and ensure the total stays within the link budget with adequate margin.',
        table: {
          headers: ['Component', 'Typical Loss', 'Notes'],
          rows: [
            ['Fiber @ 1310 nm (upstream)', '0.35 dB/km', 'Used for GPON/XG-PON upstream'],
            ['Fiber @ 1490/1577 nm (downstream)', '0.22 dB/km', 'Lower attenuation at longer wavelengths'],
            ['Connector (SC/APC, SC/UPC)', '0.3–0.5 dB each', 'Each mated pair counts as 2 connectors'],
            ['Fusion splice', '0.05–0.1 dB each', 'Lower loss than mechanical connectors'],
            ['1:2 Splitter', '3.7 dB', 'Includes excess loss'],
            ['1:4 Splitter', '7.2 dB', ''],
            ['1:8 Splitter', '10.7 dB', 'Most common GPON ratio'],
            ['1:16 Splitter', '13.8 dB', ''],
            ['1:32 Splitter', '17.2 dB', 'Maximum for Class B+ on GPON'],
            ['1:64 Splitter', '20.8 dB', 'Requires Class C+ or XGS-PON'],
          ],
        },
      },
      {
        heading: 'Fiber Edge Colors in This Simulator',
        body: 'After starting the simulation, the engine traces the ODN path from each OLT port to each ONU and computes the full path loss. The ONU\'s drop fiber is color-coded by the overall link margin.',
        bullets: [
          '🟢 Green: Margin > 3 dB — healthy link, well within budget',
          '🟡 Amber: Margin 0–3 dB — marginal link, monitor for degradation',
          '🔴 Red: Margin < 0 dB — over budget, link will not reliably register',
        ],
      },
    ],
    lab: {
      topologyId: 'budget-challenge',
      intro: 'Load the Link Budget Challenge topology. It uses a 1:32 splitter with a long feeder fiber. Some ONUs have short drop cables (green) and others have very long drop cables (amber/red) to illustrate budget stress. Start the simulation and switch to the Power Budget tab.',
      objectives: [
        { id: 'b-loaded', text: 'Load the "Budget Challenge" topology (toolbar)', checker: 'has-olt' },
        { id: 'b-started', text: 'Start the simulation and wait for ONU registration', checker: 'any-registered' },
        { id: 'b-marginal', text: 'Observe amber/red fiber edges — at least one ONU has marginal budget', checker: 'marginal-budget' },
        { id: 'b-onu-sel', text: 'Click an ONU with amber or red coloring', checker: 'onu-selected' },
        { id: 'b-powerbudget', text: 'Switch to the Power Budget tab (bottom panel)', checker: 'power-budget-open' },
      ],
    },
    quiz: [
      {
        id: 'q3-1',
        question: 'If OLT TX power is +3 dBm, total path loss is 26 dB, and ONU RX sensitivity is −28 dBm, what is the link margin?',
        choices: ['5 dB (healthy)', '3 dB (marginal)', '−1 dB (over budget)', '28 dB'],
        answer: 0,
        explanation: 'RX Power = 3 − 26 = −23 dBm. Margin = −23 − (−28) = +5 dB. This is a healthy link with 5 dB of headroom above the minimum 3 dB recommended margin.',
      },
      {
        id: 'q3-2',
        question: 'A 1:32 passive splitter introduces approximately how much signal loss?',
        choices: ['10.7 dB', '13.8 dB', '17.2 dB', '20.8 dB'],
        answer: 2,
        explanation: 'A 1:32 splitter introduces 17.2 dB of insertion loss. This is because splitting into 32 paths means each path receives 1/32 of the original power: 10·log₁₀(32) ≈ 15 dB theoretical + ~2.2 dB excess loss = 17.2 dB.',
      },
      {
        id: 'q3-3',
        question: 'Why is fiber attenuation lower at 1490 nm than at 1310 nm?',
        choices: [
          'Because 1490 nm lasers are more powerful',
          'Rayleigh scattering decreases with longer wavelengths; silica fiber has lower loss at 1490–1550 nm',
          'The 1310 nm channel carries more data so it uses more power',
          'Connectors are better tuned to 1490 nm',
        ],
        answer: 1,
        explanation: 'Silica glass fiber has a characteristic loss curve: Rayleigh scattering (dominant below 1000 nm) decreases with wavelength⁴, giving lower attenuation at 1490–1577 nm (0.2–0.25 dB/km) vs 1310 nm (0.35 dB/km). This is why downstream (1490 nm) reaches further than upstream (1310 nm).',
      },
    ],
  },

  {
    id: 'dba-bandwidth',
    title: 'Dynamic Bandwidth Allocation',
    icon: '📊',
    subtitle: 'T-CONT types, DBA algorithm, and upstream scheduling',
    estimatedMinutes: 15,
    theory: [
      {
        heading: 'Why DBA Is Needed',
        body: 'All ONUs on a single PON port share the same upstream channel. GPON upstream capacity is 1.244 Gbps shared by up to 64 ONUs. Without dynamic scheduling, each ONU would be allocated a fixed 1/N time slot regardless of whether it has data to send — a massive waste when traffic is bursty (which it almost always is).',
        bullets: [
          'DBA reallocates bandwidth every 125 μs (one GPON upstream frame)',
          'ONUs report their queue occupancy via Status Reports (SR-DBA)',
          'OLT responds with grants specifying when and how much each ONU may transmit',
          'Statistical multiplexing gain: typically 2–5× effective capacity improvement',
        ],
      },
      {
        heading: 'T-CONT Types',
        body: 'Traffic Containers (T-CONTs) are the unit of bandwidth allocation. Each ONU can have multiple T-CONTs, each with a different bandwidth class, allowing services with different QoS requirements to coexist.',
        table: {
          headers: ['Type', 'Name', 'Guarantee', 'Best For'],
          rows: [
            ['1', 'Fixed', 'Fixed bandwidth, always allocated', 'Leased lines, TDM emulation, VoIP CBR'],
            ['2', 'Assured', 'Minimum guaranteed + may use excess', 'VoIP, low-latency services'],
            ['3', 'Non-Assured', 'Assured min + best-effort beyond', 'Video streaming, IPTV'],
            ['4', 'Best-Effort', 'No guarantee — gets remaining capacity', 'HSI, web browsing'],
            ['5', 'Mixed', 'Combines Type 1+2+3+4 in one T-CONT', 'Complex multi-service ONUs'],
          ],
        },
      },
      {
        heading: '3-Pass DBA Algorithm',
        body: 'This simulator implements a simplified version of the ITU-T SR-DBA algorithm. In each 125 μs frame, three passes are made over the ONU list:',
        bullets: [
          'Pass 1 — Fixed (Type 1): Every Type 1 T-CONT receives its full fixed allocation regardless of queue depth',
          'Pass 2 — Assured (Type 2/3): Each T-CONT receives its minimum assured rate; excess is distributed proportionally to queue reports',
          'Pass 3 — Best-Effort (Type 4): Remaining frame capacity is split among all active Type 4 T-CONTs weighted by queue depth',
          'Result: Each ONU gets a GTC grant specifying its upstream burst start time and size',
        ],
      },
    ],
    lab: {
      topologyId: 'xgspon-enterprise',
      intro: 'Load the XGS-PON Enterprise topology. It has 16 ONUs each with a Type 1 (fixed 50 Mbps) T-CONT and a Type 4 (best-effort up to 500 Mbps) T-CONT — a realistic mixed-service configuration. Start the simulation and observe the Bandwidth chart.',
      objectives: [
        { id: 'd-loaded', text: 'Load the XGS-PON Enterprise topology', checker: 'standard-xgspon' },
        { id: 'd-started', text: 'Start the simulation', checker: 'sim-running' },
        { id: 'd-registered', text: 'Wait for ONUs to register (Registered: 16)', checker: 'any-registered' },
        { id: 'd-bandwidth', text: 'Switch to the Bandwidth tab in the bottom panel', checker: 'bandwidth-open' },
        { id: 'd-terminal', text: 'Run "display dba-profile all" in the Terminal', checker: 'terminal-dba' },
      ],
    },
    quiz: [
      {
        id: 'q4-1',
        question: 'Which T-CONT type is most suitable for a VoIP service requiring guaranteed 64 kbps with constant bit rate?',
        choices: ['Type 4 (Best-Effort)', 'Type 1 (Fixed)', 'Type 3 (Non-Assured)', 'Type 2 (Assured)'],
        answer: 1,
        explanation: 'VoIP with CBR (Constant Bit Rate) requires Type 1 (Fixed) T-CONT. It allocates a fixed bandwidth every frame regardless of queue depth — this guarantees low latency and jitter-free voice delivery.',
      },
      {
        id: 'q4-2',
        question: 'How often does the DBA algorithm run in a GPON system?',
        choices: ['Every 1 ms', 'Every 125 μs (one frame)', 'Every 10 ms', 'Every 1 second'],
        answer: 1,
        explanation: 'The GPON frame period is 125 μs (8000 frames per second). DBA runs once per frame, allowing very rapid reallocation of upstream bandwidth to match instantaneous traffic demand from each ONU.',
      },
      {
        id: 'q4-3',
        question: 'What is statistical multiplexing gain in a PON system?',
        choices: [
          'The optical power gain from the splitter',
          'The encryption overhead reduction',
          'The effective capacity increase when bursty users share bandwidth dynamically',
          'The latency reduction from shorter fiber runs',
        ],
        answer: 2,
        explanation: 'Statistical multiplexing gain occurs because not all users are active simultaneously. With DBA, a 1.244 Gbps upstream channel shared by 64 ONUs can effectively deliver more total throughput than if each ONU had a fixed 19 Mbps slice — because idle capacity is redistributed to active users in real time.',
      },
    ],
  },

  {
    id: 'service-config',
    title: 'Service Configuration',
    icon: '⚙️',
    subtitle: 'GEM ports, VLAN stacking, and CLI provisioning',
    estimatedMinutes: 12,
    theory: [
      {
        heading: 'GEM Port Architecture',
        body: 'GEM (GPON Encapsulation Method) is the transport container that carries subscriber traffic over the PON. GEM ports are one-way logical channels identified by a GEM Port-ID (12-bit value, 0–4094). Each T-CONT contains one or more GEM ports, and each GEM port carries one service type.',
        bullets: [
          'GEM Port-ID: identifies the logical channel (like a VLAN on Ethernet)',
          'Each ONU can have multiple GEM ports: HSI, VoIP, IPTV, management',
          'GEM ports map to T-CONTs for upstream QoS scheduling',
          'GEM encapsulates Ethernet frames with a 5-byte header (PTI, Port-ID, PLI)',
        ],
      },
      {
        heading: 'VLAN Stacking (QinQ)',
        body: 'FTTH networks use double-tagging (802.1ad QinQ) to separate subscriber traffic. The outer S-VLAN (Service VLAN) identifies the service type or geographic region; the inner C-VLAN (Customer VLAN) identifies the individual subscriber.',
        table: {
          headers: ['VLAN Type', 'Tag Position', 'Assigned By', 'Example'],
          rows: [
            ['S-VLAN', 'Outer (provider)', 'OLT operator', 'S-VLAN 100 = all HSI on PON port 0'],
            ['C-VLAN', 'Inner (customer)', 'Subscriber/CPE', 'C-VLAN 1–64 per subscriber'],
          ],
        },
        bullets: [
          'HSI (High-Speed Internet): S-VLAN 100, C-VLAN per subscriber',
          'VoIP: S-VLAN 200, dedicated GEM port for low-latency voice traffic',
          'IPTV: S-VLAN 300, multicast GEM port with IGMP snooping',
        ],
      },
      {
        heading: 'Huawei MA5800 CLI Reference',
        body: 'The Huawei MA5800 series is the industry-standard GPON OLT. This simulator implements a compatible CLI subset for provisioning and diagnostics.',
        table: {
          headers: ['Command', 'Function'],
          rows: [
            ['display ont info 0 0', 'List all ONUs on frame 0, slot 0'],
            ['display ont optical-info 0 0 0', 'Show RX/TX power for ONU index 0'],
            ['display ont register-info 0 0', 'Show registration state history'],
            ['display alarm active', 'List all active alarms'],
            ['display dba-profile all', 'List all DBA profiles'],
            ['display service-port all', 'List all service VLAN mappings'],
            ['ont add 0 0 sn-auth "HWTCXXXXXX"', 'Provision ONU by serial number'],
            ['display version', 'Show OLT software version'],
          ],
        },
      },
    ],
    lab: {
      topologyId: 'simple-gpon',
      intro: 'In this lab you will explore service configuration on a GPON ONU. You will inspect VLAN and GEM port assignments in the Properties panel, then use the CLI terminal to run provisioning and diagnostic commands.',
      objectives: [
        { id: 's-loaded', text: 'Load the Simple GPON topology', checker: 'has-olt' },
        { id: 's-onu-sel', text: 'Click an ONU and review its VLAN tab in Properties', checker: 'onu-selected' },
        { id: 's-term-ont', text: 'Run "display ont info 0 0" in the Terminal tab', checker: 'terminal-ont-info' },
        { id: 's-term-svc', text: 'Run "display service-port all" in the Terminal', checker: 'terminal-service-port' },
      ],
    },
    quiz: [
      {
        id: 'q5-1',
        question: 'What does GEM stand for in GPON?',
        choices: [
          'Generic Ethernet Method',
          'GPON Encapsulation Method',
          'Gigabit Encapsulation Mode',
          'GPON Exchange Mechanism',
        ],
        answer: 1,
        explanation: 'GEM stands for GPON Encapsulation Method. It is the data-link layer protocol used in GPON to encapsulate Ethernet frames (and other traffic types) for transport over the PON upstream and downstream channels.',
      },
      {
        id: 'q5-2',
        question: 'In a QinQ VLAN setup, which VLAN tag is assigned by the service provider\'s OLT?',
        choices: ['C-VLAN (inner tag)', 'S-VLAN (outer tag)', 'Both tags are assigned by the OLT', 'Neither — VLANs are assigned by the subscriber router'],
        answer: 1,
        explanation: 'The S-VLAN (Service VLAN) is the outer 802.1ad tag assigned by the OLT operator to identify service types or regions. The C-VLAN (Customer VLAN) is the inner 802.1q tag from the subscriber\'s premises equipment.',
      },
      {
        id: 'q5-3',
        question: 'A single ONU has HSI, VoIP, and IPTV services. What is the minimum number of GEM ports needed?',
        choices: ['1 — all services can share one GEM port', '2 — one for data, one for voice/video', '3 — one dedicated GEM port per service type', '6 — upstream and downstream for each service'],
        answer: 2,
        explanation: 'Each service type requires its own GEM port to enable separate QoS treatment: HSI on a best-effort GEM port (Type 4 T-CONT), VoIP on a low-latency GEM port (Type 1 T-CONT), and IPTV on a multicast-capable GEM port. This allows the OLT to apply appropriate DBA policies per service.',
      },
    ],
  },
  ...NEW_MODULES,
];
