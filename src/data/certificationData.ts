export type CertDomain =
  | 'FTTx Architectures'
  | 'PON Technology'
  | 'Components & Equipment'
  | 'Network Design & Planning'
  | 'Installation Practices'
  | 'Testing & Troubleshooting';

export interface CertQuestion {
  id: string;
  domain: CertDomain;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyTopic {
  title: string;
  body: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  keyTerms?: { term: string; definition: string }[];
}

export interface CertStudyDomain {
  domain: CertDomain;
  icon: string;
  color: string;
  overview: string;
  topics: StudyTopic[];
}

export const CERT_QUESTIONS: CertQuestion[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 1 — FTTx Architectures (cq-001 to cq-015)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-001',
    domain: 'FTTx Architectures',
    question: 'What does the acronym "FTTH" stand for?',
    choices: [
      'Fiber To The Hub',
      'Fiber To The Home',
      'Fiber To The Headend',
      'Fiber To The Host',
    ],
    answer: 1,
    explanation:
      'FTTH stands for Fiber To The Home, meaning the optical fiber runs all the way to the individual residential unit. This distinguishes it from variants that terminate the fiber at a node, cabinet, or building.',
    difficulty: 'easy',
  },
  {
    id: 'cq-002',
    domain: 'FTTx Architectures',
    question:
      'In an FTTB (Fiber To The Building) deployment, where does the optical fiber terminate?',
    choices: [
      'At the individual subscriber\'s wall outlet',
      'At the street-level distribution cabinet',
      'At the basement or equipment room of a multi-tenant building',
      'At the central office exclusively',
    ],
    answer: 2,
    explanation:
      'FTTB brings fiber to a termination point inside the building (typically a basement MDF or equipment room). The final connection to each unit is then made over copper or coaxial cable running through the building\'s internal wiring.',
    difficulty: 'easy',
  },
  {
    id: 'cq-003',
    domain: 'FTTx Architectures',
    question:
      'Which FTTx variant terminates the fiber at a street-side cabinet and uses copper DSL for the final drop to the subscriber?',
    choices: ['FTTH', 'FTTB', 'FTTC', 'FTTP'],
    answer: 2,
    explanation:
      'FTTC (Fiber To The Curb/Cabinet) places the fiber at a street cabinet typically 200–300 m from the subscriber, with VDSL2 or G.fast running over the existing copper pair for the final segment.',
    difficulty: 'easy',
  },
  {
    id: 'cq-004',
    domain: 'FTTx Architectures',
    question:
      'What is the key technical difference between a Point-to-Point (P2P) optical network and a Point-to-Multipoint (PON) architecture?',
    choices: [
      'P2P uses passive splitters; PON uses active switches',
      'P2P provides a dedicated fiber from OLT to each subscriber; PON shares a single fiber from the OLT among multiple subscribers via passive splitters',
      'PON is always faster than P2P',
      'P2P cannot carry voice traffic; PON can',
    ],
    answer: 1,
    explanation:
      'In a P2P architecture each subscriber has an individual dedicated fiber from the central office, whereas a PON uses passive optical splitters to share one feeder fiber among many ONUs/ONTs, reducing fiber and port costs.',
    difficulty: 'easy',
  },
  {
    id: 'cq-005',
    domain: 'FTTx Architectures',
    question:
      'What distinguishes an Active Optical Network (AON) from a Passive Optical Network (PON)?',
    choices: [
      'AON uses single-mode fiber; PON uses multimode fiber',
      'AON contains active electrically-powered switching elements in the outside plant; PON uses only passive optical components between OLT and subscribers',
      'AON supports higher bandwidth than PON',
      'PON requires more fiber than AON',
    ],
    answer: 1,
    explanation:
      'An AON places powered active equipment (switches, media converters) in the outside plant distribution network. A PON relies solely on passive optical splitters between the OLT and ONUs, eliminating outside-plant power requirements and reducing maintenance.',
    difficulty: 'medium',
  },
  {
    id: 'cq-006',
    domain: 'FTTx Architectures',
    question:
      'A typical FTTC deployment uses VDSL2 copper in the last segment. Approximately how far from the subscriber is the fiber-terminating street cabinet usually located?',
    choices: [
      '50–100 m',
      '200–300 m',
      '1–2 km',
      '5–10 km',
    ],
    answer: 1,
    explanation:
      'FTTC cabinets are typically sited 200–300 m from the subscriber to keep copper-loop lengths short enough for VDSL2 to deliver broadband speeds above 50 Mbps.',
    difficulty: 'medium',
  },
  {
    id: 'cq-007',
    domain: 'FTTx Architectures',
    question:
      'Which FTTx variant is considered the most future-proof and capable of delivering symmetric gigabit services without requiring copper upgrades?',
    choices: ['FTTN', 'FTTC', 'FTTB', 'FTTH'],
    answer: 3,
    explanation:
      'FTTH delivers fiber all the way to the subscriber\'s premises, providing unlimited upgrade potential by simply replacing the active electronics (OLT/ONT) rather than the physical plant. All other FTTx variants still rely on copper for the last drop, which inherently limits bandwidth and distance.',
    difficulty: 'easy',
  },
  {
    id: 'cq-008',
    domain: 'FTTx Architectures',
    question:
      'In the context of FTTx deployment, what does the term "last mile" refer to?',
    choices: [
      'The backbone fiber connecting two central offices',
      'The final segment of the network connecting the service provider\'s distribution point to the subscriber\'s premises',
      'The internal wiring inside the subscriber\'s home',
      'The overseas submarine cable segment',
    ],
    answer: 1,
    explanation:
      'The "last mile" (or last kilometer) describes the telecommunications link between a provider\'s distribution point and the end user. It is often the most expensive and challenging segment to deploy, regardless of whether it uses fiber, copper, or coax.',
    difficulty: 'easy',
  },
  {
    id: 'cq-009',
    domain: 'FTTx Architectures',
    question:
      'Which FTTx architecture is most commonly used in Multi-Dwelling Unit (MDU) buildings such as apartment complexes?',
    choices: ['FTTN', 'FTTC', 'FTTB', 'FTTH P2P only'],
    answer: 2,
    explanation:
      'FTTB (Fiber To The Building) is the standard MDU approach: fiber is brought to the building\'s equipment room, and in-building wiring (copper, coax, or Ethernet) is used for individual unit distribution. FTTH is also used but requires in-building fiber to each unit.',
    difficulty: 'medium',
  },
  {
    id: 'cq-010',
    domain: 'FTTx Architectures',
    question:
      'What does FTTN stand for, and how does it differ from FTTC?',
    choices: [
      'Fiber To The Node; the cabinet is located further from the subscriber (up to 1.5 km), making it less capable than FTTC',
      'Fiber To The Network; it uses a different protocol from FTTC',
      'Fiber To The Neighborhood; it is identical to FTTC',
      'Fiber To The Node; the cabinet is closer to the subscriber than FTTC',
    ],
    answer: 0,
    explanation:
      'FTTN places the fiber termination node further from subscribers (up to ~1.5 km) compared to FTTC (~200–300 m). The longer copper loop in FTTN limits achievable speeds more than FTTC.',
    difficulty: 'medium',
  },
  {
    id: 'cq-011',
    domain: 'FTTx Architectures',
    question:
      'An operator plans to deploy FTTH in a dense urban area with 200 homes per km². Which architecture is most bandwidth-efficient?',
    choices: [
      'P2P dedicated fiber to each home',
      'GPON PON sharing a 1:32 split ratio',
      'FTTC with VDSL2',
      'HFC coaxial overlay',
    ],
    answer: 1,
    explanation:
      'GPON with a 1:32 split ratio allows one OLT port to serve 32 subscribers over shared feeder fiber, maximizing fiber and port utilization in dense deployments. P2P would require 32× more OLT ports and feeder fibers.',
    difficulty: 'medium',
  },
  {
    id: 'cq-012',
    domain: 'FTTx Architectures',
    question:
      'In an SDU (Single-Dwelling Unit) FTTH deployment, the ONT is typically installed:',
    choices: [
      'On a pole outside the home',
      'Inside the subscriber\'s premises, usually at the network interface point',
      'At the street-side distribution cabinet',
      'At the central office',
    ],
    answer: 1,
    explanation:
      'In an SDU FTTH deployment, the ONT is installed inside the home at the network interface point (NID), converting optical signals to Ethernet/VoIP/RF for in-home distribution. This places the optical-to-electrical conversion at the customer premise.',
    difficulty: 'easy',
  },
  {
    id: 'cq-013',
    domain: 'FTTx Architectures',
    question:
      'Which right-of-way consideration is most critical when deploying FTTH in a municipality?',
    choices: [
      'Selecting the correct fiber wavelength',
      'Obtaining permits and easements before trenching or aerial attachment',
      'Choosing between SC/APC and SC/UPC connectors',
      'Selecting splitter ratios',
    ],
    answer: 1,
    explanation:
      'Permits, easements, and right-of-way agreements from municipalities, railroads, utilities, or private landowners must be secured before any outside plant work begins. Failure to do so can result in costly project delays or required removal of installed infrastructure.',
    difficulty: 'medium',
  },
  {
    id: 'cq-014',
    domain: 'FTTx Architectures',
    question:
      'FTTP (Fiber To The Premises) is best described as:',
    choices: [
      'A technology exclusively for enterprise customers',
      'A generic term encompassing both FTTH and FTTB, meaning fiber reaches the subscriber\'s premises boundary',
      'A variant that uses wireless for the last 100 m',
      'Identical to FTTC',
    ],
    answer: 1,
    explanation:
      'FTTP is an umbrella term covering any deployment where fiber physically reaches the subscriber\'s premises boundary, including both FTTH (to the individual home) and FTTB (to the building boundary). It is used interchangeably with FTTH in many ITU and FCC documents.',
    difficulty: 'easy',
  },
  {
    id: 'cq-015',
    domain: 'FTTx Architectures',
    question:
      'Why is FTTH architecturally superior to FTTB for future bandwidth upgrades?',
    choices: [
      'FTTH uses cheaper connectors',
      'FTTH eliminates the in-building copper bottleneck, allowing capacity increases by upgrading only the active electronics (OLT/ONT)',
      'FTTH requires fewer splitters',
      'FTTH operates at a longer wavelength',
    ],
    answer: 1,
    explanation:
      'FTTH removes the copper in-building segment entirely, so operators can double or quadruple subscriber capacity simply by upgrading OLT cards and ONTs (e.g., GPON → XGS-PON) without touching the fiber plant. FTTB is constrained by whatever copper technology is used in the building.',
    difficulty: 'medium',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 2 — PON Technology (cq-016 to cq-040)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-016',
    domain: 'PON Technology',
    question: 'What are the downstream and upstream line rates for GPON as defined by ITU-T G.984?',
    choices: [
      'DS 1.25 Gbps / US 1.25 Gbps',
      'DS 2.488 Gbps / US 1.244 Gbps',
      'DS 10 Gbps / US 2.5 Gbps',
      'DS 10 Gbps / US 10 Gbps',
    ],
    answer: 1,
    explanation:
      'ITU-T G.984 GPON specifies a downstream rate of 2.488 Gbps and an upstream rate of 1.244 Gbps. This asymmetric design reflects the typical dominance of downstream traffic in residential broadband.',
    difficulty: 'easy',
  },
  {
    id: 'cq-017',
    domain: 'PON Technology',
    question: 'EPON, defined by IEEE 802.3ah, operates at which line rate?',
    choices: [
      'DS 2.488 Gbps / US 1.244 Gbps',
      'DS 1.25 Gbps / US 622 Mbps',
      'Symmetric 1.25 Gbps in both directions',
      'Symmetric 10 Gbps in both directions',
    ],
    answer: 2,
    explanation:
      'IEEE 802.3ah EPON uses a symmetric 1.25 Gbps rate in both downstream and upstream directions, leveraging standard Ethernet framing rather than the ATM/GEM framing used by GPON.',
    difficulty: 'easy',
  },
  {
    id: 'cq-018',
    domain: 'PON Technology',
    question:
      'What downstream wavelength does GPON use for data transmission?',
    choices: ['1310 nm', '1490 nm', '1550 nm', '1577 nm'],
    answer: 1,
    explanation:
      'GPON uses 1490 nm for the downstream (OLT to ONU) direction. The 1310 nm wavelength is reserved for upstream, and 1550 nm is used for optional RF video overlay.',
    difficulty: 'easy',
  },
  {
    id: 'cq-019',
    domain: 'PON Technology',
    question:
      'What upstream wavelength does GPON use?',
    choices: ['1490 nm', '1310 nm', '1550 nm', '1270 nm'],
    answer: 1,
    explanation:
      'GPON upstream transmission (ONU to OLT) uses the 1310 nm wavelength window. This WDM separation from the 1490 nm downstream allows full-duplex operation on a single fiber.',
    difficulty: 'easy',
  },
  {
    id: 'cq-020',
    domain: 'PON Technology',
    question:
      'XGS-PON (ITU-T G.9807.1) provides which line rates?',
    choices: [
      'DS 2.488 Gbps / US 1.244 Gbps',
      'DS 10 Gbps / US 2.5 Gbps',
      'DS 10 Gbps / US 10 Gbps',
      'DS 25 Gbps / US 25 Gbps',
    ],
    answer: 2,
    explanation:
      'XGS-PON delivers symmetric 10 Gbps in both downstream and upstream directions. Its downstream uses 1577 nm and upstream uses 1270 nm, allowing wavelength coexistence with GPON on the same ODN.',
    difficulty: 'medium',
  },
  {
    id: 'cq-021',
    domain: 'PON Technology',
    question:
      'XG-PON1 (ITU-T G.987) provides which downstream and upstream rates?',
    choices: [
      'DS 10 Gbps / US 10 Gbps',
      'DS 10 Gbps / US 2.5 Gbps',
      'DS 2.488 Gbps / US 2.488 Gbps',
      'DS 1.25 Gbps / US 1.25 Gbps',
    ],
    answer: 1,
    explanation:
      'XG-PON1 (also called 10G-PON) provides 10 Gbps downstream and 2.5 Gbps upstream. It is asymmetric, unlike the fully symmetric XGS-PON.',
    difficulty: 'medium',
  },
  {
    id: 'cq-022',
    domain: 'PON Technology',
    question:
      'What is the typical insertion loss for a 1:32 PLC optical splitter?',
    choices: ['10.7 dB', '13.8 dB', '17.2 dB', '20.8 dB'],
    answer: 2,
    explanation:
      'A 1:32 PLC splitter has approximately 17.2 dB of insertion loss. Each doubling of the split ratio adds approximately 3.4–3.5 dB: 1:2 ≈ 3.7 dB, 1:4 ≈ 7.2 dB, 1:8 ≈ 10.7 dB, 1:16 ≈ 13.8 dB, 1:32 ≈ 17.2 dB.',
    difficulty: 'medium',
  },
  {
    id: 'cq-023',
    domain: 'PON Technology',
    question:
      'What is the insertion loss of a 1:64 PLC optical splitter?',
    choices: ['17.2 dB', '20.8 dB', '24.0 dB', '13.8 dB'],
    answer: 1,
    explanation:
      'A 1:64 PLC splitter has approximately 20.8 dB of insertion loss. This is one of the largest splitters used in GPON ODNs and consumes most of the 28 dB class B+ link budget.',
    difficulty: 'medium',
  },
  {
    id: 'cq-024',
    domain: 'PON Technology',
    question:
      'What is the maximum logical reach (fiber distance) for GPON Class B+?',
    choices: ['10 km', '20 km', '40 km', '60 km'],
    answer: 1,
    explanation:
      'GPON Class B+ supports a maximum logical reach (maximum fiber distance from OLT to the farthest ONU) of 20 km. The differential reach (difference between nearest and farthest ONU) is also up to 20 km.',
    difficulty: 'medium',
  },
  {
    id: 'cq-025',
    domain: 'PON Technology',
    question:
      'What is the maximum number of ONUs supported per GPON OLT port?',
    choices: ['32', '64', '128', '256'],
    answer: 1,
    explanation:
      'The GPON standard (ITU-T G.984) supports up to 64 ONUs per PON port. While XGS-PON supports up to 128, GPON is specified for a maximum of 64 logical connections per OLT port.',
    difficulty: 'medium',
  },
  {
    id: 'cq-026',
    domain: 'PON Technology',
    question:
      'What upstream multiplexing method does GPON use to prevent ONU transmissions from colliding on the shared fiber?',
    choices: [
      'CSMA/CD (Carrier Sense Multiple Access with Collision Detection)',
      'FDMA (Frequency Division Multiple Access)',
      'TDMA (Time Division Multiple Access)',
      'CDMA (Code Division Multiple Access)',
    ],
    answer: 2,
    explanation:
      'GPON upstream uses TDMA, where the OLT assigns each ONU a specific time slot (transmission window) in which to burst. This prevents collisions because only one ONU transmits at any given moment.',
    difficulty: 'easy',
  },
  {
    id: 'cq-027',
    domain: 'PON Technology',
    question:
      'What is the purpose of the Equalization Delay (EqD) in GPON ranging?',
    choices: [
      'To equalize optical power levels from all ONUs',
      'To compensate for different fiber distances so that all ONU upstream bursts arrive at the OLT with equal logical timing',
      'To balance downstream traffic across GEM ports',
      'To synchronize the OLT clock with GPS',
    ],
    answer: 1,
    explanation:
      'The OLT measures the round-trip delay (RTD) to each ONU and assigns an Equalization Delay (EqD) value. Each ONU adds this delay before transmitting, ensuring all upstream bursts arrive at the OLT as if all ONUs were equidistant.',
    difficulty: 'hard',
  },
  {
    id: 'cq-028',
    domain: 'PON Technology',
    question:
      'What does GEM stand for in GPON, and what is its primary function?',
    choices: [
      'GPON Ethernet Module; it converts Ethernet frames to ATM cells',
      'GPON Encapsulation Method; it encapsulates subscriber traffic (Ethernet, TDM, etc.) into GEM frames for transport across the PON',
      'Generalized Expansion Module; it extends GPON reach beyond 20 km',
      'GigE Ethernet Multiplexer; it aggregates multiple 1G ports onto one 10G uplink',
    ],
    answer: 1,
    explanation:
      'GEM (GPON Encapsulation Method) is the GPON native framing format that encapsulates any type of client traffic (Ethernet, TDM, OMCI) into GEM frames. Each GEM port is identified by a Port-ID and mapped to a T-CONT for upstream QoS.',
    difficulty: 'hard',
  },
  {
    id: 'cq-029',
    domain: 'PON Technology',
    question:
      'Which T-CONT type in GPON is most appropriate for voice (VoIP) traffic that requires guaranteed, fixed bandwidth with minimal jitter?',
    choices: ['T-CONT Type 1', 'T-CONT Type 3', 'T-CONT Type 4', 'T-CONT Type 5'],
    answer: 0,
    explanation:
      'T-CONT Type 1 provides fixed bandwidth allocation with no variation, making it ideal for constant bit-rate services like TDM voice and leased-line emulation where guaranteed bandwidth and bounded jitter are critical.',
    difficulty: 'hard',
  },
  {
    id: 'cq-030',
    domain: 'PON Technology',
    question:
      'What is DBA (Dynamic Bandwidth Allocation) in GPON?',
    choices: [
      'A method for statically pre-assigning fixed bandwidth to each ONU at provisioning time',
      'A mechanism by which the OLT dynamically adjusts upstream bandwidth grants to ONUs based on their actual traffic demand, enabling statistical multiplexing',
      'A wavelength assignment algorithm for WDM-PON',
      'A diagnostic process for measuring fiber attenuation',
    ],
    answer: 1,
    explanation:
      'DBA allows the OLT to grant upstream time slots to ONUs in proportion to their real-time buffer status reports, enabling statistical multiplexing. This improves overall PON efficiency when not all ONUs are simultaneously at full load.',
    difficulty: 'medium',
  },
  {
    id: 'cq-031',
    domain: 'PON Technology',
    question:
      'What is OMCI, and what is its role in GPON?',
    choices: [
      'Optical Media Conversion Interface; connects fiber to copper',
      'ONU Management and Control Interface; allows the OLT to remotely configure, manage, and monitor ONUs over the PON',
      'Optical Multiplexing and Channel Interface; manages WDM channels',
      'OLT Module Configuration Index; tracks OLT hardware inventory',
    ],
    answer: 1,
    explanation:
      'OMCI (ONU Management and Control Interface) is defined in ITU-T G.988 and provides a standardized channel over the GPON for the OLT to remotely configure services, manage VLANs, provision QoS, and perform alarm management on connected ONUs.',
    difficulty: 'hard',
  },
  {
    id: 'cq-032',
    domain: 'PON Technology',
    question:
      'What is the optical power budget for GPON Class B+?',
    choices: ['20 dB', '24 dB', '28 dB', '35 dB'],
    answer: 2,
    explanation:
      'GPON Class B+ specifies a 28 dB maximum optical power budget between the OLT transmitter and ONU receiver. This budget must cover all fiber loss, connector loss, splice loss, and splitter insertion loss in the ODN.',
    difficulty: 'medium',
  },
  {
    id: 'cq-033',
    domain: 'PON Technology',
    question:
      'Which wavelength is used for optional RF video (CATV) overlay on a GPON network?',
    choices: ['1310 nm', '1490 nm', '1550 nm', '1577 nm'],
    answer: 2,
    explanation:
      'RF video overlay uses 1550 nm, which coexists with GPON data (1490 nm DS / 1310 nm US) on the same fiber using WDM. A WDM diplexer/triplexer in the ONT separates the three wavelengths.',
    difficulty: 'medium',
  },
  {
    id: 'cq-034',
    domain: 'PON Technology',
    question:
      'What type of splitter provides the most uniform split ratio across all wavelengths and is the preferred technology for PON deployments?',
    choices: [
      'FBT (Fused Biconical Taper) splitter',
      'PLC (Planar Lightwave Circuit) splitter',
      'Prism splitter',
      'Grating coupler',
    ],
    answer: 1,
    explanation:
      'PLC splitters use photolithographic waveguide fabrication to achieve a uniform split across a wide wavelength range (1260–1650 nm) with low polarization-dependent loss. They are more compact and consistent than FBT splitters, especially at high split ratios.',
    difficulty: 'medium',
  },
  {
    id: 'cq-035',
    domain: 'PON Technology',
    question:
      'What is a limitation of FBT (Fused Biconical Taper) splitters compared to PLC splitters?',
    choices: [
      'FBT splitters cannot be used in outdoor enclosures',
      'FBT splitters have wavelength-dependent loss and uneven port-to-port uniformity, especially at split ratios above 1:8',
      'FBT splitters only work at 1310 nm',
      'FBT splitters require power to operate',
    ],
    answer: 1,
    explanation:
      'FBT splitters are fabricated by manually fusing and tapering fibers, resulting in wavelength-dependent loss and increasing non-uniformity as the split ratio rises. Above 1:8, FBT is rarely used in GPON because PLC provides much better uniformity.',
    difficulty: 'medium',
  },
  {
    id: 'cq-036',
    domain: 'PON Technology',
    question:
      'During the GPON ONU activation (O-state machine), which state does the ONU enter immediately after powering on?',
    choices: ['O2 – Standby', 'O1 – Initial', 'O3 – Serial Number', 'O5 – Operation'],
    answer: 1,
    explanation:
      'The GPON ONU state machine begins at O1 (Initial) upon power-on. The ONU then listens for the OLT downstream signal and progresses through serial number collection, ranging, authentication, and configuration before reaching O5 (Operation).',
    difficulty: 'hard',
  },
  {
    id: 'cq-037',
    domain: 'PON Technology',
    question:
      'What is the role of PLOAM (Physical Layer OAM) messages in GPON?',
    choices: [
      'PLOAM messages carry subscriber Ethernet frames',
      'PLOAM messages carry physical-layer management information such as ranging, activation, and encryption key exchange between OLT and ONUs',
      'PLOAM messages configure IP routing on the ONU',
      'PLOAM messages are used for optical power level reporting only',
    ],
    answer: 1,
    explanation:
      'PLOAM (Physical Layer OAM) is an embedded channel in the GPON frame used for ONU discovery, ranging, equalization delay assignment, encryption management, and fault indication. It operates below the GEM layer.',
    difficulty: 'hard',
  },
  {
    id: 'cq-038',
    domain: 'PON Technology',
    question:
      'A GPON ODN uses a 1:4 primary splitter followed by a 1:8 secondary splitter. What is the overall split ratio?',
    choices: ['1:8', '1:12', '1:16', '1:32'],
    answer: 3,
    explanation:
      'Cascade splitters multiply: 1:4 × 1:8 = 1:32. Each output port of the 1:4 splitter feeds one 1:8 splitter, yielding 4 × 8 = 32 subscriber ports total.',
    difficulty: 'medium',
  },
  {
    id: 'cq-039',
    domain: 'PON Technology',
    question:
      'NG-PON2, defined in ITU-T G.989, uses which multiplexing technique to support multiple wavelength channels on a single ODN?',
    choices: [
      'TDMA only',
      'DWDM (Dense Wavelength Division Multiplexing) with multiple 10G channel pairs (TWDM-PON)',
      'OFDM (Orthogonal Frequency Division Multiplexing)',
      'CDMA (Code Division Multiple Access)',
    ],
    answer: 1,
    explanation:
      'NG-PON2 uses TWDM-PON (Time and Wavelength Division Multiplexed PON), combining WDM with TDMA to provide multiple 10 Gbps downstream / 2.5 Gbps upstream channel pairs, yielding aggregate rates of 40 Gbps downstream and 10 Gbps upstream.',
    difficulty: 'hard',
  },
  {
    id: 'cq-040',
    domain: 'PON Technology',
    question:
      'What is the insertion loss of a 1:8 PLC splitter?',
    choices: ['7.2 dB', '10.7 dB', '13.8 dB', '17.2 dB'],
    answer: 1,
    explanation:
      'A 1:8 PLC splitter has approximately 10.7 dB of insertion loss. The series is: 1:2 ≈ 3.7 dB, 1:4 ≈ 7.2 dB, 1:8 ≈ 10.7 dB, 1:16 ≈ 13.8 dB, 1:32 ≈ 17.2 dB, 1:64 ≈ 20.8 dB.',
    difficulty: 'easy',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 3 — Components & Equipment (cq-041 to cq-060)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-041',
    domain: 'Components & Equipment',
    question:
      'Where is the OLT (Optical Line Terminal) located in a GPON network?',
    choices: [
      'At the subscriber\'s premises',
      'At the street-side distribution cabinet',
      'At the service provider\'s central office or headend',
      'Inside the passive optical splitter housing',
    ],
    answer: 2,
    explanation:
      'The OLT is located in the service provider\'s central office (CO) or headend. It terminates the PON on the network side, aggregates traffic from all connected ONUs, and connects upstream to the metro or core network.',
    difficulty: 'easy',
  },
  {
    id: 'cq-042',
    domain: 'Components & Equipment',
    question:
      'What is the technical distinction between an ONT and an ONU?',
    choices: [
      'ONT is used for business; ONU is used for residential subscribers',
      'An ONT is a single-unit device serving one subscriber; an ONU is a multi-subscriber device typically used in MDU or FTTB deployments',
      'ONT operates at 1310 nm; ONU operates at 1490 nm',
      'ONT stands for Optical Node Terminal; ONU stands for Optical Network Unit',
    ],
    answer: 1,
    explanation:
      'Although ITU-T uses both terms, industry convention distinguishes ONT (Optical Network Terminal) as a single-subscriber CPE device (FTTH) from ONU (Optical Network Unit) as a multi-subscriber device deployed in MDU buildings or cabinets (FTTB).',
    difficulty: 'medium',
  },
  {
    id: 'cq-043',
    domain: 'Components & Equipment',
    question:
      'What color coding and ferrule angle distinguish an SC/APC connector from an SC/UPC connector?',
    choices: [
      'SC/APC is blue with a flat ferrule; SC/UPC is green with an angled ferrule',
      'SC/APC is green with an 8° angled ferrule; SC/UPC is blue with a flat (0°) ferrule',
      'SC/APC is yellow with a 5° ferrule; SC/UPC is green with a flat ferrule',
      'SC/APC is red; SC/UPC is blue, both with flat ferrules',
    ],
    answer: 1,
    explanation:
      'SC/APC connectors are distinguished by their green housing and 8° angled ferrule, which reflects back-reflections at an angle away from the fiber core, achieving ≥60 dB return loss. SC/UPC connectors have a blue housing and a polished flat (0°) ferrule with ≥50 dB return loss.',
    difficulty: 'easy',
  },
  {
    id: 'cq-044',
    domain: 'Components & Equipment',
    question:
      'Why is SC/APC preferred over SC/UPC for PON ODN installations?',
    choices: [
      'SC/APC is cheaper to manufacture',
      'SC/APC has lower insertion loss than SC/UPC',
      'SC/APC\'s higher return loss (≥60 dB) prevents reflected light from disturbing the sensitive OLT receiver and reducing interference in the upstream direction',
      'SC/APC connectors are easier to clean',
    ],
    answer: 2,
    explanation:
      'In a shared PON, reflections from connectors can travel upstream and cause noise on the OLT burst-mode receiver. SC/APC\'s ≥60 dB return loss (vs SC/UPC ≥50 dB) provides an additional 10 dB of reflectance suppression, which is critical for PON performance.',
    difficulty: 'medium',
  },
  {
    id: 'cq-045',
    domain: 'Components & Equipment',
    question:
      'What is the typical insertion loss specification for a properly cleaned and mated SC/APC connector pair?',
    choices: ['≤0.1 dB', '≤0.5 dB', '≤1.0 dB', '≤2.0 dB'],
    answer: 1,
    explanation:
      'A clean, properly mated SC/APC connector pair should exhibit ≤0.5 dB insertion loss. Values above this threshold typically indicate contamination, damage, or improper mating.',
    difficulty: 'easy',
  },
  {
    id: 'cq-046',
    domain: 'Components & Equipment',
    question:
      'What is the typical insertion loss range for a fusion splice in a single-mode fiber plant?',
    choices: ['0.001–0.01 dB', '0.02–0.1 dB', '0.1–0.3 dB', '0.3–0.5 dB'],
    answer: 1,
    explanation:
      'Fusion splices in single-mode fiber typically exhibit 0.02–0.1 dB insertion loss when made with a quality fusion splicer and proper fiber preparation. Values above 0.1 dB suggest poor cleave quality, fiber mismatch, or splicer calibration issues.',
    difficulty: 'medium',
  },
  {
    id: 'cq-047',
    domain: 'Components & Equipment',
    question:
      'What is the typical insertion loss range for a mechanical splice?',
    choices: ['0.02–0.1 dB', '0.1–0.3 dB', '0.5–1.0 dB', '1.0–2.0 dB'],
    answer: 1,
    explanation:
      'Mechanical splices typically introduce 0.1–0.3 dB insertion loss, higher than fusion splices due to the index-matching gel filling a physical gap between fiber ends rather than a direct glass-to-glass fusion.',
    difficulty: 'medium',
  },
  {
    id: 'cq-048',
    domain: 'Components & Equipment',
    question:
      'What is the function of an ODF (Optical Distribution Frame)?',
    choices: [
      'To amplify the optical signal at the central office',
      'To provide a centralized, organized termination and cross-connection point for fiber cables, allowing flexible patching of fibers between equipment',
      'To split the optical signal to multiple subscribers',
      'To convert optical signals to electrical signals for routing',
    ],
    answer: 1,
    explanation:
      'An ODF provides a structured termination panel for incoming fiber cables (feeder, distribution, equipment cords), enabling flexible cross-patching between OLT ports, test equipment, and outgoing ODN fibers without disturbing installed cables.',
    difficulty: 'easy',
  },
  {
    id: 'cq-049',
    domain: 'Components & Equipment',
    question:
      'Which fiber type is designed with a tighter bend radius tolerance and is preferred for in-building FTTH drop wiring?',
    choices: [
      'ITU-T G.652D (standard SMF)',
      'ITU-T G.654 (ultra-low loss)',
      'ITU-T G.657A (bend-insensitive SMF)',
      'ITU-T G.651 (multimode 62.5/125)',
    ],
    answer: 2,
    explanation:
      'ITU-T G.657A (category A) is a bend-insensitive single-mode fiber that maintains low macrobending loss even at bend radii as tight as 10 mm. It is specified for in-building drop cables and indoor wiring where tight bends around corners are unavoidable.',
    difficulty: 'medium',
  },
  {
    id: 'cq-050',
    domain: 'Components & Equipment',
    question:
      'What are the standard cladding and core diameters for conventional single-mode fiber?',
    choices: [
      '62.5 μm cladding / 9 μm core',
      '125 μm cladding / 50 μm core',
      '125 μm cladding / 9 μm core',
      '250 μm cladding / 9 μm core',
    ],
    answer: 2,
    explanation:
      'Standard single-mode fiber has a 125 μm glass cladding diameter and a 9 μm core diameter. The 250 μm dimension refers to the acrylate coating over the cladding, not the glass itself.',
    difficulty: 'easy',
  },
  {
    id: 'cq-051',
    domain: 'Components & Equipment',
    question:
      'What is the primary advantage of ITU-T G.652D over earlier G.652 subtypes for GPON deployments?',
    choices: [
      'G.652D has a larger core diameter',
      'G.652D has lower water-peak attenuation in the E-band (1383 nm), enabling full-spectrum WDM use across all wavelengths',
      'G.652D is bend-insensitive',
      'G.652D supports higher power levels',
    ],
    answer: 1,
    explanation:
      'G.652D specifies reduced water-peak attenuation at 1383 nm, making it suitable for WDM systems using the full O-, E-, S-, C-, and L-bands. Previous G.652A/B subtypes had a high water-peak that prevented use of the E-band.',
    difficulty: 'hard',
  },
  {
    id: 'cq-052',
    domain: 'Components & Equipment',
    question:
      'In a GPON network, does the ODN (Optical Distribution Network) contain any EDFA (Erbium-Doped Fiber Amplifiers)?',
    choices: [
      'Yes, EDFAs are required at each splitter to compensate for split loss',
      'No, the ODN is entirely passive; no active amplification is used between OLT and ONU',
      'Yes, but only for the 1550 nm RF video overlay channel',
      'Yes, EDFAs are placed at the midpoint of the 20 km feeder fiber',
    ],
    answer: 1,
    explanation:
      'By definition, a Passive Optical Network uses no powered active components in the outside plant. The ODN between OLT and ONUs contains only passive elements: splitters, connectors, splices, and fiber. The link budget must be satisfied without amplification.',
    difficulty: 'medium',
  },
  {
    id: 'cq-053',
    domain: 'Components & Equipment',
    question:
      'What functions does a typical residential gateway (RGW) integrated with a GPON ONT provide?',
    choices: [
      'Optical amplification and wavelength conversion only',
      'DHCP server, NAT, WiFi access point, VoIP ATA, and firewall functions',
      'OTDR testing and fiber characterization',
      'OMCI configuration of upstream T-CONTs',
    ],
    answer: 1,
    explanation:
      'A residential gateway (RGW) or integrated ONT/router provides DHCP for in-home IP assignment, NAT for IP sharing, WiFi (802.11ac/ax), VoIP/ATA ports for analog telephone adapters, and basic firewall/stateful packet inspection.',
    difficulty: 'easy',
  },
  {
    id: 'cq-054',
    domain: 'Components & Equipment',
    question:
      'Which fiber cable construction is best suited for direct-burial applications without conduit?',
    choices: [
      'Tight-buffered indoor cable',
      'Aerial self-supporting ADSS cable',
      'Armored gel-filled loose-tube cable with a polyethylene jacket',
      'Ribbon cable in a breakout configuration',
    ],
    answer: 2,
    explanation:
      'Armored, gel-filled loose-tube cables with a polyethylene outer jacket are designed for direct-burial. The armor provides rodent/crush resistance, gel prevents water ingress, and PE resists soil chemicals and moisture over decades.',
    difficulty: 'medium',
  },
  {
    id: 'cq-055',
    domain: 'Components & Equipment',
    question:
      'What is the purpose of gel filling in loose-tube fiber optic cables?',
    choices: [
      'To improve optical transmission efficiency',
      'To provide waterblocking and prevent water migration along the cable length',
      'To increase the cable\'s tensile strength',
      'To reduce the cable\'s outer diameter',
    ],
    answer: 1,
    explanation:
      'Thixotropic gel inside loose-tube buffer tubes blocks water ingress and prevents water from migrating longitudinally along the cable. Without gel, water entry at a damage point could propagate over long distances, causing widespread fiber damage.',
    difficulty: 'medium',
  },
  {
    id: 'cq-056',
    domain: 'Components & Equipment',
    question:
      'What is the standard coating diameter of a bare single-mode fiber (acrylate coating over the 125 μm cladding)?',
    choices: ['125 μm', '250 μm', '900 μm', '2 mm'],
    answer: 1,
    explanation:
      'The standard acrylate primary coating applied over the 125 μm glass cladding results in a 250 μm overall fiber diameter. For indoor or terminated applications, this is further protected with a 900 μm tight buffer, and then jacketed to 2 mm or 3 mm.',
    difficulty: 'easy',
  },
  {
    id: 'cq-057',
    domain: 'Components & Equipment',
    question:
      'An outdoor aerial FTTH drop cable uses which construction to self-support between poles without a separate messenger wire?',
    choices: [
      'ADSS (All-Dielectric Self-Supporting) cable with aramid yarn strength members',
      'Loose-tube gel-filled cable with steel central strength member',
      'Figure-8 cable with a steel messenger wire integrated into the jacket',
      'Armored direct-burial cable attached to a lashing wire',
    ],
    answer: 2,
    explanation:
      'Figure-8 drop cables have a steel (or dielectric) messenger wire molded into one lobe of the jacket and the fiber in the other lobe. The messenger bears the span tension, making a separate lashing wire unnecessary. ADSS is used for longer spans.',
    difficulty: 'medium',
  },
  {
    id: 'cq-058',
    domain: 'Components & Equipment',
    question:
      'Which power consideration is unique to the ONU/ONT compared to the OLT?',
    choices: [
      'ONTs require three-phase 480V power',
      'ONTs at the subscriber premises must have local AC power or battery backup; loss of power at the ONT interrupts service including VoIP emergency calls',
      'ONTs use more power than OLTs',
      'ONTs require dedicated UPS because they generate significant heat',
    ],
    answer: 1,
    explanation:
      'Unlike the OLT (which resides in a powered, UPS-protected CO), the ONT relies on the subscriber\'s local AC power. A power outage at the premises will disable the ONT and any VoIP service unless a local battery backup is provided, which is an important safety consideration for emergency 911 service.',
    difficulty: 'medium',
  },
  {
    id: 'cq-059',
    domain: 'Components & Equipment',
    question:
      'What distinguishes a power splitter from a WDM coupler in a PON ODN?',
    choices: [
      'A power splitter divides optical power equally across all wavelengths; a WDM coupler separates or combines specific wavelengths',
      'A WDM coupler divides power equally; a power splitter separates wavelengths',
      'Both devices perform the same function',
      'A power splitter is active; a WDM coupler is passive',
    ],
    answer: 0,
    explanation:
      'A power splitter (1:N coupler) divides optical power equally among output ports regardless of wavelength, incurring split loss. A WDM coupler selectively routes specific wavelength bands (e.g., 1490 nm vs 1550 nm) with low insertion loss, used for CATV overlay or WDM-PON.',
    difficulty: 'medium',
  },
  {
    id: 'cq-060',
    domain: 'Components & Equipment',
    question:
      'In what situation would a ribbon fiber cable be preferred over loose-tube construction?',
    choices: [
      'When high fiber counts (96–3456 fibers) must be accommodated in a small duct diameter, and mass fusion splicing is required for rapid deployment',
      'For single-fiber drop cable to a residential subscriber',
      'For aerial spans exceeding 500 m',
      'When bend-insensitive fiber is required',
    ],
    answer: 0,
    explanation:
      'Ribbon cables contain fibers arranged in flat ribbons of 12 or 24, which can be mass-fusion spliced (an entire ribbon at once), dramatically speeding up splicing of high-count cables in central office and duct environments.',
    difficulty: 'medium',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 4 — Network Design & Planning (cq-061 to cq-075)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-061',
    domain: 'Network Design & Planning',
    question:
      'In an ODN link budget calculation, which formula correctly determines the received power at the ONU?',
    choices: [
      'Rx Power = Tx Power + Total Loss',
      'Rx Power = Tx Power − Total Loss',
      'Rx Power = Total Loss − Tx Power',
      'Rx Power = Tx Power × Split Ratio',
    ],
    answer: 1,
    explanation:
      'Optical link budget is calculated by subtracting all losses from the transmitter output power: Rx Power (dBm) = Tx Power (dBm) − Total Loss (dB). The result must exceed the receiver sensitivity to achieve the required BER.',
    difficulty: 'easy',
  },
  {
    id: 'cq-062',
    domain: 'Network Design & Planning',
    question:
      'What is the minimum recommended system margin (safety margin) for a GPON ODN link budget?',
    choices: ['1 dB', '3 dB', '6 dB', '10 dB'],
    answer: 1,
    explanation:
      'A minimum 3 dB system margin is the industry-recommended safety buffer above the receiver sensitivity threshold. This accounts for aging effects, connector contamination, fiber bending variations, and component tolerances over the system lifetime.',
    difficulty: 'medium',
  },
  {
    id: 'cq-063',
    domain: 'Network Design & Planning',
    question:
      'A GPON Class B+ system has an OLT Tx power of +5 dBm and an ONU receiver sensitivity of −27 dBm. What is the maximum allowable ODN loss?',
    choices: ['22 dB', '27 dB', '28 dB', '32 dB'],
    answer: 2,
    explanation:
      'Maximum ODN loss = Tx Power − Rx Sensitivity = +5 dBm − (−27 dBm) = 32 dB. However, Class B+ specifies a maximum budget of 28 dB, so the ODN must not exceed 28 dB for standards-compliant operation with adequate margin.',
    difficulty: 'hard',
  },
  {
    id: 'cq-064',
    domain: 'Network Design & Planning',
    question:
      'What are the three hierarchical levels of an FTTH ODN fiber plant?',
    choices: [
      'Core, Metro, Access',
      'Feeder, Distribution, Drop',
      'OLT, Splitter, ONU',
      'Backbone, Aggregation, Customer',
    ],
    answer: 1,
    explanation:
      'FTTH ODN fiber is organized into three segments: Feeder fiber (from OLT to primary splitter, typically in conduit or aerial), Distribution fiber (from primary splitter to secondary distribution point or pedestal), and Drop fiber (from distribution point to the subscriber premises).',
    difficulty: 'easy',
  },
  {
    id: 'cq-065',
    domain: 'Network Design & Planning',
    question:
      'A designer plans a two-stage cascade split with a 1:4 primary splitter and a 1:8 secondary splitter. What is the total combined insertion loss of both splitters?',
    choices: ['10.7 dB', '17.9 dB', '20.8 dB', '13.8 dB'],
    answer: 1,
    explanation:
      'The combined loss is the sum: 1:4 splitter ≈ 7.2 dB + 1:8 splitter ≈ 10.7 dB = 17.9 dB total. This cascade creates a 1:32 effective split ratio at 17.9 dB, slightly lower than a single 1:32 PLC at 17.2 dB due to rounding of individual component values.',
    difficulty: 'hard',
  },
  {
    id: 'cq-066',
    domain: 'Network Design & Planning',
    question:
      'What is a key advantage of a two-stage (cascade) split design over a single-stage 1:32 or 1:64 split?',
    choices: [
      'Cascade splitting always has lower total loss',
      'Cascade splitting allows the secondary splitter to be deployed closer to subscribers, reducing expensive drop fiber lengths and allowing future expansion by adding secondary splitters',
      'Cascade splitting avoids the need for an ODF',
      'Cascade splitting eliminates the need for system margin',
    ],
    answer: 1,
    explanation:
      'Two-stage splitting places the primary splitter near the OLT and secondary splitters near subscriber clusters. This minimizes expensive, individually-routed drop fiber lengths and provides incremental scalability—secondary splitters can be added as the subscriber base grows.',
    difficulty: 'medium',
  },
  {
    id: 'cq-067',
    domain: 'Network Design & Planning',
    question:
      'What does IRU (Indefeasible Right of Use) mean in the context of fiber network planning?',
    choices: [
      'A government permit for aerial fiber installation',
      'A long-term contractual right to use a specific fiber capacity on another party\'s cable, typically for 15–25 years, without owning the physical infrastructure',
      'An insurance policy for damaged fiber cable',
      'A technical standard for fiber duct fill ratios',
    ],
    answer: 1,
    explanation:
      'An IRU is a long-term indefeasible (irrevocable) agreement granting a party exclusive use of specific fiber strands or capacity on a cable owned by another operator. It is commonly used to obtain fiber routes without building new infrastructure.',
    difficulty: 'hard',
  },
  {
    id: 'cq-068',
    domain: 'Network Design & Planning',
    question:
      'When planning fiber counts in a feeder cable, what is the primary reason to include spare fibers beyond immediate needs?',
    choices: [
      'Spare fibers reduce signal attenuation',
      'Spare fibers allow for future service expansion, protection switching, testing, and replacement of fibers damaged during installation without requiring cable replacement',
      'Spare fibers are required by IEEE standards',
      'Spare fibers provide redundant power paths',
    ],
    answer: 1,
    explanation:
      'Planning spare fibers (typically 20–50% above immediate requirements) avoids costly cable replacement when demand grows or fibers are damaged. They also enable protection rings, test access, and future technology overlays such as adding a WDM-PON layer.',
    difficulty: 'medium',
  },
  {
    id: 'cq-069',
    domain: 'Network Design & Planning',
    question:
      'What is the purpose of a mid-span splice closure in an outside plant fiber deployment?',
    choices: [
      'To amplify the optical signal at the cable midpoint',
      'To provide a weather-sealed enclosure for fiber splices where cable segments are joined, with slack storage and a re-enterable housing for future access',
      'To house the passive optical splitter',
      'To terminate the feeder fiber and connect to the OLT',
    ],
    answer: 1,
    explanation:
      'Mid-span splice closures (also called inline closures) provide an environmentally sealed junction point where cable drum-length segments are fusion-spliced together. They include splice tray capacity, fiber slack storage, and re-enterable sealing for future repairs.',
    difficulty: 'medium',
  },
  {
    id: 'cq-070',
    domain: 'Network Design & Planning',
    question:
      'In FTTH network scalability planning, why is fiber-to-the-home fundamentally more scalable than copper-based last-mile technologies?',
    choices: [
      'Fiber is cheaper to install than copper',
      'The optical fiber itself is the bandwidth-inert medium; capacity can be increased simply by upgrading the active electronics (OLT/ONT) at each end without touching the buried/aerial fiber plant',
      'Fiber supports longer wavelengths',
      'Fiber has lower latency than copper',
    ],
    answer: 1,
    explanation:
      'Single-mode fiber has essentially unlimited bandwidth potential (limited only by current transceiver technology). Upgrading GPON to XGS-PON or NG-PON2 requires only replacing the active equipment, not the fiber. Copper last-mile upgrades (VDSL2 to G.fast) require increasingly shorter loop lengths, eventually requiring fiber anyway.',
    difficulty: 'medium',
  },
  {
    id: 'cq-071',
    domain: 'Network Design & Planning',
    question:
      'When designing an MDU in-building wiring plan for FTTH, which approach avoids the need for active equipment on each floor?',
    choices: [
      'Use a separate ONU per floor with Ethernet switches',
      'Deploy passive optical splitters in the building riser and run individual fiber drops from the splitter to each ONT in each unit',
      'Use VDSL2 over existing telephone wiring from a basement ONU',
      'Install DOCSIS 3.1 coax from a basement CMTS',
    ],
    answer: 1,
    explanation:
      'A passive optical splitter in the building riser allows a single feeder fiber from the OLT to be split to individual fiber drops to each apartment\'s ONT, with no active equipment or power supply required in the riser or hallways.',
    difficulty: 'medium',
  },
  {
    id: 'cq-072',
    domain: 'Network Design & Planning',
    question:
      'What is the recommended GIS tool used for fiber route planning and outside plant management?',
    choices: [
      'AutoCAD for mechanical drawings only',
      'A GIS (Geographic Information System) platform that records fiber routes, splice points, equipment locations, and attributes in a geospatial database for route planning, permitting, and O&M',
      'A standard spreadsheet for tracking fiber counts',
      'OTDR software for trace analysis',
    ],
    answer: 1,
    explanation:
      'GIS platforms (such as ArcGIS, QGIS, or telecom-specific tools like OSPInsight) are essential for FTTH planning. They enable spatial analysis of routes, permit applications, conflict identification with existing utilities, and ongoing fiber asset management.',
    difficulty: 'medium',
  },
  {
    id: 'cq-073',
    domain: 'Network Design & Planning',
    question:
      'During a fiber route survey, an engineer discovers the planned conduit path crosses a railroad right-of-way. What is the most important next step?',
    choices: [
      'Re-route the fiber to avoid the railroad entirely',
      'Obtain a railroad crossing permit and license from the railroad company before installation, as railroads have strict encroachment policies and safety requirements',
      'Use aerial fiber over the tracks instead',
      'Install the conduit immediately as railroad rights-of-way are public property',
    ],
    answer: 1,
    explanation:
      'Railroad rights-of-way are private property and require a formal crossing license or encroachment permit from the railroad company. Installation without a permit can result in forced removal and significant legal liability.',
    difficulty: 'medium',
  },
  {
    id: 'cq-074',
    domain: 'Network Design & Planning',
    question:
      'A link budget worksheet shows: OLT Tx = +3 dBm, feeder loss = 4 dB, 1:32 splitter = 17.2 dB, distribution loss = 2 dB, drop loss = 1.5 dB, connector loss = 1.5 dB. What is the total ODN loss and the received power at the ONU?',
    choices: [
      'Total loss = 24.2 dB; Rx = −21.2 dBm',
      'Total loss = 26.2 dB; Rx = −23.2 dBm',
      'Total loss = 28.7 dB; Rx = −25.7 dBm',
      'Total loss = 17.2 dB; Rx = −14.2 dBm',
    ],
    answer: 1,
    explanation:
      'Total loss = 4 + 17.2 + 2 + 1.5 + 1.5 = 26.2 dB. Rx Power = Tx − Loss = +3 − 26.2 = −23.2 dBm. If ONU sensitivity is −27 dBm, the margin is 3.8 dB (acceptable).',
    difficulty: 'hard',
  },
  {
    id: 'cq-075',
    domain: 'Network Design & Planning',
    question:
      'What does a ring topology provide in a FTTH feeder network that a hub-and-spoke (star) topology does not?',
    choices: [
      'Lower installation cost',
      'Higher split ratios',
      'Automatic traffic rerouting via the ring\'s alternate path in the event of a single cable cut, providing redundancy and faster restoration',
      'Support for more ONUs per OLT port',
    ],
    answer: 2,
    explanation:
      'A ring topology allows traffic to be rerouted in the opposite direction around the ring if a cable is cut, enabling sub-50 ms protection switching. A hub-and-spoke (star) design has no alternate path, so a feeder cable cut disconnects all subscribers on that branch.',
    difficulty: 'medium',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 5 — Installation Practices (cq-076 to cq-090)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-076',
    domain: 'Installation Practices',
    question:
      'What is the minimum long-term (installed) bend radius for a standard single-mode fiber optic cable with a 3 mm outer diameter?',
    choices: [
      '10× the outer diameter (30 mm)',
      '15× the outer diameter (45 mm)',
      '20× the outer diameter (60 mm)',
      '30× the outer diameter (90 mm)',
    ],
    answer: 2,
    explanation:
      'The standard long-term minimum bend radius is 20× the cable outer diameter. For a 3 mm cable, this equals 60 mm. Exceeding this limit causes macrobending losses and can lead to fiber fatigue cracks over time.',
    difficulty: 'easy',
  },
  {
    id: 'cq-077',
    domain: 'Installation Practices',
    question:
      'During cable installation (pulling), the short-term minimum bend radius is typically:',
    choices: [
      '5× the cable outer diameter',
      '10× the cable outer diameter',
      '20× the cable outer diameter',
      '30× the cable outer diameter',
    ],
    answer: 1,
    explanation:
      'During active installation (pulling, handling), the short-term minimum bend radius is 10× the cable outer diameter. Once installed and clamped, the long-term limit of 20× applies. The relaxed short-term limit acknowledges that brief bending during installation is less damaging than permanent stress.',
    difficulty: 'medium',
  },
  {
    id: 'cq-078',
    domain: 'Installation Practices',
    question:
      'What is the primary safety precaution when working with live fiber optic cables?',
    choices: [
      'Always wear steel-toed boots',
      'Never look directly into the end of a fiber or connector, as invisible laser radiation can cause immediate and permanent retinal damage',
      'Always work in pairs',
      'Use only metal tools near fiber connectors',
    ],
    answer: 1,
    explanation:
      'The most critical fiber safety rule is to never look directly into a fiber end or connector port. Even CW 1310/1490/1550 nm laser light is invisible to the naked eye and can permanently damage the retina. Always use an optical power meter or approved VFL (with safety features) to verify a fiber is dark before inspecting.',
    difficulty: 'easy',
  },
  {
    id: 'cq-079',
    domain: 'Installation Practices',
    question:
      'What is the maximum acceptable cleave angle for a fiber end-face intended for fusion splicing?',
    choices: ['5.0°', '3.0°', '1.0°', '0.5°'],
    answer: 3,
    explanation:
      'A cleave angle ≤0.5° is required for quality fusion splicing. Angles above this create an air gap or angular misalignment at the splice point, increasing insertion loss. Most precision cleavers achieve <0.2°.',
    difficulty: 'medium',
  },
  {
    id: 'cq-080',
    domain: 'Installation Practices',
    question:
      'What is the correct sequence of steps for fusion splicing a single-mode fiber?',
    choices: [
      'Cleave → Strip → Clean → Splice → Protect',
      'Strip → Clean → Cleave → Splice → Protect with heat-shrink sleeve',
      'Strip → Splice → Cleave → Clean → Protect',
      'Clean → Strip → Splice → Cleave → Protect',
    ],
    answer: 1,
    explanation:
      'The correct fusion splicing sequence is: (1) Strip the coating/buffer, (2) Clean the bare glass with IPA/dry wipes, (3) Cleave to achieve a flat end-face, (4) Load into splicer and arc-fuse, (5) Slide heat-shrink sleeve over splice and cure in the splicer\'s heater.',
    difficulty: 'medium',
  },
  {
    id: 'cq-081',
    domain: 'Installation Practices',
    question:
      'When pulling fiber cable through conduit, what should be monitored to prevent fiber damage?',
    choices: [
      'The color of the outer jacket',
      'The pulling tension, which should not exceed the cable\'s rated maximum tensile load (typically 100–600 N depending on cable type)',
      'The temperature of the pulling lubricant',
      'The power meter reading during pulling',
    ],
    answer: 1,
    explanation:
      'Exceeding the maximum tensile load during cable pulling can permanently elongate or break fibers, even if the jacket appears undamaged. Monitoring via a tension meter or breakaway swivel ensures the cable is not over-stressed.',
    difficulty: 'medium',
  },
  {
    id: 'cq-082',
    domain: 'Installation Practices',
    question:
      'What is the recommended minimum burial depth for a fiber optic cable in a residential conduit installation per standard practices?',
    choices: ['12 inches (30 cm)', '18 inches (45 cm)', '24 inches (60 cm)', '36 inches (90 cm)'],
    answer: 2,
    explanation:
      'Standard practice for residential direct-buried or conduit fiber installations is a minimum depth of 24 inches (60 cm). Deeper burial (36 inches) is recommended under driveways, roads, and agricultural areas where earth-moving equipment may operate.',
    difficulty: 'medium',
  },
  {
    id: 'cq-083',
    domain: 'Installation Practices',
    question:
      'When using SC/APC connectors, what is the proper cleaning procedure before mating?',
    choices: [
      'Blow compressed air only; wiping can introduce scratches',
      'Clean with a lint-free dry wipe only',
      'Use a fiber optic cleaning tool (reel cleaner or cassette) or lint-free IPA wipe followed by a dry wipe; inspect with a fiber microscope (≥200×) before mating',
      'No cleaning is necessary for factory-polished connectors',
    ],
    answer: 2,
    explanation:
      'The recommended cleaning procedure is: apply an IPA-wet lint-free wipe (or use an approved fiber reel cleaner), follow with a dry wipe to remove residue, then inspect the end-face with a fiber inspection microscope at ≥200× magnification. Dirty connectors are the #1 cause of fiber plant problems.',
    difficulty: 'medium',
  },
  {
    id: 'cq-084',
    domain: 'Installation Practices',
    question:
      'What does the IEC 61300-3-35 standard define for fiber optic connector inspection?',
    choices: [
      'Maximum bend radius for fiber optic cables',
      'Pass/fail criteria for connector end-face cleanliness and surface defects, defining inspection zones A, B, C, D for single-mode connectors',
      'Minimum tensile load for fiber pulling',
      'Wavelength specifications for GPON',
    ],
    answer: 1,
    explanation:
      'IEC 61300-3-35 establishes end-face quality criteria for fiber connectors, dividing the end-face into zones (A=core, B=cladding, C=contact area, D=outer region) with specific scratch and defect limits for each zone. Zone A (core) must be defect-free.',
    difficulty: 'hard',
  },
  {
    id: 'cq-085',
    domain: 'Installation Practices',
    question:
      'What is the recommended conduit fill ratio for fiber optic cables to allow future cable additions without excessive pulling friction?',
    choices: [
      'Up to 100% fill',
      'Up to 80% fill',
      'Up to 53% fill for a single cable; up to 40% fill for multiple cables',
      'Up to 20% fill maximum',
    ],
    answer: 2,
    explanation:
      'Standard conduit fill ratios for fiber are: ≤53% for a single cable in conduit, and ≤40% for two or more cables. Exceeding these limits causes excessive pulling tension and friction, potentially damaging cables.',
    difficulty: 'hard',
  },
  {
    id: 'cq-086',
    domain: 'Installation Practices',
    question:
      'In aerial FTTH installation, what is the purpose of "sag" in the fiber span between poles?',
    choices: [
      'Sag is undesirable and should be minimized to prevent bird perching',
      'Controlled sag accommodates thermal expansion and contraction, ice/wind loading, and prevents excessive tension that could damage fibers',
      'Sag reduces the fiber span attenuation',
      'Sag allows the cable to absorb lightning surges',
    ],
    answer: 1,
    explanation:
      'Controlled sag in aerial spans is intentional. It provides slack to accommodate thermal expansion (summer) and contraction (winter), prevents the cable from becoming dangerously taut in cold temperatures, and allows for ice and wind loading without exceeding the cable\'s maximum rated tension.',
    difficulty: 'medium',
  },
  {
    id: 'cq-087',
    domain: 'Installation Practices',
    question:
      'Why should cable ties (zip ties) never be overtightened on fiber optic cables?',
    choices: [
      'Overtightened cable ties increase the cable\'s pulling tension',
      'Overtightened cable ties can impose localized radial pressure on the cable, causing microbend-induced signal loss',
      'Overtightened cable ties prevent future cable additions',
      'Cable ties cannot be used on fiber at all',
    ],
    answer: 1,
    explanation:
      'Radial compression from overtightened cable ties creates microbends in the fiber, which scatter light and increase attenuation. Fiber cable ties should be snug but not crushing; Velcro or hook-and-loop straps are preferred for indoor fiber management.',
    difficulty: 'medium',
  },
  {
    id: 'cq-088',
    domain: 'Installation Practices',
    question:
      'When feeding a fiber drop cable through a wall penetration into a subscriber\'s home, what is required for weatherproofing and fire compliance?',
    choices: [
      'The hole should be sealed with foam-backed tape only',
      'The penetration should be sealed with an approved weatherproof sealant or duct seal compound; if passing through a fire-rated wall, a listed firestop sealant or device must be used',
      'No sealing is required if the conduit is metal',
      'A rubber grommet is sufficient for all applications',
    ],
    answer: 1,
    explanation:
      'Wall penetrations require weatherproof sealing to prevent air/water infiltration. In fire-rated assemblies (e.g., between floors or between units in an MDU), a UL-listed firestop sealant or device is required by building codes to maintain the fire rating.',
    difficulty: 'medium',
  },
  {
    id: 'cq-089',
    domain: 'Installation Practices',
    question:
      'What is the purpose of a fusion splice protection sleeve (heat-shrink sleeve)?',
    choices: [
      'To improve the optical characteristics of the splice',
      'To provide mechanical protection, moisture resistance, and structural support for the fragile fusion splice point',
      'To label the splice for future identification',
      'To reduce the insertion loss of the splice',
    ],
    answer: 1,
    explanation:
      'A fusion splice protection sleeve (containing a stainless steel stiffening rod and hot-melt adhesive inside a heat-shrink tube) provides mechanical protection against bending/stress at the fragile bare-glass splice point and seals against moisture ingress.',
    difficulty: 'easy',
  },
  {
    id: 'cq-090',
    domain: 'Installation Practices',
    question:
      'When installing a fiber optic cable using horizontal directional drilling (HDD), what precaution must be taken regarding the fiber?',
    choices: [
      'The fiber must be pre-tested before pulling',
      'The fiber must be pulled through a pre-installed conduit; fiber cable should never be pulled directly through HDD bore holes, as the auger head and bore fluid can damage the cable',
      'HDD cannot be used for fiber installations',
      'The fiber must be armored for all HDD installations',
    ],
    answer: 1,
    explanation:
      'Standard practice for HDD is to first install a HDPE conduit through the bore, then pull the fiber cable through the conduit in a separate operation. This protects the fiber from drill bit contact, bore fluid chemicals, and borehole collapse.',
    difficulty: 'medium',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 6 — Testing & Troubleshooting (cq-091 to cq-100)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cq-091',
    domain: 'Testing & Troubleshooting',
    question:
      'How does an OTDR (Optical Time Domain Reflectometer) measure distance and locate events in a fiber?',
    choices: [
      'It injects a CW (continuous wave) tone and measures received power at the far end',
      'It launches a short laser pulse into the fiber and measures the time and amplitude of Rayleigh backscatter and Fresnel reflections returning to the instrument',
      'It applies a mechanical vibration to the cable and measures resonant frequency',
      'It injects multiple wavelengths and analyzes chromatic dispersion',
    ],
    answer: 1,
    explanation:
      'An OTDR operates on the optical time-domain reflectometry principle: it launches a nanosecond-to-microsecond laser pulse, then measures backscattered (Rayleigh) and reflected (Fresnel) light returning over time. Distance is calculated from the round-trip time using the fiber\'s refractive index.',
    difficulty: 'easy',
  },
  {
    id: 'cq-092',
    domain: 'Testing & Troubleshooting',
    question:
      'On an OTDR trace, what does a non-reflective step loss event (downward step without reflection spike) most likely represent?',
    choices: [
      'A fiber end or connector',
      'A fusion splice or macrobend',
      'A mechanical splice with index gel',
      'A ghost reflection',
    ],
    answer: 1,
    explanation:
      'Fusion splices and macrobends appear on an OTDR trace as a step-down in backscatter level with little or no reflection spike. Connectors and mechanical splices typically show a Fresnel reflection spike because of the air gap or refractive index discontinuity.',
    difficulty: 'medium',
  },
  {
    id: 'cq-093',
    domain: 'Testing & Troubleshooting',
    question:
      'What is the "dead zone" on an OTDR trace, and why does it matter for PON testing?',
    choices: [
      'The distance beyond the fiber end where the OTDR cannot detect signals; it has no practical effect',
      'The distance following a large reflection (e.g., a connector) during which the OTDR detector is saturated and cannot accurately measure losses; events within this zone may be missed',
      'The wavelength range where the OTDR laser is inactive',
      'The time needed for the OTDR to recalibrate between acquisitions',
    ],
    answer: 1,
    explanation:
      'The dead zone (event dead zone and attenuation dead zone) is the distance following a strong Fresnel reflection during which the OTDR receiver is saturated. Events (splices, connectors) within this region cannot be resolved. In PON testing, the OLT connector\'s large reflection can create a dead zone that hides the first splice or splitter.',
    difficulty: 'hard',
  },
  {
    id: 'cq-094',
    domain: 'Testing & Troubleshooting',
    question:
      'When should a power meter and light source (insertion loss test) be used instead of or in addition to an OTDR?',
    choices: [
      'Only when the OTDR is unavailable',
      'For final acceptance testing to measure actual end-to-end insertion loss, as required by TIA-568 and ISO 11801; the OTDR provides location of events but not a direct power budget measurement',
      'Power meters are only used on multimode fiber',
      'Power meters cannot measure loss at PON wavelengths',
    ],
    answer: 1,
    explanation:
      'TIA-568, ISO 11801, and most service provider acceptance standards require an end-to-end insertion loss test using a calibrated light source and power meter (LSPM). This directly measures the loss that the PON link budget must support. OTDR testing locates faults but does not substitute for LSPM acceptance testing.',
    difficulty: 'medium',
  },
  {
    id: 'cq-095',
    domain: 'Testing & Troubleshooting',
    question:
      'What is the industry-standard maximum acceptable insertion loss for a single connector mating?',
    choices: ['0.1 dB', '0.3 dB', '0.5 dB', '1.0 dB'],
    answer: 2,
    explanation:
      'Industry standards (TIA-568, IEC 61753) specify ≤0.5 dB insertion loss per connector mating. Connectors exceeding this value typically have a contaminated or damaged end-face and should be cleaned and re-inspected before acceptance.',
    difficulty: 'easy',
  },
  {
    id: 'cq-096',
    domain: 'Testing & Troubleshooting',
    question:
      'What is a Visual Fault Locator (VFL) and what is its typical useful range?',
    choices: [
      'A high-power OTDR used for long-haul testing; useful to 100 km',
      'A device that injects visible red light (650 nm) into the fiber, making bends, breaks, and bad splices glow through the jacket; typically useful to ~5 km',
      'An optical spectrum analyzer for WDM channel testing',
      'An OTDR with a visible laser for display purposes',
    ],
    answer: 1,
    explanation:
      'A VFL injects 650 nm red laser light that is visible through tight-buffer cables and can illuminate macrobends, bad splices, and fiber breaks as a bright red glow. It is a quick first-line diagnostic tool useful up to approximately 3–5 km.',
    difficulty: 'easy',
  },
  {
    id: 'cq-097',
    domain: 'Testing & Troubleshooting',
    question:
      'What minimum Optical Return Loss (ORL) value is typically required for a well-installed SC/APC PON plant?',
    choices: ['≥40 dB', '≥45 dB', '≥55 dB', '≥65 dB'],
    answer: 2,
    explanation:
      'A properly installed SC/APC fiber plant should exhibit an ORL of ≥55 dB (measured from the OLT). SC/APC connectors individually have reflectance <−60 dB, and the cumulative ORL of the entire ODN should be ≥55 dB to prevent back-reflections from degrading OLT laser performance.',
    difficulty: 'hard',
  },
  {
    id: 'cq-098',
    domain: 'Testing & Troubleshooting',
    question:
      'What is the most common cause of problems in fiber optic networks?',
    choices: [
      'Fiber breaks from mechanical damage',
      'Dirty or contaminated connectors',
      'Wrong fiber type (multimode vs. single-mode)',
      'Laser wavelength drift',
    ],
    answer: 1,
    explanation:
      'Dirty connectors (contamination on the fiber end-face) are the single most common cause of fiber optic network problems. Even a sub-micron particle on the 9 μm SMF core can cause high insertion loss or complete signal failure. Cleaning and inspecting connectors before mating is essential.',
    difficulty: 'easy',
  },
  {
    id: 'cq-099',
    domain: 'Testing & Troubleshooting',
    question:
      'An OTDR trace shows a "ghost" event appearing at twice the distance of a large reflection. What causes this?',
    choices: [
      'A second physical connector at that location',
      'The OTDR is measuring at the wrong wavelength',
      'A double-reflection: light bouncing back from a strong reflector, reflecting again off the OTDR source, and returning to appear as a false event at twice the original reflection\'s distance',
      'Chromatic dispersion causing pulse broadening',
    ],
    answer: 2,
    explanation:
      'Ghosts (also called double-bounce artifacts) are caused by light from a strong reflective event traveling back to the OTDR launch port, reflecting off the OTDR\'s own source, traveling out again, and returning—appearing as a false "event" at twice the original distance. Ghosts have no step loss and disappear when the original reflector is improved.',
    difficulty: 'hard',
  },
  {
    id: 'cq-100',
    domain: 'Testing & Troubleshooting',
    question:
      'What is the industry-standard maximum acceptable insertion loss for a fusion splice during acceptance testing?',
    choices: ['0.05 dB', '0.1 dB', '0.3 dB', '0.5 dB'],
    answer: 2,
    explanation:
      'Most service provider and industry acceptance standards (TIA, IEC, ITU) specify ≤0.3 dB per fusion splice for acceptance. However, well-made fusion splices typically measure 0.02–0.1 dB, so 0.3 dB represents a conservative pass/fail threshold for field conditions.',
    difficulty: 'medium',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STUDY DOMAINS
// ─────────────────────────────────────────────────────────────────────────────

export const CERT_STUDY_DOMAINS: CertStudyDomain[] = [
  {
    domain: 'FTTx Architectures',
    icon: '🏗️',
    color: '#1d4ed8',
    overview:
      'FTTx (Fiber To The x) describes a range of broadband network architectures that use optical fiber for all or part of the last-mile connection to subscribers. Understanding the distinctions between FTTH, FTTB, FTTC, FTTN, and FTTP is fundamental to designing and selling fiber services. The choice of architecture directly determines achievable speeds, upgrade potential, and deployment cost.',
    topics: [
      {
        title: 'What is FTTx?',
        body: 'FTTx is an umbrella term for any broadband network architecture using optical fiber to replace all or part of the copper local loop. The "x" denotes the termination point: Home (H), Building (B), Curb (C), Node (N), Cabinet (Cab), or Premises (P). Each variant trades off capital expenditure against achievable performance and future-proofing.',
        bullets: [
          'FTTH / FTTP: Fiber terminates inside the subscriber\'s home or at the premises boundary — highest performance, most future-proof',
          'FTTB: Fiber reaches the building\'s equipment room; in-building copper/coax used for individual units',
          'FTTC / FTTCab: Fiber reaches a street cabinet ~200–300 m from subscriber; VDSL2 or G.fast for last segment',
          'FTTN: Fiber to a node up to ~1.5 km from subscriber; ADSL2+ or VDSL2 for last segment',
          'Last Mile: The final connection segment from distribution point to subscriber — historically the costliest and slowest upgrade path',
        ],
      },
      {
        title: 'Comparing FTTx Variants',
        body: 'Each FTTx variant differs in where the optical fiber terminates, the technology used for the final segment, and the maximum bandwidth achievable.',
        table: {
          headers: ['Variant', 'Fiber Termination Point', 'Last-Segment Technology', 'Typical Max DL Speed', 'Upgrade Path'],
          rows: [
            ['FTTH/FTTP', 'Inside subscriber home', 'None (fiber to ONT)', '1–10 Gbps+', 'Excellent — replace electronics only'],
            ['FTTB', 'Building equipment room', 'Copper/Ethernet in-building', '100–1000 Mbps', 'Good — upgrade in-building wiring'],
            ['FTTC', 'Street cabinet ~200–300 m', 'VDSL2 / G.fast over copper', '50–300 Mbps', 'Limited — copper still required'],
            ['FTTN', 'Node up to ~1.5 km', 'ADSL2+ / VDSL2 over copper', '24–100 Mbps', 'Poor — long copper loop limits speed'],
            ['FTTN (G.fast)', 'Node ~100–250 m', 'G.fast over copper', '200–500 Mbps', 'Moderate — short loops only'],
          ],
        },
      },
      {
        title: 'P2P vs PON Architectures',
        body: 'Two fundamental ODN architectures exist for FTTH: Point-to-Point (P2P) and Point-to-Multipoint (PON). P2P provides each subscriber with a dedicated fiber strand from the OLT. PON shares one feeder fiber among multiple subscribers using passive optical splitters.',
        bullets: [
          'P2P: Full dedicated bandwidth; high fiber count and OLT port count; preferred for business SLAs',
          'PON: Shared downstream bandwidth; fewer OLT ports and feeder fibers needed; lower cost per subscriber',
          'AON (Active Optical Network): Uses powered switches/hubs in the outside plant; requires field power; P2P Ethernet topology',
          'PON (Passive Optical Network): No powered equipment between OLT and subscriber; passive splitters only; GPON/EPON/XGS-PON',
          'Typical PON split ratios: 1:32 (GPON most common), 1:64 (larger areas, tighter budget)',
        ],
      },
      {
        title: 'FTTH for Future-Proofing',
        body: 'FTTH is considered the gold standard for last-mile connectivity because single-mode fiber has virtually unlimited bandwidth potential. Capacity upgrades require only replacing the active electronics (OLT and ONT), not the buried or aerial fiber plant. VDSL2 and G.fast networks still require fiber to get closer and eventually converge to FTTH.',
        bullets: [
          'GPON (2.5G/1.25G) → XGS-PON (10G/10G) → NG-PON2 (40G) — same fiber ODN, just replace OLT cards and ONTs',
          'Copper-based variants require physical reduction of loop length (more dig/deployment) to improve speed',
          'MDU (Multi-Dwelling Unit) FTTH increasingly uses in-building fiber to each unit rather than FTTB + copper',
          'SDU (Single-Dwelling Unit): FTTH is the standard — fiber all the way to the home',
          'Regulators and governments globally mandate FTTH for national broadband plans due to its longevity',
        ],
      },
    ],
  },

  {
    domain: 'PON Technology',
    icon: '📡',
    color: '#7c3aed',
    overview:
      'Passive Optical Networks (PON) are the dominant FTTH delivery technology worldwide. A deep understanding of GPON, EPON, XGS-PON, and their wavelength plans, frame structures, and QoS mechanisms is central to the CFOS(H) exam. PON technology knowledge covers everything from the physical-layer splitter loss budget to the logical ranging and bandwidth allocation mechanisms.',
    topics: [
      {
        title: 'GPON vs EPON',
        body: 'GPON (ITU-T G.984) and EPON (IEEE 802.3ah) are the two dominant legacy PON standards. They differ in speeds, framing, and management interfaces.',
        table: {
          headers: ['Feature', 'GPON (ITU-T G.984)', 'EPON (IEEE 802.3ah)'],
          rows: [
            ['Downstream rate', '2.488 Gbps', '1.25 Gbps'],
            ['Upstream rate', '1.244 Gbps', '1.25 Gbps'],
            ['DS wavelength', '1490 nm', '1490 nm'],
            ['US wavelength', '1310 nm', '1310 nm'],
            ['Frame format', 'GEM (GPON Encapsulation Method)', 'Ethernet (802.3)'],
            ['Management', 'OMCI (ITU-T G.988)', 'OAM (802.3ah)'],
            ['Max ONUs per port', '64', '32 (typical)'],
            ['Max reach', '20 km', '20 km'],
            ['QoS mechanism', 'T-CONT / DBA', 'MPCP / DBA'],
          ],
        },
      },
      {
        title: 'PON Wavelength Plan',
        body: 'Different PON generations are designed to coexist on the same ODN fiber using WDM wavelength separation. Understanding the wavelength plan is critical for equipment compatibility and avoiding interference.',
        table: {
          headers: ['Standard', 'Downstream λ', 'Upstream λ', 'Max Speed DS/US'],
          rows: [
            ['GPON (G.984)', '1490 nm', '1310 nm', '2.5G / 1.25G'],
            ['EPON (802.3ah)', '1490 nm', '1310 nm', '1.25G / 1.25G'],
            ['XG-PON1 (G.987)', '1577 nm', '1270 nm', '10G / 2.5G'],
            ['XGS-PON (G.9807.1)', '1577 nm', '1270 nm', '10G / 10G'],
            ['RF Video Overlay', '1550 nm', 'N/A', 'CATV analog/digital'],
            ['NG-PON2 (G.989)', '1596–1602 nm (TWDM)', '1524–1544 nm', '40G / 10G aggregate'],
          ],
        },
      },
      {
        title: 'Splitter Technology & Loss Values',
        body: 'Passive optical splitters divide the optical power from one fiber to multiple output fibers. PLC (Planar Lightwave Circuit) splitters are preferred for PON due to their wavelength independence and uniformity.',
        table: {
          headers: ['Split Ratio', 'PLC Insertion Loss', 'FBT Typical Loss', 'Notes'],
          rows: [
            ['1:2', '3.7 dB', '3.7 dB', 'Both types comparable at low ratios'],
            ['1:4', '7.2 dB', '7.5 dB', 'FBT usable but wavelength-dependent'],
            ['1:8', '10.7 dB', '10.5–11.0 dB', 'FBT uniformity degrades'],
            ['1:16', '13.8 dB', '14.0–15.0 dB', 'PLC preferred above 1:8'],
            ['1:32', '17.2 dB', 'Not recommended', 'PLC is standard for 1:32'],
            ['1:64', '20.8 dB', 'Not recommended', 'PLC only; near budget limit'],
          ],
        },
      },
      {
        title: 'ONU Registration (O-State Machine)',
        body: 'A GPON ONU follows a defined activation state machine to register with the OLT before carrying subscriber traffic.',
        bullets: [
          'O1 – Initial: ONU powers on, tunes receiver, listens for OLT downstream',
          'O2 – Standby: ONU synchronized to downstream frame; awaiting Serial Number request',
          'O3 – Serial Number: ONU responds to Serial Number request with its unique ID',
          'O4 – Ranging: OLT measures round-trip delay; assigns Equalization Delay (EqD)',
          'O5 – Operation: ONU fully registered, authenticated, and carrying traffic',
          'O6 – POPUP: ONU responding to a POPUP message during rogue ONU detection',
          'O7 – Emergency Stop: ONU transmitter disabled by OLT command',
          'PLOAM messages carry all activation, ranging, and key-exchange signaling',
          'OMCI (G.988) configures services (VLANs, QoS, VoIP) after O5 is reached',
        ],
      },
      {
        title: 'DBA & QoS (T-CONTs)',
        body: 'GPON quality-of-service is managed through T-CONTs (Transmission Containers) and Dynamic Bandwidth Allocation (DBA). T-CONTs define how upstream bandwidth is granted to each ONU.',
        bullets: [
          'T-CONT Type 1: Fixed — constant guaranteed bandwidth, no variation; for TDM, VoIP',
          'T-CONT Type 2: Assured — guaranteed minimum; unused grants are not reallocated; for video streaming',
          'T-CONT Type 3: Assured + non-assured — guaranteed minimum + burst above guaranteed; for data',
          'T-CONT Type 4: Best Effort — no guarantee; filled when bandwidth is available; for background data',
          'T-CONT Type 5: Combined — all T-CONT types in one; most flexible; for convergent services',
          'DBA: OLT polls ONUs\' buffer status reports (BSR) and dynamically adjusts grant sizes each frame',
          'Statistical multiplexing gain: when not all ONUs are busy simultaneously, DBA reclaims and redistributes idle capacity',
          'GEM ports: Each T-CONT carries one or more GEM ports that map to individual services (Internet, VoIP, IPTV)',
        ],
      },
    ],
  },

  {
    domain: 'Components & Equipment',
    icon: '🔧',
    color: '#0891b2',
    overview:
      'A thorough understanding of fiber optic components — from OLT and ONT hardware to connectors, cables, and splices — is essential for both design and field work. The CFOS(H) exam tests knowledge of connector types, fiber specifications, splice losses, and infrastructure elements like ODFs and enclosures.',
    topics: [
      {
        title: 'OLT & ONU/ONT',
        body: 'The OLT (Optical Line Terminal) and ONU/ONT (Optical Network Unit/Terminal) are the active endpoints of the PON.',
        bullets: [
          'OLT: Located in the service provider\'s CO; terminates the PON; connects to IP/MPLS core upstream; houses OLT line cards (one per PON port)',
          'ONU: Multi-subscriber device used in FTTB/MDU deployments; converts optical to Ethernet for multiple units',
          'ONT: Single-subscriber CPE device at an individual home; provides ETH, WiFi, VoIP, and sometimes CATV ports',
          'Residential Gateway (RGW): ONT with integrated router, DHCP server, NAT, WiFi AP, and VoIP ATA',
          'OMCI: OLT remotely configures and monitors ONTs using OMCI (ITU-T G.988) management channel embedded in GEM port 0',
          'OLT power: Resides in powered CO with UPS; typically N+1 redundant power supplies',
          'ONT power: Relies on subscriber AC power; battery backup (BBU) required for VoIP survivability',
        ],
      },
      {
        title: 'Connector Types',
        body: 'Connector choice critically affects return loss and insertion loss. SC/APC is the standard for PON ODN; LC connectors are used for equipment-side patch cords.',
        table: {
          headers: ['Connector', 'Color', 'Ferrule Angle', 'Typical Return Loss', 'Primary Use'],
          rows: [
            ['SC/APC', 'Green', '8° angled', '≥60 dB', 'PON ODN (outside plant, splitters, ODF)'],
            ['SC/UPC', 'Blue', '0° flat', '≥50 dB', 'General SMF connections; not preferred for PON'],
            ['LC/APC', 'Green', '8° angled', '≥60 dB', 'High-density equipment panels; SFP modules'],
            ['LC/UPC', 'Blue', '0° flat', '≥50 dB', 'Data center, SFP+, XFP transceivers'],
            ['FC/APC', 'Green', '8° angled', '≥60 dB', 'Test equipment, OTDR launch cables'],
            ['MPO/MTP', 'Various', '0° flat', '≥20 dB', 'Multi-fiber ribbon, data center trunk cables'],
          ],
        },
      },
      {
        title: 'Fiber Types',
        body: 'Single-mode fiber types are standardized by ITU-T G.65x series. Understanding which type to specify is important for system performance and installation compliance.',
        table: {
          headers: ['ITU-T Type', 'Common Name', 'Core/Clad', 'Key Feature', 'Typical Use'],
          rows: [
            ['G.652D', 'Standard SMF (low water peak)', '9/125 μm', 'Zero water-peak; full O–L band usable', 'Outside plant feeder and distribution fiber'],
            ['G.657A1', 'Bend-insensitive SMF (moderate)', '9/125 μm', 'Min bend radius 10 mm; G.652 compatible', 'In-building wiring, drop cables'],
            ['G.657A2', 'Bend-insensitive SMF (extreme)', '9/125 μm', 'Min bend radius 7.5 mm', 'Very tight-turn indoor applications'],
            ['G.654', 'Ultra-low loss SMF', '9–10/125 μm', 'Very low attenuation (0.16 dB/km)', 'Long-haul, submarine; not typical for FTTH'],
            ['G.651.1', 'Multimode OM3/OM4', '50/125 μm', 'High bandwidth multimode', 'Data center short-reach; not used in FTTH'],
          ],
        },
      },
      {
        title: 'Splice Types',
        body: 'Fibers must be spliced to join cable sections. Two splicing methods are used: fusion (preferred) and mechanical (temporary/emergency).',
        bullets: [
          'Fusion splice: Arc-welded glass-to-glass join; loss 0.02–0.1 dB; permanent; requires fusion splicer and cleaver',
          'Mechanical splice: Index-matching gel between cleaved fiber ends in a mechanical housing; loss 0.1–0.3 dB; faster but less reliable long-term',
          'Mass fusion splice: Splices an entire 12-fiber ribbon simultaneously; used in high-count cable plants for speed',
          'Splice protection: Heat-shrink sleeves (with steel rod insert) protect fusion splices; minimum 40 mm length',
          'Splice trays: House and organize splices inside closures; typically hold 12 or 24 splices per tray',
          'Acceptance: Maximum 0.3 dB per splice (standards), typically <0.1 dB for quality work',
        ],
      },
      {
        title: 'ODF & Infrastructure',
        body: 'The Optical Distribution Frame (ODF) and associated outside plant enclosures form the physical backbone of the fiber network.',
        bullets: [
          'ODF: Rack-mounted termination panel in the CO that terminates incoming cables and provides patch access to OLT ports; manages fiber slack and labeling',
          'Splice closure: Weatherproof enclosure for mid-span cable splices; dome, horizontal, or butt-entry styles; re-enterable design preferred',
          'Distribution cabinet/pedestal: Street-level enclosure housing passive splitters, splice trays, and fiber management; temperature-rated for outdoor use',
          'FAT (Fiber Access Terminal): Pole-mounted or buried terminal providing subscriber drop connection points',
          'Conduit: HDPE 40 mm and 32 mm microtrenching conduits are common for FTTH; singleway or multiway duct systems',
          'Innerduct: Sub-ducts inside larger conduit allow multiple cable pulls in one conduit installation',
        ],
      },
    ],
  },

  {
    domain: 'Network Design & Planning',
    icon: '📐',
    color: '#d97706',
    overview:
      'FTTH network design requires balancing optical power budgets, subscriber density, topological choices, and economic constraints. The CFOS(H) exam tests the ability to calculate link budgets, understand ODN architecture levels, plan fiber counts, and apply cascade splitting strategies for scalable deployments.',
    topics: [
      {
        title: 'Link Budget Calculation',
        body: 'The optical power budget is the fundamental design calculation for every PON ODN. It ensures that enough optical power reaches each ONU under worst-case conditions.',
        bullets: [
          'Formula: Rx Power (dBm) = OLT Tx Power (dBm) − Total ODN Loss (dB)',
          'System margin = Rx Power − Rx Sensitivity; must be ≥3 dB',
          'GPON Class B+: OLT Tx = +5 dBm typical; ONU sensitivity = −27 dBm; max budget = 28 dB',
          'Loss components: feeder fiber (0.35 dB/km at 1490 nm) + splitter loss + distribution fiber + drop fiber + connector losses + splice losses',
          'Example: 10 km feeder (3.5 dB) + 1:32 splitter (17.2 dB) + 0.5 km distribution (0.18 dB) + 4 connectors (2.0 dB) + 3 splices (0.3 dB) = 23.18 dB total loss',
          'Rx = +5 − 23.18 = −18.18 dBm; margin = −18.18 − (−27) = 8.82 dB (excellent)',
          'If total loss exceeds 28 dB (minus desired margin), redesign the ODN (shorter feeder, lower split ratio, better connectors)',
        ],
      },
      {
        title: 'ODN Architecture Levels',
        body: 'The ODN (Optical Distribution Network) is organized into three hierarchical levels from CO to subscriber.',
        bullets: [
          'Feeder fiber: OLT → Primary Splitter Point (PSP). Typically high-fiber-count cable in conduit or aerial. Carries all PON traffic for a service area.',
          'Distribution fiber: PSP → Secondary Splitter Point (SSP) or FAT. Fan-out from primary splitter to neighborhood distribution nodes.',
          'Drop fiber: SSP/FAT → Subscriber ONT. Individual subscriber fiber; typically 2-fiber drop cable, 200–500 m long.',
          'Primary Splitter Point: Located at a CO, remote cabinet, or aerial/underground closure; houses primary PLC splitter (e.g., 1:4 or 1:8)',
          'Secondary Splitter Point: Located at pedestals, aerial closures, or building entry points; houses secondary PLC splitter (e.g., 1:8 or 1:16)',
          'FAT (Fiber Access Terminal): Houses individual subscriber connections; may contain secondary splitter or just terminations',
        ],
      },
      {
        title: 'Cascade Splitting',
        body: 'Cascade (two-stage) splitting uses two splitters in series to achieve a high overall split ratio while placing the second splitter closer to the subscriber.',
        table: {
          headers: ['Cascade Configuration', 'Total Split', 'Total Splitter Loss', 'Design Advantage'],
          rows: [
            ['1:2 + 1:16', '1:32', '3.7 + 13.8 = 17.5 dB', 'Secondary splitter very small; incremental build'],
            ['1:4 + 1:8', '1:32', '7.2 + 10.7 = 17.9 dB', 'Balanced; widely used configuration'],
            ['1:8 + 1:8', '1:64', '10.7 + 10.7 = 21.4 dB', '1:64 high density; tight on budget'],
            ['1:4 + 1:16', '1:64', '7.2 + 13.8 = 21.0 dB', 'Lower combined loss vs 1:64 single stage (20.8 dB difference negligible)'],
            ['Single 1:32', '1:32', '17.2 dB', 'Simplest; all splitting at one point'],
          ],
        },
      },
      {
        title: 'Fiber Count Planning',
        body: 'Planning the correct fiber counts in feeder and distribution cables is critical for both immediate service and future scalability.',
        bullets: [
          'Feeder fiber count: Based on number of OLT PON ports required for the service area plus spares',
          'Spare fibers: Minimum 20% spare at installation; 50% spare preferred in feeder cables',
          'Protection fibers: Ring or dual-route topologies require parallel fiber pairs for automatic switchover',
          'Dark fiber / IRU: Pre-installed fibers leased to third parties or reserved for future services (e.g., mobile backhaul, enterprise)',
          'Fiber inventory: GIS-based OSS/BSS tracks available, in-use, reserved, and failed fibers in real time',
          'MDU in-building: Plan one fiber per unit + 20% spare; include homerun fiber to each unit from building entry point for future P2P upgrade',
          'Duct capacity: Plan conduit fill ≤40% for multiple cables; leave empty innerducts for future pulls without excavation',
        ],
      },
    ],
  },

  {
    domain: 'Installation Practices',
    icon: '🦺',
    color: '#16a34a',
    overview:
      'Correct installation practices ensure the fiber plant performs to spec, remains reliable over its 30+ year design life, and passes acceptance testing. The CFOS(H) exam covers fiber handling, bend radius rules, fusion splicing procedures, cable installation methods, and safety practices that every fiber technician must know.',
    topics: [
      {
        title: 'Fiber Handling & Bend Radius',
        body: 'Fiber glass is strong in tension but brittle under sharp bends. Bend radius rules exist to prevent macrobending loss and long-term fatigue fractures.',
        bullets: [
          'Long-term (installed) bend radius: ≥20× cable outer diameter',
          'Short-term (during installation) bend radius: ≥10× cable outer diameter',
          'G.657A1 bend-insensitive fiber: rated for 10 mm bend radius — used in drop cables inside walls',
          'Standard SMF (G.652D): 125 μm cladding / 9 μm core / 250 μm coating',
          'Fiber dimensions: 9 μm core (SMF), 50 μm core (MMF), 125 μm cladding, 250 μm coating, 900 μm tight buffer, 2 mm or 3 mm jacket',
          'Cable ties: Use Velcro or hand-tight zip ties only; overtightening causes microbend loss',
          'Pulling tension: Monitor with in-line tension meter; do not exceed rated maximum tensile load (100–600 N)',
          'Minimum pull angles: Avoid sharp turns at conduit bends; use sweeping 45° bends, not 90° elbows',
        ],
      },
      {
        title: 'Fusion Splicing Procedure',
        body: 'Fusion splicing is the permanent joining of two fiber ends by electric arc melting. Following the correct step sequence is essential to achieving low-loss, reliable splices.',
        bullets: [
          'Step 1 – Strip: Remove outer jacket, loose tube, and buffer coating using appropriate stripping tools; do not nick the glass',
          'Step 2 – Clean: Wipe bare glass with 99% IPA (isopropyl alcohol) on lint-free wipe; then dry wipe; remove all gel and residue',
          'Step 3 – Cleave: Insert fiber into precision cleaver; obtain a flat end-face with ≤0.5° angle and no chips or hackles',
          'Step 4 – Load & Splice: Load both fibers into splicer V-grooves; close lid; splicer performs auto-alignment and arc fusion',
          'Step 5 – Inspect: Check splicer-estimated insertion loss (typically <0.05 dB); inspect microscope view for defects',
          'Step 6 – Protect: Slide pre-threaded heat-shrink sleeve over splice; place in splicer heater for ~30 seconds',
          'Step 7 – Store: Coil spliced fiber with adequate radius and store in splice tray; secure with retainer clips',
          'Cleave quality: End-face angle ≤0.5° required; chips or hackles cause elevated loss and must be re-cleaved',
        ],
      },
      {
        title: 'Cable Types & Installation Methods',
        body: 'Different cable constructions suit different installation environments. Choosing the wrong cable type is a common and expensive mistake.',
        table: {
          headers: ['Cable Type', 'Construction Features', 'Typical Application'],
          rows: [
            ['Loose-tube gel-filled', 'Multiple buffer tubes, thixotropic gel, PE jacket', 'OSP aerial or direct-burial (with armor)'],
            ['Tight-buffered indoor', '900 μm tight buffer, aramid yarn, PVC/LSZH jacket', 'Indoor risers, equipment rooms, patch cords'],
            ['Ribbon cable', 'Flat ribbons of 12 or 24 fibers, loose or tight construction', 'High-count CO cables, mass fusion splicing'],
            ['ADSS aerial', 'All-dielectric, aramid strength members, PE sheath', 'Long aerial spans on power line poles'],
            ['Figure-8 aerial drop', 'Steel/dielectric messenger + fiber lobe in one jacket', 'Short aerial drops to premises, up to ~50–100 m span'],
            ['Armored direct-burial', 'Corrugated steel or PE armor layer, outer PE jacket', 'Direct burial without conduit, rodent-prone areas'],
            ['Microduct cable', 'Very small OD (2–5 mm), loose-tube or tight-buffered', 'Blown-fiber installation in 7–14 mm microducts'],
          ],
        },
      },
      {
        title: 'Safety Practices',
        body: 'Fiber optic work involves invisible laser radiation, sharp glass shards, and chemical hazards. Safe work practices are non-negotiable.',
        bullets: [
          'NEVER look into a fiber end or connector — invisible 1310/1490/1550 nm laser light causes permanent retinal damage',
          'Use power meter or approved VFL (with safety interlock) to verify fiber is dark before work',
          'Laser safety: GPON OLTs typically operate at Class 1M or Class 3B levels; PPE (safety glasses with side shields) required',
          'Fiber scraps: Bare glass fibers are invisible and extremely sharp; dispose in dedicated sealed containers; never leave on work surfaces',
          'IPA (isopropyl alcohol): Flammable; keep away from open flame; provide adequate ventilation',
          'Fusion splicer arc: Generates UV light and ozone; do not stare at arc; maintain ventilation',
          'Working at height: Aerial work requires fall protection, pole-climbing certification, and hot-stick rules near energized conductors',
          'Conduit pull: OSHA lockout/tagout procedures when working in vaults or manholes (confined space entry)',
        ],
      },
    ],
  },

  {
    domain: 'Testing & Troubleshooting',
    icon: '🔍',
    color: '#dc2626',
    overview:
      'Testing is how we prove the fiber plant is built correctly and meets specifications. The CFOS(H) exam covers OTDR operation and trace interpretation, end-to-end loss testing, optical return loss measurement, and systematic fault diagnosis. Understanding when to use each test tool and how to interpret results is essential for a certified fiber specialist.',
    topics: [
      {
        title: 'OTDR Fundamentals',
        body: 'The OTDR (Optical Time Domain Reflectometer) is the most powerful diagnostic tool for fiber plants, providing a visual map of the fiber with event locations and loss values.',
        bullets: [
          'Operating principle: Launches short laser pulses; measures amplitude and time of backscattered (Rayleigh) and reflected (Fresnel) light',
          'Distance calculation: d = (c/n) × (t/2), where c = speed of light, n = fiber refractive index (~1.468 for G.652), t = round-trip time',
          'Rayleigh backscatter: Continuous low-level return from the fiber; decreases linearly with distance (fiber attenuation slope)',
          'Fresnel reflection: Large spike from air-gap interfaces (connectors, fiber ends, cracks); reflective events',
          'Non-reflective event: Step-down without spike — fusion splices, macrobends',
          'Event dead zone: Region after a large reflection where detector is saturated; typically 0.5–5 m; events within zone are missed',
          'Attenuation dead zone: Longer zone after reflection before accuracy is restored; typically 2–10 m',
          'Ghost: False event at 2× distance of a real large reflection — caused by double-bounce; has no step loss',
          'OTDR launch cable: Short (100–500 m) fiber jumper placed before DUT to push dead zone away from first connector',
        ],
      },
      {
        title: 'End-to-End Power Testing',
        body: 'The light source and power meter (LSPM) test is the definitive method for measuring insertion loss over a fiber link. It is required for standards-compliant acceptance testing.',
        bullets: [
          'Method: Launch stable CW light at the test wavelength from a stabilized light source at one end; measure received power with a calibrated power meter at the other end',
          'Reference measurement: First measure source output power into a reference cord; subtract from link measurement for insertion loss',
          'Wavelengths: Test at all operating wavelengths (e.g., 1310 nm and 1550 nm for G.652 characterization; 1490 nm for GPON)',
          'Standards: TIA-568-C.3 and ISO/IEC 14763-3 specify test procedures and pass/fail limits',
          'Acceptable connector loss: ≤0.5 dB per mating pair',
          'Acceptable splice loss: ≤0.3 dB per splice (standards limit); typically <0.1 dB in practice',
          'OTDR vs LSPM: OTDR locates faults; LSPM measures actual power available — both required for complete acceptance testing',
          'Bidirectional OTDR: Average measurements from both directions to eliminate gain/loss artifacts at splices',
        ],
      },
      {
        title: 'Common Faults',
        body: 'Knowing the most frequent failure modes and their causes allows for rapid systematic troubleshooting.',
        table: {
          headers: ['Fault Type', 'Likely Cause', 'Diagnostic Tool', 'Resolution'],
          rows: [
            ['High insertion loss at connector', 'Dirty end-face contamination', 'Fiber microscope, power meter', 'Clean connector; re-inspect; retest'],
            ['High insertion loss at splice', 'Poor cleave quality, fiber mismatch, splicer arc problem', 'OTDR', 'Re-splice; re-cleave fibers'],
            ['Complete signal loss (hard break)', 'Physical fiber break (dig, crush, over-tension)', 'OTDR, VFL', 'Locate break; splice or replace section'],
            ['High return loss / ORL failure', 'SC/UPC used instead of SC/APC; damaged ferrule', 'ORL meter', 'Replace connectors with SC/APC'],
            ['Intermittent loss', 'Loose connector mating; thermal expansion stress', 'Power meter over time', 'Reseat connectors; check hardware mounting'],
            ['Macro bend loss', 'Tight bend in cable (corner, cable tie)', 'VFL (visible red glow), OTDR', 'Relieve bend; add bend radius protector'],
            ['Water ingress in splice', 'Failed splice closure seal; flooding', 'OTDR (high attenuation section)', 'Open closure; replace gel; re-seal'],
            ['ONU not registering', 'Dirty patch cord, fiber mislabeled, power budget exceeded', 'OTDR, power meter, OLT diagnostic', 'Test and clean fibers; verify budget'],
          ],
        },
      },
      {
        title: 'Acceptance Testing Standards',
        body: 'Acceptance testing is required before a fiber plant is handed over to operations. Standards define the test methods, equipment accuracy requirements, and pass/fail criteria.',
        bullets: [
          'TIA-568-C.3: Optical fiber cabling standard; defines test methods (Method A, B, C) and loss limits for structured cabling',
          'IEC 61280-4-2: Field test method for optical fiber cabling systems (OTDR method)',
          'ISO/IEC 14763-3: Testing of optical fiber cabling — field test method standard',
          'Connector end-face: IEC 61300-3-35 defines end-face acceptance zones A/B/C/D for SMF; Zone A (core) must be defect-free',
          'ORL: Minimum ≥55 dB for SC/APC plant; measured from OLT side with ORL meter or OTDR',
          'Insertion loss limits: ≤0.5 dB per connector; ≤0.3 dB per splice; total ODN loss ≤28 dB (GPON B+)',
          'Test documentation: All OTDR traces, LSPM results, and end-face photos should be stored in GIS/OSS for future reference',
          'Bidirectional OTDR: Both directions measured and averaged for accurate splice loss characterization per IEC 61280-4-2',
        ],
      },
    ],
  },
];
