// Generates src/evidence.js: how each answer was checked.
// Run after editing questions: node scripts/make-evidence.js
global.window = {};
require('../src/questions.js');
const B = window.QBANK;
const SOURCES = {
  rs: ['RS Components – BS 7671 guide', 'https://uk.rs-online.com/web/content/facilities-intralogistics/facilities-management/workplace-infrastructure/electrical-wiring-regulations-guide'],
  wikiBS: ['Wikipedia – BS 7671 (scope and exclusions)', 'https://en.wikipedia.org/wiki/BS_7671'],
  wikiUK: ['Wikipedia – Electrical wiring in the UK (definitions)', 'https://en.wikipedia.org/wiki/Electrical_wiring_in_the_United_Kingdom'],
  selectA4: ['SELECT – 2026 Amendment 4: What’s New', 'https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf'],
  esf: ['Electrical Safety First – Wiring Regulations help', 'https://www.electricalsafetyfirst.org.uk/resources-for-electricians/wiring-regulations-help'],
  bondingEx: ['Electrical Exchange – earthing and bonding', 'https://electricalexchange.co.uk/blog/earth-bonding-and-earthing-explained'],
  sparkline: ['Sparklineeng – earthing systems TN-S, TN-C-S, TT', 'https://sparklineeng.design/insights/earthing-systems-tns-tncs-tt-explained.php'],
  zeMate: ['Elec-Mate – Ze values UK', 'https://www.elec-mate.com/guides/ze-values-uk'],
  engxZe: ['IET EngX forum – max Ze values from DNO', 'https://engx.theiet.org/f/wiring-and-regulations/28037/max-ze-values-from-dno'],
  rcdTimes: ['RCD disconnection times (Tables 41.1 and 41.5, A4)', 'https://www.rcddisconnectiontime.co.uk'],
  napitADS: ['NAPIT (Professional Electrician) – automatic disconnection', 'https://professional-electrician.com/technical/the-requirements-for-automatic-disconnection-in-case-of-a-fault-napit'],
  prepDisc: ['18th Edition Prep – disconnection times', 'https://www.18theditionprep.co.uk/quick-reference/disconnection-times'],
  certioZs: ['Certio – maximum Zs values and the 80% rule', 'https://certio.uk/guides/maximum-zs-values-bs-7671'],
  icertZs: ['iCertifi – Zs testing, Table 41.3', 'https://icertifi.co.uk/zs-testing-explained-max-zs-values-bs-7671-table-41-3-icertifi'],
  ringNICEIC: ['NICEIC (Professional Electrician) – ring continuity test', 'https://professional-electrician.com/technical/the-essential-three-step-process-for-testing-ring-final-circuit-continuity'],
  ringPrep: ['18th Edition Prep – R1+R2 ring test values', 'https://www.18theditionprep.co.uk/blog/r1-r2-ring-final-circuit-test-values-dont-match'],
  ringIET: ['IET Wiring Matters – ring test step 3 readings', 'https://electrical.theiet.org/wiring-matters/years/2022/89-march-2022/resistance-readings-for-step-3-of-the-ring-final-circuit-test'],
  prepRCD: ['18th Edition Prep – 30 mA RCD protection rules', 'https://www.18theditionprep.co.uk/blog/rcd-protection-bs-7671'],
  afdd: ['Power and Data UK – where AFDDs are required', 'https://poweranddatauk.co.uk/blogs/news/where-are-afdds-required'],
  eatonA2: ['Eaton – BS 7671 Amendment 2 white paper', 'https://www.eaton.com/content/dam/eaton/company/news-insights/eaton-bs-7671-amd-2-whitepaper-en-gb-hr.pdf'],
  amperis: ['Amperis – adiabatic k values', 'https://amperis.com/en/resources/tools/cable-size-calculator'],
  wiley: ['Electrical Installation Calculations (Wiley excerpt) – 0.725 factor', 'https://catalogimages.wiley.com/images/db/pdf/9781444324266.excerpt.pdf'],
  ietProtect: ['IET Wiring Matters – protective measures', 'https://electrical.theiet.org/media/1605/protective-measures-special-installations-or-locations-part-1.pdf'],
  ipChart: ['Electrician Courses 4U – IP ratings explained', 'https://electriciancourses4u.co.uk/useful-resources/ip-ratings-explained'],
  ietCU: ['IET – non-combustible consumer units (421.1.201)', 'https://electrical.theiet.org/media/1438/consumer-units.pdf'],
  spd: ['Sparklineeng – SPD requirements (443.4.1)', 'https://sparklineeng.design/insights/spd-surge-protection-bs7671.php'],
  ietApp4: ['IET Wiring Matters – Appendix 4 and Regulation 523.9', 'https://electrical.theiet.org/media/1522/changes-to-appendix-4-of-amendment-1-of-bs7671-2008.pdf'],
  ietCorr: ['IET – BS 7671:2018 corrigendum (514.12.2, 514.13.1, Table 51)', 'https://electrical.theiet.org/media/2063/bs-7671-2018-corrigendum-dec-2018.pdf'],
  prepBond: ['18th Edition Prep – earthing and bonding sizes', 'https://www.18theditionprep.co.uk/blog/earthing-and-bonding-explained'],
  napitBond: ['NAPIT (Professional Electrician) – earthing vs bonding', 'https://professional-electrician.com/technical/what-are-the-differences-between-earthing-and-bonding-napit'],
  pdBond: ['ProjectDesign – UK earthing and bonding reference', 'https://projectdesign.io/uk-earthing-bonding-design-reference'],
  squote: ['squote – main bonding requirements (544.1.2)', 'https://squote.app/knowledge/electrical/earthing-and-bonding'],
  ietHPCC: ['IET Wiring Matters – protective conductor sizes (543.1.1)', 'https://electrical.theiet.org/wiring-matters/years/2022/93-november-2022/high-protective-conductor-currents-in-electrical-installations'],
  niceicWalls: ['NICEIC (Professional Electrician) – cables in walls and zones', 'https://professional-electrician.com/technical/why-contractors-need-to-apply-due-diligence-when-installing-cables-embedded-in-thin-walls-or-partitions-niceic'],
  zonesTS: ['Total Skills – cable safe zones (A4 Table 52.1)', 'https://www.totalskills.co.uk/guides/cable-safe-zones'],
  beama: ['BEAMA – prevention of premature collapse (521.10.202)', 'https://www.beama.org.uk/static/c8da4e9a-8ca6-47bf-97fce89dc408ab82/Premature-Collapse-Guide-2022.pdf'],
  vd: ['VoltDropCalc – 3% / 5% limits (Table 4Ab)', 'https://voltdropcalc.com/uk-voltage-drop-calculator'],
  eland: ['Eland Cables – Table 4D5 (18 mV/A/m for 2.5 mm²)', 'https://www.elandcables.com/media/3hoka0mu/table-4d5.pdf'],
  cableCalc: ['Cable size calculator – worked voltage-drop example', 'https://cablesize.ai.studio'],
  prepCable: ['18th Edition Prep – reference methods A, B, C', 'https://www.18theditionprep.co.uk/quick-reference/cable-capacities'],
  certioRCD: ['Certio – RCD testing (643.8, 514.12.2)', 'https://certio.uk/guides/rcd-testing-explained'],
  ietRCD: ['IET Wiring Matters – which RCD type?', 'https://electrical.theiet.org/wiring-matters/years/2019/77-september-2019/which-rcd-type'],
  niceicRCD: ['NICEIC (Professional Electrician) – RCD selection and selectivity', 'https://professional-electrician.com/technical/the-importance-of-selecting-rcds-that-are-suitable-to-electronic-loads-and-controls-connected-to-an-electrical-installation-niceic'],
  seq: ['Elec-Mate – GN3 testing sequence', 'https://www.elec-mate.com/guides/testing-sequence-guide'],
  irTable: ['iCertifi – insulation resistance and Table 64', 'https://icertifi.co.uk/insulation-resistance-testing-bs-7671-reg-643-3-guide'],
  irNICEIC: ['NICEIC (Professional Electrician) – two-stage IR test (643.3.3)', 'https://professional-electrician.com/technical/what-are-the-changes-to-the-requirements-for-insulation-resistance-testing'],
  polarity: ['Elec-Mate – polarity test (643.6)', 'https://www.elec-mate.com/polarity-test-guide'],
  eicr: ['GetTesting – EICR codes C1, C2, C3, FI', 'https://gettesting.co.uk/eicr-codes-explained-what-do-c1-c2-c3-and-fi-mean'],
  bathRR: ['RegsReady – bathroom zones (Section 701)', 'https://regsready.co.uk/guides/bathroom-zones-explained'],
  bathEX: ['Electrical Exchange – bathroom zones and the 2.5 m rule', 'https://electricalexchange.co.uk/blog/bathroom-electrical-zones'],
  ietBond701: ['IET Wiring Matters – protective bonding habits (701.415.2)', 'https://electrical.theiet.org/wiring-matters/years/2019/76-july-2019/protective-bonding-habits'],
  ietRLV: ['IET Wiring Matters – reduced low voltage systems', 'https://electrical.theiet.org/wiring-matters/years/2020/82-september-2020/reduced-low-voltage-systems'],
  ietChanges: ['IET – changes within BS 7671:2018 (sections and appendices)', 'https://electrical.theiet.org/media/2027/major-changes_for-website.pdf'],
  evMate: ['Elec-Mate – Section 722 EV charging', 'https://www.elec-mate.com/guides/section-722-ev-charging-complete-guide'],
  evIET: ['IET Wiring Matters – EV Code of Practice (722.411.4.1)', 'https://electrical.theiet.org/wiring-matters/years/2020/80-may-2020/the-iet-code-of-practice-for-electric-vehicle-charging-equipment-installation-4th-edition'],
  part7: ['Legh Richardson – Part 7 special locations (705, 708)', 'http://www.leghrichardson.co.uk/electricalpresentations/BS7671%2017th%20Edition%202015%20part%207.pdf'],
  ietCaravan: ['IET – caravan and camping park installations', 'https://electrical.theiet.org/media/1187/electrical-installations-in-caravan-camping-parks-caravans-and-motor-caravans.pdf'],
  dbA4: ['Designing Buildings – Amendment 4 summary (Section 710)', 'https://www.designingbuildings.co.uk/wiki/The_Orange_book:_2026_Amendment_4_to_BS_7671:2018'],
  pool: ['IET Wiring Matters – Section 702 swimming pools', 'https://electrical.theiet.org/media/1531/section-702-swimming-pools-and-other-basins.pdf'],
  app15: ['BS 7671 Appendix 15 text (Voltimum corrigendum copy)', 'https://content.voltimum.com/de/136240/20090716118520090703650200907015730.pdf'],
  spurNICEIC: ['NICEIC (Professional Electrician) – unfused spurs', 'https://professional-electrician.com/technical/the-practice-of-unfused-spurs-off-a-ring-final-circuit'],
  vdApp4: ['My Cable Engineering – Appendix 4 voltage drop (A4:2026)', 'https://mycableengineering.com/bs-7671-voltage-drop']
};
// index -> [type, [sources], working]
// S = confirmed by an independent source, C = worked calculation (+ source for the inputs),
// U = standard fact not independently confirmed in the review session.
const M = {
  0: ['S', ['rs']], 1: ['S', ['wikiBS']], 6: ['S', ['selectA4']],
  8: ['S', ['esf', 'bondingEx']], 9: ['S', ['wikiUK']], 10: ['S', ['wikiUK']], 11: ['S', ['wikiUK']],
  13: ['S', ['sparkline']], 14: ['S', ['zeMate']], 17: ['S', ['sparkline']], 18: ['S', ['sparkline']], 19: ['S', ['sparkline', 'rcdTimes']],
  20: ['S', ['zeMate', 'engxZe']], 21: ['S', ['zeMate', 'engxZe']],
  26: ['S', ['napitADS', 'prepDisc']], 27: ['S', ['napitADS', 'prepDisc']], 28: ['S', ['napitADS', 'prepDisc']], 29: ['S', ['napitADS', 'prepDisc']],
  30: ['C', ['certioZs', 'icertZs'], '(0.95 × 230) ÷ (5 × 32) = 218.5 ÷ 160 = 1.37 Ω'],
  31: ['C', ['icertZs'], '(0.95 × 230) ÷ (5 × 16) = 218.5 ÷ 80 = 2.73 Ω'],
  32: ['C', ['icertZs', 'certioZs'], '(0.95 × 230) ÷ (10 × 32) = 218.5 ÷ 320 = 0.68 Ω'],
  33: ['C', ['certioZs'], 'Zs = Ze + (R1 + R2) = 0.35 + 0.62 = 0.97 Ω'],
  34: ['S', ['ringNICEIC']], 35: ['C', ['certioZs'], 'Type B trips at 3–5 × In; Table 41.3 uses the upper limit, e.g. 5 × 32 = 160 A'],
  36: ['S', ['prepRCD']], 37: ['C', ['rcdTimes'], 'RA ≤ 50 V ÷ 0.1 A = 500 Ω'], 38: ['C', ['rcdTimes'], '50 V ÷ 0.03 A = 1667 Ω'],
  39: ['S', ['afdd', 'eatonA2']], 42: ['C', ['amperis'], 'S = √(1000² × 0.1) ÷ 115 = 316.2 ÷ 115 = 2.75 mm²'],
  43: ['S', ['wiley']], 44: ['S', ['ietProtect']], 45: ['S', ['ipChart', 'esf']], 46: ['S', ['ietCU']], 48: ['S', ['ietProtect']],
  50: ['S', ['spd']], 51: ['S', ['ietApp4']], 52: ['S', ['ietCorr']],
  54: ['S', ['prepBond', 'napitBond', 'pdBond']], 55: ['C', ['napitBond', 'prepBond'], '½ × 16 = 8 mm² (≥ 6 mm²); 8 is not a standard size, so 10 mm²'],
  56: ['S', ['squote', 'prepBond']], 57: ['S', ['ietHPCC', 'pdBond']], 58: ['S', ['niceicWalls', 'zonesTS']], 59: ['S', ['zonesTS', 'selectA4']],
  60: ['S', ['beama']], 61: ['C', ['vd'], '3% × 230 V = 6.9 V'], 62: ['C', ['eland', 'cableCalc'], '18 × 20 × 25 ÷ 1000 = 9.0 V (limit 5% = 11.5 V)'],
  63: ['C', ['ietApp4'], 'It ≥ 32 ÷ (0.94 × 0.8) = 32 ÷ 0.752 = 42.6 A (factors as given in the question)'],
  64: ['S', ['prepCable']], 66: ['S', ['prepBond', 'pdBond']], 67: ['S', ['ietCorr', 'certioRCD']], 68: ['S', ['ietCorr']],
  72: ['S', ['ietRCD']], 73: ['S', ['ietRCD', 'niceicRCD']], 75: ['S', ['selectA4']], 76: ['S', ['selectA4']],
  77: ['S', ['seq']], 78: ['S', ['irTable']], 79: ['S', ['irTable']], 80: ['S', ['irNICEIC']],
  81: ['C', ['ringPrep', 'ringIET'], '(r1 + r2) ÷ 4 = (0.52 + 0.86) ÷ 4 = 0.345 ≈ 0.35 Ω'],
  82: ['S', ['ringPrep', 'ringNICEIC']], 83: ['S', ['ringPrep', 'ringNICEIC']], 84: ['S', ['certioRCD']], 85: ['S', ['polarity']], 86: ['S', ['seq']],
  87: ['C', [], 'PEFC = U0 ÷ Ze = 230 ÷ 0.35 = 657 A'], 88: ['S', ['eicr']], 89: ['S', ['eicr']],
  93: ['C', ['icertZs', 'certioZs'], '0.8 × 1.37 = 1.10 Ω'],
  96: ['S', ['bathRR', 'bathEX']], 97: ['S', ['bathRR', 'bathEX']], 98: ['S', ['esf', 'bathEX']], 99: ['S', ['bathRR', 'bathEX']], 100: ['S', ['bathEX']],
  101: ['S', ['ietBond701']], 102: ['C', ['ietRLV'], '110 V centre-tapped: 110 ÷ 2 = 55 V to Earth'],
  103: ['S', ['ietChanges']], 104: ['S', ['evMate']], 105: ['S', ['ietChanges']], 106: ['S', ['evMate']], 107: ['S', ['evIET']],
  108: ['S', ['part7']], 109: ['S', ['part7']], 110: ['S', ['ietCaravan']], 111: ['S', ['dbA4']], 112: ['S', ['pool']], 113: ['S', ['prepRCD']],
  114: ['S', ['wikiBS']], 115: ['S', ['app15']], 116: ['S', ['ietChanges']], 117: ['S', ['ietChanges']], 118: ['S', ['vdApp4', 'eland']],
  119: ['S', ['app15']], 120: ['S', ['app15', 'spurNICEIC']], 122: ['S', ['ietChanges']]
};
const key = (q) => q.q.slice(0, 48) + '|' + q.o[0].slice(0, 16);
const EV = {};
B.forEach((q, i) => {
  const m = M[i] || ['U', []];
  if (EV[key(q)]) throw new Error('duplicate key ' + key(q));
  m[1].forEach((s) => { if (!SOURCES[s]) throw new Error('unknown source ' + s); });
  EV[key(q)] = { t: m[0], s: m[1], w: m[2] || '' };
});
const out = '/* Generated by scripts/make-evidence.js. How each answer was checked. */\n' +
  'window.SOURCES = ' + JSON.stringify(Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, { n: v[0], u: v[1] }])), null, 1) + ';\n' +
  'window.EVIDENCE = ' + JSON.stringify(EV, null, 1) + ';\n' +
  'window.evidenceKey = function (q) { return q.q.slice(0, 48) + "|" + q.o[0].slice(0, 16); };\n';
require('fs').writeFileSync(__dirname + '/../src/evidence.js', out);
const c = { S: 0, C: 0, U: 0 };
Object.values(EV).forEach((e) => c[e.t]++);
console.log('evidence written:', c, 'total', B.length);
