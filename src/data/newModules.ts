import type { LearningModule } from './learningModules';

export const NEW_MODULES: LearningModule[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // Module A: FTTH Network Design
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'ftth-design',
    title: 'FTTH Network Design',
    icon: '🏗',
    subtitle: 'ODN planning, fiber types, and deployment rules',
    estimatedMinutes: 18,
    theory: [
      {
        heading: 'ODN Architecture Levels',
        body: 'The Optical Distribution Network (ODN) is structured into four hierarchical levels, each with distinct roles, typical distances, and component types. Understanding these levels is essential for planning a correct, cost-effective FTTH rollout.',
        table: {
          headers: ['Level', 'Component', 'Typical Distance'],
          rows: [
            ['CO Level', 'OLT, ODF, patch panels', '0 m'],
            ['Feeder', 'Trunk fiber OLT → 1st splitter', '1–20 km'],
            ['Distribution', '1st splitter → 2nd splitter / ODF', '0.5–5 km'],
            ['Drop', 'Final splitter → ONU (customer premises)', '20–200 m'],
          ],
        },
        bullets: [
          'Central Office (CO): Houses OLT chassis, patch panels, and ODF frames. The starting point of all PON circuits.',
          'Feeder fiber: Single high-count ribbon or loose-tube cable running from CO to the first street cabinet or splitter enclosure.',
          'Distribution cables: Branch from feeder cabinets toward neighbourhood street closures or multi-dwelling unit (MDU) riser frames.',
          'Drop cable: The final, thin (2–4 fibre) cable from the street closure to the subscriber ONU — often G.657A for bend tolerance in tight building risers.',
        ],
      },
      {
        heading: 'Fiber Types',
        body: 'Not all fiber is equal. Each ITU-T G-series fiber type is optimised for a specific deployment scenario. Choosing the wrong fiber can add unnecessary loss or make installation impossible in tight conduit.',
        table: {
          headers: ['Type', 'Loss (dB/km)', 'Bend radius', 'Use case'],
          rows: [
            ['G.652D', '0.35 @ 1310 nm / 0.22 @ 1550 nm', '30 mm (min)', 'Standard SMF: feeder & distribution cables, outside plant'],
            ['G.657A', '0.35 @ 1310 nm / 0.22 @ 1550 nm', '7.5–10 mm', 'Bend-insensitive: indoor drop cables, tight building risers'],
            ['G.654E', '0.17 @ 1550 nm', '30 mm', 'Ultra-low loss: long-haul feeder, budget-critical links'],
          ],
        },
        bullets: [
          'G.652D is the workhorse of outside-plant OSP deployments and is backwards compatible with all GPON/XGS-PON equipment.',
          'G.657A is mandatory for indoor drop cables — it can be routed around door frames and window sills without inducing measurable bend loss.',
          'G.654E is rarely used in access networks but may appear in very long feeder runs (>15 km) where standard SMF loss would erode the link margin.',
        ],
      },
      {
        heading: 'Splitter Placement Rules',
        body: 'The two principal splitting strategies — centralised and distributed — represent a trade-off between field installation complexity and fibre count in the feeder route.',
        bullets: [
          'Centralised splitting: Single 1:32 or 1:64 splitter at the CO or first cabinet. Fewer splitter enclosures to maintain, but requires high-fibre-count feeder cables to each subscriber area.',
          'Distributed splitting: 1:4 or 1:8 feeder splitter at the CO/cabinet, then 1:8 distribution splitters close to the subscribers. Lower fibre count in feeder, but more field splitter locations to maintain.',
          'ODF placement: An ODF at the CO (and optionally at each street cabinet) provides a patching point, simplifies fault localisation, and allows circuit reassignment without field splicing.',
          'Maximum logical reach: OLT to ONU must not exceed 20 km (GPON Class B+). Physical fiber path including all ODN segments must be calculated, not straight-line distance.',
          'Differential reach: All ONUs on the same PON port must be within 20 km of each other — otherwise ranging guard bands grow and capacity is wasted.',
        ],
      },
      {
        heading: 'Power Budget Design Process',
        body: 'A systematic power budget calculation must be completed before any field work begins. The goal is to confirm that every ONU in the design will have at least 3 dB of margin above the receiver sensitivity threshold.',
        bullets: [
          'Step 1: Choose standard — GPON (Class B+: TX +1 to +5 dBm, RX sensitivity −28 dBm, budget ≈ 29–33 dB) or XGS-PON (Class N2: budget ≈ 31 dB).',
          'Step 2: Determine maximum distance from OLT to farthest ONU in the planned area.',
          'Step 3: Select split ratio — higher ratios (1:32, 1:64) consume more of the budget for splitter loss.',
          'Step 4: Calculate feeder loss — (feeder length km × 0.22 dB/km) + (connectors × 0.5 dB) + (splices × 0.1 dB).',
          'Step 5: Calculate distribution loss — (distribution length × 0.35 dB/km) + connector and splice losses.',
          'Step 6: Calculate drop loss — (drop length × 0.35 dB/km) + connector losses.',
          'Step 7: Sum all losses + splitter insertion loss. Verify: Budget − Total Loss ≥ 3 dB margin.',
        ],
      },
    ],
    lab: {
      topologyId: 'complete-ftth',
      intro: 'Load the Complete FTTH District topology which models a real district with a Central Office ODF, street cabinet splitters, and multiple ONUs. Trace the optical path from OLT through the ODN levels to each ONU, then verify that all links operate within budget.',
      objectives: [
        { id: 'fd-has-olt', text: 'Load the Complete FTTH topology', checker: 'has-olt' },
        { id: 'fd-has-odf', text: 'Confirm the topology has an ODF in the central office section', checker: 'has-odf' },
        { id: 'fd-all-reg', text: 'Start simulation and verify all ONUs register successfully (O5)', checker: 'all-registered' },
        { id: 'fd-budget', text: 'Open the Power Budget tab and verify all links are green', checker: 'power-budget-open' },
      ],
    },
    quiz: [
      {
        id: 'qfd-1',
        question: 'What is the maximum logical reach of a GPON Class B+ system?',
        choices: ['5 km', '10 km', '20 km', '40 km'],
        answer: 2,
        explanation: 'ITU-T G.984.2 Class B+ specifies a maximum logical reach of 20 km. This is the maximum distance from OLT to ONU — the physical fiber path must not exceed this limit or the ONU cannot complete ranging.',
      },
      {
        id: 'qfd-2',
        question: 'Which fiber type is recommended for indoor drop cables due to its tight bend radius tolerance?',
        choices: ['G.652D', 'G.657A', 'G.654E', 'G.651.1'],
        answer: 1,
        explanation: 'G.657A bend-insensitive fiber handles bend radii as small as 7.5–10 mm, making it ideal for routing around door frames, window sills, and tight building risers without incurring measurable bend-induced loss.',
      },
      {
        id: 'qfd-3',
        question: 'In a 2-stage cascaded splitter design using a 1:4 feeder splitter and a 1:4 distribution splitter, what is the effective total splitting ratio?',
        choices: ['1:4', '1:8', '1:16', '1:32'],
        answer: 2,
        explanation: 'Cascaded splitters multiply: 4 × 4 = 16, giving an effective ratio of 1:16. Each stage also adds its own insertion loss, so the total budget consumption equals the sum of both splitter losses (7.2 + 7.2 = 14.4 dB).',
      },
      {
        id: 'qfd-4',
        question: 'What is the minimum recommended link margin for a reliable GPON connection?',
        choices: ['0 dB', '1 dB', '3 dB', '6 dB'],
        answer: 2,
        explanation: 'A minimum 3 dB margin is the industry standard. This headroom accounts for connector degradation over time, fiber bending, temperature-induced loss variation, and future maintenance connectors added when fiber is repaired.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Module B: Troubleshooting & Fault Analysis
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    subtitle: 'Fault isolation, alarm interpretation, and optical testing',
    estimatedMinutes: 20,
    theory: [
      {
        heading: 'Common PON Faults',
        body: 'PON faults follow recognisable patterns. Matching the observed symptom to the likely cause dramatically speeds up restoration. The O-state the ONU is stuck in is usually the first and most useful diagnostic clue.',
        table: {
          headers: ['Symptom', 'Possible Cause', 'Test / Fix'],
          rows: [
            ['ONU stuck in O1 (no signal)', 'Fiber cut, dirty connector, wrong wavelength', 'OTDR test, clean connectors, verify ONU standard matches OLT'],
            ['ONU stuck in O2', 'Downstream sync issues, low RX power', 'Check OLT TX power, measure ONU RX power with optical power meter'],
            ['ONU oscillates O3 ↔ O4', 'Ranging failure, RTD instability', 'Check fiber length is within 20 km, look for reflections on OTDR trace'],
            ['ONU goes O5 → O6 frequently', 'Marginal budget, physical damage to fiber', 'Check power budget margin, inspect entire fiber route for damage'],
            ['High BER (elevated bit errors)', 'Dirty connectors, fiber micro-bends', 'Clean all connectors with IEC 61300-3-35 tool, check cable routing'],
          ],
        },
      },
      {
        heading: 'Alarm Severity Levels',
        body: 'All PON management systems classify alarms by severity so operators can prioritise response. Understanding severity levels prevents operators from ignoring critical alarms among a sea of informational messages.',
        bullets: [
          'Critical (red): LOS (Loss of Signal), LOF (Loss of Frame), ONU offline — immediate response required, subscriber completely out of service.',
          'Major (orange): RX power below threshold, BER exceeded — service degraded, SLA likely breached.',
          'Minor (yellow): Marginal budget warning, temperature approaching limit — schedule maintenance before fault occurs.',
          'Info (blue): ONU registered, service activated, software upgrade completed — no action required.',
          'To see all active alarms in the Huawei CLI: run "display alarm active". The output lists alarm ID, severity, time, and affected entity (e.g., frame/slot/port/ONU).',
        ],
      },
      {
        heading: 'Optical Time Domain Reflectometer (OTDR)',
        body: 'An OTDR is the key field instrument for locating fiber faults. It sends a high-power laser pulse into the fiber and measures the time-of-flight of back-scattered and back-reflected light to produce a trace of loss vs. distance.',
        table: {
          headers: ['Event type', 'OTDR signature', 'Typical loss'],
          rows: [
            ['Clean fiber end (far end)', 'Large positive reflection spike at cable end', '0 dB (reference)'],
            ['Good fusion splice', 'Small step-down in trace, no reflection', '0.05–0.1 dB'],
            ['Poor fusion splice / micro-bend', 'Larger step-down, possibly a small ghost', '0.2–0.5 dB'],
            ['Mated connector pair (SC/APC)', 'Small step-down and possible reflection', '0.3–0.5 dB'],
            ['Dirty or damaged connector', 'Large step-down with strong reflection spike', '>0.5 dB'],
            ['Fiber break / cut', 'Trace drops to noise floor; strong reflection', 'Infinite (link broken)'],
            ['Ghost / reflection artefact', 'False echo event beyond the real cable end', 'Measured distance > actual cable length'],
          ],
        },
        bullets: [
          'Set OTDR pulse width to match fiber length: short pulse (5–30 ns) for <2 km, long pulse (1–10 μs) for >10 km.',
          'In a PON, the OTDR is placed at the OLT side. Splitters appear as a large loss event (10.7 dB for 1:8) followed by multiple echoes from each branch.',
          'A PON-optimised OTDR (such as Viavi T-BERD 8000 with PON module) can suppress the splitter return and trace individual drop cables.',
        ],
      },
      {
        heading: 'Fault Isolation Process',
        body: 'A structured, step-by-step isolation process avoids wasted truck rolls and ensures the root cause is correctly identified the first time.',
        bullets: [
          'Step 1: Check the alarm log — note the alarm severity, time of occurrence, and which ONU(s) are affected.',
          'Step 2: Identify affected ONUs — is it one ONU or all ONUs on the same PON port?',
          'Step 3: Scope the fault — if a single ONU is affected, suspect the drop cable or the ONU itself. If all ONUs on a port are affected, suspect the feeder fiber or the OLT PON port.',
          'Step 4: Test optical power at the ONU RX port using a calibrated optical power meter.',
          'Step 5: Run OTDR from OLT side if RX power is zero or severely low — locate the break or high-loss event.',
          'Step 6: Clean connectors (IEC 61300-3-35 criteria) before replacing any fiber section — 80% of PON faults are caused by dirty connectors.',
        ],
      },
    ],
    lab: {
      topologyId: 'budget-challenge',
      intro: 'Load the Budget Challenge topology. It features ONUs with marginal and over-budget optical links, simulating real-world degraded or partially faulty connections. Your task is to identify the alarms, analyse the root cause using the power budget tool, and review the event log.',
      objectives: [
        { id: 'tr-loaded', text: 'Load the Budget Challenge topology', checker: 'has-olt' },
        { id: 'tr-started', text: 'Start the simulation', checker: 'sim-running' },
        { id: 'tr-marginal', text: 'Identify ONUs with alarm conditions (amber or red coloring)', checker: 'marginal-budget' },
        { id: 'tr-onu-sel', text: 'Select a red or amber ONU to check its RX power in the Properties panel', checker: 'onu-selected' },
        { id: 'tr-budget', text: 'Open the Power Budget chart to analyse the full path loss breakdown', checker: 'power-budget-open' },
        { id: 'tr-events', text: 'Check the Event Log tab for alarm events', checker: 'events-logged' },
      ],
    },
    quiz: [
      {
        id: 'qtr-1',
        question: 'An ONU is stuck at O1 state after the simulation starts. What is the most likely cause?',
        choices: [
          'VLAN misconfiguration on the service port',
          'Fiber cut or no optical signal reaching the ONU',
          'Wrong ONU-ID assigned by the OLT',
          'DBA profile error causing upstream scheduling failure',
        ],
        answer: 1,
        explanation: 'O1 is the initial power-on state. The ONU cannot proceed to O2 until it detects a valid downstream optical signal. A fiber cut, a completely dirty or disconnected connector, or the wrong ONU standard (GPON vs XGS-PON) would all keep the ONU in O1.',
      },
      {
        id: 'qtr-2',
        question: 'All ONUs on a single PON port simultaneously transition to O6 state. What does this most likely indicate?',
        choices: [
          'Individual ONU hardware failures happening at the same time',
          'A fault in the shared feeder fiber or the OLT PON port itself',
          'A DBA algorithm crash causing upstream scheduling to fail',
          'A VLAN storm on the subscriber network',
        ],
        answer: 1,
        explanation: 'When all ONUs on one port fail simultaneously, the fault must be in a shared component — the feeder fiber between OLT and the first splitter, or the OLT PON card/port itself. Individual ONU faults would affect only the specific ONU whose drop cable is damaged.',
      },
      {
        id: 'qtr-3',
        question: 'What instrument is used to locate the exact physical position of a fiber break?',
        choices: [
          'Optical power meter',
          'Spectrum analyser',
          'OTDR (Optical Time Domain Reflectometer)',
          'Stabilised light source',
        ],
        answer: 2,
        explanation: 'An OTDR measures the time-of-flight of back-scattered laser pulses to produce a distance-vs-loss trace. A fiber break appears as a sharp reflection followed by the trace dropping to the noise floor. The distance to the break is measured directly from the trace, enabling crews to excavate or access the correct location.',
      },
      {
        id: 'qtr-4',
        question: 'A link margin drops gradually from 8 dB to 2 dB over 6 months with no configuration changes. What is the most likely cause?',
        choices: [
          'Increased internet traffic loading the optical link',
          'Gradual connector contamination or slow fiber degradation (micro-bending)',
          'An OLT software bug reducing TX power output',
          'Splitter component aging reducing insertion loss',
        ],
        answer: 1,
        explanation: 'Gradual optical margin loss is almost always caused by connector contamination (dust accumulation at SC/APC connectors) or fiber degradation such as micro-bending from cable movements or mechanical stress. Traffic load has no effect on optical power. A software bug would cause a sudden change, not a gradual drift.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Module C: Residential Home Setup
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'home-setup',
    title: 'Home Network Setup',
    icon: '🏠',
    subtitle: 'From FTTH ONT to WiFi and end devices',
    estimatedMinutes: 15,
    theory: [
      {
        heading: 'The Home FTTH Connection',
        body: 'A residential FTTH connection starts at the Central Office OLT and ends at the subscriber\'s ONU/ONT (Optical Network Terminal) installed at the home. The ONU is the bridge between the optical PON network and the copper/WiFi home network.',
        bullets: [
          'OLT at Central Office → feeder fiber (trunk) → street cabinet splitter → drop cable → ONU/ONT at the customer premises.',
          'The ONU converts the optical PON signal to standard Ethernet (RJ-45) and WiFi for home devices.',
          'Most residential ONUs include: 1× PON port (optical SC/APC), 4× LAN ports (Gigabit Ethernet), 1× dual-band WiFi radio (2.4 GHz + 5 GHz), 2× POTS ports (VoIP telephony).',
          'Common residential ONU models: Huawei HG8245H (GPON, 4-port), ZTE F680 (GPON, WiFi 6), Nokia G-240W-B (XGS-PON compatible).',
          'The ISP provisions the ONU remotely via OMCI (ONU Management and Control Interface) — the subscriber does not need to configure the PON side.',
        ],
      },
      {
        heading: 'IP Address Assignment',
        body: 'A residential FTTH connection involves two distinct IP address layers: the WAN side (between ONU and OLT/ISP) and the LAN side (between ONU and home devices). Understanding both layers helps diagnose connectivity problems.',
        table: {
          headers: ['Layer', 'Addressing'],
          rows: [
            ['WAN (ONU to OLT / ISP core)', 'Managed entirely by the ISP. Typically PPPoE (dial-up style) or DHCP. Subscriber gets a public IP address (or CG-NAT address).'],
            ['LAN (ONU to home devices)', '192.168.1.x / 24 by default. The ONU acts as a NAT router; its LAN IP is 192.168.1.1.'],
            ['Home devices', 'Assigned automatically by DHCP: 192.168.1.2 through 192.168.1.254. Lease time typically 24 hours.'],
          ],
        },
        bullets: [
          'PPPoE (Point-to-Point Protocol over Ethernet) is common in ADSL/FTTH migration networks — the subscriber has a username and password.',
          'IPoE (IP over Ethernet) / DHCP WAN is increasingly common in new FTTH deployments — no username needed, the ONU gets an IP automatically.',
          'The ONU\'s built-in NAT (Network Address Translation) allows all home devices to share the single ISP-provided WAN IP address.',
        ],
      },
      {
        heading: 'WiFi Best Practices',
        body: 'The integrated WiFi radio in the ONU/router is most users\' primary interface to the internet. Optimal channel selection, security settings, and placement significantly affect performance.',
        table: {
          headers: ['Band', 'Range', 'Speed', 'Best for'],
          rows: [
            ['2.4 GHz', 'Long (30 m+)', 'Up to 300 Mbps (802.11n)', 'IoT devices, phones at distance, penetrating walls'],
            ['5 GHz', 'Short (~15 m)', 'Up to 1300 Mbps (802.11ac)', 'HD streaming, gaming, laptops near the router'],
            ['Dual-band (both)', 'Both', 'Both', 'Modern laptops and phones that auto-select the best band'],
          ],
        },
        bullets: [
          'Security: WPA3 is the current recommended standard. WPA2 is acceptable. Never use WEP or open networks.',
          'Change the default SSID (network name) and password — default credentials are publicly documented for every router model.',
          '2.4 GHz channels: Use channels 1, 6, or 11 only — these are the three non-overlapping channels. Avoid channels 2–5 and 7–10.',
          '5 GHz: Use DFS channels (52–144) only if your devices support DFS — they avoid interference from radar systems.',
          'Placement: Install the ONU/router at a central location, elevated, and away from microwave ovens and cordless phones.',
        ],
      },
      {
        heading: 'Troubleshooting Home WiFi',
        body: 'Most home WiFi problems have simple causes. A structured checklist resolves the majority of issues without requiring ISP intervention.',
        bullets: [
          'Slow speed: Check distance to the router. Move closer or upgrade to 5 GHz band. Check for interference from neighbouring WiFi networks (use a WiFi analyser app to identify congested channels).',
          'No IP address assigned: Restart the ONU (unplug for 30 seconds). Verify DHCP is enabled in the ONU LAN settings. Check the device\'s WiFi driver is functioning.',
          'One device cannot connect: On the device, "Forget" the WiFi network and reconnect. Check the device\'s MAC address has not been accidentally blocked in the ONU\'s access control list.',
          'ONU online (solid green) but no internet: ISP service may be disrupted — check the ISP status page. If PPPoE, verify username/password are correct in the ONU WAN settings.',
          'Intermittent drops: Check the ONU optical RX power — marginal budget causes brief O5→O6 transitions. Also check for WiFi channel congestion causing retransmissions.',
        ],
      },
    ],
    lab: {
      topologyId: 'home-gpon',
      intro: 'Load the Home GPON topology which models a complete residential FTTH setup: OLT at the central office, a 1:8 street splitter, and a home ONU connected to a WiFi AP, desktop PC, and smart TV. Explore the connection and verify end-to-end registration.',
      objectives: [
        { id: 'hs-loaded', text: 'Load the Home GPON topology', checker: 'has-olt' },
        { id: 'hs-onu-sel', text: 'Click on the WiFi AP or ONU node to view its properties', checker: 'onu-selected' },
        { id: 'hs-registered', text: 'Start the simulation and verify the ONU registers (O5 state)', checker: 'any-registered' },
        { id: 'hs-events', text: 'Check the Event Log for ONU registration events', checker: 'events-logged' },
        { id: 'hs-bandwidth', text: 'Open the Bandwidth chart to observe traffic flow', checker: 'bandwidth-open' },
      ],
    },
    quiz: [
      {
        id: 'qhs-1',
        question: 'A home ONU shows a steady green light (O5 state) but WiFi clients cannot get IP addresses. What should you check first?',
        choices: [
          'Replace the ONU — it is clearly faulty',
          'Check if DHCP is enabled on the ONU\'s LAN/WiFi interface',
          'Call the ISP immediately to report a network outage',
          'Check the Central Office OLT configuration',
        ],
        answer: 1,
        explanation: 'If the ONU is in O5 (operational), the PON and WAN connection is working. DHCP failure is a LAN-side issue — it means the ONU\'s built-in DHCP server may be disabled, or there is a maximum lease count reached. Check the ONU LAN settings before escalating.',
      },
      {
        id: 'qhs-2',
        question: 'Which WiFi frequency band provides better range and wall penetration in a home environment?',
        choices: [
          '5 GHz — higher frequency penetrates obstacles more effectively',
          '2.4 GHz — lower frequency has longer wavelength and better wall penetration',
          'Both bands are identical in range and penetration',
          'Neither band can penetrate walls — WiFi only works line-of-sight',
        ],
        answer: 1,
        explanation: '2.4 GHz radio waves have a longer wavelength (~12.5 cm) compared to 5 GHz (~6 cm). Longer wavelengths diffract around and penetrate through solid obstacles (walls, floors) more effectively. 5 GHz delivers higher speed but only over shorter distances in open areas.',
      },
      {
        id: 'qhs-3',
        question: 'What is the typical default LAN IP address of a residential ONU/home router?',
        choices: ['10.0.0.1', '172.16.0.1', '192.168.1.1', '192.168.0.254'],
        answer: 2,
        explanation: '192.168.1.1 is the most widely used default gateway address for residential ONUs and home routers from Huawei, ZTE, Nokia, and most other vendors. The 192.168.1.x /24 subnet is the de-facto standard home LAN range.',
      },
      {
        id: 'qhs-4',
        question: 'A laptop connected via Ethernet to the ONU has IP address 192.168.1.50. What is the correct subnet mask?',
        choices: ['255.0.0.0 (/8)', '255.255.0.0 (/16)', '255.255.255.0 (/24)', '255.255.255.128 (/25)'],
        answer: 2,
        explanation: 'Home ONUs use a /24 subnet (255.255.255.0) for the LAN by default. This provides 254 usable addresses (192.168.1.1–192.168.1.254) — more than enough for all devices in a typical household, with the ONU itself at .1 and DHCP clients from .2 upward.',
      },
    ],
  },
];
