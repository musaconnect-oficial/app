// Campana de notificaciones y acceso a los chats, con sus contadores de no leídos.
// Cada página pone un <a id="campana"> con un <span id="campana-badge"> dentro
// (y opcionalmente <a id="chat-link"> con <span id="chat-badge">)
// y llama a actualizarCampana(client) después de crear el cliente de Supabase.
function mostrarContador(badge, count) {
    if (!badge) return;
    if (!count) { badge.classList.add('hidden'); return; }
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.classList.remove('hidden');
}

window.actualizarCampana = async function (client) {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return; // sin sesión no hay notificaciones ni chats que mostrar
    const miId = session.user.id;

    const campana = document.getElementById('campana');
    if (campana) {
        campana.classList.remove('hidden');
        const { count, error } = await client.from('notificaciones')
            .select('id', { count: 'exact', head: true })
            .eq('usuario_id', miId)
            .eq('leida', false);
        mostrarContador(document.getElementById('campana-badge'), error ? 0 : count);
    }

    const chatLink = document.getElementById('chat-link');
    if (chatLink) {
        chatLink.classList.remove('hidden');
        // Las reglas de la base de datos solo devuelven mensajes de mis propios chats
        const { count, error } = await client.from('mensajes')
            .select('id', { count: 'exact', head: true })
            .neq('autor_id', miId)
            .eq('leido', false);
        mostrarContador(document.getElementById('chat-badge'), error ? 0 : count);
    }
};
