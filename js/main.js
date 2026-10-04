(() => {
  'use strict';

  const WA_NUMBER = '5491126142293';
  const PHONE_DISPLAY = '+54 9 11 2614-2293';
  const ROUTE_KM = 35;
  const PRICE_AIRPORT = '$35.000';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const $ = (id) => document.getElementById(id);

  /* ---------- Navegación: fondo sólido al salir del hero ---------- */
  const nav = $('nav');
  const hero = $('hero');

  function updateNav() {
    nav.classList.toggle('solid', scrollY > hero.offsetHeight - innerHeight - 40);
  }
  addEventListener('scroll', updateNav, { passive: true });
  addEventListener('resize', updateNav);
  updateNav();

  /* ---------- Menú en pantallas angostas ---------- */
  const navToggle = $('navToggle');
  const navLinks = $('navLinks');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
  });

  /* ---------- Sección actual marcada en el menú ---------- */
  if ('IntersectionObserver' in window) {
    const links = new Map([...navLinks.querySelectorAll('a:not(.btn)')].map((a) => [a.hash.slice(1), a]));
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      const a = links.get(e.target.id);
      if (!a) return;
      if (e.isIntersecting) {
        links.forEach((l) => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'location');
      } else if (a.hasAttribute('aria-current')) {
        a.removeAttribute('aria-current');
      }
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = $(id); if (s) spy.observe(s); });
  }

  /* ---------- Hero: la ruta CABA → EZE avanza con el scroll ---------- */
  const beats = [...document.querySelectorAll('.beat')];
  const fill = $('routeFill');
  const routeDot = $('routeCar');
  const km = $('routeKm');
  const hint = $('scrollHint');
  const scene = $('scene');
  const layerFar = $('layerFar');
  const layerMid = $('layerMid');
  const road = $('road');
  const plane = $('plane');
  const beam = $('beam');
  const spokes = document.querySelector('#wheel .spokes');
  const skyDawn = $('skyDawn');
  const stars = $('stars');
  const sun = $('sun');

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  // Estrellas con posiciones fijas (pseudoaleatorias) para que siempre se vean igual
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = (rand() * 100) + '%';
    s.style.top = (rand() * 92) + '%';
    s.style.opacity = (0.25 + rand() * 0.6).toFixed(2);
    if (rand() > 0.85) { s.style.width = s.style.height = '3px'; }
    stars.appendChild(s);
  }

  let vw = 0, vh = 0, farW = 0, midW = 0, planeW = 0, planeTop = 0;
  const measure = () => {
    vw = scene.clientWidth;
    vh = scene.clientHeight;
    farW = layerFar.getBoundingClientRect().width;
    midW = layerMid.getBoundingClientRect().width;
    planeW = plane.getBoundingClientRect().width;
    // En pantallas angostas el texto ocupa todo el ancho: el avión vuela por debajo del último texto
    planeTop = vh * 0.14;
    if (vw < 700) {
      const last = beats[beats.length - 1];
      planeTop = Math.max(planeTop, last.offsetTop + last.offsetHeight + 28);
    }
  };

  function render(p) {
    layerFar.style.transform = `translate3d(${-p * Math.max(0, farW - vw)}px,0,0)`;
    layerMid.style.transform = `translate3d(${-p * Math.max(0, midW - vw)}px,0,0)`;
    road.style.setProperty('--road-x', (-p * 5200).toFixed(1) + 'px');
    spokes.setAttribute('transform', `rotate(${(p * 5400) % 360})`);
    beam.style.opacity = 1 - smooth(0.55, 1, p) * 0.75;

    // Amanece mientras se acerca al aeropuerto
    skyDawn.style.opacity = smooth(0.35, 1, p);
    stars.style.opacity = 1 - smooth(0.3, 0.85, p);
    sun.style.transform = `translateY(${140 - 190 * smooth(0.45, 1, p)}%)`;

    // El avión despega en el último tramo
    const t = clamp01((p - 0.66) / 0.34);
    const startY = road.offsetTop - planeW * 0.3;
    const endY = Math.min(planeTop, startY - 20);
    const x = Math.min(vw * (0.4 + 0.42 * t), vw - planeW * 1.3);
    const y = startY - Math.pow(t, 1.5) * (startY - endY);
    plane.style.opacity = smooth(0, 0.06, t);
    plane.style.transform = `translate3d(${x}px,${y}px,0) rotate(${-(2 + 12 * t)}deg) scale(${0.8 + 0.4 * t})`;
  }

  measure();
  render(0);

  if (reduce) {
    addEventListener('resize', () => { measure(); render(0); });
  } else {
    let target = 0;
    let current = 0;
    let running = false;

    const heroProgress = () => {
      const total = hero.offsetHeight - innerHeight;
      return clamp01(-hero.getBoundingClientRect().top / (total || 1));
    };

    // El bucle solo corre mientras la escena no llegó a la posición pedida; después se detiene
    const tick = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0005) current = target;
      render(current);
      if (current !== target) requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (!running) { running = true; requestAnimationFrame(tick); }
    };

    const onScroll = () => {
      const p = heroProgress();
      target = p;
      const idx = Math.min(beats.length - 1, Math.floor(p * beats.length * 0.999));
      beats.forEach((b, i) => b.classList.toggle('on', i === idx));
      fill.style.width = (p * 100) + '%';
      routeDot.style.left = (p * 100) + '%';
      km.textContent = Math.round(p * ROUTE_KM) + ' km';
      hint.style.opacity = p > 0.03 ? 0 : 1;
      kick();
    };

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { measure(); render(current); onScroll(); });
    // Las fuentes del cartel pueden cambiar el ancho de las capas al cargar
    document.fonts && document.fonts.ready.then(() => { measure(); render(current); });
    onScroll();
  }

  /* ---------- Aparición suave de secciones ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); }
    });
  }

  /* ---------- Auto 360° ---------- */
  const frames = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `assets/img/car-${i}.webp`);
  const views = ['frontal tres cuartos', 'lateral izquierda', 'trasera tres cuartos', 'trasera',
    'trasera tres cuartos derecha', 'lateral derecha', 'frontal tres cuartos derecha', 'frontal'];
  const img = $('carImg');
  const deg = $('deg');
  const stage = $('stage');
  let frame = 0;
  let preloaded = false;

  // Las 8 vistas se cargan recién cuando la sección está por aparecer
  const preload = () => {
    if (preloaded) return;
    preloaded = true;
    frames.forEach((src) => { const i = new Image(); i.src = src; });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { preload(); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(stage);
  } else {
    preload();
  }

  function show(n) {
    frame = (n + frames.length) % frames.length;
    img.src = frames[frame];
    img.alt = 'Renault Sandero blanco, vista ' + views[frame];
    deg.textContent = (frame * 45) + '°';
  }
  $('prevBtn').addEventListener('click', () => show(frame - 1));
  $('nextBtn').addEventListener('click', () => show(frame + 1));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(frame - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(frame + 1); }
  });

  // Arrastrar: cada 45 px de recorrido es una vista
  let dragX = null;
  let startFrame = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    preload();
    dragX = e.clientX;
    startFrame = frame;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    const next = startFrame + Math.round((e.clientX - dragX) / -45);
    if (((next % 8) + 8) % 8 !== frame) show(next);
  });
  const endDrag = () => { dragX = null; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* ---------- Reserva por WhatsApp ---------- */
  const form = $('bookForm');
  const preview = $('preview');
  const sendWa = $('sendWa');
  const origCode = $('origCode');
  const destCode = $('destCode');
  const routeIcon = $('routeIcon');
  const fecha = $('fecha');
  const destinoField = $('destinoField');
  const vueloField = $('vueloField');
  const fitNote = $('fitNote');
  const formError = $('formError');

  // Textos que cambian según el tipo de viaje
  const TIPOS = {
    t1: {
      codes: ['CABA', 'EZE'], icon: '#i-plane',
      dir: 'Dirección de búsqueda', dirMsg: 'Búsqueda en', dirPh: 'Ej: Santa Fe 3200, Palermo',
      vuelo: 'Vuelo (opcional)', vueloHint: 'Sirve para saber a qué terminal ir.', vueloReq: false,
      hora: 'Hora de salida', horaHint: 'A qué hora querés que te pase a buscar. Si no sabés, dejala vacía y Oswaldo te propone una según tu vuelo.'
    },
    t2: {
      codes: ['EZE', 'CABA'], icon: '#i-plane',
      dir: 'Dirección de destino', dirMsg: 'Destino', dirPh: 'Ej: Santa Fe 3200, Palermo',
      vuelo: 'Número de vuelo', vueloHint: 'Con el número de vuelo se puede seguir el horario real de llegada.', vueloReq: true,
      hora: 'Hora de aterrizaje', horaHint: 'La que figura en tu pasaje.'
    },
    t3: {
      codes: ['A', 'B'], icon: '#i-arrow',
      dir: 'Dirección de origen', dirMsg: 'Origen', dirPh: 'Ej: Santa Fe 3200, Palermo',
      hora: 'Hora de salida', horaHint: ''
    }
  };

  // Fecha local (no UTC): de noche en Argentina toISOString ya da el día siguiente
  const isoLocal = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  fecha.min = isoLocal(new Date());

  const fmtDate = (v) => {
    if (!v) return 'a definir';
    const [y, m, d] = v.split('-');
    const day = new Date(+y, m - 1, +d).toLocaleDateString('es-AR', { weekday: 'long' });
    return `${day} ${d}/${m}/${y}`;
  };

  const val = (id) => $(id).value.trim();
  const tipoId = () => form.querySelector('input[name="tipo"]:checked').id;

  function buildMsg() {
    const id = tipoId();
    const cfg = TIPOS[id];
    const lines = [
      '¡Hola Oswaldo! Quiero reservar un viaje.',
      `• Viaje: ${$(id).value}`,
      `• Nombre: ${val('nombre') || '-'}`,
      `• ${cfg.dirMsg}: ${val('direccion') || '-'}`
    ];
    if (id === 't3') lines.push(`• Destino: ${val('destino') || '-'}`);
    else if (val('vuelo')) lines.push(`• Vuelo: ${val('vuelo')}`);
    lines.push(
      `• Fecha: ${fmtDate(val('fecha'))}`,
      `• ${cfg.hora}: ${val('hora') || 'a definir'}`,
      `• Pasajeros: ${val('pasajeros')} · Valijas grandes: ${val('valijas')}`
    );
    if (val('notas')) lines.push(`• Comentarios: ${val('notas').replace(/\s*\n\s*/g, ' ')}`);
    lines.push(id === 't3' ? '¿Cuál sería la tarifa?' : `Tarifa fija: ${PRICE_AIRPORT}. ¿Me confirmás disponibilidad?`);
    return lines.join('\n');
  }

  // Validación: los errores se muestran recién después del primer intento de envío
  let tried = false;

  function errors() {
    const id = tipoId();
    const list = [];
    if (!val('nombre')) list.push(['nombre', 'Escribí tu nombre.']);
    if (!val('direccion')) list.push(['direccion', id === 't2' ? 'Escribí a dónde vas.' : 'Escribí dónde te paso a buscar.']);
    if (id === 't3' && !val('destino')) list.push(['destino', 'Escribí a dónde vas.']);
    if (id === 't2' && !val('vuelo')) list.push(['vuelo', 'Escribí el número de vuelo.']);
    if (!val('fecha')) list.push(['fecha', 'Elegí la fecha del viaje.']);
    else if (val('fecha') < fecha.min) list.push(['fecha', 'La fecha ya pasó: elegí una de hoy en adelante.']);
    return list;
  }

  function showErrors() {
    const list = tried ? errors() : [];
    const bad = new Map(list);
    ['nombre', 'direccion', 'destino', 'vuelo', 'fecha'].forEach((f) => {
      const msg = bad.get(f) || '';
      $(f + '-err').textContent = msg;
      if (msg) $(f).setAttribute('aria-invalid', 'true');
      else $(f).removeAttribute('aria-invalid');
    });
    formError.textContent = list.length ? 'Faltan datos para armar el pedido. Revisá los campos marcados.' : '';
    return list;
  }

  function update() {
    const cfg = TIPOS[tipoId()];
    const isCity = tipoId() === 't3';

    $('direccionLabel').textContent = cfg.dir;
    $('direccion').placeholder = cfg.dirPh;
    destinoField.hidden = !isCity;
    vueloField.hidden = isCity;
    if (!isCity) {
      $('vueloLabel').textContent = cfg.vuelo;
      $('vuelo-hint').textContent = cfg.vueloHint;
    }
    $('horaLabel').textContent = cfg.hora;
    $('hora-hint').textContent = cfg.horaHint;
    $('hora-hint').hidden = !cfg.horaHint;

    origCode.firstChild.nodeValue = cfg.codes[0];
    destCode.firstChild.nodeValue = cfg.codes[1];
    routeIcon.setAttribute('href', cfg.icon);

    const pn = $('priceNote');
    pn.textContent = isCity ? 'Los viajes dentro de CABA no tienen precio fijo: Oswaldo te pasa la tarifa por WhatsApp.' : `Precio fijo: ${PRICE_AIRPORT} el viaje completo, ida o vuelta.`;
    pn.classList.toggle('quote', isCity);

    const pax = +val('pasajeros');
    const bags = +val('valijas');
    // El baúl del Sandero (320 L) lleva cómodas unas 2 valijas grandes
    fitNote.textContent = (bags >= 3 || (pax >= 4 && bags >= 2))
      ? 'Con tantas valijas grandes puede que no entre todo en el baúl: Oswaldo te lo confirma al responderte.'
      : '';

    const text = buildMsg();
    preview.textContent = text;
    sendWa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    showErrors();
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);

  sendWa.addEventListener('click', (e) => {
    tried = true;
    const list = showErrors();
    if (list.length) {
      e.preventDefault();
      $(list[0][0]).focus();
    }
  });

  // Enter en un campo no abre WhatsApp de golpe: valida y lleva al botón de envío
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    tried = true;
    const list = showErrors();
    if (list.length) $(list[0][0]).focus();
    else sendWa.focus();
  });

  // Elegir un viaje en el tablero de servicios lo deja marcado en el formulario
  document.querySelectorAll('.row-link').forEach((a) => a.addEventListener('click', () => {
    $(a.dataset.tipo).checked = true;
    update();
  }));

  update();

  /* ---------- Copiar al portapapeles ---------- */
  function selectNode(el, out) {
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    out.textContent = touch ? 'Texto seleccionado: mantené apretado para copiarlo' : 'Seleccionado: copialo con Ctrl+C';
  }
  function copy(text, out, fallbackEl) {
    const ok = () => {
      out.textContent = 'Copiado';
      setTimeout(() => { out.textContent = ''; }, 2000);
    };
    if (navigator.clipboard && isSecureContext) {
      navigator.clipboard.writeText(text).then(ok).catch(() => selectNode(fallbackEl, out));
    } else {
      selectNode(fallbackEl, out);
    }
  }
  $('copyMsg').addEventListener('click', () => copy(preview.textContent, $('copyMsgOk'), preview));
  $('copyPhone').addEventListener('click', () => copy(PHONE_DISPLAY, $('copyPhoneOk'), $('phone')));
})();
