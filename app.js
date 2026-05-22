// ==================== DOMINÓ PINTINTÍN - VERSIÓN FINAL CON MANUAL INTEGRADO ====================
// Creado por Ricardo Castillo (Richard) - La Demajagua, Isla de la Juventud, Cuba
console.log("🎲 Dominó Pintintín - La Demajagua está en la casa");

// --- CONFIGURACIÓN INICIAL ---
let diaActivo = null;
let jugadoresActuales = [];
let estadoMachActual = { numero: 1, patasActuales: new Map(), empatePendiente: null, historialManos: [] };
let almacenamiento = { jugadores: [], dias: [], participaciones: [], machs: [] };

// Colores para cada posición
const coloresPosicion = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

// --- FUNCIONES DE PERSISTENCIA LOCAL (localStorage) ---
function guardarTodoEnLocalStorage() {
    localStorage.setItem('pintintin_jugadores', JSON.stringify(almacenamiento.jugadores));
    localStorage.setItem('pintintin_dias', JSON.stringify(almacenamiento.dias));
    localStorage.setItem('pintintin_participaciones', JSON.stringify(almacenamiento.participaciones));
    localStorage.setItem('pintintin_machs', JSON.stringify(almacenamiento.machs));
}
function cargarTodoDesdeLocalStorage() {
    almacenamiento.jugadores = JSON.parse(localStorage.getItem('pintintin_jugadores')) || [];
    almacenamiento.dias = JSON.parse(localStorage.getItem('pintintin_dias')) || [];
    almacenamiento.participaciones = JSON.parse(localStorage.getItem('pintintin_participaciones')) || [];
    almacenamiento.machs = JSON.parse(localStorage.getItem('pintintin_machs')) || [];
}

// --- RESPALDO AUTOMÁTICO (Backup) ---
function getDiaSemanaAbreviatura() {
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return dias[new Date().getDay()];
}
async function guardarBackupAutomatico() {
    const data = {
        jugadores: almacenamiento.jugadores,
        dias: almacenamiento.dias,
        participaciones: almacenamiento.participaciones,
        machs: almacenamiento.machs,
        fecha: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const link = document.createElement('a');
    const nombreArchivo = `pintintin_${getDiaSemanaAbreviatura()}.json`;
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
    console.log(`Backup automático guardado: ${nombreArchivo}`);
}
async function exportarBackupManual() { await guardarBackupAutomatico(); }
async function importarBackup(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            almacenamiento = {
                jugadores: data.jugadores || [],
                dias: data.dias || [],
                participaciones: data.participaciones || [],
                machs: data.machs || []
            };
            guardarTodoEnLocalStorage();
            alert("Respaldo importado correctamente. Recarga la página.");
            window.location.reload();
        } catch (error) { alert("Archivo inválido"); }
    };
    reader.readAsText(file);
}

// --- FUNCIONES AUXILIARES ---
function obtenerOJugador(nombre) {
    nombre = nombre.trim();
    let existente = almacenamiento.jugadores.find(j => j.nombre === nombre);
    if (existente) return existente;
    const nuevoId = almacenamiento.jugadores.length + 1;
    const nuevoJugador = { id: nuevoId, nombre };
    almacenamiento.jugadores.push(nuevoJugador);
    guardarTodoEnLocalStorage();
    return nuevoJugador;
}

// --- SORTEO DE POSICIONES ---
function tirarDado() { return Math.floor(Math.random() * 6) + 1; }
function getDadoEmoji(v) { return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v-1]; }
function resolverEmpates(jugadoresConDados) {
    let ordenados = [];
    let grupos = new Map();
    for (let j of jugadoresConDados) {
        if (!grupos.has(j.dado)) grupos.set(j.dado, []);
        grupos.get(j.dado).push(j);
    }
    let dadosOrd = Array.from(grupos.keys()).sort((a,b)=>b-a);
    for (let dado of dadosOrd) {
        let grupo = grupos.get(dado);
        if (grupo.length === 1) ordenados.push(grupo[0]);
        else {
            for (let g of grupo) g.dado = tirarDado();
            let subSorteados = resolverEmpates(grupo);
            ordenados.push(...subSorteados);
        }
    }
    return ordenados;
}
async function sortearEIniciar() {
    const fecha = fechaDiaInput.value;
    if (!fecha) { alert("Selecciona fecha"); return false; }
    let nombres = [];
    for (let i=1; i<=4; i++) {
        let n = document.getElementById(`jugador${i}`).value.trim();
        if(!n) { alert(`Falta nombre jugador ${i}`); return false; }
        nombres.push(n);
    }
    if(new Set(nombres).size !== 4) { alert("Nombres deben ser distintos"); return false; }
    
    modalSorteo.style.display = 'flex';
    dadosResultadosDiv.innerHTML = '<div style="text-align:center;">🎲 Tirando dados...</div>';
    await new Promise(r => setTimeout(r, 300));
    let jugadoresDados = nombres.map(n => ({nombre:n, dado:tirarDado()}));
    dadosResultadosDiv.innerHTML = jugadoresDados.map(j => `<div class="dado-item"><span>${j.nombre}</span><span>${getDadoEmoji(j.dado)} ${j.dado}</span></div>`).join('');
    await new Promise(r => setTimeout(r, 500));
    let ordenFinal = resolverEmpates(jugadoresDados);
    sorteoResultadosDiv.innerHTML = `<strong>🏆 Orden de sillas:</strong><br>${ordenFinal.map((j,i)=>`Silla ${i+1}: ${j.nombre}`).join('<br>')}`;
    
    let jugadoresPos = [];
    for(let i=0; i<ordenFinal.length; i++) {
        let jug = obtenerOJugador(ordenFinal[i].nombre);
        jugadoresPos.push({ posicion: i+1, jugadorId: jug.id, nombre: jug.nombre });
    }
    const diaId = almacenamiento.dias.length + 1;
    almacenamiento.dias.push({ id: diaId, fecha, activo: 1 });
    diaActivo = { id: diaId, fecha };
    for(let j of jugadoresPos) {
        almacenamiento.participaciones.push({ id: almacenamiento.participaciones.length+1, diaId, jugadorId: j.jugadorId, machsGanados:0, patasNetas:0, aguas:0, forros:0 });
    }
    jugadoresActuales = jugadoresPos;
    estadoMachActual = { numero:1, patasActuales: new Map(), empatePendiente: null, historialManos:[] };
    jugadoresActuales.forEach(j => estadoMachActual.patasActuales.set(j.jugadorId, 0));
    guardarTodoEnLocalStorage();
    localStorage.setItem('sesionPintintin', JSON.stringify({ diaId, fecha, jugadores: jugadoresActuales, estadoMachActual: { numero:1, patasActuales: [], empatePendiente: null, historialManos:[] } }));
    modalSorteo.style.display = 'none';
    cargarVistaJuego();
    return true;
}

// --- VISTA JUEGO ---
function cargarVistaJuego() {
    vistaConfig.style.display = 'none'; vistaJuego.style.display = 'block'; vistaEstadisticas.style.display = 'none';
    fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
    if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
    renderizarJugadores();
    actualizarAvisoEmpate();
}
function renderizarJugadores() {
    jugadoresGrid.innerHTML = '';
    for(let j of jugadoresActuales) {
        let patas = estadoMachActual.patasActuales.get(j.jugadorId) || 0;
        let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === j.jugadorId);
        let forrosDia = part ? part.forros : 0;
        let aguasDia = part ? part.aguas : 0;
        let color = coloresPosicion[(j.posicion-1) % coloresPosicion.length];
        let div = document.createElement('div'); div.className = 'tarjeta-jugador'; div.style.borderLeftColor = color;
        div.innerHTML = `
            <div class="nombre" style="color:${color};">🪑 ${j.posicion} - ${j.nombre}</div>
            <div class="patas">${patas} 🦶</div>
            <div class="stats-mini">🧤 ${forrosDia} F | 💧 ${aguasDia} A</div>
            <div class="botones-jugador">
                <button class="btn-pata" data-id="${j.jugadorId}">🏆 Pata</button>
                <button class="btn-forro" data-id="${j.jugadorId}">🧤 Forro</button>
                <button class="btn-agua" data-id="${j.jugadorId}">💧 Agua</button>
            </div>
        `;
        jugadoresGrid.appendChild(div);
    }
    document.querySelectorAll('.btn-pata').forEach(b => b.onclick = () => registrarPata(parseInt(b.dataset.id)));
    document.querySelectorAll('.btn-forro').forEach(b => b.onclick = () => registrarForro(parseInt(b.dataset.id)));
    document.querySelectorAll('.btn-agua').forEach(b => b.onclick = () => registrarAgua(parseInt(b.dataset.id)));
}
function actualizarAvisoEmpate() {
    if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        let nombres = estadoMachActual.empatePendiente.jugadoresIds.map(id => jugadoresActuales.find(j=>j.jugadorId===id)?.nombre).join(', ');
        avisoEmpateDiv.innerText = `⚠️ EMPATE entre: ${nombres}. Si gana uno suma 2 PATAS.`;
    } else avisoEmpateDiv.innerText = '';
}

// --- REGISTRO DE JUGADAS ---
function registrarPata(jugadorId) {
    let patasAApuntar = 1;
    if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        if(estadoMachActual.empatePendiente.jugadoresIds.includes(jugadorId)) patasAApuntar = 2;
        estadoMachActual.empatePendiente = null;
        actualizarAvisoEmpate();
    }
    let actual = estadoMachActual.patasActuales.get(jugadorId) || 0;
    estadoMachActual.patasActuales.set(jugadorId, actual + patasAApuntar);
    estadoMachActual.historialManos.push({ tipo:'pata', jugadorId, patasAfectadas:patasAApuntar, timestamp:new Date().toISOString() });
    renderizarJugadores();
    verificarFinMach(jugadorId);
}
function registrarForro(jugadorId) {
    let actual = estadoMachActual.patasActuales.get(jugadorId) || 0;
    estadoMachActual.patasActuales.set(jugadorId, actual - 1);
    estadoMachActual.historialManos.push({ tipo:'forro', jugadorId, patasAfectadas:-1, timestamp:new Date().toISOString() });
    renderizarJugadores();
    guardarSesionLocal();
}
function registrarAgua(jugadorId) {
    estadoMachActual.historialManos.push({ tipo:'agua', jugadorId, patasAfectadas:0, timestamp:new Date().toISOString() });
    let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
    if(part) {
        part.aguas = (part.aguas || 0) + 1;
        guardarTodoEnLocalStorage();
    }
    renderizarJugadores();
    guardarSesionLocal();
}
async function verificarFinMach(ganadorId) {
    let patasGanador = estadoMachActual.patasActuales.get(ganadorId);
    if(patasGanador >= 5) {
        let ganadorNombre = jugadoresActuales.find(j=>j.jugadorId===ganadorId).nombre;
        ganadorMachMsg.innerText = `🎉 ¡MACH para ${ganadorNombre} con ${patasGanador} patas! 🎉`;
        let participantesMach = jugadoresActuales.map(j=>({ jugadorId:j.jugadorId, nombre:j.nombre, patasFinales: estadoMachActual.patasActuales.get(j.jugadorId)||0 }));
        almacenamiento.machs.push({ id: almacenamiento.machs.length+1, diaId: diaActivo.id, numeroMach: estadoMachActual.numero, fechaHora: new Date().toISOString(), ganadorId, participantes:participantesMach, manos: JSON.parse(JSON.stringify(estadoMachActual.historialManos)) });
        for(let j of jugadoresActuales) {
            let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === j.jugadorId);
            if(part) {
                let patasNetasMach = estadoMachActual.patasActuales.get(j.jugadorId)||0;
                let forrosMach = estadoMachActual.historialManos.filter(m => m.tipo==='forro' && m.jugadorId===j.jugadorId).length;
                let aguasMach = estadoMachActual.historialManos.filter(m => m.tipo==='agua' && m.jugadorId===j.jugadorId).length;
                let nuevosMachs = (j.jugadorId===ganadorId)?1:0;
                part.machsGanados += nuevosMachs; 
                part.patasNetas += patasNetasMach; 
                part.forros = (part.forros||0)+forrosMach; 
                part.aguas = (part.aguas||0)+aguasMach;
            }
        }
        guardarTodoEnLocalStorage();
        estadoMachActual.numero++; 
        estadoMachActual.patasActuales.clear(); 
        jugadoresActuales.forEach(j=>estadoMachActual.patasActuales.set(j.jugadorId,0)); 
        estadoMachActual.historialManos = []; 
        estadoMachActual.empatePendiente = null;
        renderizarJugadores(); 
        if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
        fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
        setTimeout(()=>ganadorMachMsg.innerText='',2500);
    }
    guardarSesionLocal();
}
function guardarSesionLocal() { 
    if(diaActivo) localStorage.setItem('sesionPintintin', JSON.stringify({ 
        diaId:diaActivo.id, 
        fecha:diaActivo.fecha, 
        jugadores:jugadoresActuales, 
        estadoMachActual:{ 
            numero:estadoMachActual.numero, 
            patasActuales:Array.from(estadoMachActual.patasActuales.entries()), 
            empatePendiente:estadoMachActual.empatePendiente, 
            historialManos:estadoMachActual.historialManos 
        } 
    })); 
}

// --- ESTADÍSTICAS DEL DÍA ---
function mostrarEstadisticasDelDia() {
    if(!diaActivo) return alert('Inicia un día primero');
    let stats = new Map();
    for(let m of almacenamiento.machs) if(m.diaId === diaActivo.id) for(let p of m.participantes) { 
        let s = stats.get(p.nombre) || { machs:0, patas:0, forros:0, aguas:0 }; 
        s.machs += (p.jugadorId === m.ganadorId?1:0); 
        s.patas += p.patasFinales; 
        s.forros += m.manos.filter(h=>h.tipo==='forro' && h.jugadorId===p.jugadorId).length; 
        s.aguas += m.manos.filter(h=>h.tipo==='agua' && h.jugadorId===p.jugadorId).length; 
        stats.set(p.nombre,s); 
    }
    for(let j of jugadoresActuales) { 
        let s = stats.get(j.nombre) || { machs:0, patas:0, forros:0, aguas:0 }; 
        let patasActual = estadoMachActual.patasActuales.get(j.jugadorId)||0; 
        s.patas += patasActual; 
        s.forros += estadoMachActual.historialManos.filter(h=>h.tipo==='forro' && h.jugadorId===j.jugadorId).length; 
        s.aguas += estadoMachActual.historialManos.filter(h=>h.tipo==='agua' && h.jugadorId===j.jugadorId).length; 
        stats.set(j.nombre,s); 
    }
    let html = `<div class="stats-container"><table class="tabla-estadisticas"><thead><tr><th>Jugador</th><th>🏆 Machs</th><th>🦶 Patas</th><th>🧤 Forros</th><th>💧 Aguas</th></tr></thead><tbody>`;
    for(let [nom, s] of stats) html += `<tr><td>${nom}</td><td>${s.machs}</td><td>${s.patas}</td><td>${s.forros}</td><td>${s.aguas}</td></tr>`;
    html += `</tbody></table><p class="stats-nota">⚡ Mach actual #${estadoMachActual.numero} en curso</p></div>`;
    document.getElementById('resultadosStats').innerHTML = html;
    vistaEstadisticas.style.display = 'block'; 
    vistaJuego.style.display = 'none';
    document.querySelector('#vistaEstadisticas h2').innerHTML = '📊 Estadísticas del Día';
}

// --- ESTADÍSTICAS GLOBALES ---
function cargarEstadisticasGlobales(desde, hasta) {
    let machsFiltrados = almacenamiento.machs;
    if (desde && hasta) {
        machsFiltrados = machsFiltrados.filter(m => m.fechaHora.substring(0,10) >= desde && m.fechaHora.substring(0,10) <= hasta);
    } else if (desde) {
        machsFiltrados = machsFiltrados.filter(m => m.fechaHora.substring(0,10) >= desde);
    } else if (hasta) {
        machsFiltrados = machsFiltrados.filter(m => m.fechaHora.substring(0,10) <= hasta);
    }
    let porFecha = new Map();
    for(let m of machsFiltrados) {
        let fecha = m.fechaHora.substring(0,10);
        if(!porFecha.has(fecha)) porFecha.set(fecha, []);
        porFecha.get(fecha).push(m);
    }
    let fechasOrdenadas = Array.from(porFecha.keys()).sort((a,b) => new Date(b) - new Date(a));
    let html = '<div class="stats-container">';
    if (fechasOrdenadas.length === 0) {
        html += '<p class="stats-vacio">📭 No hay machs registrados en el período seleccionado.</p>';
    } else {
        for(let fecha of fechasOrdenadas) {
            let machsDia = porFecha.get(fecha);
            let statsJugador = new Map();
            for(let m of machsDia) {
                for(let p of m.participantes) {
                    let s = statsJugador.get(p.nombre) || { machs:0, patas:0, forros:0, aguas:0 };
                    if(p.jugadorId === m.ganadorId) s.machs++;
                    s.patas += p.patasFinales;
                    s.forros += m.manos.filter(h=>h.tipo==='forro' && h.jugadorId===p.jugadorId).length;
                    s.aguas += m.manos.filter(h=>h.tipo==='agua' && h.jugadorId===p.jugadorId).length;
                    statsJugador.set(p.nombre, s);
                }
            }
            let sorted = Array.from(statsJugador.entries()).sort((a,b) => b[1].machs - a[1].machs);
            html += `<div class="dia-stats-block"><h4>📅 ${fecha}</h4><table class="tabla-estadisticas"><thead><tr><th>Jugador</th><th>🏆 Machs</th><th>🦶 Patas</th><th>🧤 Forros</th><th>💧 Aguas</th></tr></thead><tbody>`;
            for(let [nom, s] of sorted) html += `<tr><td>${nom}</td><td>${s.machs}</td><td>${s.patas}</td><td>${s.forros}</td><td>${s.aguas}</td></tr>`;
            html += `</tbody></table><div class="dia-stats-footer">${machsDia.length} mach(s) completados</div></div>`;
        }
    }
    html += '</div>';
    document.getElementById('resultadosStats').innerHTML = html;
}

// ==================== MANUAL DE AYUDA INTEGRADO ====================
const modalAyuda = document.getElementById('modalAyuda');
const btnAyuda = document.getElementById('btnAyuda');
const cerrarAyuda = document.getElementById('cerrarAyuda');
const contenidoAyuda = document.getElementById('contenidoAyuda');

const manualHTML = `
<h1>📖 MANUAL DE USUARIO - DOMINÓ PINTINTÍN</h1>
<p style="text-align:center;">🀰 Aplicación para Campeonato de Dominó (4 jugadores individuales)</p>
<p style="text-align:center;"><strong>Creado por:</strong> Ricardo Castillo (Richard)<br>
<strong>Ubicación:</strong> La Demajagua, Isla de la Juventud, Cuba</p>

<h2>📋 ÍNDICE</h2>
<ol>
    <li><a href="#" onclick="scrollToSection('intro')">Introducción</a></li>
    <li><a href="#" onclick="scrollToSection('instalacion')">Instalación en el móvil</a></li>
    <li><a href="#" onclick="scrollToSection('inicio')">Pantalla de inicio</a></li>
    <li><a href="#" onclick="scrollToSection('sorteo')">Sorteo de posiciones</a></li>
    <li><a href="#" onclick="scrollToSection('juego')">Pantalla de juego</a></li>
    <li><a href="#" onclick="scrollToSection('jugadas')">Registro de jugadas</a></li>
    <li><a href="#" onclick="scrollToSection('empate')">Declarar empate</a></li>
    <li><a href="#" onclick="scrollToSection('sustitucion')">Sustituir jugador</a></li>
    <li><a href="#" onclick="scrollToSection('estadisticas')">Estadísticas</a></li>
    <li><a href="#" onclick="scrollToSection('backup')">Respaldo de datos</a></li>
    <li><a href="#" onclick="scrollToSection('borrar')">Borrar datos</a></li>
    <li><a href="#" onclick="scrollToSection('faq')">Preguntas frecuentes</a></li>
</ol>

<h2 id="intro">1. INTRODUCCIÓN</h2>
<p><strong>Dominó Pintintín</strong> es una aplicación para llevar la puntuación de un campeonato de dominó con <strong>4 jugadores individuales</strong>. Reglas especiales:</p>
<ul>
    <li>Se juega por <strong>patas</strong> (no por puntos)</li>
    <li>Un <strong>MACH</strong> se gana al alcanzar 5 patas</li>
    <li>Los <strong>forros</strong> (errores) restan 1 pata</li>
    <li>El <strong>agua</strong> (revolver fichas) es estadística aparte</li>
    <li>Los <strong>empates</strong> dan bonificación de 2 patas</li>
</ul>

<h2 id="instalacion">2. INSTALACIÓN EN EL MÓVIL</h2>
<p><strong>Requisitos:</strong> Chrome en Android.</p>
<ol>
    <li>Abre Chrome y navega hasta la aplicación</li>
    <li>Toca ⋮ → <strong>"Instalar aplicación"</strong></li>
    <li>Confirma "Dominó Pintintín"</li>
</ol>
<p>✅ Funciona <strong>sin conexión a internet</strong>.</p>

<h2 id="inicio">3. PANTALLA DE INICIO</h2>
<table>
    <thead><tr><th>Elemento</th><th>Función</th></tr></thead>
    <tbody>
        <tr><td>📅 Fecha</td><td>Selecciona el día</td></tr>
        <tr><td>🎲 Jugador 1-4</td><td>Escribe los nombres</td></tr>
        <tr><td>🎲 Sortear sillas e iniciar</td><td>Sorteo y comienzo</td></tr>
        <tr><td>📊 Estadísticas globales</td><td>Ver todos los días</td></tr>
        <tr><td>⚠️ Borrar datos</td><td>Elimina todo (requiere contraseña <code>pintintin</code>)</td></tr>
        <tr><td>💾 Exportar respaldo</td><td>Guarda copia de seguridad</td></tr>
        <tr><td>📂 Importar respaldo</td><td>Restaura copia guardada</td></tr>
    </tbody>
</table>

<h2 id="sorteo">4. SORTEO DE POSICIONES</h2>
<ol>
    <li>Ingresa los 4 nombres</li>
    <li>Toca <strong>🎲 Sortear sillas e iniciar</strong></li>
    <li>Se muestran los dados y el orden final</li>
    <li>Los empates se resuelven automáticamente</li>
</ol>

<h2 id="juego">5. PANTALLA DE JUEGO</h2>
<p>Cada tarjeta de jugador muestra:</p>
<ul>
    <li>🪑 Posición y nombre (color único)</li>
    <li><strong>Patas actuales</strong> (número grande)</li>
    <li>🧤 Forros acumulados | 💧 Aguas acumuladas</li>
    <li>Botones: 🏆 Pata, 🧤 Forro, 💧 Agua</li>
</ul>
<p><strong>Botones inferiores:</strong> ⚖️ Empate, 🔄 Sustituir, 📊 Estadísticas día, 🌍 Estadísticas globales, 🚪 Cerrar día</p>

<h2 id="jugadas">6. REGISTRO DE JUGADAS</h2>
<h3>🏆 PATA</h3>
<p>Toca 🏆 Pata del ganador. Suma 1 pata (2 si venía de empate).</p>
<h3>🧤 FORRO</h3>
<p>Toca 🧤 Forro. El jugador <strong>pierde 1 pata</strong> (puede quedar negativo).</p>
<h3>💧 AGUA</h3>
<p>Toca 💧 Agua. Solo aumenta el contador, no afecta las patas.</p>

<h2 id="empate">7. DECLARAR EMPATE</h2>
<ol>
    <li>Toca <strong>⚖️ Declarar empate</strong></li>
    <li>Selecciona los jugadores empatados (mínimo 2)</li>
    <li>Toca Aceptar. El ganador de la próxima mano suma <strong>2 patas</strong></li>
</ol>

<h2 id="sustitucion">8. SUSTITUIR JUGADOR</h2>
<p>Cuando un jugador se retira (después de un mach):</p>
<ol>
    <li>Toca <strong>🔄 Sustituir jugador</strong></li>
    <li>Ingresa posición (1-4) y nombre del nuevo</li>
</ol>
<p>El jugador anterior conserva sus estadísticas.</p>

<h2 id="estadisticas">9. ESTADÍSTICAS</h2>
<p><strong>Del día:</strong> Muestra tabla con machs, patas, forros, aguas del día actual.</p>
<p><strong>Globales:</strong> Muestra todos los días, filtrable por fechas. Exportable a CSV y PDF.</p>

<h2 id="backup">10. RESPALDO DE DATOS</h2>
<ul>
    <li><strong>Automático:</strong> Al cerrar un día se guarda <code>pintintin_lun.json</code> (según día)</li>
    <li><strong>Exportar manual:</strong> Botón 💾 Exportar respaldo</li>
    <li><strong>Importar:</strong> Botón 📂 Importar respaldo</li>
</ul>

<h2 id="borrar">11. BORRAR DATOS</h2>
<p><strong>¡CUIDADO! Acción irreversible.</strong></p>
<ol>
    <li>Toca ⚠️ Borrar datos</li>
    <li>Ingresa contraseña: <code>pintintin</code></li>
    <li>Confirma</li>
</ol>

<h2 id="faq">12. PREGUNTAS FRECUENTES</h2>
<table>
    <thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead>
    <tbody>
        <tr><td>¿Funciona sin internet?</td><td>Sí, una vez instalada como PWA</td></tr>
        <tr><td>¿Se pierden datos al recargar?</td><td>No, se recupera la sesión automáticamente</td></tr>
        <tr><td>¿Pueden las patas ser negativas?</td><td>Sí, por forros</td></tr>
        <tr><td>¿Cómo exportar a Excel?</td><td>Usa Exportar CSV en estadísticas globales</td></tr>
    </tbody>
</table>

<div class="footer">
    <p><strong>Desarrollador:</strong> Ricardo Castillo (Richard)<br>
    <strong>La Demajagua, Isla de la Juventud, Cuba</strong></p>
    <p>🎲 ¡A BOTAR GORDA! 🎲</p>
</div>
`;

if (contenidoAyuda) contenidoAyuda.innerHTML = manualHTML;

window.scrollToSection = function(id) {
    const elemento = contenidoAyuda.querySelector(`#${id}`);
    if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
};

if (btnAyuda) {
    btnAyuda.onclick = () => {
        modalAyuda.style.display = 'flex';
        if (contenidoAyuda) contenidoAyuda.scrollTop = 0;
    };
}
if (cerrarAyuda) cerrarAyuda.onclick = () => modalAyuda.style.display = 'none';
if (modalAyuda) modalAyuda.onclick = (e) => { if (e.target === modalAyuda) modalAyuda.style.display = 'none'; };

// --- INICIALIZACIÓN Y EVENTOS ---
const vistaConfig = document.getElementById('vistaConfig');
const vistaJuego = document.getElementById('vistaJuego');
const vistaEstadisticas = document.getElementById('vistaEstadisticas');
const fechaDiaInput = document.getElementById('fechaDia');
const jugadoresInputsContainer = document.getElementById('jugadoresInputsContainer');
const btnSortearEIniciar = document.getElementById('btnSortearEIniciar');
const btnCambiarJugador = document.getElementById('btnCambiarJugador');
const irAEstadisticas = document.getElementById('irAEstadisticas');
const jugadoresGrid = document.getElementById('jugadoresGrid');
const btnEmpate = document.getElementById('btnEmpate');
const btnCerrarDia = document.getElementById('btnCerrarDia');
const btnStatsEnJuego = document.getElementById('btnStatsEnJuego');
const fechaMostrada = document.getElementById('fechaMostrada');
const numMachActualSpan = document.getElementById('numMachActual');
const ganadorMachMsg = document.getElementById('ganadorMachMsg');
const avisoEmpateDiv = document.getElementById('avisoEmpate');
const btnBorrarTodo = document.getElementById('btnBorrarTodo');
const modalEmpate = document.getElementById('modalEmpate');
const checkEmpateDiv = document.getElementById('checkEmpate');
const confirmarEmpate = document.getElementById('confirmarEmpate');
const cancelarEmpate = document.getElementById('cancelarEmpate');
const modalSorteo = document.getElementById('modalSorteo');
const dadosResultadosDiv = document.getElementById('dadosResultados');
const sorteoResultadosDiv = document.getElementById('sorteoResultados');
const cerrarSorteo = document.getElementById('cerrarSorteo');
const fechaDesde = document.getElementById('fechaDesde');
const fechaHasta = document.getElementById('fechaHasta');
const resultadoSorteoDiv = document.getElementById('resultadoSorteo');

function renderInputsJugadores() { 
    jugadoresInputsContainer.innerHTML = ''; 
    for(let i=1;i<=4;i++) jugadoresInputsContainer.innerHTML += `<div><label>🎲 Jugador ${i}</label><input type="text" id="jugador${i}" placeholder="Nombre" autocomplete="off"></div>`; 
}
renderInputsJugadores();

btnSortearEIniciar.onclick = sortearEIniciar;
cerrarSorteo.onclick = () => modalSorteo.style.display = 'none';
btnCambiarJugador.onclick = () => { 
    if(!diaActivo) return alert('Inicia día'); 
    let pos = prompt('Posición a sustituir (1-4)'); 
    let nom = prompt('Nuevo nombre'); 
    if(pos && nom) { 
        let jug = obtenerOJugador(nom); 
        let idx = jugadoresActuales.findIndex(j=>j.posicion===parseInt(pos)); 
        if(idx!==-1) { 
            jugadoresActuales[idx] = { posicion:parseInt(pos), jugadorId:jug.id, nombre:jug.nombre }; 
            if(!almacenamiento.participaciones.find(p=>p.diaId===diaActivo.id && p.jugadorId===jug.id)) 
                almacenamiento.participaciones.push({ id:almacenamiento.participaciones.length+1, diaId:diaActivo.id, jugadorId:jug.id, machsGanados:0, patasNetas:0, aguas:0, forros:0 }); 
            if(!estadoMachActual.patasActuales.has(jug.id)) estadoMachActual.patasActuales.set(jug.id,0); 
            renderizarJugadores(); 
            guardarSesionLocal(); 
        } 
    } 
};
btnCerrarDia.onclick = async () => { 
    if(diaActivo) { 
        let dia = almacenamiento.dias.find(d=>d.id===diaActivo.id); 
        if(dia) dia.activo=0; 
        guardarTodoEnLocalStorage(); 
        await guardarBackupAutomatico(); 
    } 
    localStorage.removeItem('sesionPintintin'); 
    diaActivo=null; 
    jugadoresActuales=[]; 
    vistaConfig.style.display='block'; 
    vistaJuego.style.display='none'; 
    renderInputsJugadores(); 
    fechaDiaInput.value=''; 
    if(resultadoSorteoDiv) resultadoSorteoDiv.innerHTML = ''; 
};
btnStatsEnJuego.onclick = mostrarEstadisticasDelDia;

const btnEstadisticasGlobalesJuego = document.getElementById('btnEstadisticasGlobalesJuego');
if(btnEstadisticasGlobalesJuego) {
    btnEstadisticasGlobalesJuego.onclick = () => { 
        if(!diaActivo) return alert('Inicia día'); 
        let fechas = almacenamiento.machs.map(m => m.fechaHora.substring(0,10));
        let minFecha = fechas.length ? fechas.sort()[0] : new Date().toISOString().substring(0,10);
        let maxFecha = new Date().toISOString().substring(0,10);
        if(fechaDesde) fechaDesde.value = minFecha;
        if(fechaHasta) fechaHasta.value = maxFecha;
        cargarEstadisticasGlobales(minFecha, maxFecha); 
        vistaJuego.style.display='none'; 
        vistaEstadisticas.style.display='block';
        document.querySelector('#vistaEstadisticas h2').innerHTML = '📊 Estadísticas Globales';
    };
}

irAEstadisticas.onclick = () => { 
    let fechas = almacenamiento.machs.map(m => m.fechaHora.substring(0,10));
    let minFecha = fechas.length ? fechas.sort()[0] : new Date().toISOString().substring(0,10);
    let maxFecha = new Date().toISOString().substring(0,10);
    if(fechaDesde) fechaDesde.value = minFecha;
    if(fechaHasta) fechaHasta.value = maxFecha;
    cargarEstadisticasGlobales(minFecha, maxFecha); 
    vistaConfig.style.display='none'; 
    vistaEstadisticas.style.display='block';
    document.querySelector('#vistaEstadisticas h2').innerHTML = '📊 Estadísticas Globales';
};

const volverInicioStats = document.getElementById('volverInicioStats');
if(volverInicioStats) {
    volverInicioStats.onclick = () => { 
        if(diaActivo) { 
            vistaEstadisticas.style.display='none'; 
            vistaJuego.style.display='block'; 
        } else { 
            vistaEstadisticas.style.display='none'; 
            vistaConfig.style.display='block'; 
        } 
    };
}

const btnFiltrar = document.getElementById('btnFiltrar');
if(btnFiltrar) btnFiltrar.onclick = () => cargarEstadisticasGlobales(fechaDesde.value, fechaHasta.value);

btnBorrarTodo.onclick = () => { 
    let pass = prompt("🔐 Contraseña para borrar datos:"); 
    if(pass === "pintintin") { 
        localStorage.clear(); 
        almacenamiento = { jugadores:[], dias:[], participaciones:[], machs:[] }; 
        alert("Datos borrados. Recargando..."); 
        window.location.reload(); 
    } else alert("Contraseña incorrecta"); 
};

const btnExportarCSV = document.getElementById('btnExportarCSV');
if(btnExportarCSV) {
    btnExportarCSV.onclick = () => { 
        let csv="Fecha,Mach,Ganador\n"; 
        almacenamiento.machs.forEach(m=>{ 
            let g=m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre; 
            csv+=`${m.fechaHora.substring(0,10)},${m.numeroMach},${g}\n`; 
        }); 
        let blob=new Blob([csv],{type:'text/csv'}); 
        let a=document.createElement('a'); 
        a.href=URL.createObjectURL(blob); 
        a.download='pintintin_stats.csv'; 
        a.click(); 
    };
}

const btnExportarPDF = document.getElementById('btnExportarPDF');
if(btnExportarPDF && window.jspdf) {
    btnExportarPDF.onclick = () => { 
        let { jsPDF } = window.jspdf; 
        let doc = new jsPDF(); 
        doc.text("Estadísticas Dominó Pintintín", 20,20); 
        let data = almacenamiento.machs.map(m=>[m.fechaHora.substring(0,10), m.numeroMach, m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre]); 
        doc.autoTable({ head:[['Fecha','Mach #','Ganador']], body:data, startY:30 }); 
        doc.save('pintintin_stats.pdf'); 
    };
}

const btnExportarBackup = document.getElementById('btnExportarBackup');
if(btnExportarBackup) btnExportarBackup.onclick = exportarBackupManual;

const importBackupInput = document.getElementById('importBackupInput');
if(importBackupInput) {
    importBackupInput.onchange = (e) => { if(e.target.files.length) importarBackup(e.target.files[0]); };
}

btnEmpate.onclick = () => { 
    if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) return alert('Ya hay empate'); 
    checkEmpateDiv.innerHTML = ''; 
    jugadoresActuales.forEach(j=>{ 
        let l=document.createElement('label'); 
        l.innerHTML=`<input type="checkbox" value="${j.jugadorId}"> ${j.nombre}`; 
        checkEmpateDiv.appendChild(l); 
    }); 
    modalEmpate.style.display='flex'; 
};
confirmarEmpate.onclick = () => { 
    let checks = [...checkEmpateDiv.querySelectorAll('input:checked')]; 
    if(checks.length<2) return alert('Selecciona al menos dos'); 
    estadoMachActual.empatePendiente = { jugadoresIds: checks.map(c=>parseInt(c.value)), resuelto:false }; 
    actualizarAvisoEmpate(); 
    modalEmpate.style.display='none'; 
    guardarSesionLocal(); 
};
cancelarEmpate.onclick = () => modalEmpate.style.display='none';

function recuperarSesion() {
    let g = localStorage.getItem('sesionPintintin'); if(!g) return false;
    let data = JSON.parse(g); let dia = almacenamiento.dias.find(d=>d.id===data.diaId);
    if(!dia || dia.activo!==1) return false;
    diaActivo = { id:dia.id, fecha:dia.fecha }; jugadoresActuales = data.jugadores;
    let patasMap = new Map(); if(data.estadoMachActual && data.estadoMachActual.patasActuales) {
        for(let [k,v] of data.estadoMachActual.patasActuales) patasMap.set(parseInt(k), v);
    }
    estadoMachActual = { 
        numero: data.estadoMachActual?.numero || 1, 
        patasActuales: patasMap, 
        empatePendiente: data.estadoMachActual?.empatePendiente || null, 
        historialManos: data.estadoMachActual?.historialManos || [] 
    };
    cargarVistaJuego(); return true;
}

window.onload = () => { 
    cargarTodoDesdeLocalStorage(); 
    renderInputsJugadores(); 
    if(!recuperarSesion()) { 
        vistaConfig.style.display='block'; 
        vistaJuego.style.display='none'; 
        vistaEstadisticas.style.display='none'; 
    } 
};