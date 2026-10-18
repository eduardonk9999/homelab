'use strict';
// r2d2 homelab: página de estudo em pixel art. Sem dependências externas (a CSP só permite 'self').
(() => {
  const PAL = {
    k: '#1a1c2c', p: '#5d275d', r: '#b13e53', o: '#ef7d57', y: '#ffcd75', l: '#a7f070', g: '#38b764', t: '#257179',
    n: '#29366f', b: '#3b5dc9', c: '#41a6f6', a: '#73eff7', w: '#f4f4f4', s: '#94b0c2', d: '#566c86', e: '#333c57',
  };
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel) => document.querySelector(sel);

  // ---------------------------------------------------------------- fonte 5x7
  const GLYPHS = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
    C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
    E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
    K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
    O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
    Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
    2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
    4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
    8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
    ' ': '.....|.....|.....|.....|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.##..|.##..',
    ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
    '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '-': '.....|.....|.....|#####|.....|.....|.....',
    '/': '....#|....#|...#.|..#..|.#...|#....|#....', '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
    '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
    ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...', ',': '.....|.....|.....|.....|.##..|..#..|.#...',
    '%': '##..#|##..#|...#.|..#..|.#...|#..##|#..##', '=': '.....|.....|#####|.....|#####|.....|.....',
  };
  const FONT = {};
  for (const [ch, rows] of Object.entries(GLYPHS)) FONT[ch] = rows.split('|');

  const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const textWidth = (t, s = 1) => Math.max(0, norm(t).length * 6 - 1) * s;

  function drawText(ctx, text, x, y, color, s = 1) {
    ctx.fillStyle = PAL[color] || color;
    let cx = Math.round(x);
    for (const ch of norm(text)) {
      const g = FONT[ch] || FONT['?'];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) if (g[r][c] === '#') ctx.fillRect(cx + c * s, Math.round(y) + r * s, s, s);
      }
      cx += 6 * s;
    }
  }
  const drawTextC = (ctx, text, cx, y, color, s = 1) => drawText(ctx, text, cx - textWidth(text, s) / 2, y, color, s);

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = PAL[color] || color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  // ---------------------------------------------------------------- sprites 8x8
  const SPRITES = {
    star: ['...yy...', '...yy...', 'yyyyyyyy', '.yyyyyy.', '..yyyy..', '.yy..yy.', 'y......y', '........'],
    lock: ['..ssss..', '.s....s.', '.s....s.', 'yyyyyyyy', 'yyykkyyy', 'yyykkyyy', 'yyyyyyyy', '........'],
    shield: ['.bbbbbb.', 'bccccccb', 'bcwccccb', 'bccccccb', 'bccccccb', '.bccccb.', '..bccb..', '...bb...'],
    box: ['tttttttt', 'taaaaaat', 'tattttat', 'taaaaaat', 'tattttat', 'taaaaaat', 'tttttttt', '........'],
    key: ['........', '.yyy....', 'y...y...', 'y...yyyy', 'y...y.y.', '.yyy..y.', '........', '........'],
    cloud: ['........', '..www...', '.wwwwww.', 'wwwwwwww', 'wwwwwwww', '.ssssss.', '........', '........'],
    arrow: ['........', '....o...', '....oo..', 'oooooooo', 'oooooooo', '....oo..', '....o...', '........'],
    bug: ['..r..r..', '...rr...', '.rrrrrr.', 'rrkrrkrr', '.rrrrrr.', 'r.rrrr.r', '.r....r.', '........'],
    skull: ['.wwwwww.', 'wwwwwwww', 'wkkwwkkw', 'wkkwwkkw', 'wwwwwwww', '.wwkkww.', '.w.ww.w.', '........'],
    moon: ['..yyyy..', '.yyyyyy.', 'yyyyoyyy', 'yyyyyyyy', 'yoyyyyyy', 'yyyyyyoy', '.yyyyyy.', '..yyyy..'],
  };
  function sprite(ctx, name, x, y, s = 1) {
    const rows = SPRITES[name];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        if (ch !== '.') rect(ctx, x + c * s, y + r * s, s, s, ch);
      }
    }
  }

  // ---------------------------------------------------------------- títulos e ícones estáticos
  document.querySelectorAll('canvas.ptitle').forEach((cv) => {
    const text = cv.dataset.text;
    const scale = Number(cv.dataset.scale || 3);
    cv.width = textWidth(text) + 1;
    cv.height = 8;
    const ctx = cv.getContext('2d');
    drawText(ctx, text, 1, 1, 'k');
    drawText(ctx, text, 0, 0, cv.dataset.color || 'y');
    cv.style.width = `${cv.width * scale}px`;
  });
  function paintIcon(cv, name) {
    cv.width = 8; cv.height = 8;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 8, 8);
    sprite(ctx, name, 0, 0);
  }
  document.querySelectorAll('canvas.icon[data-sprite]').forEach((cv) => paintIcon(cv, cv.dataset.sprite));

  // ---------------------------------------------------------------- XP e conquistas
  const XP = { v: 0, got: new Set() };
  try {
    const saved = JSON.parse(localStorage.getItem('r2d2-xp') || '{}');
    XP.v = saved.v || 0;
    XP.got = new Set(saved.got || []);
  } catch (_) { /* armazenamento indisponível: XP só desta visita */ }

  function renderXP() {
    const lvl = Math.floor(XP.v / 50) + 1;
    $('#xp-text').textContent = `XP ${XP.v} · NV ${lvl}`;
    $('#xp-fill').style.width = `${(XP.v % 50) * 2}%`;
  }
  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }
  function award(id, n, why) {
    if (XP.got.has(id)) return;
    XP.got.add(id);
    XP.v += n;
    try { localStorage.setItem('r2d2-xp', JSON.stringify({ v: XP.v, got: [...XP.got] })); } catch (_) { /* ok */ }
    renderXP();
    toast(`+${n} XP · ${why}`);
  }
  renderXP();

  // ---------------------------------------------------------------- loop de cenas
  const scenes = [];
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        const sc = scenes.find((s) => s.canvas === e.target);
        if (sc) sc.visible = e.isIntersecting;
      }
    })
    : null;

  function addScene(canvas, w, h, draw) {
    canvas.width = w;
    canvas.height = h;
    const sc = { canvas, ctx: canvas.getContext('2d'), w, h, draw, t: 0, visible: !io };
    sc.render = () => draw(sc.ctx, sc.t, sc);
    scenes.push(sc);
    if (io) io.observe(canvas);
    sc.render();
    return sc;
  }
  // Passo fixo de 60 Hz: em telas de 120/144 Hz a animação não acelera.
  const STEP = 1000 / 60;
  let last = 0;
  let acc = 0;
  function loop(now) {
    if (!last) last = now;
    acc = Math.min(acc + (now - last), STEP * 5);
    last = now;
    // tolerância de 2 ms: em 60 Hz o intervalo oscila em torno de 16,6 ms e não pode pular passo
    let n = 0;
    while (acc >= STEP - 2 && n < 3) {
      acc -= STEP;
      n++;
      for (const sc of scenes) {
        if (sc.visible) { sc.t++; sc.render(); }
      }
    }
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------- peças desenhadas
  function drawServer(ctx, x, y, w, h, t, label) {
    rect(ctx, x, y, w, h, 'k');
    rect(ctx, x + 1, y + 1, w - 2, h - 2, 'd');
    rect(ctx, x + 3, y + 4, w - 6, 3, 'e');
    rect(ctx, x + 3, y + 9, w - 6, 3, 'e');
    for (let i = 0; i < Math.floor((h - 24) / 3); i++) rect(ctx, x + 3, y + 15 + i * 3, w - 6, 1, 'e');
    const blinkA = REDUCED || ((t >> 3) % 3 !== 0);
    const blinkB = REDUCED || ((t >> 4) % 2 === 0);
    rect(ctx, x + 3, y + h - 5, 2, 2, 'c');
    rect(ctx, x + 7, y + h - 5, 2, 2, blinkA ? 'l' : 'g');
    rect(ctx, x + 11, y + h - 5, 2, 2, blinkB ? 'y' : 'o');
    if (label) drawTextC(ctx, label, x + w / 2, y + h + 3, 's');
  }

  function drawLaptop(ctx, x, y, t) {
    rect(ctx, x + 2, y, 22, 14, 's');
    rect(ctx, x + 3, y + 1, 20, 12, 'k');
    drawText(ctx, '>', x + 5, y + 3, 'l');
    if (REDUCED || (t >> 5) % 2 === 0) rect(ctx, x + 12, y + 9, 4, 1, 'l');
    rect(ctx, x, y + 14, 26, 3, 'd');
    rect(ctx, x, y + 14, 26, 1, 's');
  }

  function drawBrickWall(ctx, x, y, w, h, gaps = []) {
    for (let yy = y; yy < y + h; yy += 3) {
      const inGap = gaps.some((g) => yy + 3 > g - 3 && yy < g + 4);
      if (inGap) continue;
      const odd = ((yy - y) / 3) % 2;
      rect(ctx, x, yy, w, 2, odd ? 'r' : 'o');
      rect(ctx, x + (odd ? 1 : 3), yy, 1, 2, 'k');
    }
  }

  function drawDashedV(ctx, x, y, h, color) {
    for (let yy = y; yy < y + h; yy += 4) rect(ctx, x, yy, 1, 2, color);
  }
  function drawDashedRect(ctx, x, y, w, h, color) {
    for (let xx = x; xx < x + w; xx += 4) { rect(ctx, xx, y, 2, 1, color); rect(ctx, xx, y + h - 1, 2, 1, color); }
    for (let yy = y; yy < y + h; yy += 4) { rect(ctx, x, yy, 1, 2, color); rect(ctx, x + w - 1, yy, 1, 2, color); }
  }

  function spark(ctx, x, y, life, color) {
    const r = 6 - Math.floor(life / 4);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      rect(ctx, x + dx * r, y + dy * r, 1, 1, color);
    }
  }

  // ---------------------------------------------------------------- cena de abertura
  (() => {
    const cv = $('#hero');
    if (!cv) return;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const stars = Array.from({ length: 34 }, () => ({ x: Math.floor(rnd() * 160), y: Math.floor(rnd() * 56), p: Math.floor(rnd() * 90) }));
    const ssh = [];
    const attacks = [];

    addScene(cv, 160, 90, (ctx, t) => {
      rect(ctx, 0, 0, 160, 90, 'k');
      for (const s of stars) {
        const bright = !REDUCED && (t + s.p) % 90 < 6;
        rect(ctx, s.x, s.y, 1, 1, bright ? 'w' : 'd');
      }
      sprite(ctx, 'moon', 140, 6);
      drawText(ctx, 'INTERNET', 4, 4, 'r');

      rect(ctx, 0, 72, 160, 18, 'e');
      rect(ctx, 0, 72, 160, 1, 'd');

      // cabo do Mac até o servidor
      for (let x = 40; x < 118; x += 2) rect(ctx, x, 75, 1, 1, 't');

      drawLaptop(ctx, 14, 55, t);
      drawText(ctx, 'MAC', 18, 80, 's');

      drawBrickWall(ctx, 96, 38, 5, 34);
      drawText(ctx, 'UFW', 90, 29, 'o');

      drawServer(ctx, 118, 30, 20, 42, t, null);
      drawText(ctx, 'R2D2', 117, 80, 's');

      if (!REDUCED) {
        if (t % 45 === 0) ssh.push({ x: 40 });
        if (t % 80 === 20) attacks.push({ x: 30 + Math.floor((t * 13) % 40), y: 12, life: -1 });
      }
      for (const p of ssh) { p.x += 0.8; rect(ctx, p.x, 74, 2, 2, 'a'); }
      while (ssh.length && ssh[0].x > 116) ssh.shift();

      for (const a of attacks) {
        if (a.life < 0) {
          a.x += 0.9; a.y += 0.5;
          rect(ctx, a.x, a.y, 2, 2, 'r');
          if (a.x >= 93) a.life = 20;
        } else {
          spark(ctx, 95, a.y, a.life, 'o');
          a.life--;
        }
      }
      while (attacks.length && attacks[0].life === 0) attacks.shift();
    });
  })();

  // ---------------------------------------------------------------- motor de pistas (simuladores 1, 3 e 4)
  // Cada pista leva pacotes de "from" até "to". Se blocked() for verdadeiro, o pacote para em blockX.
  function laneSim(canvas, cfg) {
    const packets = [];
    const spawn = (i) => {
      const ln = cfg.lanes[i];
      packets.push({ ln, x: ln.from, state: 'move', life: 0 });
    };
    const sc = addScene(canvas, cfg.w, cfg.h, (ctx, t) => {
      rect(ctx, 0, 0, cfg.w, cfg.h, 'k');
      cfg.bg(ctx, t);
      if (!REDUCED) {
        cfg.lanes.forEach((ln, i) => {
          if (ln.rate && t % ln.rate === (ln.offset || 0)) spawn(i);
        });
      }
      for (const p of packets) {
        const { ln } = p;
        if (p.state === 'move') {
          p.x += ln.dir * (ln.speed || 0.9);
          const hitBlock = ln.blocked && ln.blocked() && (ln.dir > 0 ? p.x >= ln.blockX : p.x <= ln.blockX);
          const arrived = ln.dir > 0 ? p.x >= ln.to : p.x <= ln.to;
          if (hitBlock) { p.state = 'blocked'; p.life = 22; p.x = ln.blockX; if (ln.onBlock) ln.onBlock(); }
          else if (arrived) { p.state = 'arrived'; p.life = 16; p.x = ln.to; if (ln.onArrive) ln.onArrive(); }
          else {
            rect(ctx, p.x - ln.dir * 3, ln.y - 1, 1, 3, 'e');
            rect(ctx, p.x - 1, ln.y - 1, 3, 3, ln.color);
          }
        } else if (p.state === 'blocked') {
          spark(ctx, p.x, ln.y, p.life, 'o');
          p.life--;
        } else {
          if ((p.life >> 2) % 2 === 0) rect(ctx, p.x - 2, ln.y - 2, 5, 5, ln.arriveColor || ln.color);
          p.life--;
        }
      }
      for (let i = packets.length - 1; i >= 0; i--) if (packets[i].state !== 'move' && packets[i].life <= 0) packets.splice(i, 1);
      cfg.fg(ctx, t);
    });
    return { spawn, sc };
  }

  function lanes(ctx, list, x0, x1) {
    for (const ln of list) for (let x = x0; x < x1; x += 3) rect(ctx, x, ln.y, 1, 1, 'e');
  }

  // ---------------------------------------------------------------- simulador 1: firewall
  (() => {
    const cv = $('#sim-fw');
    if (!cv) return;
    const st = { on: false, exposed: 0, blocked: 0 };
    const stats = $('#fw-stats');
    const update = () => { stats.textContent = `Da internet chegaram: ${st.exposed} · bloqueados: ${st.blocked}`; };
    const L = [
      { y: 24, from: 8, to: 162, dir: 1, color: 'r', arriveColor: 'r', rate: 70, offset: 5, blockX: 92,
        blocked: () => st.on, onArrive: () => { st.exposed++; update(); }, onBlock: () => { st.blocked++; update(); } },
      { y: 54, from: 8, to: 162, dir: 1, color: 'a', rate: 95, offset: 35 },
      { y: 84, from: 8, to: 162, dir: 1, color: 'l', rate: 130, offset: 70 },
    ];
    const sim = laneSim(cv, {
      w: 192, h: 100, lanes: L,
      bg: (ctx) => lanes(ctx, L, 8, 162),
      fg: (ctx, t) => {
        drawText(ctx, 'INTERNET IPV6', 4, 13, 'r');
        drawText(ctx, 'LAN', 4, 43, 'a');
        drawText(ctx, 'TAILSCALE', 4, 73, 'l');
        if (st.on) {
          drawBrickWall(ctx, 93, 12, 6, 84, [54, 84]);
          drawText(ctx, 'UFW ON', 78, 2, 'l');
        } else {
          drawDashedV(ctx, 95, 12, 84, 'd');
          drawText(ctx, 'UFW OFF', 75, 2, 'r');
        }
        drawServer(ctx, 166, 12, 22, 74, t, null);
        drawText(ctx, ':22', 168, 90, 's');
      },
    });
    const btn = $('#fw-toggle');
    btn.addEventListener('click', () => {
      st.on = !st.on;
      btn.textContent = st.on ? 'ufw: ativo' : 'ufw: inativo';
      btn.classList.toggle('btn-good', st.on);
      btn.classList.toggle('btn-bad', !st.on);
      btn.setAttribute('aria-pressed', String(st.on));
      if (REDUCED) { sim.spawn(0); sim.spawn(1); sim.spawn(2); }
      if (st.on) award('fw-on', 10, 'firewall ligado');
    });
    cv.addEventListener('click', () => { sim.spawn(0); sim.spawn(1); sim.spawn(2); });
  })();

  // ---------------------------------------------------------------- simulador 2: senha x chave
  (() => {
    const term = $('#ssh-term');
    if (!term) return;
    let mode = 'pass';
    let run = 0;
    const bPass = $('#ssh-pass');
    const bKey = $('#ssh-key');
    const setMode = (m) => {
      mode = m;
      bPass.setAttribute('aria-pressed', String(m === 'pass'));
      bKey.setAttribute('aria-pressed', String(m === 'key'));
    };
    bPass.addEventListener('click', () => setMode('pass'));
    bKey.addEventListener('click', () => setMode('key'));

    const SCRIPTS = {
      pass: [
        ['$ hydra -l duzera -P senhas.txt ssh://r2d2', ''],
        ['[22][ssh] duzera:123456 ........ falhou', 'dim'],
        ['[22][ssh] duzera:senha123 ...... falhou', 'dim'],
        ['[22][ssh] duzera:r2d2 .......... falhou', 'dim'],
        ['[22][ssh] duzera:eduardo2026 ... falhou', 'dim'],
        ['... milhares de tentativas por hora, sem parar ...', 'warn'],
        ['[!] com senha liberada, é questão de tempo e de uma senha fraca.', 'bad'],
      ],
      key: [
        ['$ hydra -l duzera -P senhas.txt ssh://r2d2', ''],
        ['[ERROR] target ssh://r2d2:22/ does not support password authentication', 'bad'],
        ['$ ssh duzera@r2d2', ''],
        ['duzera@r2d2: Permission denied (publickey).', 'bad'],
        ['[ok] sem a chave privada, que nunca sai do Mac, não há o que tentar.', ''],
      ],
    };

    $('#ssh-run').addEventListener('click', () => {
      const id = ++run;
      const lines = SCRIPTS[mode];
      term.textContent = '';
      let i = 0;
      const next = () => {
        if (id !== run || i >= lines.length) {
          if (id === run && mode === 'key') award('ssh-key', 10, 'SSH só com chave');
          return;
        }
        const [txt, cls] = lines[i++];
        const span = document.createElement('span');
        if (cls) span.className = cls;
        span.textContent = `${txt}\n`;
        term.appendChild(span);
        term.scrollTop = term.scrollHeight;
        setTimeout(next, REDUCED ? 0 : 420);
      };
      next();
    });
  })();

  // ---------------------------------------------------------------- simulador 3: bind de porta
  (() => {
    const cv = $('#sim-bind');
    if (!cv) return;
    const st = { mode: 'any', lan: 0, tunnel: 0 };
    const stats = $('#bind-stats');
    const update = () => { stats.textContent = `Da LAN chegaram: ${st.lan} · pelo túnel: ${st.tunnel}`; };
    const L = [
      { y: 34, from: 8, to: 138, dir: 1, color: 'o', arriveColor: 'r', rate: 75, offset: 10, blockX: 72,
        blocked: () => st.mode === 'local', onArrive: () => { st.lan++; update(); } },
      { y: 70, from: 8, to: 138, dir: 1, color: 'a', rate: 100, offset: 50, onArrive: () => { st.tunnel++; update(); } },
    ];
    const sim = laneSim(cv, {
      w: 192, h: 100, lanes: L,
      bg: (ctx) => {
        drawDashedRect(ctx, 86, 6, 102, 90, 's');
        drawText(ctx, 'R2D2', 90, 10, 's');
        lanes(ctx, L, 8, 138);
      },
      fg: (ctx) => {
        drawText(ctx, 'LAN', 4, 23, 'o');
        drawText(ctx, 'VOCE (TUNEL)', 4, 59, 'a');
        drawBrickWall(ctx, 73, 14, 6, 80, st.mode === 'any' ? [34, 70] : [70]);
        drawText(ctx, 'UFW', 64, 3, 'o');
        if (st.mode === 'any') drawText(ctx, 'DOCKER', 90, 23, 'c');
        drawText(ctx, ':22', 90, 59, 'l');
        rect(ctx, 140, 22, 44, 60, 't');
        rect(ctx, 142, 24, 40, 56, 'k');
        drawTextC(ctx, 'NGINX', 162, 46, 'a');
        drawText(ctx, st.mode === 'any' ? '0.0.0.0:8080' : '127.0.0.1:8080', 90, 86, st.mode === 'any' ? 'r' : 'l');
      },
    });
    const bAny = $('#bind-any');
    const bLocal = $('#bind-local');
    const setMode = (m) => {
      st.mode = m;
      bAny.setAttribute('aria-pressed', String(m === 'any'));
      bLocal.setAttribute('aria-pressed', String(m === 'local'));
      if (REDUCED) { sim.spawn(0); sim.spawn(1); }
      if (m === 'local') award('bind-local', 10, 'porta só em localhost');
    };
    bAny.addEventListener('click', () => setMode('any'));
    bLocal.addEventListener('click', () => setMode('local'));
    cv.addEventListener('click', () => { sim.spawn(0); sim.spawn(1); });
  })();

  // ---------------------------------------------------------------- simulador 4: isolamento do Juice Shop
  (() => {
    const cv = $('#sim-jail');
    if (!cv) return;
    const st = { internal: true, escaped: 0, held: 0 };
    const stats = $('#jail-stats');
    const update = () => { stats.textContent = `Escaparam: ${st.escaped} · contidos: ${st.held}`; };
    const out = { from: 46, to: 148, dir: 1, color: 'r', arriveColor: 'r', blockX: 84, speed: 1.1,
      blocked: () => st.internal, onArrive: () => { st.escaped++; update(); }, onBlock: () => { st.held++; update(); } };
    const L = [
      { ...out, y: 24 },
      { ...out, y: 56 },
      { y: 84, from: 186, to: 46, dir: -1, color: 'a', rate: 110, offset: 20 },
    ];
    const sim = laneSim(cv, {
      w: 192, h: 100, lanes: L,
      bg: (ctx) => {
        drawText(ctx, 'ISOLATED', 6, 3, st.internal ? 'r' : 'd');
        lanes(ctx, L, 46, 186);
      },
      fg: (ctx) => {
        rect(ctx, 10, 14, 34, 80, 'o');
        rect(ctx, 12, 16, 30, 76, 'k');
        drawTextC(ctx, 'JUICE', 27, 46, 'y');
        drawTextC(ctx, 'SHOP', 27, 56, 'y');
        if (st.internal) {
          rect(ctx, 85, 12, 2, 64, 'r');
          drawText(ctx, 'INTERNAL', 92, 3, 'r');
        } else {
          drawDashedV(ctx, 86, 12, 64, 'd');
          drawText(ctx, 'SEM ISOLAMENTO', 92, 3, 'o');
        }
        rect(ctx, 78, 76, 18, 16, 'b');
        drawTextC(ctx, 'GW', 87, 81, 'w');
        sprite(ctx, 'cloud', 154, 14);
        drawText(ctx, 'NET', 164, 16, 's');
        rect(ctx, 152, 48, 34, 14, 'e');
        drawTextC(ctx, 'LAN', 169, 52, 's');
        drawText(ctx, 'VOCE', 160, 73, 'a');
      },
    });
    $('#jail-shell').addEventListener('click', () => {
      [0, 180, 360].forEach((ms) => setTimeout(() => { sim.spawn(0); sim.spawn(1); }, REDUCED ? 0 : ms));
      if (st.internal) award('jail', 10, 'lab contido');
    });
    const tog = $('#jail-toggle');
    tog.addEventListener('click', () => {
      st.internal = !st.internal;
      tog.textContent = `internal: ${st.internal}`;
      tog.classList.toggle('btn-good', st.internal);
      tog.classList.toggle('btn-bad', !st.internal);
      tog.setAttribute('aria-pressed', String(st.internal));
    });
  })();

  // ---------------------------------------------------------------- escudos
  (() => {
    const info = $('#shield-info');
    const btns = document.querySelectorAll('.shield');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      info.textContent = b.dataset.info;
      award(`shield-${b.textContent.trim()}`, 2, 'escudo estudado');
    }));
  })();

  // ---------------------------------------------------------------- simulador 5: pipeline
  (() => {
    const cv = $('#sim-pipe');
    if (!cv) return;
    const STATIONS = [
      { id: 'leaks', label: 'LEAKS', sec: 8, ok: 'gitleaks: nenhum segredo no histórico' },
      { id: 'lint', label: 'LINT', sec: 3, ok: 'hadolint: Dockerfile sem avisos' },
      { id: 'ports', label: 'PORTAS', sec: 1, ok: 'ok: todas as portas publicadas declaram IP de bind' },
      { id: 'build', label: 'BUILD', sec: 32, ok: 'docker build: imagem homepage:scan pronta' },
      { id: 'trivy', label: 'TRIVY', sec: 20, ok: 'Trivy: 0 HIGH/CRITICAL com correção disponível' },
      { id: 'ghcr', label: 'GHCR', sec: 15, ok: 'push ghcr.io/eduardonk9999/homelab-homepage:main' },
      { id: 'pull', label: 'R2D2', sec: 5, ok: 'r2d2: deploy: apps/homepage atualizado' },
    ];
    const SCEN = {
      ok: { fail: null },
      cve: { fail: 'trivy', lines: [
        'homepage:scan (alpine) — Total: 43 (HIGH: 43, CRITICAL: 0)',
        'curl       CVE-2026-11352  HIGH  8.17.0-r1 → 8.22.0-r0',
        'libcrypto3 CVE-2026-45447  HIGH  3.5.6-r0  → 3.5.7-r0',
        '✗ imagem barrada: a base nginx 1.29 parou de receber patches',
      ] },
      port: { fail: 'ports', lines: [
        'Porta publicada sem IP de bind (viola ADR 0002):',
        'apps/homepage/compose.yaml:12:      - "8080:8080"',
        '✗ PR barrado antes de qualquer build',
      ] },
      leak: { fail: 'leaks', lines: [
        'Finding: DB_PASSWORD=************',
        'RuleID: generic-api-key   File: apps/homepage/.env',
        '✗ leaks found: 1 — o segredo nunca chega ao registry',
      ] },
    };
    const X0 = 8;
    const GAP = 38;
    const cx = (i) => X0 + i * GAP + 14;
    const run = { active: false, scen: null, idx: 0, phase: 'idle', x: -10, timer: 0, sec: 0, lamps: STATIONS.map(() => 'e'), flash: 0 };
    const log = $('#pipe-log');
    const clock = $('#pipe-clock');
    const buttons = document.querySelectorAll('.pipe-run');

    const say = (txt, cls) => {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = `${txt}\n`;
      log.appendChild(span);
      log.scrollTop = log.scrollHeight;
    };
    const finish = () => { run.active = false; buttons.forEach((b) => { b.disabled = false; }); };

    function step() {
      if (!run.active) return;
      if (run.phase === 'travel') {
        const target = cx(run.idx) - 4;
        run.x += REDUCED ? 999 : 1.4;
        if (run.x >= target) { run.x = target; run.phase = 'scan'; run.timer = REDUCED ? 1 : 36; run.lamps[run.idx] = 'y'; }
      } else if (run.phase === 'scan') {
        run.timer--;
        if (run.timer <= 0) {
          const st = STATIONS[run.idx];
          if (run.scen.fail === st.id) {
            run.lamps[run.idx] = 'r';
            run.phase = 'fail';
            run.scen.lines.forEach((l, i) => say(l, i === run.scen.lines.length - 1 ? 'bad' : 'warn'));
            award(`pipe-${run.scen.name}`, 10, `${st.label.toLowerCase()} barrou`);
            finish();
          } else {
            run.lamps[run.idx] = 'l';
            run.sec += st.sec;
            clock.textContent = `t+${String(run.sec).padStart(2, '0')}s`;
            say(`✓ ${st.ok}`);
            run.idx++;
            if (run.idx >= STATIONS.length) {
              run.phase = 'done';
              run.flash = 90;
              say(`do push à página nova: ${run.sec}s (medido de verdade em 2026-10-18: 84s)`, 'warn');
              award('pipe-ok', 10, 'deploy completo');
              finish();
            } else run.phase = 'travel';
          }
        }
      }
    }

    addScene(cv, 276, 96, (ctx, t) => {
      step();
      rect(ctx, 0, 0, 276, 96, 'k');
      drawText(ctx, 'GIT PUSH', 2, 2, 's');
      // esteira
      rect(ctx, 0, 70, 276, 6, 'e');
      const off = REDUCED ? 0 : Math.floor(t / 3) % 6;
      for (let x = -6 + off; x < 276; x += 6) rect(ctx, x, 72, 3, 2, 'd');
      rect(ctx, 0, 76, 276, 1, 'd');
      STATIONS.forEach((st, i) => {
        const x = X0 + i * GAP;
        if (st.id === 'pull') {
          drawServer(ctx, x + 4, 22, 20, 46, t, null);
          if (run.flash > 0 && (run.flash >> 3) % 2 === 0) drawTextC(ctx, 'DEPLOY', x + 14, 12, 'l');
        } else {
          rect(ctx, x, 30, 28, 22, 'n');
          rect(ctx, x + 2, 32, 24, 18, 'e');
          rect(ctx, x + 12, 52, 4, 18, 'n');
          const lamp = run.lamps[i];
          const blink = lamp === 'y' && !REDUCED && (t >> 2) % 2;
          rect(ctx, x + 11, 24, 6, 4, blink ? 'e' : lamp);
        }
        drawTextC(ctx, st.label, x + 14, 82, run.lamps[i] === 'r' ? 'r' : run.lamps[i] === 'l' ? 'l' : 's');
      });
      if (run.flash > 0) run.flash--;
      // pacote
      if (run.phase !== 'idle' && run.phase !== 'done') {
        const failed = run.phase === 'fail';
        const shake = failed && !REDUCED ? ((t >> 1) % 2 ? 1 : -1) : 0;
        rect(ctx, run.x + shake, 61, 9, 8, failed ? 'r' : 'o');
        rect(ctx, run.x + 4 + shake, 61, 1, 8, failed ? 'p' : 'y');
        rect(ctx, run.x + shake, 64, 9, 1, failed ? 'p' : 'y');
      }
    });

    buttons.forEach((b) => b.addEventListener('click', () => {
      const name = b.dataset.scenario;
      run.scen = { name, ...SCEN[name] };
      Object.assign(run, { active: true, idx: 0, phase: 'travel', x: -10, sec: 0, flash: 0, lamps: STATIONS.map(() => 'e') });
      log.textContent = '';
      say(`$ git push origin main   # cenário: ${b.textContent.trim()}`, 'dim');
      clock.textContent = 't+00s';
      buttons.forEach((o) => { o.disabled = true; });
    }));
  })();

  // ---------------------------------------------------------------- quiz
  (() => {
    const list = $('#quiz-list');
    if (!list) return;
    const Q = [
      ['Fase 1', 'O serviço ufw estava ativo. Por que nada era bloqueado?',
        ['O firewall estava com "Estado: inativo": serviço rodando não é regra aplicada', 'O Docker desligou o ufw', 'O roteador já bloqueava tudo'],
        'O ufw só filtra depois do "ufw enable". Confira sempre com "sudo ufw status verbose".'],
      ['Fase 1', 'Por que o IPv6 tornou o firewall indispensável no r2d2?',
        ['Em IPv6 não há NAT: o servidor é endereçável direto da internet', 'IPv6 é mais lento que IPv4', 'O SSH só funciona em IPv6'],
        'Em IPv4 o NAT do roteador "esconde" a casa. Em IPv6 cada aparelho pode ter IP público, e só o firewall protege.'],
      ['Fase 1', 'Com "PasswordAuthentication no", o que um atacante precisaria pra entrar?',
        ['A chave privada, que nunca sai do Mac', 'Só o nome do usuário', 'A senha do sudo'],
        'O servidor guarda só a chave pública. Sem a privada, não existe nada pra adivinhar.'],
      ['Fase 2', 'O compose tem ports: "8080:8080" e o ufw bloqueia tudo. A porta fica…',
        ['Aberta pra rede: o Docker cria regras que passam antes do ufw', 'Fechada: o ufw sempre vence', 'Aberta só pro Mac'],
        'Por isso a regra do r2d2 é declarar o IP: "127.0.0.1:8080:8080". O CI barra quem esquecer.'],
      ['Fase 2', 'O que "internal: true" faz na rede do Juice Shop?',
        ['Remove o gateway: nada lá dentro alcança a internet nem a LAN', 'Criptografa o tráfego', 'Limita a RAM do container'],
        'O gateway nginx é o único ligado às duas redes. Testamos com wget e ping: tudo bloqueado.'],
      ['Fase 2', 'Pra que serve o live-restore?',
        ['Manter os containers rodando enquanto o Docker reinicia', 'Restaurar backups dos volumes', 'Religar containers que travaram'],
        'Religar container é o papel do "restart: unless-stopped". O live-restore evita a queda quando o próprio Docker atualiza.'],
      ['Fase 3', 'Por que o r2d2 puxa a imagem em vez de o GitHub enviar?',
        ['Nenhuma credencial do servidor fica fora de casa e nenhuma porta precisa abrir', 'Porque é mais rápido', 'Porque o GitHub não permite deploy'],
        'É o deploy por pull, o mesmo princípio do GitOps (Flux, ArgoCD) que vem na Fase 5.'],
      ['Fase 3', 'Por que as actions são fixadas por SHA e não por tag?',
        ['Uma tag pode ser movida pra código malicioso; um SHA de commit, não', 'SHA é mais curto de escrever', 'Tags não funcionam em repo público'],
        'Foi o que aconteceu com a tj-actions/changed-files em 2025. O comentário "# v7.0.1" ao lado é só pra humanos lerem.'],
      ['Fase 3', 'O que o Trivy barrou na primeira execução do pipeline?',
        ['43 vulnerabilidades HIGH na imagem base nginx 1.29', 'Uma senha no código', 'Um erro de sintaxe no YAML'],
        'A 1.29 tinha parado de receber patches. Correção: base 1.30+, apk upgrade no build, rebuild semanal e Dependabot.'],
      ['Fase 1', 'O curl dá "Connection refused" num caso e fica parado até timeout no outro. Qual a diferença?',
        ['Refused: o host respondeu que nada escuta na porta. Timeout: algo descartou o pacote, quase sempre um firewall', 'São a mesma coisa', 'Refused é DNS errado; timeout é senha errada'],
        'Vimos os dois no r2d2: porta fechada respondia na hora; com o ufw descartando, o teste da LAN ficava pendurado.'],
      ['Fase 1', 'O r2d2 (4 threads) mostra load average 4,0. Isso significa…',
        ['CPU no limite: em média 4 processos querendo rodar pra 4 threads', 'Uso de 4% da CPU', 'Que há 4 GB de RAM em uso'],
        'Load average conta processos rodando ou esperando CPU (e disco). Compare com o número de threads: acima disso, há fila.'],
      ['Fase 2', 'Por que copiar o package.json e rodar npm ci ANTES de COPY . . ?',
        ['Pra camada das dependências vir do cache quando só o código muda', 'Porque o npm exige', 'Pra imagem ficar menor'],
        'Veja o Simulador 6: com a ordem otimizada, editar uma linha leva 21 s em vez de 81 s.'],
      ['Fase 2', 'Um container parou com exit code 137. A causa mais provável é…',
        ['SIGKILL, normalmente o kernel matando por falta de memória (OOM)', 'Erro de sintaxe no compose', 'Porta já em uso'],
        '137 = 128 + 9 (SIGKILL). Confira com docker inspect: State.OOMKilled = true. Aumente o limite ou ache o vazamento.'],
      ['Fase 2', 'EXPOSE 8080 no Dockerfile deixa a porta acessível de fora?',
        ['Não: só documenta. Quem publica é ports: no compose (ou -p)', 'Sim, em todas as interfaces', 'Sim, mas só em localhost'],
        'É por isso que a regra do r2d2 olha o ports: do compose, e não o Dockerfile.'],
      ['Fase 3', 'O que significa "build once, deploy many"?',
        ['A mesma imagem (mesmo digest) passa por staging e produção; muda só a configuração', 'Fazer um build por ambiente', 'Fazer deploy várias vezes ao dia'],
        'Se você reconstrói pra produção, o que vai pro ar não é exatamente o que foi testado.'],
      ['Fase 3', 'Qual estratégia de deploy expõe a versão nova a uma pequena parte dos usuários primeiro?',
        ['Canary', 'Recreate', 'Blue-green'],
        'No blue-green a troca é de uma vez (100%), com volta rápida. No canary, uma fração pequena testa antes de todo mundo.'],
    ];
    const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

    Q.forEach(([fase, q, opts, explain], qi) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      const n = document.createElement('p');
      n.className = 'qn';
      n.textContent = `${fase} · pergunta ${qi + 1}/${Q.length}`;
      const p = document.createElement('p');
      p.className = 'q';
      p.textContent = q;
      const wrap = document.createElement('div');
      wrap.className = 'quiz-opts';
      const ex = document.createElement('p');
      ex.className = 'quiz-explain';
      ex.hidden = true;
      let tries = 0;
      shuffle(opts.map((text, i) => ({ text, right: i === 0 }))).forEach((o) => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.type = 'button';
        b.textContent = o.text;
        b.addEventListener('click', () => {
          tries++;
          if (o.right) {
            b.classList.add('right');
            wrap.querySelectorAll('button').forEach((x) => { x.disabled = true; });
            ex.textContent = `✓ ${explain}`;
            ex.hidden = false;
            if (tries === 1) award(`quiz-${qi}`, 10, 'acertou de primeira');
          } else {
            b.classList.add('wrong');
            b.disabled = true;
            ex.textContent = `✗ Ainda não. ${explain}`;
            ex.hidden = false;
          }
        });
        wrap.appendChild(b);
      });
      card.append(n, p, wrap, ex);
      list.appendChild(card);
    });
  })();

  // ---------------------------------------------------------------- inventário
  (() => {
    const inv = $('#inv');
    if (!inv) return;
    const ITEMS = [
      ['SSH', 'key', 'Protocolo de acesso remoto ao terminal, criptografado. No r2d2, só com chave.'],
      ['Chave ed25519', 'key', 'Par de chaves: a privada fica no Mac, o servidor guarda a pública. Nada secreto trafega.'],
      ['ufw', 'shield', 'Interface simples do firewall do Linux. No r2d2: bloqueia tudo que entra, exceto SSH da LAN e do Tailscale.'],
      ['NAT', 'cloud', 'Tradução de endereços do roteador. Em IPv4 esconde a casa atrás de um IP; em IPv6 não existe.'],
      ['Headless', 'star', 'Servidor sem interface gráfica, administrado só por terminal.'],
      ['Baseline', 'star', 'Foto do consumo de recursos num momento conhecido, pra comparar antes de qualquer upgrade.'],
      ['Imagem', 'box', 'Pacote só leitura com a aplicação e suas dependências. Identificada por um digest sha256.'],
      ['Container', 'box', 'A imagem em execução, isolada do resto do sistema pelo kernel (namespaces e cgroups).'],
      ['Compose', 'box', 'Arquivo YAML que descreve containers, redes e volumes. "docker compose up -d" sobe tudo.'],
      ['Health check', 'star', 'Comando periódico que verifica se a aplicação responde de verdade, não só se o processo existe.'],
      ['Túnel SSH', 'arrow', 'Traz uma porta do servidor pra dentro do Mac pela conexão SSH, sem abrir nada na rede.'],
      ['internal', 'lock', 'Rede Docker sem gateway: os containers conversam entre si, mas não saem pra internet nem pra LAN.'],
      ['CI/CD', 'arrow', 'Integração contínua (testar a cada commit) e entrega contínua (publicar automaticamente).'],
      ['Trivy', 'bug', 'Scanner de vulnerabilidades. Falha o pipeline em CVE HIGH/CRITICAL que já tem correção.'],
      ['CVE', 'bug', 'Identificador público de uma vulnerabilidade conhecida, como CVE-2024-47176 (cups-browsed).'],
      ['GHCR', 'cloud', 'Registry de imagens do GitHub, onde o pipeline publica a homepage.'],
      ['Pull deploy', 'arrow', 'O servidor busca a versão nova sozinho, em vez de o pipeline entrar nele.'],
      ['SHA pin', 'lock', 'Fixar uma action pelo hash do commit, que não pode ser alterado depois.'],
      ['Dependabot', 'star', 'Robô do GitHub que abre PR quando sai versão nova de imagem ou action.'],
      ['Supply chain', 'skull', 'Tudo que o seu software usa sem você ter escrito: imagens, actions, bibliotecas.'],
      ['systemd', 'star', 'Gerenciador de serviços do Linux. O timer de deploy do r2d2 é uma unit systemd.'],
      ['CIDR', 'cloud', '192.168.15.0/24: os 24 primeiros bits são a rede, sobram 256 endereços pra máquinas.'],
      ['DNS', 'cloud', 'Traduz nome em IP. O r2d2.local resolve por mDNS, sem servidor DNS. "É sempre DNS."'],
      ['Load average', 'star', 'Média de processos querendo CPU. Compare com o número de threads (4 no r2d2).'],
      ['OOM killer', 'skull', 'Quando a RAM acaba, o kernel mata um processo. Em container aparece como exit 137.'],
      ['Namespaces', 'box', 'O que faz um container "ver" só os próprios processos, rede e arquivos. Ele divide o kernel com o host.'],
      ['cgroups', 'box', 'O que aplica o limite de CPU e RAM de um container.'],
      ['Camadas', 'box', 'Cada linha do Dockerfile vira uma camada com cache. Mudou uma, as de baixo são refeitas.'],
      ['Multi-stage', 'box', 'Um estágio compila, outro só copia o resultado. A imagem final não leva o compilador.'],
      ['Digest', 'lock', 'O sha256 que identifica uma imagem exata. A tag é um apelido que pode mudar; o digest, não.'],
      ['PID 1', 'star', 'O primeiro processo do container. Precisa receber o SIGTERM pra desligar com calma.'],
      ['docker.sock', 'skull', 'Montar o socket do Docker num container dá a ele controle total do host.'],
      ['OIDC', 'key', 'O CI troca um token temporário por credencial na nuvem, sem chave fixa guardada.'],
      ['SBOM', 'bug', 'A lista de tudo que existe dentro de uma imagem. Quando sai um CVE novo, você sabe na hora se é afetado.'],
      ['Canary', 'arrow', 'Deploy que manda uma fração pequena dos usuários pra versão nova antes de todos.'],
      ['Blue-green', 'arrow', 'Dois ambientes idênticos: sobe o novo do lado e troca o tráfego de uma vez. Volta rápida.'],
      ['DORA', 'star', 'Quatro métricas de entrega: frequência, lead time (84 s no r2d2), falha de mudança e recuperação.'],
      ['Idempotência', 'star', 'Rodar de novo dá o mesmo resultado. O ufw.sh e o deploy do r2d2 são idempotentes.'],
    ];
    const info = $('#inv-info');
    const buttons = [];
    ITEMS.forEach(([name, spr, desc]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      const cv = document.createElement('canvas');
      cv.className = 'icon';
      cv.setAttribute('aria-hidden', 'true');
      paintIcon(cv, spr);
      b.append(cv, document.createTextNode(name));
      b.addEventListener('click', () => {
        buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        info.textContent = `${name}: ${desc}`;
        award(`item-${name}`, 1, 'item coletado');
      });
      buttons.push(b);
      inv.appendChild(b);
    });
  })();

  // ---------------------------------------------------------------- pergaminhos
  document.querySelectorAll('details').forEach((d, i) => {
    d.addEventListener('toggle', () => { if (d.open) award(`scroll-${i}`, 2, 'pergaminho lido'); });
  });

  // ---------------------------------------------------------------- simulador 6: cache de camadas
  (() => {
    const list = $('#layers');
    if (!list) return;
    // src: quais mudanças invalidam a camada (code = código, deps = package.json)
    const ORDERS = {
      bad: [
        { i: 'FROM node:22-alpine', sec: 0 },
        { i: 'WORKDIR /app', sec: 0 },
        { i: 'COPY . .', sec: 1, src: ['code', 'deps'] },
        { i: 'RUN npm ci', sec: 60 },
        { i: 'RUN npm run build', sec: 20 },
        { i: 'CMD ["node", "dist/server.js"]', sec: 0 },
      ],
      good: [
        { i: 'FROM node:22-alpine', sec: 0 },
        { i: 'WORKDIR /app', sec: 0 },
        { i: 'COPY package*.json ./', sec: 1, src: ['deps'] },
        { i: 'RUN npm ci', sec: 60 },
        { i: 'COPY . .', sec: 1, src: ['code', 'deps'] },
        { i: 'RUN npm run build', sec: 20 },
        { i: 'CMD ["node", "dist/server.js"]', sec: 0 },
      ],
    };
    let order = 'bad';
    let run = 0;
    const total = $('#layer-total');
    const render = () => {
      list.textContent = '';
      ORDERS[order].forEach((l) => {
        const li = document.createElement('li');
        if (l.src) li.className = 'src';
        const code = document.createElement('code');
        code.textContent = l.i;
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = 'aguardando';
        li.append(code, tag);
        list.appendChild(li);
      });
      total.textContent = 'build: —';
    };
    const pick = (o) => {
      order = o;
      run++;
      $('#layer-bad').setAttribute('aria-pressed', String(o === 'bad'));
      $('#layer-good').setAttribute('aria-pressed', String(o === 'good'));
      render();
    };
    const build = (change) => {
      const id = ++run;
      render();
      const layers = ORDERS[order];
      const tags = list.querySelectorAll('.tag');
      let broken = false;
      let secs = 0;
      let i = 0;
      const next = () => {
        if (id !== run) return;
        if (i >= layers.length) {
          total.textContent = `build: ${secs}s`;
          if (order === 'good' && change === 'code') award('layers-good', 10, 'cache aproveitado');
          return;
        }
        const l = layers[i];
        if (!broken && l.src && l.src.includes(change)) broken = true;
        const t = tags[i];
        if (broken) {
          t.className = 'tag build';
          t.textContent = l.sec ? `refeita · ${l.sec}s` : 'refeita';
          secs += l.sec;
        } else {
          t.className = 'tag cached';
          t.textContent = 'CACHED';
        }
        total.textContent = `build: ${secs}s…`;
        i++;
        setTimeout(next, REDUCED ? 0 : (broken ? 120 + l.sec * 12 : 140));
      };
      next();
    };
    $('#layer-bad').addEventListener('click', () => pick('bad'));
    $('#layer-good').addEventListener('click', () => pick('good'));
    $('#layer-code').addEventListener('click', () => build('code'));
    $('#layer-deps').addEventListener('click', () => build('deps'));
    render();
  })();

  // ---------------------------------------------------------------- simulador 7: estratégias de deploy
  (() => {
    const cv = $('#sim-deploy');
    if (!cv) return;
    const A = (v) => [v, v, v, v];
    // cada passo: versões da fileira A, da fileira B (null = não existe), quem recebe tráfego, legenda
    const PLANS = {
      recreate: [
        { a: A(1), b: null, to: 'a', msg: 'v1 atendendo 100% dos usuários.' },
        { a: A(0), b: null, to: 'a', msg: 'Derruba todas as instâncias v1… o site está FORA DO AR.', down: true },
        { a: A(2), b: null, to: 'a', msg: 'Sobe v2 em todas. Simples e barato, mas teve downtime.' },
      ],
      rolling: [
        { a: A(1), b: null, to: 'a', msg: 'v1 atendendo 100%.' },
        { a: [0, 1, 1, 1], b: null, to: 'a', msg: 'Troca uma instância por vez; as outras seguem atendendo.' },
        { a: [2, 1, 1, 1], b: null, to: 'a', msg: 'Uma já está em v2. Por um tempo, v1 e v2 convivem.' },
        { a: [2, 0, 1, 1], b: null, to: 'a', msg: 'Próxima…' },
        { a: [2, 2, 1, 1], b: null, to: 'a', msg: 'Metade em v2.' },
        { a: [2, 2, 0, 1], b: null, to: 'a', msg: 'Próxima…' },
        { a: [2, 2, 2, 1], b: null, to: 'a', msg: 'Quase lá.' },
        { a: [2, 2, 2, 0], b: null, to: 'a', msg: 'Última…' },
        { a: A(2), b: null, to: 'a', msg: 'Pronto, sem downtime. Exige que v1 e v2 funcionem juntas.' },
      ],
      bluegreen: [
        { a: A(1), b: null, to: 'a', msg: 'Ambiente azul (v1) atendendo 100%.' },
        { a: A(1), b: A(2), to: 'a', msg: 'Sobe um ambiente verde inteiro com v2, ao lado. Custo dobrado por um tempo.' },
        { a: A(1), b: A(2), to: 'b', msg: 'Troca o tráfego de uma vez pro verde. Deu ruim? Volta pro azul em segundos.' },
        { a: A(0), b: A(2), to: 'b', msg: 'Tudo certo: desliga o azul.' },
      ],
      canary: [
        { a: A(1), b: null, to: 'a', msg: 'v1 atendendo 100%.' },
        { a: [2, 1, 1, 1], b: null, to: 'a', canary: true, msg: 'Uma instância (o "canário") recebe v2 e uma fração pequena dos usuários.' },
        { a: [2, 1, 1, 1], b: null, to: 'a', canary: true, msg: 'Observa erros e latência do canário. Se piorar, só uma minoria foi afetada.' },
        { a: A(2), b: null, to: 'a', msg: 'Métricas boas: promove v2 pra todos.' },
      ],
    };
    const FACTS = {
      recreate: [['Downtime', 'sim', 'bad'], ['Custo extra', 'nenhum', 'good'], ['Risco exposto', '100% de uma vez', 'bad']],
      rolling: [['Downtime', 'não', 'good'], ['Custo extra', '~1 instância', 'good'], ['Risco exposto', 'gradual', 'mid']],
      bluegreen: [['Downtime', 'não', 'good'], ['Custo extra', '100% durante a troca', 'bad'], ['Risco exposto', '100%, com volta imediata', 'mid']],
      canary: [['Downtime', 'não', 'good'], ['Custo extra', 'pequeno', 'good'], ['Risco exposto', 'só a fração do canário', 'good']],
    };
    let strategy = 'recreate';
    let step = 0;
    let running = false;
    let hold = 0;
    const status = $('#dep-status');
    const facts = $('#dep-facts');
    const showFacts = () => {
      facts.textContent = '';
      FACTS[strategy].forEach(([k, v, cls]) => {
        const d = document.createElement('div');
        const b = document.createElement('b');
        b.textContent = k;
        const sp = document.createElement('span');
        sp.className = cls;
        sp.textContent = v;
        d.append(b, sp);
        facts.appendChild(d);
      });
    };
    const COL = { 0: 'd', 1: 'c', 2: 'l' };
    const box = (ctx, x, y, v, t) => {
      rect(ctx, x, y, 28, 20, 'k');
      rect(ctx, x + 1, y + 1, 26, 18, COL[v]);
      if (v === 0) {
        drawTextC(ctx, 'X', x + 14, y + 7, 'k');
      } else {
        drawTextC(ctx, `V${v}`, x + 14, y + 7, 'k');
        if (!REDUCED && (t >> 4) % 2) rect(ctx, x + 23, y + 3, 2, 2, 'w');
      }
    };
    const traffic = (ctx, x, y, color) => {
      for (let yy = 16; yy < y; yy += 3) rect(ctx, x, yy, 1, 1, color);
    };

    addScene(cv, 192, 100, (ctx, t) => {
      if (running) {
        hold--;
        if (hold <= 0) {
          if (step < PLANS[strategy].length - 1) {
            step++;
            hold = REDUCED ? 1 : 110;
            status.textContent = PLANS[strategy][step].msg;
          } else {
            running = false;
            $('#dep-run').disabled = false;
            award(`deploy-${strategy}`, 5, `deploy ${strategy}`);
          }
        }
      }
      const st = PLANS[strategy][step];
      rect(ctx, 0, 0, 192, 100, 'k');
      drawTextC(ctx, 'USUARIOS', 96, 3, st.down ? 'r' : 's');
      const xs = [18, 58, 98, 138];
      const yA = 34;
      const yB = 72;
      xs.forEach((x, i) => {
        const v = st.a[i];
        const serving = st.to === 'a' && v !== 0;
        if (serving) traffic(ctx, x + 14, yA, st.canary && i === 0 ? 'y' : COL[v]);
        box(ctx, x, yA, v, t);
      });
      if (st.b) {
        xs.forEach((x, i) => {
          const v = st.b[i];
          if (st.to === 'b') {
            for (let yy = 16; yy < yB; yy += 3) rect(ctx, x + 30, yy, 1, 1, COL[v]);
          }
          box(ctx, x, yB, v, t);
        });
        drawText(ctx, 'VERDE', 2, 61, 'l');
        drawText(ctx, 'AZUL', 2, 26, 'c');
      }
      if (st.canary) drawText(ctx, '10%', 4, 24, 'y');
      if (st.down && !REDUCED && (t >> 3) % 2) drawTextC(ctx, 'FORA DO AR', 96, 60, 'r');
      if (st.down && REDUCED) drawTextC(ctx, 'FORA DO AR', 96, 60, 'r');
    });

    document.querySelectorAll('.dep-pick').forEach((b) => b.addEventListener('click', () => {
      if (running) return;
      strategy = b.dataset.strategy;
      step = 0;
      document.querySelectorAll('.dep-pick').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      status.textContent = PLANS[strategy][0].msg;
      showFacts();
    }));
    $('#dep-run').addEventListener('click', () => {
      step = 0;
      running = true;
      hold = REDUCED ? 1 : 70;
      status.textContent = PLANS[strategy][0].msg;
      $('#dep-run').disabled = true;
    });
    showFacts();
  })();

  // ---------------------------------------------------------------- biblioteca
  (() => {
    const list = $('#lib-list');
    if (!list) return;
    // [fase, nome, usado no r2d2?, em uma frase, na prática, pegadinha]. `crase` vira <code>.
    const LIB = [
      [1, 'systemd e units', true, 'O gerenciador de serviços do Linux: sobe, para, reinicia e vigia processos descritos em "units".',
        '`systemctl status ssh` · `systemctl enable --now X` · `systemctl list-timers`',
        '`start` liga agora; `enable` liga no próximo boot. `enable --now` faz os dois. Esquecer o enable = serviço some depois do reboot.'],
      [1, 'journalctl: os logs', true, 'O systemd guarda a saída de todos os serviços num diário consultável.',
        '`journalctl -u ssh -f` (acompanhar) · `--since "-1h"` · `-p err` (só erros) · `-b` (só desde o último boot)',
        'Sem `-u` você vê o sistema inteiro e se perde. Filtre sempre por unit e por tempo.'],
      [1, 'Permissões rwx', false, 'Cada arquivo tem dono, grupo e "outros", cada um com ler (4), escrever (2) e executar (1).',
        '`chmod 640 arquivo` = dono lê/escreve, grupo lê, outros nada · `chown user:grupo arquivo` · `ls -l`',
        '`chmod 777` "resolve" qualquer erro abrindo tudo pra todos. Em diretório, o x significa poder entrar nele.'],
      [1, 'Usuários, grupos e sudo', true, 'Quem você é define o que pode fazer. O sudo executa um comando como root, com registro.',
        '`id` · `groups` · `sudo usermod -aG grupo user` (o -a é essencial) · `sudo visudo`',
        'Estar no grupo `docker` equivale a ser root: dá pra montar o / do host num container. Está no ADR 0002 do r2d2.'],
      [1, 'Pacotes e repositórios', true, 'O apt instala software de repositórios assinados com chave GPG.',
        '`apt update` (atualiza a lista) · `apt upgrade` (atualiza pacotes) · `apt full-upgrade` (inclui kernel e remoções) · `apt-mark manual X`',
        '`upgrade` não instala nem remove pacotes; kernel novo costuma exigir `full-upgrade`. E `autoremove` pode levar o que estava marcado como automático (quase levou o network-manager).'],
      [1, 'Processos e sinais', false, 'Sinais são avisos que o kernel entrega a um processo. TERM pede pra sair; KILL mata sem chance de reagir.',
        '`ps aux` · `pgrep -fl nome` · `kill -TERM PID` · `kill -KILL PID` (último recurso)',
        'Começar pelo `kill -9` impede o programa de fechar arquivos e conexões direito. Tente o TERM antes.'],
      [1, 'CPU, memória e OOM', true, 'Load average é a fila de processos querendo CPU; o OOM killer mata processos quando a RAM acaba.',
        '`uptime` · `htop` · `free -h` (olhe "disponível") · `vmstat 1` · `dmesg | grep -i oom`',
        'Load 4 em 4 threads = 100%. E "livre" baixo é normal: o Linux usa RAM sobrando como cache. O que importa é "disponível".'],
      [1, 'Disco cheio', false, 'Espaço por partição e quem está ocupando.',
        '`df -h` · `du -sh /var/* | sort -h` · `ncdu /` · `df -i` (inodes)',
        '`df` diz cheio e o `du` não acha nada? Arquivo apagado mas ainda aberto por um processo (`lsof +L1`), ou inodes esgotados.'],
      [1, 'IP, CIDR e portas', true, 'IP é o endereço da máquina; /24 diz quantos bits são a rede; a porta identifica o serviço.',
        '`192.168.15.0/24` = 256 endereços · portas: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS · `ip -br a` · `ip r`',
        'TCP abre conexão e garante entrega (SSH, HTTP); UDP não (DNS, VPN, streaming). Regra de firewall precisa do protocolo certo.'],
      [1, 'DNS', true, 'Traduz nome em IP. O r2d2.local resolve por mDNS (avahi), sem servidor DNS.',
        '`dig r2d2.local` · `dig +short exemplo.com` · `resolvectl status` · `getent hosts nome`',
        '"É sempre DNS": cache e TTL fazem uma mudança demorar a aparecer. E o nome pode resolver primeiro pra IPv6 (aconteceu com o r2d2.local).'],
      [1, 'DHCP e IP fixo', true, 'O roteador entrega IP automático; a reserva por MAC garante sempre o mesmo.',
        '`ip -br link` (ver o MAC) · reserva no roteador · alternativa: IP estático no netplan',
        'Sem reserva, o IP muda num reboot: o r2d2 saiu do .4 e foi pro .15, e outro aparelho ficou com o .4.'],
      [1, 'Diagnóstico de rede', true, 'Descobrir, em camadas, onde a comunicação quebra.',
        '`ss -tlnp` (o que escuta) · `ping` · `nc -zv host porta` · `curl -v` · `mtr host` · `tcpdump -i any port 22`',
        '"Connection refused" = o host respondeu que nada escuta ali. Timeout = algo descartou o pacote (firewall). E ping falhando não prova que o host caiu: ICMP pode estar bloqueado.'],
      [1, 'SSH além do básico', true, 'Config por host, agente de chaves e encaminhamento de portas.',
        '`~/.ssh/config` (Host, HostName, IdentityFile) · `ssh -L` (traz porta remota) · `ssh -R` (expõe porta local) · `ssh -D` (proxy SOCKS) · `ProxyJump` (bastion)',
        '`AllowAgentForwarding` ligado num servidor comprometido deixa o atacante usar suas chaves enquanto você está conectado.'],
      [1, 'cron × systemd timer', true, 'Os dois agendam tarefas; o timer tem logs no journal, dependências e atraso aleatório.',
        'cron: `*/2 * * * * script.sh` · timer: `OnUnitActiveSec=2min` + `RandomizedDelaySec` · `Persistent=true` roda o que perdeu',
        'Cron roda com PATH mínimo e manda erro por e-mail (que ninguém lê). Muito script "funciona no terminal e falha no cron" por isso.'],
      [1, 'fail2ban', false, 'Lê os logs e bane temporariamente o IP que erra a senha várias vezes.',
        '`fail2ban-client status sshd`',
        'Não substitui desligar a senha. Com SSH só por chave (como no r2d2), ele vira redução de ruído, não proteção principal.'],

      [2, 'Namespaces e cgroups', true, 'Container não é VM: é um processo com visão isolada (namespaces) e limites de recurso (cgroups), dividindo o kernel do host.',
        'namespaces: pid, net, mnt, uts, ipc, user · cgroups: CPU, memória, I/O · `docker stats`',
        'Por dividir o kernel, container isola menos que VM. Por isso as camadas extras: sem root, cap_drop, no-new-privileges.'],
      [2, 'Camadas e cache de build', false, 'Cada instrução do Dockerfile gera uma camada. Mudou uma, todas as de baixo são refeitas.',
        'Ordene do que muda menos ao que muda mais · `docker history imagem` · veja o Simulador 6',
        '`COPY . .` antes de instalar as dependências joga o cache fora a cada linha de código alterada.'],
      [2, 'Instruções do Dockerfile', true, 'FROM, RUN, COPY, WORKDIR, ENV, USER, EXPOSE, HEALTHCHECK, CMD e ENTRYPOINT.',
        'Prefira `COPY` a `ADD` (que baixa URL e descompacta) · `USER 101` · `.dockerignore` pra não mandar `.git` e `.env` pro build',
        '`EXPOSE` só documenta a porta. Quem publica é o `ports:` do compose. Sem `.dockerignore`, segredos locais podem parar dentro da imagem.'],
      [2, 'CMD, ENTRYPOINT e PID 1', true, 'ENTRYPOINT é o executável; CMD, os argumentos padrão. O processo principal vira o PID 1 e precisa receber o SIGTERM.',
        'forma JSON: `CMD ["nginx", "-g", "daemon off;"]` · `docker stop` envia TERM e, após 10 s, KILL',
        'Na forma shell (`CMD nginx -g ...`) o app roda embaixo de um `sh` e não recebe o sinal: o desligamento vira morte forçada. Foi o aviso DL3025 do hadolint no r2d2.'],
      [2, 'Multi-stage build', false, 'Um estágio compila com todas as ferramentas; o final só copia o resultado.',
        '`FROM node:22 AS build` … `RUN npm run build` · `FROM nginx:alpine` · `COPY --from=build /app/dist /usr/share/nginx/html`',
        'Sem multi-stage, a imagem de produção leva compilador, cache do npm e código-fonte: maior e com mais CVEs.'],
      [2, 'Imagens base mínimas', true, 'alpine (pequena, musl), distroless (sem shell), scratch (vazia). Menos pacote, menos CVE.',
        'O Juice Shop usa distroless: `docker exec ... sh` não funciona. Debug com um container efêmero na mesma rede (fizemos com busybox).',
        'A base também envelhece: a nginx 1.29 parou de receber patches e trouxe 43 CVEs. Imagem mínima precisa de rebuild periódico igual.'],
      [2, 'Tag × digest', true, 'A tag é um apelido que pode mudar (`:main`, `:latest`); o digest `@sha256:…` é imutável.',
        '`docker inspect --format "{{.RepoDigests}}" imagem` · no compose: `image: nginx@sha256:...`',
        '`:latest` não quer dizer "a mais nova": é só o nome padrão quando nenhuma tag é dada. Em produção, fixe versão ou digest.'],
      [2, 'Volumes, bind mounts e tmpfs', true, 'Volume: gerenciado pelo Docker, persiste. Bind mount: uma pasta do host. tmpfs: na memória, some ao parar.',
        'volume pra banco de dados · bind `./gateway.conf:/etc/nginx/conf.d/default.conf:ro` · `tmpfs: /tmp` (usados no r2d2)',
        'O que é gravado na camada do container some quando ele é recriado. Dado importante tem que estar num volume.'],
      [2, 'Redes Docker', true, 'bridge (padrão, com NAT), host (usa a rede do host, sem isolamento), none, e internal (sem saída).',
        'No compose, um serviço acha o outro pelo nome: `proxy_pass http://juice-shop:3000` · `docker network inspect`',
        '`network_mode: host` ignora todo o isolamento de rede e a publicação de portas. Raramente é o que você quer.'],
      [2, 'Variáveis e segredos', false, 'Configuração entra por variável de ambiente; segredo nunca vai dentro da imagem.',
        '`env_file: .env` (fora do Git) · Docker secrets · cofre (Vault, AWS Secrets Manager)',
        '`ARG`/`ENV` com senha fica gravado na imagem e aparece no `docker history`. E `docker inspect` mostra as variáveis de qualquer container.'],
      [2, 'Restart policies', true, 'O que o Docker faz quando o container para: no, on-failure, always, unless-stopped.',
        '`restart: unless-stopped` (r2d2) · `docker inspect -f "{{.RestartCount}}" nome`',
        'Restart não conserta nada: um container em loop de crash reinicia pra sempre. Olhe o RestartCount e os logs.'],
      [2, 'depends_on e prontidão', false, '`depends_on` só define a ordem de criação; não espera a aplicação ficar pronta.',
        '`depends_on: { db: { condition: service_healthy } }` + healthcheck no serviço `db`',
        'A API sobe antes de o banco aceitar conexões e cai. É o bug clássico de "no meu PC funciona".'],
      [2, 'docker.sock', true, 'Montar /var/run/docker.sock num container dá a ele controle total do Docker, ou seja, do host.',
        'Muita ferramenta pede isso (Watchtower, Portainer, Traefik). Pese o risco antes.',
        'O deploy do r2d2 por timer no host evitou dar o socket pra um container atualizador.'],
      [2, 'Comandos do dia a dia', true, 'O kit de sobrevivência pra investigar container.',
        '`docker ps -a` · `logs -f --tail 100` · `exec -it` · `inspect` · `stats` · `system df` · `compose ps / logs / config`',
        '`docker system prune -a --volumes` apaga volumes sem uso, inclusive dados de banco de um stack parado.'],
      [2, 'Limites e exit 137', true, 'Passou do limite de memória, o kernel mata o container.',
        '`deploy.resources.limits.memory: 64M` · `docker inspect -f "{{.State.OOMKilled}}" nome`',
        'Exit 137 = 128 + 9 (SIGKILL). Quase sempre é OOM: aumente o limite ou ache o vazamento.'],

      [3, 'Git: branch, PR e merge', true, 'Branch isola o trabalho; o PR junta revisão e CI antes de entrar na main.',
        'merge (mantém o histórico) · squash (vira um commit, usado nos PRs do Dependabot) · rebase (reaplica em cima da main)',
        'Nunca faça rebase/force-push em branch que outras pessoas já usam: você reescreve o histórico delas.'],
      [3, 'Trunk-based × GitFlow', true, 'Trunk: branches curtas e merge frequente na main. GitFlow: develop, release e hotfix.',
        'O r2d2 é trunk-based: tudo vai pra main por commit ou PR curto, e o pipeline publica.',
        'Branch de feature que vive semanas vira um merge doloroso e atrasa o feedback. CD combina com branches curtas.'],
      [3, 'Anatomia de um pipeline', true, 'Gatilho, jobs, steps, runners, dependências, artefatos e cache.',
        '`on: push / pull_request / schedule` · `needs: checks` · `concurrency` · `cache-from: type=gha` · `matrix`',
        'Job sem `needs` roda em paralelo: o build pode publicar antes de o teste falhar.'],
      [3, 'Runners', true, 'A máquina que executa os jobs: hospedada (VM nova a cada job) ou self-hosted (a sua).',
        'O r2d2 usa runners hospedados do GitHub; o servidor só puxa a imagem pronta.',
        'Runner self-hosted em repo público: qualquer pessoa abre um PR e roda código na sua máquina.'],
      [3, 'Segredos no CI e OIDC', true, 'Segredos entram por `secrets.X` e com permissões mínimas. Melhor ainda: OIDC, sem chave fixa.',
        '`permissions: contents: read` · `GITHUB_TOKEN` (expira no fim do job) · OIDC: o job troca um token temporário por credencial na AWS',
        'Chave de nuvem fixa guardada no CI é o que vaza e é usado pra minerar cripto. PRs de fork não recebem secrets, de propósito.'],
      [3, 'Branch protection', false, 'Regras que impedem merge na main sem CI verde e sem revisão.',
        'Settings → Branches/Rulesets → exigir status checks (`checks`, `build`, `validate`) e PR',
        'Sem proteção, o CI só avisa: alguém (ou um script) pode empurrar direto pra main com o pipeline vermelho.'],
      [3, 'Tipos de scan', true, 'Cada um olha pra um lugar diferente.',
        'segredos (gitleaks) · SAST, o código (CodeQL, Semgrep) · SCA, as dependências e imagens (Trivy, Dependabot) · DAST, o app rodando (ZAP) · IaC (Checkov)',
        'Nenhum cobre tudo. O r2d2 tem segredos, SCA de imagem e lint; faltam SAST e DAST.'],
      [3, 'SBOM e assinatura', false, 'SBOM é a lista de tudo dentro da imagem; a assinatura prova quem a gerou.',
        '`trivy image --format cyclonedx` · `syft imagem` · assinatura com `cosign` (Sigstore)',
        'Sem SBOM, quando sai um CVE novo você precisa reescanear tudo pra saber se é afetado.'],
      [3, 'Build once, deploy many', true, 'A mesma imagem, com o mesmo digest, passa por todos os ambientes; só a configuração muda.',
        'tag `sha-<commit>` imutável · configuração por variável de ambiente',
        'Fazer um build novo pra produção significa colocar no ar algo que não foi exatamente o testado.'],
      [3, 'SemVer e conventional commits', true, 'MAJOR.MINOR.PATCH: quebra compatibilidade, adiciona recurso, corrige bug.',
        '`v20.3.0` (Juice Shop) · commits `feat:` e `fix:` geram versão e changelog automáticos',
        'Fixar `^1.2.3` aceita qualquer 1.x: uma minor mal versionada pode quebrar seu build. Por isso o lockfile.'],
      [3, 'Estratégias de deploy', true, 'Recreate, rolling, blue-green e canary trocam downtime, custo e risco entre si.',
        'Veja o Simulador 7. O r2d2 usa recreate: o container é recriado (alguns segundos fora do ar).',
        'Rolling e canary exigem que v1 e v2 funcionem ao mesmo tempo, inclusive contra o mesmo banco de dados.'],
      [3, 'Rollback e roll-forward', true, 'Rollback volta à versão anterior; roll-forward corrige e publica uma nova.',
        '`git revert <commit>` (o timer reaplica) · ou fixar `image: ...:sha-<anterior>`',
        'Migração de banco pode impedir o rollback simples. Faça mudanças de schema compatíveis (expand/contract).'],
      [3, 'Push × pull (GitOps)', true, 'Push: o CI entra no ambiente. Pull: um agente no ambiente sincroniza com o Git.',
        'r2d2: timer + `docker compose pull`. Em Kubernetes: Flux e ArgoCD.',
        'Com pull, o Git é a fonte da verdade: mudança feita à mão no servidor é desfeita na próxima sincronização.'],
      [3, 'Métricas DORA', true, 'Frequência de deploy, lead time, taxa de falha de mudança e tempo de recuperação.',
        'lead time do r2d2: 84 s do push ao ar · taxa de falha: quantos deploys precisaram de correção',
        'Medem a saúde do processo de entrega, não a produtividade de uma pessoa. Usar como meta individual distorce tudo.'],
      [3, 'Ambientes e promoção', false, 'dev → staging → produção, promovendo a mesma imagem.',
        'staging o mais parecido possível com produção · feature flags separam deploy (código no ar) de release (usuário vê)',
        'Staging diferente de produção dá falsa confiança: "passou em staging" não prova nada.'],
      [3, 'Idempotência', true, 'Rodar de novo dá o mesmo resultado, sem efeito colateral.',
        'O `ufw.sh` e o `homelab-deploy.sh` do r2d2 podem rodar mil vezes. É a base do Ansible (Fase 4).',
        'Script que faz `echo >> arquivo` a cada execução duplica a linha. Verifique antes de alterar.'],
    ];

    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = (t) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
    let done = new Set();
    try { done = new Set(JSON.parse(localStorage.getItem('r2d2-lib') || '[]')); } catch (_) { /* ok */ }
    const save = () => { try { localStorage.setItem('r2d2-lib', JSON.stringify([...done])); } catch (_) { /* ok */ } };

    const progress = $('#lib-progress');
    const NAMES = { 1: 'F1 · Linux', 2: 'F2 · Containers', 3: 'F3 · CI/CD' };
    const renderProgress = () => {
      progress.textContent = '';
      [1, 2, 3].forEach((f) => {
        const all = LIB.filter((c) => c[0] === f);
        const ok = all.filter((c) => done.has(c[1])).length;
        const d = document.createElement('div');
        d.textContent = `${NAMES[f]}: ${ok}/${all.length} dominados`;
        const bar = document.createElement('span');
        bar.className = 'bar';
        const fill = document.createElement('span');
        fill.style.width = `${(ok / all.length) * 100}%`;
        bar.appendChild(fill);
        d.appendChild(bar);
        progress.appendChild(d);
      });
    };

    const cards = LIB.map(([f, name, r2, what, how, trap]) => {
      const d = document.createElement('details');
      d.className = 'lib-card';
      d.dataset.f = String(f);
      d.dataset.text = norm(`${name} ${what} ${how} ${trap}`);
      d.innerHTML = `<summary><span class="name">${esc(name)}</span>`
        + `<span class="badge f${f}">F${f}</span>${r2 ? '<span class="badge r2">no r2d2</span>' : ''}`
        + '<span class="badge ok" hidden>dominei</span></summary>'
        + `<p><span class="k">Em uma frase</span>${fmt(what)}</p>`
        + `<p><span class="k">Na prática</span>${fmt(how)}</p>`
        + `<p class="trap"><span class="k">Pegadinha</span>${fmt(trap)}</p>`
        + '<label><input type="checkbox"> dominei: consigo explicar sem olhar</label>';
      const cb = d.querySelector('input');
      const badge = d.querySelector('.badge.ok');
      cb.checked = done.has(name);
      badge.hidden = !cb.checked;
      cb.addEventListener('change', () => {
        if (cb.checked) { done.add(name); award(`lib-${name}`, 3, 'conceito dominado'); } else done.delete(name);
        badge.hidden = !cb.checked;
        save();
        renderProgress();
      });
      list.appendChild(d);
      return d;
    });

    let fase = '0';
    const q = $('#lib-q');
    const apply = () => {
      const term = norm(q.value.trim());
      let shown = 0;
      cards.forEach((c) => {
        const ok = (fase === '0' || c.dataset.f === fase) && (!term || c.dataset.text.includes(term));
        c.hidden = !ok;
        if (ok) shown++;
      });
      $('#lib-empty').hidden = shown > 0;
    };
    document.querySelectorAll('.lib-filter').forEach((b) => b.addEventListener('click', () => {
      fase = b.dataset.f;
      document.querySelectorAll('.lib-filter').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      apply();
    }));
    q.addEventListener('input', apply);
    renderProgress();
  })();

  requestAnimationFrame(loop);
})();
