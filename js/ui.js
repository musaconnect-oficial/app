// =====================================================================
// MusaConnect · Interfaz compartida
// Navegación superior + barra inferior en celular, avisos (toasts),
// animaciones de entrada y la tarjeta de perfil que usan varias páginas.
// Uso: después de crear el cliente de Supabase, cada página llama
//      MusaUI.montar(client, { activo: 'muro' });
// Requiere js/seguridad.js (esc, safeUrl, safeColor, safeFont).
// =====================================================================
(function () {
    const ICONOS = {
        inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
        muro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/></svg>',
        radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.07 4.93A10 10 0 1 0 22 12"/><path d="M16.24 7.76A6 6 0 1 0 18 12"/><circle cx="12" cy="12" r="2"/><path d="m13.4 10.6 6.6-6.6"/></svg>',
        explorar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
        chats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>',
        campana: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
        perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
        editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
        panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        corona: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 5 5 5-8 5 8 5-5-2 12H4z"/></svg>',
        salir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>'
    };

    const TIPOS = {
        artista:    { label: 'Artista',    emoji: '🎤', bio: 'Artista en MusaConnect' },
        banda:      { label: 'Banda',      emoji: '🎸', bio: 'Banda en MusaConnect' },
        compositor: { label: 'Productor',  emoji: '🎹', bio: 'Compositor y beatmaker' },
        estudio:    { label: 'Estudio',    emoji: '🎙️', bio: 'Estudio de grabación' },
        fan:        { label: 'Fan',        emoji: '🎧', bio: 'Fan de la música independiente' }
    };

    const NAV = [
        { id: 'inicio', href: 'index.html', texto: 'Inicio' },
        { id: 'muro', href: 'feed.html', texto: 'Muro' },
        { id: 'radar', href: 'radar.html', texto: 'Radar' },
        { id: 'explorar', href: 'explorar.html', texto: 'Explorar' }
    ];

    // ---------------- Avisos ----------------
    function contenedorToasts() {
        let c = document.querySelector('.mc-toasts');
        if (!c) { c = document.createElement('div'); c.className = 'mc-toasts'; document.body.appendChild(c); }
        return c;
    }

    function toast(mensaje, tipo) {
        const texto = String(mensaje == null ? '' : mensaje);
        if (!tipo) {
            if (/^(error|no se pudo|no tienes|acceso|debes|falta|completa|llena|escribe|el título|el nombre|la url)/i.test(texto)) tipo = 'error';
            else if (/(éxito|✅|enviad|guardad|publicad|copiad|actualizad|listo)/i.test(texto)) tipo = 'ok';
            else tipo = 'info';
        }
        const icono = { ok: '✓', error: '!', info: '♪' }[tipo] || '♪';
        const el = document.createElement('div');
        el.className = 'mc-toast ' + tipo;
        el.setAttribute('role', 'status');
        el.innerHTML = `<span class="mc-toast-icono">${icono}</span><span class="flex-1 leading-snug"></span>`;
        el.lastChild.textContent = texto;
        contenedorToasts().appendChild(el);
        const cerrar = () => { el.classList.add('sale'); setTimeout(() => el.remove(), 300); };
        el.addEventListener('click', cerrar);
        setTimeout(cerrar, Math.min(7000, 2600 + texto.length * 45));
    }
    // Los alert() de toda la app pasan a ser avisos elegantes
    window.alert = function (m) { toast(m); };

    // ---------------- Animaciones de entrada ----------------
    const observador = 'IntersectionObserver' in window
        ? new IntersectionObserver(entradas => entradas.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-in'); observador.unobserve(e.target); }
        }), { threshold: 0.12 })
        : null;
    function revelar(raiz) {
        (raiz || document).querySelectorAll('.mc-reveal:not(.is-in)').forEach(el => {
            if (observador) observador.observe(el); else el.classList.add('is-in');
        });
    }

    // ---------------- Tarjeta de perfil ----------------
    function inicial(nombre) {
        return esc((String(nombre || '?').trim().charAt(0) || '?').toUpperCase());
    }

    function avatarHtml(p, clases, forma) {
        const f = forma || (p && p.forma_avatar === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-full');
        const url = p && safeUrl(p.avatar_url);
        return url
            ? `<div class="${clases} ${f} overflow-hidden bg-zinc-800 shrink-0"><img src="${url}" alt="" loading="lazy" class="w-full h-full object-cover"></div>`
            : `<div class="${clases} ${f} shrink-0 grid place-items-center font-black text-white" style="background:linear-gradient(135deg, ${safeColor(p && p.color_acento, '#8b5cf6')}, #1a1724)">${inicial(p && (p.nombre_display || p.username))}</div>`;
    }

    function tarjetaPerfil(u) {
        const acento = safeColor(u.color_acento, '#8b5cf6');
        const fuente = esc(safeFont(u.fuente_nombre));
        const tipo = TIPOS[u.tipo] ? u.tipo : 'fan';
        const t = TIPOS[tipo];
        const nombre = u.nombre_display || '@' + u.username;
        const generos = (u.generos || []).slice(0, 2).map(g => `<span class="mc-chip">${esc(g)}</span>`).join('');
        const banner = safeUrl(u.banner_url);
        return `
        <a href="visor.html?id=${encodeURIComponent(u.id)}" class="mc-card mc-glow mc-reveal group block overflow-hidden" style="--acento:${acento}">
            <div class="h-20 relative overflow-hidden" style="background:linear-gradient(135deg, ${acento}66, transparent 75%)">
                ${banner ? `<img src="${banner}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition duration-700">` : ''}
                <div class="absolute inset-0" style="background:linear-gradient(180deg, transparent, rgba(14,13,19,.95))"></div>
            </div>
            <div class="px-5 pb-5 -mt-9 relative">
                <div class="inline-block rounded-full" style="box-shadow:0 0 0 3px #0e0d13, 0 0 0 5px ${acento}88; border-radius:${u.forma_avatar === 'rounded-2xl' ? '16px' : '999px'}">
                    ${avatarHtml(u, 'w-[68px] h-[68px] text-2xl')}
                </div>
                <div class="mt-3 flex items-center gap-1.5 min-w-0">
                    <h4 class="font-extrabold text-lg truncate transition-colors group-hover:text-[var(--acento)]" style="font-family:${fuente}">${esc(nombre)}</h4>
                    ${u.verificado ? '<span class="mc-verificado" title="Verificado">✓</span>' : ''}
                </div>
                <p class="text-xs text-zinc-500 truncate">@${esc(u.username)}${u.ciudad ? ' · 📍 ' + esc(u.ciudad) : ''}</p>
                <p class="text-sm text-zinc-400 mt-2 line-clamp-2 min-h-[2.5rem] leading-relaxed">${esc(u.bio || t.bio)}</p>
                <div class="mt-3 flex flex-wrap items-center gap-1.5">
                    <span class="mc-tipo mc-tipo-${tipo}">${t.emoji} ${t.label}</span>${generos}
                </div>
            </div>
        </a>`;
    }

    // ---------------- Compartir ----------------
    async function compartir(url, titulo) {
        if (navigator.share) {
            try { await navigator.share({ title: titulo || 'MusaConnect', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
        }
        try { await navigator.clipboard.writeText(url); toast('¡Link copiado! Pégalo en tu bio o compártelo.', 'ok'); }
        catch (e) { toast('Copia este link: ' + url, 'info'); }
    }

    // ---------------- Navegación ----------------
    function topbarHtml(activo) {
        const links = NAV.map(l => `<a href="${l.href}" class="mc-navlink ${l.id === activo ? 'activo' : ''}">${ICONOS[l.id]}${l.texto}</a>`).join('');
        return `
        <header class="mc-topbar" id="mc-topbar">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
                <a href="index.html" class="flex items-center gap-2.5 shrink-0 group" aria-label="MusaConnect, inicio">
                    <span class="w-9 h-9 rounded-xl grid place-items-center shadow-[0_8px_24px_-8px_rgba(236,72,153,.8)] group-hover:rotate-6 transition-transform" style="background:var(--mc-grad)">
                        <span class="mc-eq" style="height:15px"><i style="background:#fff"></i><i style="background:#fff"></i><i style="background:#fff"></i><i style="background:#fff"></i></span>
                    </span>
                    <span class="mc-display font-extrabold text-[17px] tracking-tight hidden sm:inline">MUSA<span class="mc-grad-text">CONNECT</span></span>
                </a>
                <nav class="hidden md:flex items-center gap-1">${links}</nav>
                <div class="flex items-center gap-2">
                    <a href="chat.html" id="chat-link" title="Chats" class="mc-iconbtn hidden ${activo === 'chats' ? 'text-white' : ''}">${ICONOS.chats}<span id="chat-badge" class="mc-badge hidden"></span></a>
                    <a href="notificaciones.html" id="campana" title="Notificaciones" class="mc-iconbtn hidden ${activo === 'notis' ? 'text-white' : ''}">${ICONOS.campana}<span id="campana-badge" class="mc-badge hidden"></span></a>
                    <div id="mc-auth" class="relative"><div class="w-24 h-9 mc-skel rounded-full"></div></div>
                </div>
            </div>
        </header>`;
    }

    function bottombarHtml(activo) {
        const tab = (id, href, texto) => `<a href="${href}" class="mc-tab ${activo === id ? 'activo' : ''}">${ICONOS[id]}<span>${texto}</span></a>`;
        return `
        <nav class="mc-bottombar" aria-label="Navegación principal">
            ${tab('inicio', 'index.html', 'Inicio')}
            ${tab('muro', 'feed.html', 'Muro')}
            <a href="radar.html" class="mc-tab-centro" aria-label="Radar">${ICONOS.radar}</a>
            ${tab('chats', 'chat.html', 'Chats')}
            ${tab('perfil', 'profile.html', 'Perfil')}
        </nav>`;
    }

    function pintarSesion(perfil) {
        const cont = document.getElementById('mc-auth');
        if (!cont) return;
        if (!perfil) {
            cont.innerHTML = `
                <div class="flex items-center gap-2">
                    <a href="login.html" class="mc-btn-ghost mc-btn-sm hidden sm:inline-flex">Ingresar</a>
                    <a href="register.html" class="mc-btn mc-btn-sm">Únete gratis</a>
                </div>`;
            return;
        }
        const extra = [];
        if (perfil.tipo && perfil.tipo !== 'fan') extra.push(`<a href="admin.html">${ICONOS.panel}Panel de creador</a>`);
        if (perfil.es_admin) extra.push(`<a href="super-admin.html">${ICONOS.corona}Modo Dios</a>`);
        cont.innerHTML = `
            <button id="mc-avatar-btn" class="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full border border-[var(--mc-line)] bg-[var(--mc-surface)] hover:bg-[var(--mc-surface-2)] transition-colors" aria-haspopup="menu" aria-expanded="false">
                ${avatarHtml(perfil, 'w-8 h-8 text-sm', 'rounded-full')}
                <span class="hidden sm:block text-sm font-bold max-w-[120px] truncate">${esc(perfil.nombre_display || perfil.username)}</span>
            </button>
            <div id="mc-menu" class="mc-menu mc-glass hidden" role="menu">
                <div class="px-3 py-2 mb-1">
                    <p class="font-bold text-sm truncate">${esc(perfil.nombre_display || perfil.username)}</p>
                    <p class="text-xs text-zinc-500 truncate">@${esc(perfil.username)}</p>
                </div>
                <a href="profile.html">${ICONOS.perfil}Mi perfil</a>
                <a href="editar-perfil.html">${ICONOS.editar}Editar perfil</a>
                <a href="chat.html">${ICONOS.chats}Chats</a>
                <a href="notificaciones.html">${ICONOS.campana}Notificaciones</a>
                ${extra.join('')}
                <div class="mc-divider my-1"></div>
                <button id="mc-salir" class="!text-rose-400">${ICONOS.salir}Cerrar sesión</button>
            </div>`;
        const btn = document.getElementById('mc-avatar-btn');
        const menu = document.getElementById('mc-menu');
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const abierto = !menu.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', String(abierto));
        });
        document.addEventListener('click', e => { if (!menu.contains(e.target)) menu.classList.add('hidden'); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.classList.add('hidden'); });
        document.getElementById('mc-salir').addEventListener('click', async () => {
            await MusaUI.client.auth.signOut();
            window.location.href = 'index.html';
        });
    }

    async function montar(client, opciones) {
        opciones = opciones || {};
        MusaUI.client = client;
        if (!document.querySelector('.mc-aurora')) {
            document.body.insertAdjacentHTML('afterbegin', '<div class="mc-aurora" aria-hidden="true"><span></span><span></span><span></span></div>');
        }
        if (!opciones.sinNav) {
            const ancla = document.querySelector('.mc-aurora');
            ancla.insertAdjacentHTML('afterend', topbarHtml(opciones.activo));
            document.body.insertAdjacentHTML('beforeend', bottombarHtml(opciones.activo));
            document.body.classList.add('mc-con-nav');
        }
        revelar();
        new MutationObserver(() => revelar()).observe(document.body, { childList: true, subtree: true });
        // Respaldo: si el navegador no avisa del scroll, lo que ya está en pantalla se muestra igual
        setInterval(() => document.querySelectorAll('.mc-reveal:not(.is-in)').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
        }), 1500);

        if (opciones.sinNav) return null;
        const { data: { session } } = await client.auth.getSession();
        if (!session) { pintarSesion(null); return null; }
        const { data: perfil } = await client.from('perfiles')
            .select('id, username, nombre_display, avatar_url, tipo, es_admin, color_acento, forma_avatar')
            .eq('id', session.user.id).maybeSingle();
        pintarSesion(perfil || { username: 'tu-cuenta', nombre_display: 'Mi cuenta' });
        if (typeof window.actualizarCampana === 'function') window.actualizarCampana(client);
        MusaUI.miPerfil = perfil;
        return perfil;
    }

    // Cuenta hacia arriba un número (para estadísticas)
    function contar(el, hasta) {
        if (!el) return;
        const total = Number(hasta) || 0;
        const final = total.toLocaleString('es-CL');
        if (document.hidden || total === 0) { el.textContent = final; return; }
        const inicio = performance.now(), dur = 1100;
        let terminado = false;
        const paso = t => {
            if (terminado) return;
            const k = Math.min(1, (t - inicio) / dur);
            el.textContent = Math.round(total * (1 - Math.pow(1 - k, 3))).toLocaleString('es-CL');
            if (k < 1) requestAnimationFrame(paso); else terminado = true;
        };
        requestAnimationFrame(paso);
        // Si el navegador pausa las animaciones, el número real igual queda puesto
        setTimeout(() => { terminado = true; el.textContent = final; }, dur + 150);
    }

    function tiempoRelativo(fecha) {
        const s = Math.floor((Date.now() - new Date(fecha)) / 1000);
        if (s < 60) return 'ahora';
        if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
        if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
        if (s < 604800) return `hace ${Math.floor(s / 86400)} d`;
        return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    }

    window.MusaUI = { montar, toast, revelar, tarjetaPerfil, avatarHtml, compartir, contar, tiempoRelativo, TIPOS, ICONOS, client: null, miPerfil: null };
})();
