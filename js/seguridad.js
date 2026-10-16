// Utilidades de seguridad compartidas por todas las páginas.
// Todo dato que venga de la base de datos o de un usuario debe pasar por aquí
// antes de insertarse con innerHTML.

// Escapa texto para insertarlo dentro de HTML o de un atributo entre comillas
window.esc = function (valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
};

// Devuelve la URL escapada solo si es http(s); bloquea javascript:, data:, etc.
window.safeUrl = function (url) {
    if (!url) return '';
    const v = String(url).trim();
    try {
        const u = new URL(v, window.location.href);
        if (u.protocol === 'http:' || u.protocol === 'https:') return esc(u.href);
    } catch (e) { /* URL inválida */ }
    return '';
};

// Solo acepta colores hexadecimales (#abc, #aabbcc, #aabbccdd)
window.safeColor = function (color, porDefecto = '#7c3aed') {
    return /^#[0-9a-fA-F]{3,8}$/.test(color || '') ? color : porDefecto;
};

// Solo acepta las fuentes que ofrece la plataforma
const FUENTES_PERMITIDAS = ["Inter", "'Bebas Neue'", "'Space Mono'", "'Permanent Marker'"];
window.safeFont = function (fuente) {
    return FUENTES_PERMITIDAS.includes(fuente) ? fuente : 'Inter';
};

// Los adelantos exclusivos viven en el bucket privado 'previews': la tabla guarda la ruta
// del archivo. Los registros viejos guardaban la URL pública completa; de ella se saca la ruta.
window.rutaPreview = function (urlMedia) {
    if (!urlMedia) return '';
    const v = String(urlMedia).trim();
    const m = v.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/previews\/([^?#]+)/);
    if (m) {
        try { return decodeURIComponent(m[1]); } catch (e) { return ''; }
    }
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? '' : v;   // cualquier otra URL se descarta
};

// Pide URLs firmadas (válidas 1 hora) para una lista de adelantos.
// Supabase solo las entrega al dueño y a sus seguidores. Devuelve { id del adelanto: url }.
window.firmarPreviews = async function (client, previews) {
    const rutas = {};
    (previews || []).forEach(p => { const r = rutaPreview(p.url_media); if (r) rutas[p.id] = r; });
    const lista = [...new Set(Object.values(rutas))];
    if (!lista.length) return {};
    const { data, error } = await client.storage.from('previews').createSignedUrls(lista, 3600);
    if (error || !data) return {};
    const porRuta = {};
    data.forEach(d => { const u = d.signedUrl || d.signedURL; if (u && !d.error) porRuta[d.path] = u; });
    const urls = {};
    Object.keys(rutas).forEach(id => { if (porRuta[rutas[id]]) urls[id] = porRuta[rutas[id]]; });
    return urls;
};

// Convierte un código <iframe> o un link de Spotify / YouTube / SoundCloud / Apple Music / Bandcamp
// en un reproductor seguro. Cualquier otra cosa se descarta.
window.embedSeguro = function (codigo) {
    if (!codigo) return '';
    const texto = String(codigo).trim();

    // Si pegaron el código del iframe, extraemos solo el src y la altura
    const srcMatch = texto.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
    const altoMatch = texto.match(/\sheight=["']?(\d{2,4})/i);
    let url;
    try { url = new URL(srcMatch ? srcMatch[1].replace(/&amp;/g, '&') : texto); }
    catch (e) { return ''; }
    if (url.protocol !== 'https:') return '';

    const host = url.hostname.replace(/^www\./, '');
    let src = null, alto = null, video = false;

    if (host === 'open.spotify.com') {
        const m = url.pathname.match(/^\/(?:embed\/)?(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
        if (m) { src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`; alto = m[1] === 'track' || m[1] === 'episode' ? 152 : 352; }
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
        let id = null;
        if (host === 'youtu.be') id = url.pathname.slice(1);
        else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2];
        else if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2];
        else id = url.searchParams.get('v');
        if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) { src = `https://www.youtube.com/embed/${id}`; video = true; }
    } else if (host === 'w.soundcloud.com' && url.pathname.startsWith('/player')) {
        const destino = url.searchParams.get('url');
        if (destino) { src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(destino)}&color=%237c3aed`; alto = 166; }
    } else if (host === 'soundcloud.com') {
        src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url.origin + url.pathname)}&color=%237c3aed`; alto = 166;
    } else if (host === 'embed.music.apple.com' || host === 'music.apple.com') {
        src = `https://embed.music.apple.com${url.pathname}${url.search}`; alto = url.searchParams.get('i') ? 175 : 450;
    } else if (host === 'bandcamp.com' && url.pathname.startsWith('/EmbeddedPlayer')) {
        src = `https://bandcamp.com${url.pathname}`; alto = 120;
    }

    if (!src) return '';
    if (video) {
        return `<div class="aspect-video w-full"><iframe src="${esc(src)}" class="w-full h-full" frameborder="0" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    }
    if (altoMatch) alto = Math.min(Math.max(parseInt(altoMatch[1], 10), 80), 600);
    return `<iframe src="${esc(src)}" width="100%" height="${alto}" frameborder="0" style="border-radius:12px" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
};
