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

  requestAnimationFrame(loop);
})();
