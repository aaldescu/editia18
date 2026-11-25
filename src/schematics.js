/* Schematic library: every drawing is generated as inline SVG and coloured
   through CSS tokens, so it follows the light/dark theme. Conductor colours
   follow BS 7671 Table 51: line brown, neutral blue, protective green-and-yellow. */
(function () {
  const P = (pts) => pts.map((p) => p.join(',')).join(' ');
  const ln = (pts, cls) => `<polyline class="${cls}" points="${P(pts)}"/>`;
  const L = (pts) => ln(pts, 'wL');
  const N = (pts) => ln(pts, 'wN');
  const PE = (pts) => ln(pts, 'wG') + ln(pts, 'wY');
  const PEN = (pts) => ln(pts, 'wN') + ln(pts, 'wPEN');
  const K = (pts, extra = '') => ln(pts, ('wK ' + extra).trim());
  const HL = (pts) => ln(pts, 'wHL');
  const T = (x, y, s, cls = '', anchor = 'start') =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" class="dot"/>`;
  const earth = (x, y) =>
    K([[x, y], [x, y + 12]]) + K([[x - 13, y + 12], [x + 13, y + 12]]) +
    K([[x - 8, y + 17], [x + 8, y + 17]]) + K([[x - 3, y + 22], [x + 3, y + 22]]);
  const box = (x, y, w, h, label, sub, cls = 'bx') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="${cls}"/>` +
    (label ? T(x + w / 2, y + (sub ? h / 2 - 3 : h / 2 + 4), label, 'lb', 'middle') : '') +
    (sub ? T(x + w / 2, y + h / 2 + 13, sub, 'sm', 'middle') : '');
  const zone = (x, y, w, h, cls = 'zn') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
  const q = (x, y) => `<g class="qmark"><circle cx="${x}" cy="${y}" r="11"/>${T(x, y + 5, '?', 'qm', 'middle')}</g>`;
  const dim = (x1, y1, x2, y2, label, lx, ly) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dim" marker-start="url(#ar)" marker-end="url(#ar)"/>` +
    (label ? T(lx, ly, label, 'dl', 'middle') : '');
  const defs = `<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arw"/></marker></defs>`;
  const svg = (w, h, body, title) =>
    `<svg viewBox="0 0 ${w} ${h}" class="sch" role="img" aria-label="${title}" preserveAspectRatio="xMidYMid meet">${defs}${body}</svg>`;

  const source = (x, y, w, h, label = 'Supply transformer', sub = '230/400 V') =>
    box(x, y, w, h, label, sub, 'bx src');

  const S = {};

  /* --- Earthing systems ------------------------------------------------ */
  S.tns = (p = {}) => svg(640, 270,
    source(16, 40, 130, 150) +
    T(330, 28, p.hideName ? 'Supply cable: separate neutral and protective (metal sheath) conductors' : 'TN-S', 'sm', 'middle') +
    L([[146, 70], [600, 70]]) + T(160, 63, 'L', 'tag') +
    N([[146, 110], [600, 110]]) + T(160, 103, 'N', 'tag') +
    K([[190, 110], [190, 150]]) + dot(190, 110) + dot(190, 150) + earth(190, 150) +
    PE([[190, 150], [540, 150]]) + T(260, 143, 'PE (cable sheath)', 'tag') +
    box(460, 40, 164, 190, '', '', 'bx inst') + T(542, 218, 'Consumer installation', 'sm', 'middle') +
    box(520, 138, 60, 26, 'MET', '', 'bx met') +
    T(70, 210, 'Source earth', 'sm', 'middle') + K([[70, 190], [70, 200]], 'thin') + T(120, 238, 'N–E link at source', 'sm'),
    'Earthing arrangement diagram A');

  S.tncs = (p = {}) => svg(640, 280,
    source(16, 40, 130, 150) +
    L([[146, 70], [610, 70]]) + T(160, 63, 'L', 'tag') +
    PEN([[146, 120], [482, 120]]) + T(160, 113, 'PEN', 'tag') +
    dot(190, 120) + earth(190, 120) + dot(330, 120) + earth(330, 120) +
    T(330, 172, 'additional earth', 'sm', 'middle') + T(330, 186, 'on network', 'sm', 'middle') +
    box(460, 40, 164, 200, '', '', 'bx inst') + T(542, 230, 'Consumer installation', 'sm', 'middle') +
    dot(482, 120) + N([[482, 120], [482, 96], [610, 96]]) + T(560, 90, 'N', 'tag') +
    PE([[482, 120], [482, 170], [520, 170]]) + box(520, 157, 60, 26, 'MET', '', 'bx met') +
    T(492, 140, p.hideName ? 'split' : 'N–PE split', 'sm') +
    T(330, 28, p.hideName ? 'Supply cable: combined neutral and protective conductor' : 'TN-C-S (PME)', 'sm', 'middle'),
    'Earthing arrangement diagram B');

  S.tt = (p = {}) => svg(640, 290,
    source(16, 40, 130, 150) +
    L([[146, 70], [610, 70]]) + T(160, 63, 'L', 'tag') +
    N([[146, 110], [610, 110]]) + T(160, 103, 'N', 'tag') +
    K([[190, 110], [190, 196]]) + dot(190, 110) + earth(190, 196) +
    box(460, 40, 164, 160, '', '', 'bx inst') + T(542, 190, 'Consumer installation', 'sm', 'middle') +
    (p.rcd ? box(480, 58, 74, 64, 'RCD', p.rcd, 'bx dev') : '') +
    box(520, 136, 60, 26, 'MET', '', 'bx met') +
    PE([[550, 162], [550, 226]]) + earth(550, 226) +
    T(538, 245, p.ra ? 'RA =' : 'installation electrode', 'sm', 'end') +
    K([[190, 262], [550, 262]], 'dash') + T(370, 280, 'return path through the general mass of Earth', 'sm', 'middle') +
    (p.ra === '?' ? q(590, 240) : '') +
    T(330, 28, p.hideName ? 'No protective conductor is provided by the supply cable' : 'TT', 'sm', 'middle'),
    'Earthing arrangement diagram C');

  /* --- Earth fault loop -------------------------------------------------- */
  S.loop = (p = {}) => svg(640, 270,
    source(16, 50, 104, 160, 'Source', 'winding') +
    L([[120, 80], [520, 80]]) + PEN([[120, 180], [260, 180]]) + PE([[260, 180], [520, 180]]) +
    K([[260, 30], [260, 240]], 'dash') + T(260, 258, 'origin of installation (MET)', 'sm', 'middle') + dot(260, 180) +
    box(520, 50, 100, 160, '', '', 'bx app') + T(570, 228, 'Class I appliance', 'sm', 'middle') +
    `<polyline class="fault" points="540,82 560,112 548,118 574,160 562,164 578,178"/>` + T(600, 128, 'fault', 'tag', 'middle') +
    HL([[130, 92], [508, 92], [508, 168], [130, 168]]) +
    T(190, 72, 'Ze = ' + (p.ze || '0.35 Ω'), 'val', 'middle') +
    T(390, 72, 'R1 (line) ' + (p.r1 || ''), 'val', 'middle') +
    T(390, 200, 'R2 (cpc) ' + (p.r2 || ''), 'val', 'middle') +
    (p.sum ? T(390, 135, 'R1 + R2 = ' + p.sum, 'val', 'middle') : '') +
    T(190, 200, 'PEN', 'tag', 'middle'),
    'Earth fault loop path');

  /* --- Ring final circuit ------------------------------------------------ */
  const sockets = (pts) => pts.map(([x, y, n]) =>
    `<rect x="${x - 15}" y="${y - 12}" width="30" height="24" rx="3" class="bx sock"/>` + T(x, y + 4, n, 'sm', 'middle')).join('');
  S.ring = (p = {}) => {
    let body = box(16, 70, 110, 130, 'Consumer unit', p.dev || 'B32', 'bx cu') +
      `<path d="M126 110 H520 Q570 110 570 160 Q570 210 520 210 H126" class="cable"/>` +
      sockets([[210, 110, 'S1'], [330, 110, 'S2'], [450, 110, 'S3'], [450, 210, 'S4'], [330, 210, 'S5'], [210, 210, 'S6']]) +
      T(330, 92, 'ring final circuit: L, N and cpc run as a continuous loop', 'sm', 'middle');
    if (p.spur) body += K([[330, 222], [330, 250]], 'cableK') + sockets([[330, 256, 'S7']]) + T(360, 262, 'spur', 'tag');
    if (p.readings) body += `<g class="readings">` +
      p.readings.map((r, i) => T(620, 40 + i * 18, r, 'val', 'end')).join('') + `</g>`;
    return svg(640, p.spur ? 285 : 250, body, 'Ring final circuit');
  };

  /* --- Bathroom zones ---------------------------------------------------- */
  S.bath = (p = {}) => {
    const fl = 250, z1top = 70; // 80 px per metre, 2.25 m = 180 px
    let b = zone(110, 42, 1, 208, 'wall') +
      K([[100, fl], [636, fl]]) + K([[110, 30], [110, fl]]) +
      zone(110, z1top, 190, fl - z1top - 50, 'zn z1') + zone(300, z1top, 48, fl - z1top, 'zn z2') +
      zone(110, fl - 50, 190, 50, 'zn z0') +
      `<rect x="110" y="${fl - 50}" width="190" height="50" class="bathtub" rx="6"/>` +
      T(205, fl - 20, 'zone 0', 'lb', 'middle') + T(205, 140, 'zone 1', 'lb', 'middle') + T(324, 140, 'zone 2', 'lb', 'middle') +
      T(470, fl + 18, 'floor', 'sm', 'middle') + T(205, fl + 18, 'bath', 'sm', 'middle');
    b += dim(80, fl, 80, z1top, '', 0, 0) + T(72, 165, p.hide === 'z1h' ? '' : '2.25 m', 'dl', 'end');
    if (p.hide === 'z1h') b += q(60, 160);
    b += dim(300, 52, 348, 52, '', 0, 0) + (p.hide === 'z2w' ? q(324, 36) : T(324, 44, '0.6 m', 'dl', 'middle'));
    if (p.socket) {
      b += `<rect x="586" y="150" width="34" height="26" rx="3" class="bx sock"/>` + T(603, 167, '13A', 'sm', 'middle') +
        dim(348, 196, 603, 196, '', 0, 0) + (p.hide === 'sock' ? q(475, 186) : T(475, 188, '3 m', 'dl', 'middle'));
    }
    return svg(640, 280, b, 'Bathroom zones elevation');
  };

  /* --- Main protective bonding ------------------------------------------ */
  S.bonding = (p = {}) => svg(640, 260,
    `<rect x="40" y="40" width="580" height="200" class="bld"/>` + T(330, 230, 'Building (consumer side)', 'sm', 'middle') +
    box(70, 70, 100, 70, 'Cut-out', 'and meter', 'bx') + box(200, 80, 80, 50, 'CU', '', 'bx cu') +
    L([[170, 95], [200, 95]]) + N([[170, 115], [200, 115]]) +
    box(85, 180, 70, 30, 'MET', '', 'bx met') + PE([[120, 140], [120, 180]]) + T(127, 165, 'earthing conductor', 'tag') +
    K([[445, 10], [445, 70]], 'pipe') + T(455, 24, 'incoming gas service', 'sm') +
    box(400, 70, 90, 50, 'Gas meter', '', 'bx') + K([[490, 95], [610, 95]], 'pipe') +
    T(560, 118, 'installation pipework', 'sm', 'middle') +
    `<rect x="${p.hide ? 520 : 510}" y="89" width="10" height="12" class="clamp"/>` +
    PE([[155, 195], [515, 195], [515, 101]]) + T(330, 188, p.size ? 'main protective bonding ' + p.size : 'main protective bonding conductor', 'tag', 'middle') +
    dim(490, 72, 515, 72, '', 0, 0) + (p.hide ? q(503, 56) : T(503, 64, '≤600 mm', 'dl', 'middle')),
    'Main protective bonding to gas installation pipe');

  /* --- Two-way lighting -------------------------------------------------- */
  S.twoway = () => svg(640, 260,
    T(40, 40, 'From MCB', 'sm') + L([[40, 60], [130, 60]]) + N([[40, 220], [560, 220], [560, 170]]) +
    box(130, 40, 90, 100, '', '', 'bx sw') + T(175, 156, 'Two-way switch 1', 'sm', 'middle') +
    box(400, 40, 90, 100, '', '', 'bx sw') + T(445, 156, 'Two-way switch 2', 'sm', 'middle') +
    T(146, 54, 'COM', 'tag') + T(204, 90, 'L1', 'tag', 'end') + T(204, 130, 'L2', 'tag', 'end') +
    T(474, 54, 'COM', 'tag', 'end') + T(416, 90, 'L1', 'tag') + T(416, 130, 'L2', 'tag') +
    dot(140, 60) + dot(210, 70) + dot(210, 110) + dot(410, 70) + dot(410, 110) + dot(480, 60) +
    K([[140, 60], [205, 70]], 'contact') + K([[480, 60], [415, 110]], 'contact') +
    L([[210, 70], [410, 70]]) + L([[210, 110], [410, 110]]) +
    T(310, 63, 'A', 'tag', 'middle') + T(310, 103, 'B', 'tag', 'middle') + q(310, 136) +
    L([[480, 60], [560, 60], [560, 130]]) + `<circle cx="560" cy="150" r="20" class="lamp"/>` +
    K([[546, 136], [574, 164]], 'thin') + K([[574, 136], [546, 164]], 'thin') + T(590, 154, 'lamp', 'sm'),
    'Two-way lighting circuit');

  /* --- Insulation resistance test --------------------------------------- */
  S.irtest = (p = {}) => svg(640, 250,
    box(20, 40, 160, 160, 'Distribution board', 'supply isolated', 'bx cu') +
    L([[180, 80], [470, 80]]) + N([[180, 110], [470, 110]]) + PE([[180, 160], [470, 160]]) +
    T(200, 73, 'L', 'tag') + T(200, 103, 'N', 'tag') + T(200, 153, 'cpc', 'tag') +
    box(470, 50, 60, 130, '', '', 'bx') + T(500, 196, 'circuit (lamps out, loads off)', 'sm', 'middle') +
    K([[300, 80], [300, 110]], 'link') + dot(300, 80) + dot(300, 110) + T(306, 98, 'L+N linked', 'tag') +
    box(260, 200, 140, 40, 'IR tester', p.v || '500 V d.c.', 'bx dev') +
    K([[300, 110], [300, 130], [280, 130], [280, 200]], 'lead') + K([[380, 160], [380, 200]], 'lead') + dot(380, 160),
    'Insulation resistance test arrangement');

  /* --- Selectivity -------------------------------------------------------- */
  S.select = () => svg(640, 260,
    box(16, 90, 100, 60, 'Cut-out fuse', 'BS 88-3 100 A', 'bx dev') + L([[116, 120], [150, 120]]) +
    box(150, 90, 100, 60, 'Main switch', '100 A', 'bx dev') + L([[250, 120], [300, 120]]) +
    K([[300, 40], [300, 220]], 'bus') +
    L([[300, 50], [350, 50]]) + box(350, 30, 90, 40, 'B6', 'lighting', 'bx dev') + L([[440, 50], [600, 50]]) +
    L([[300, 120], [350, 120]]) + box(350, 100, 90, 40, 'B32', 'sockets', 'bx dev') + L([[440, 120], [600, 120]]) +
    L([[300, 200], [350, 200]]) + box(350, 180, 90, 40, 'B40', 'cooker', 'bx dev') + L([[440, 200], [600, 200]]) +
    `<polyline class="fault" points="560,108 574,122 566,126 582,140"/>` + T(590, 156, 'fault', 'tag', 'middle'),
    'Protective device selectivity');

  /* --- Voltage drop -------------------------------------------------------- */
  S.vd = (p = {}) => svg(640, 200,
    box(16, 60, 110, 80, 'CU', p.dev || 'B32', 'bx cu') +
    `<path d="M126 100 H500" class="cable"/>` + dim(126, 150, 500, 150, '', 0, 0) + T(313, 172, 'L = ' + (p.len || '25 m'), 'dl', 'middle') +
    T(313, 88, p.cable || '2.5 mm² 70 °C thermoplastic, 18 mV/A/m', 'tag', 'middle') +
    box(500, 60, 120, 80, 'Load', 'Ib = ' + (p.ib || '20 A'), 'bx app') +
    T(313, 40, 'Voltage drop = ? (230 V supply)', 'val', 'middle'),
    'Voltage drop calculation');

  /* --- Safe zones in walls ------------------------------------------------- */
  S.zones = () => {
    let b = `<rect x="70" y="30" width="500" height="220" class="bld"/>` + T(320, 22, 'ceiling', 'sm', 'middle') + T(320, 268, 'floor', 'sm', 'middle') +
      zone(70, 30, 500, 30, 'zn safe') + zone(70, 30, 30, 220, 'zn safe') + zone(540, 30, 30, 220, 'zn safe') +
      zone(290, 30, 40, 220, 'zn safe') + zone(70, 186, 500, 28, 'zn safe') +
      `<rect x="296" y="186" width="28" height="28" rx="3" class="bx sock"/>` +
      dim(50, 30, 50, 60, '', 0, 0) + T(50, 78, '150 mm', 'dl', 'middle');
    b += K([[180, 30], [180, 250]], 'route') + T(188, 120, 'A', 'tag') +
      K([[310, 60], [310, 186]], 'route') + T(316, 120, 'B', 'tag') +
      K([[400, 30], [460, 120], [460, 250]], 'route') + T(466, 150, 'C', 'tag') +
      K([[100, 130], [290, 130]], 'route') + T(140, 124, 'D', 'tag');
    return svg(640, 280, b, 'Prescribed zones for concealed cables');
  };

  /* --- Three phase colours ------------------------------------------------ */
  S.three = () => svg(640, 230,
    source(16, 30, 130, 170, 'Star point', '400 V') +
    L([[146, 60], [600, 60]]) + T(160, 53, 'L1', 'tag') +
    K([[146, 100], [600, 100]], 'unknown') + T(160, 93, 'L2', 'tag') + q(380, 100) +
    K([[146, 140], [600, 140]], 'grey3') + T(160, 133, 'L3', 'tag') +
    N([[146, 180], [600, 180]]) + T(160, 173, 'N', 'tag'),
    'Three-phase conductor identification');

  /* --- Polarity fault ------------------------------------------------------ */
  S.polarity = () => svg(640, 220,
    box(16, 50, 100, 120, 'CU', 'B6', 'bx cu') +
    L([[116, 80], [560, 80], [560, 110]]) +
    N([[116, 150], [260, 150]]) + box(260, 130, 80, 40, 'switch', '1-way', 'bx sw') + N([[340, 150], [560, 150], [560, 150]]) +
    `<circle cx="560" cy="130" r="20" class="lamp"/>` + K([[546, 116], [574, 144]], 'thin') + K([[574, 116], [546, 144]], 'thin') +
    T(300, 200, 'Lighting circuit as found during initial verification', 'sm', 'middle'),
    'Lighting circuit polarity');

  /* --- SELV / reduced low voltage --------------------------------------- */
  S.selv = () => svg(640, 230,
    L([[20, 70], [150, 70]]) + N([[20, 150], [150, 150]]) + T(24, 60, '230 V a.c.', 'sm') +
    box(150, 40, 130, 140, 'Safety isolating', 'transformer', 'bx src') +
    K([[280, 80], [520, 80]]) + K([[280, 140], [520, 140]]) +
    box(520, 60, 100, 100, 'Luminaire', '12 V a.c.', 'bx app') + T(400, 112, 'no connection to Earth', 'tag', 'middle') +
    T(400, 205, 'no cpc, no earthed point', 'sm', 'middle'),
    'Extra-low voltage circuit');

  S.cte = () => svg(640, 240,
    L([[20, 70], [150, 70]]) + N([[20, 170], [150, 170]]) + T(24, 60, '230 V a.c.', 'sm') +
    box(150, 40, 140, 160, '110 V site', 'transformer', 'bx src') +
    K([[290, 70], [540, 70]]) + K([[290, 170], [540, 170]]) + K([[290, 120], [350, 120]]) + dot(350, 120) + PE([[350, 120], [350, 190]]) + earth(350, 190) +
    T(360, 116, 'centre tap', 'tag') +
    dim(560, 70, 560, 170, '', 0, 0) + T(570, 125, '110 V', 'dl') +
    dim(480, 70, 480, 120, '', 0, 0) + q(500, 96) +
    T(415, 60, 'to 110 V socket-outlet (yellow)', 'sm', 'middle'),
    'Reduced low voltage centre-tapped transformer');

  window.SCHEMATICS = S;
  window.renderSchematic = (spec) => (spec && S[spec.type] ? S[spec.type](spec) : '');
})();
