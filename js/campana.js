// Campana de notificaciones: muestra cuántas notificaciones sin leer tiene el usuario.
// Cada página pone un <a id="campana"> con un <span id="campana-badge"> dentro
// y llama a actualizarCampana(client) después de crear el cliente de Supabase.
window.actualizarCampana = async function (client) {
    const campana = document.getElementById('campana');
    const badge = document.getElementById('campana-badge');
    if (!campana || !badge) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session) return; // sin sesión no hay notificaciones que mostrar
    campana.classList.remove('hidden');

    const { count, error } = await client.from('notificaciones')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', session.user.id)
        .eq('leida', false);
    if (error || !count) { badge.classList.add('hidden'); return; }

    badge.textContent = count > 9 ? '9+' : String(count);
    badge.classList.remove('hidden');
};
