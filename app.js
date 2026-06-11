// ==================== DOMINÓ PINTINTÍN - VERSIÓN 6.0.6 ====================
// Creado por Ricardo Castillo Valdés (Richard) - La Demajagua, Isla de la Juventud, Cuba
// *** VERSIÓN CORREGIDA: IDs Únicos, Estadísticas del Día y Globales Funcionales ***
// *** MEJORADA: Sistema de empate con mensajes persistentes ***
// *** MEJORADA: Modales personalizados reemplazan alert/confirm/prompt ***
// *** CORREGIDA: Definiciones de CIERRE y PEGADO ***

console.log("🎲 Dominó Pintintín - Versión 6.0.6 (CORREGIDA)");

// --- CONFIGURACIÓN INICIAL ---
let diaActivo = null;
let jugadoresActuales = [];
let estadoMachActual = {
    numero: 1,
    patasActuales: new Map(),
    empatePendiente: null,
    empateMultiplicador: 0,
    jugadorQueSale: null,
    historialManos: [],
    historialGanadores: [],
    fechaHoraInicio: null
};
let almacenamiento = { jugadores: [], dias: [], participaciones: [], machs: [] };
let ganadorPendiente = null;
let ultimaJugadaFueAgua = false;

let ultimoGanadorId = null;
let penultimoGanadorId = null;
let tablaTranspuesta = false;

const coloresPosicion = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

// ==================== FUNCIÓN CRÍTICA: GENERAR IDs ÚNICOS ====================
function generarNuevoId(array) {
    if (!array || array.length === 0) return 1;
    const maxId = Math.max(...array.map(item => item.id), 0);
    return maxId + 1;
}

// ==================== FUNCIONES DE FECHAS ====================
function formatearFechaDDMMYYYY(fechaISO) {
    if (!fechaISO) return '';
    const partes = fechaISO.split('-');
    if (partes.length !== 3) return fechaISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaParaInput(fechaDDMMYYYY) {
    if (!fechaDDMMYYYY) return '';
    const partes = fechaDDMMYYYY.split('/');
    if (partes.length !== 3) return fechaDDMMYYYY;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

function validarFechaISO(fechaISO) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fechaISO)) return false;
    const [año, mes, dia] = fechaISO.split('-').map(Number);
    if (mes < 1 || mes > 12) return false;
    const diasPorMes = [31, (año % 4 === 0 && año % 100 !== 0) || año % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dia < 1 || dia > diasPorMes[mes - 1]) return false;
    return true;
}

function getFechaLocalISO() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

function getFechasDesdeHastaInput() {
    const desdeInput = document.getElementById('fechaDesde');
    const hastaInput = document.getElementById('fechaHasta');
    let desde = '', hasta = '';
    if (desdeInput && desdeInput.value && validarFechaISO(desdeInput.value)) {
        desde = desdeInput.value;
    }
    if (hastaInput && hastaInput.value && validarFechaISO(hastaInput.value)) {
        hasta = hastaInput.value;
    }
    return { desde, hasta };
}

// ==================== OBTENER FECHAS EXTREMAS ====================
function obtenerPrimeraFecha() {
    let fechasConMachs = new Set();
    for (let m of almacenamiento.machs) {
        const dia = almacenamiento.dias.find(d => d.id === m.diaId);
        if (dia && dia.fecha) fechasConMachs.add(dia.fecha);
    }
    const fechasOrdenadas = Array.from(fechasConMachs).sort();
    if (fechasOrdenadas.length > 0) return fechasOrdenadas[0];
    if (almacenamiento.dias.length > 0) {
        const diasOrdenados = [...almacenamiento.dias].sort((a,b) => a.fecha.localeCompare(b.fecha));
        return diasOrdenados[0].fecha;
    }
    return getFechaLocalISO();
}

function obtenerUltimaFecha() {
    let fechasConMachs = new Set();
    for (let m of almacenamiento.machs) {
        const dia = almacenamiento.dias.find(d => d.id === m.diaId);
        if (dia && dia.fecha) fechasConMachs.add(dia.fecha);
    }
    const fechasOrdenadas = Array.from(fechasConMachs).sort();
    if (fechasOrdenadas.length > 0) return fechasOrdenadas[fechasOrdenadas.length - 1];
    if (almacenamiento.dias.length > 0) {
        const diasOrdenados = [...almacenamiento.dias].sort((a,b) => b.fecha.localeCompare(a.fecha));
        return diasOrdenados[0].fecha;
    }
    return getFechaLocalISO();
}

function inicializarFiltrosEstadisticasGlobales() {
    const fechaDesdeInput = document.getElementById('fechaDesde');
    const fechaHastaInput = document.getElementById('fechaHasta');
    if (fechaDesdeInput) fechaDesdeInput.value = obtenerPrimeraFecha();
    if (fechaHastaInput) fechaHastaInput.value = obtenerUltimaFecha();
}

// ==================== MODALES PERSONALIZADOS ====================

function mostrarAlerta(mensaje, titulo = 'Información', tipo = 'info') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = `modal-personalizado modal-alerta`;
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>${tipo === 'error' ? '❌ Error' : (tipo === 'exito' ? '✅ Éxito' : 'ℹ️ Información')}</h3>
                    <button class="btn-cerrar-modal">&times;</button>
                </div>
                <div class="modal-body">${mensaje}</div>
                <div class="modal-footer"><button class="btn-aceptar">Aceptar</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        const cerrar = () => { modal.remove(); resolve(); };
        modal.querySelector('.btn-aceptar').onclick = cerrar;
        modal.querySelector('.btn-cerrar-modal').onclick = cerrar;
        modal.onclick = (e) => { if (e.target === modal) cerrar(); };
    });
}

function mostrarConfirmacion(mensaje, titulo = 'Confirmar', tipo = 'normal') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = `modal-personalizado ${tipo === 'peligro' ? 'modal-peligro' : ''}`;
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>${tipo === 'peligro' ? '⚠️ ' : '❓ '}${titulo}</h3>
                    <button class="btn-cerrar-modal">&times;</button>
                </div>
                <div class="modal-body">${mensaje}</div>
                <div class="modal-footer">
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-confirmar">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const resolver = (resultado) => { modal.remove(); resolve(resultado); };
        modal.querySelector('.btn-confirmar').onclick = () => resolver(true);
        modal.querySelector('.btn-cancelar').onclick = () => resolver(false);
        modal.querySelector('.btn-cerrar-modal').onclick = () => resolver(false);
        modal.onclick = (e) => { if (e.target === modal) resolver(false); };
    });
}

function mostrarPrompt(mensaje, titulo = 'Ingresar dato', valorDefault = '') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = `modal-personalizado modal-prompt`;
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>✏️ ${titulo}</h3>
                    <button class="btn-cerrar-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <label>${mensaje}</label>
                    <input type="text" id="promptInput" value="${escapeHtml(valorDefault)}" autocomplete="off">
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-confirmar">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const input = modal.querySelector('#promptInput');
        input.focus();
        input.select();
        const resolver = (resultado) => { modal.remove(); resolve(resultado); };
        modal.querySelector('.btn-confirmar').onclick = () => resolver(input.value.trim());
        modal.querySelector('.btn-cancelar').onclick = () => resolver(null);
        modal.querySelector('.btn-cerrar-modal').onclick = () => resolver(null);
        modal.onclick = (e) => { if (e.target === modal) resolver(null); };
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') resolver(input.value.trim());
        });
    });
}

function mostrarToast(mensaje, tipo = 'info', duracion = 2500) {
    const toast = document.createElement('div');
    toast.className = `toast-personalizado toast-${tipo}`;
    toast.innerHTML = `${tipo === 'exito' ? '✅ ' : tipo === 'error' ? '❌ ' : 'ℹ️ '}${mensaje}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-salida');
        setTimeout(() => toast.remove(), 300);
    }, duracion);
}

// --- FUNCIONES DE PERSISTENCIA ---
function guardarTodoEnLocalStorage() {
    localStorage.setItem('pintintin_jugadores', JSON.stringify(almacenamiento.jugadores));
    localStorage.setItem('pintintin_dias', JSON.stringify(almacenamiento.dias));
    localStorage.setItem('pintintin_participaciones', JSON.stringify(almacenamiento.participaciones));
    localStorage.setItem('pintintin_machs', JSON.stringify(almacenamiento.machs));
    localStorage.setItem('pintintin_preferencia', JSON.stringify({ tablaTranspuesta: tablaTranspuesta }));
    localStorage.setItem('pintintin_ultimoGanador', ultimoGanadorId);
    localStorage.setItem('pintintin_penultimoGanador', penultimoGanadorId);
}

function cargarTodoDesdeLocalStorage() {
    almacenamiento.jugadores = JSON.parse(localStorage.getItem('pintintin_jugadores')) || [];
    almacenamiento.dias = JSON.parse(localStorage.getItem('pintintin_dias')) || [];
    almacenamiento.participaciones = JSON.parse(localStorage.getItem('pintintin_participaciones')) || [];
    almacenamiento.machs = JSON.parse(localStorage.getItem('pintintin_machs')) || [];
    const pref = JSON.parse(localStorage.getItem('pintintin_preferencia'));
    if (pref) tablaTranspuesta = pref.tablaTranspuesta || false;

    for (let p of almacenamiento.participaciones) {
        if (p.empatesParticipados === undefined) p.empatesParticipados = 0;
        if (p.empatesGanados === undefined) p.empatesGanados = 0;
        if (p.empatesAcumulados === undefined) p.empatesAcumulados = 0;
        if (p.patasPorEmpate === undefined) p.patasPorEmpate = 0;
        if (p.pollonas === undefined) p.pollonas = 0;
        if (p.capicuas === undefined) p.capicuas = 0;
        if (p.cierres === undefined) p.cierres = 0;
        if (p.pegado === undefined) p.pegado = 0;
        if (p.paseManoDados === undefined) p.paseManoDados = 0;
        if (p.paseManoRecibidos === undefined) p.paseManoRecibidos = 0;
    }
    for (let m of almacenamiento.machs) {
        if (m.fechaHoraInicio === undefined) m.fechaHoraInicio = null;
        if (!m.participantes) m.participantes = [];
        if (!m.manos) m.manos = [];
    }

    ultimoGanadorId = parseInt(localStorage.getItem('pintintin_ultimoGanador')) || null;
    penultimoGanadorId = parseInt(localStorage.getItem('pintintin_penultimoGanador')) || null;
}

function guardarSesionCompleta() {
    const sesion = {
        diaActivo: diaActivo,
        jugadoresActuales: jugadoresActuales,
        estadoMachActual: {
            numero: estadoMachActual.numero,
            patasActuales: Array.from(estadoMachActual.patasActuales.entries()),
            empatePendiente: estadoMachActual.empatePendiente,
            empateMultiplicador: estadoMachActual.empateMultiplicador,
            jugadorQueSale: estadoMachActual.jugadorQueSale,
            historialManos: estadoMachActual.historialManos,
            historialGanadores: estadoMachActual.historialGanadores,
            fechaHoraInicio: estadoMachActual.fechaHoraInicio
        },
        ultimoGanadorId: ultimoGanadorId,
        penultimoGanadorId: penultimoGanadorId
    };
    localStorage.setItem('sesionPintintinV2', JSON.stringify(sesion));
    console.log("✅ Sesión guardada correctamente");
}

function cargarSesionCompleta() {
    const sesionGuardada = localStorage.getItem('sesionPintintinV2');
    if (!sesionGuardada) return false;
    try {
        const data = JSON.parse(sesionGuardada);
        if (!data.diaActivo) return false;
        const dia = almacenamiento.dias.find(d => d.id === data.diaActivo.id);
        if (!dia) {
            limpiarSesionCompleta();
            return false;
        }
        if (dia.activo !== 1) {
            dia.activo = 1;
            guardarTodoEnLocalStorage();
        }
        diaActivo = data.diaActivo;
        jugadoresActuales = data.jugadoresActuales;
        estadoMachActual = {
            numero: data.estadoMachActual.numero,
            patasActuales: new Map(data.estadoMachActual.patasActuales),
            empatePendiente: data.estadoMachActual.empatePendiente,
            empateMultiplicador: data.estadoMachActual.empateMultiplicador || 0,
            jugadorQueSale: data.estadoMachActual.jugadorQueSale || null,
            historialManos: data.estadoMachActual.historialManos || [],
            historialGanadores: data.estadoMachActual.historialGanadores || [],
            fechaHoraInicio: data.estadoMachActual.fechaHoraInicio || null
        };
        ultimoGanadorId = data.ultimoGanadorId || null;
        penultimoGanadorId = data.penultimoGanadorId || null;
        console.log("✅ Sesión cargada correctamente");
        return true;
    } catch (e) {
        console.error("Error cargando sesión:", e);
        limpiarSesionCompleta();
        return false;
    }
}

function limpiarSesionCompleta() {
    localStorage.removeItem('sesionPintintinV2');
    localStorage.removeItem('pintintin_ultimoGanador');
    localStorage.removeItem('pintintin_penultimoGanador');
    ultimoGanadorId = null;
    penultimoGanadorId = null;
    if (estadoMachActual) estadoMachActual.historialGanadores = [];
    console.log("🧹 Sesión limpiada");
}

// --- RESPALDO ---
function getDiaSemanaAbreviatura() {
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return dias[new Date().getDay()];
}

function formatearFechaParaNombreArchivo() {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yy = String(hoy.getFullYear()).slice(-2);
    return `${dd}${mm}${yy}`;
}

async function guardarBackupAutomatico() {
    const data = { jugadores: almacenamiento.jugadores, dias: almacenamiento.dias, participaciones: almacenamiento.participaciones, machs: almacenamiento.machs, fecha: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const link = document.createElement('a');
    const nombreArchivo = `Pinti_v606_${getDiaSemanaAbreviatura()}.json`;
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
    console.log("✅ Backup automático guardado:", nombreArchivo);
}

async function exportarBackupManual() {
    const data = { jugadores: almacenamiento.jugadores, dias: almacenamiento.dias, participaciones: almacenamiento.participaciones, machs: almacenamiento.machs, fecha: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const link = document.createElement('a');
    const nombreArchivo = `Pinti_v606_${formatearFechaParaNombreArchivo()}.json`;
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
}

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
            for (let m of almacenamiento.machs) if (m.fechaHoraInicio === undefined) m.fechaHoraInicio = null;
            guardarTodoEnLocalStorage();
            limpiarSesionCompleta();
            diaActivo = null;
            jugadoresActuales = [];
            estadoMachActual = {
                numero: 1,
                patasActuales: new Map(),
                empatePendiente: null,
                empateMultiplicador: 0,
                jugadorQueSale: null,
                historialManos: [],
                historialGanadores: [],
                fechaHoraInicio: null
            };
            if (document.getElementById('vistaConfig')) {
                renderInputsJugadores();
                actualizarDatalistJugadores();
                actualizarColorBotonSorteo();
            }
            mostrarAlerta('Datos importados correctamente', '✅ Éxito', 'exito');
        } catch (error) { 
            mostrarAlerta('Archivo inválido: ' + error.message, '❌ Error', 'error');
        }
    };
    reader.readAsText(file);
}

// ==================== FUNCIÓN DE RENDERIZADO DE TABLAS ====================
function ordenarJugadoresPorPrioridad(entriesArray) {
    return entriesArray.sort((a, b) => {
        const sA = a[1];
        const sB = b[1];
        if (sA.machs !== sB.machs) return (sB.machs || 0) - (sA.machs || 0);
        if (sA.patas !== sB.patas) return (sB.patas || 0) - (sA.patas || 0);
        if (sA.pollonas !== sB.pollonas) return (sB.pollonas || 0) - (sA.pollonas || 0);
        if (sA.capicuas !== sB.capicuas) return (sB.capicuas || 0) - (sA.capicuas || 0);
        if (sA.pegado !== sB.pegado) return (sB.pegado || 0) - (sA.pegado || 0);
        if (sA.paseManoDados !== sB.paseManoDados) return (sB.paseManoDados || 0) - (sA.paseManoDados || 0);
        if (sA.empatesParticipados !== sB.empatesParticipados) return (sB.empatesParticipados || 0) - (sA.empatesParticipados || 0);
        if (sA.empatesGanados !== sB.empatesGanados) return (sB.empatesGanados || 0) - (sA.empatesGanados || 0);
        if (sA.forros !== sB.forros) return (sA.forros || 0) - (sB.forros || 0);
        if (sA.aguas !== sB.aguas) return (sA.aguas || 0) - (sB.aguas || 0);
        return a[0].localeCompare(b[0]);
    });
}

function renderizarTablaNormal(stats, titulo) {
    if (!stats || stats.size === 0) return `<div class="stats-container"><p class="stats-vacio">📭 No hay estadísticas registradas.</p></div>`;
    const metricas = [
        { key: 'machs', icono: '🏆', nombre: 'Machs' },
        { key: 'patas', icono: '🦶', nombre: 'Patas' },
        { key: 'pollonas', icono: '🐔', nombre: 'Pollonas' },
        { key: 'capicuas', icono: '🀰', nombre: 'Capicuas' },
        { key: 'cierres', icono: '🚪', nombre: 'Cierres (Última ficha)' },
        { key: 'pegado', icono: '🏃', nombre: 'Pegados (Ficha que encaja por ambas cabezas)' },
        { key: 'forros', icono: '🧤', nombre: 'Forros' },
        { key: 'aguas', icono: '💧', nombre: 'Aguas' },
        { key: 'paseManoDados', icono: '🎯', nombre: 'PM Dados' },
        { key: 'paseManoRecibidos', icono: '📥', nombre: 'PM Recibidos' },
        { key: 'empatesParticipados', icono: '⚖️', nombre: 'Empates' },
        { key: 'empatesGanados', icono: '🏆⚖️', nombre: 'E. Ganados' },
        { key: 'patasPorEmpate', icono: '🧩', nombre: 'Patas x Empate' }
    ];
    const entries = Array.from(stats.entries());
    const sortedEntries = ordenarJugadoresPorPrioridad(entries);
    const nombres = sortedEntries.map(e => e[0]);
    const totalesPorMetrica = {};
    for (let metrica of metricas) {
        totalesPorMetrica[metrica.key] = 0;
        for (let nombre of nombres) totalesPorMetrica[metrica.key] += stats.get(nombre)[metrica.key] || 0;
    }
    let html = `<div class="stats-container"><div class="table-responsive"><table class="tabla-estadisticas"><thead>`;
    html += `<tr><th>Jugador</th>`;
    for (let metrica of metricas) html += `<th>${metrica.icono} ${metrica.nombre}</th>`;
    html += `</thead><tbody>`;
    for (let nombre of nombres) {
        html += `<tr>
            <td><strong>${escapeHtml(nombre)}</strong></td>`;
        for (let metrica of metricas) {
            html += `<td class="text-center">${stats.get(nombre)[metrica.key] || 0}</td>`;
        }
        html += `</tr>`;
    }
    html += `<tr style="background:#f1f5f9; font-weight:bold;">
        <td><strong>📊 TOTALES</strong></td>`;
    for (let metrica of metricas) {
        html += `<td class="text-center"><strong>${totalesPorMetrica[metrica.key]}</strong></td>`;
    }
    html += `</tr>
    </tbody></table></div>`;
    if (titulo) html += `<p class="stats-nota">⚡ ${titulo}</p>`;
    html += `</div>`;
    return html;
}

function renderizarTablaTranspuesta(stats, titulo) {
    if (!stats || stats.size === 0) return `<div class="stats-container"><p class="stats-vacio">📭 No hay estadísticas registradas.</p></div>`;
    const metricas = [
        { key: 'machs', icono: '🏆', nombre: 'Machs' },
        { key: 'patas', icono: '🦶', nombre: 'Patas' },
        { key: 'pollonas', icono: '🐔', nombre: 'Pollonas' },
        { key: 'capicuas', icono: '🀰', nombre: 'Capicuas' },
        { key: 'cierres', icono: '🚪', nombre: 'Cierres (Última ficha)' },
        { key: 'pegado', icono: '🏃', nombre: 'Pegados (Ficha que encaja por ambas cabezas)' },
        { key: 'forros', icono: '🧤', nombre: 'Forros' },
        { key: 'aguas', icono: '💧', nombre: 'Aguas' },
        { key: 'paseManoDados', icono: '🎯', nombre: 'PM Dados' },
        { key: 'paseManoRecibidos', icono: '📥', nombre: 'PM Recibidos' },
        { key: 'empatesParticipados', icono: '⚖️', nombre: 'Empates' },
        { key: 'empatesGanados', icono: '🏆⚖️', nombre: 'E. Ganados' },
        { key: 'patasPorEmpate', icono: '🧩', nombre: 'Patas x Empate' }
    ];
    const entries = Array.from(stats.entries());
    const sortedEntries = ordenarJugadoresPorPrioridad(entries);
    const nombres = sortedEntries.map(e => e[0]);
    const totalesPorMetrica = {};
    for (let metrica of metricas) {
        totalesPorMetrica[metrica.key] = 0;
        for (let nombre of nombres) totalesPorMetrica[metrica.key] += stats.get(nombre)[metrica.key] || 0;
    }
    let html = `<div class="stats-container"><div class="table-responsive"><table class="tabla-estadisticas"><thead>`;
    html += `<tr><th>Estadística</th>`;
    for (let nombre of nombres) html += `<th>${escapeHtml(nombre)}</th>`;
    html += `<th style="background:#f1f5f9;">📊 TOTAL</th></thead><tbody>`;
    for (let metrica of metricas) {
        html += `<tr>`;
        html += `<td><strong>${metrica.icono} ${metrica.nombre}</strong></td>`;
        for (let nombre of nombres) {
            html += `<td class="text-center">${stats.get(nombre)[metrica.key] || 0}</td>`;
        }
        html += `<td class="text-center" style="background:#f1f5f9; font-weight:bold;">${totalesPorMetrica[metrica.key]}</td>`;
        html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    if (titulo) html += `<p class="stats-nota">⚡ ${titulo}</p>`;
    html += `</div>`;
    return html;
}

// ==================== MENSAJE DE EMPATE PERSISTENTE (MEJORADO) ====================
function actualizarAvisoEmpate() {
    const avisoEmpateDiv = document.getElementById('avisoEmpate');
    if(!avisoEmpateDiv) return;
    
    if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        const jugadoresEmpatados = estadoMachActual.empatePendiente.jugadoresIds;
        const nombresEmpatados = jugadoresEmpatados.map(id => {
            const jugador = jugadoresActuales.find(j => j.jugadorId === id);
            return jugador ? jugador.nombre : '?';
        }).join(', ');
        
        const multiplicador = estadoMachActual.empateMultiplicador || 1;
        const valorMultiplicador = Math.pow(2, multiplicador);
        
        let mensajeEmpate = `⚠️ ¡EMPATE! Jugadores: ${nombresEmpatados}`;
        mensajeEmpate += ` | 🔥 Mano vale ×${valorMultiplicador} (${multiplicador} empate${multiplicador !== 1 ? 's' : ''} acumulado${multiplicador !== 1 ? 's' : ''})`;
        
        if(estadoMachActual.jugadorQueSale && estadoMachActual.empateMultiplicador > 0) {
            const jugadorSale = jugadoresActuales.find(j => j.jugadorId === estadoMachActual.jugadorQueSale);
            if(jugadorSale) {
                mensajeEmpate += ` | 🎯 Comienza: ${jugadorSale.nombre}`;
            }
        } else if(estadoMachActual.empateMultiplicador === 0) {
            mensajeEmpate += ` | 🎲 Es la primera mano del mach`;
        }
        
        avisoEmpateDiv.innerHTML = mensajeEmpate;
        avisoEmpateDiv.style.display = 'block';
        avisoEmpateDiv.style.background = '#fef3c7';
        avisoEmpateDiv.style.borderLeft = '4px solid #f59e0b';
        avisoEmpateDiv.style.padding = '0.6rem';
        avisoEmpateDiv.style.borderRadius = '0.5rem';
        avisoEmpateDiv.style.fontWeight = 'bold';
    } else {
        avisoEmpateDiv.innerHTML = '';
        avisoEmpateDiv.style.display = 'none';
    }
}

// ==================== ESTADÍSTICAS DEL DÍA (CORREGIDO) ====================
function mostrarEstadisticasDelDia() {
    if (!diaActivo) {
        mostrarAlerta('No hay un día activo. Inicia una partida primero.', '⚠️ Atención', 'error');
        return;
    }

    const machsCompletados = almacenamiento.machs.filter(m => m.diaId === diaActivo.id);
    const statsMap = new Map();

    for (const mach of machsCompletados) {
        for (const participante of mach.participantes) {
            if (!participante.jugadorId) continue;
            const nombreJugador = participante.nombre;
            if (!statsMap.has(nombreJugador)) {
                statsMap.set(nombreJugador, {
                    machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                    capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                    paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                    patasPorEmpate: 0
                });
            }
            const stats = statsMap.get(nombreJugador);
            if (participante.jugadorId === mach.ganadorId) stats.machs++;
            stats.patas += participante.patasFinales || 0;
            if (mach.manos) {
                for (const mano of mach.manos) {
                    if (mano.jugadorId !== participante.jugadorId) continue;
                    switch (mano.tipo) {
                        case 'forro': stats.forros++; break;
                        case 'agua': stats.aguas++; break;
                        case 'capicua': stats.capicuas++; break;
                        case 'cierre': stats.cierres++; break;
                        case 'pegado': stats.pegado++; break;
                        case 'paseMano':
                        case 'paseManoDado': stats.paseManoDados++; break;
                        case 'paseManoRecibido': stats.paseManoRecibidos++; break;
                    }
                }
            }
        }
    }

    const participacionesDia = almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id);
    for (const p of participacionesDia) {
        const jugador = almacenamiento.jugadores.find(j => j.id === p.jugadorId);
        if (!jugador) continue;
        const nombreJugador = jugador.nombre;
        if (!statsMap.has(nombreJugador)) {
            statsMap.set(nombreJugador, {
                machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                patasPorEmpate: 0
            });
        }
        const stats = statsMap.get(nombreJugador);
        stats.pollonas += p.pollonas || 0;
        stats.empatesParticipados += p.empatesParticipados || 0;
        stats.empatesGanados += p.empatesGanados || 0;
        stats.patasPorEmpate += p.patasPorEmpate || 0;
    }

    if (jugadoresActuales && jugadoresActuales.length > 0) {
        for (const j of jugadoresActuales) {
            if (!j.jugadorId || !j.nombre) continue;
            if (!statsMap.has(j.nombre)) {
                statsMap.set(j.nombre, {
                    machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                    capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                    paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                    patasPorEmpate: 0
                });
            }
            const stats = statsMap.get(j.nombre);
            stats.patas += estadoMachActual.patasActuales.get(j.jugadorId) || 0;
            if (estadoMachActual.historialManos) {
                for (const mano of estadoMachActual.historialManos) {
                    if (mano.jugadorId !== j.jugadorId) continue;
                    switch (mano.tipo) {
                        case 'forro': stats.forros++; break;
                        case 'agua': stats.aguas++; break;
                        case 'capicua': stats.capicuas++; break;
                        case 'cierre': stats.cierres++; break;
                        case 'pegado': stats.pegado++; break;
                        case 'paseMano':
                        case 'paseManoDado': stats.paseManoDados++; break;
                        case 'paseManoRecibido': stats.paseManoRecibidos++; break;
                    }
                }
            }
        }
    }

    const resultadosStats = document.getElementById('resultadosStats');
    const vistaEstadisticas = document.getElementById('vistaEstadisticas');
    const vistaJuego = document.getElementById('vistaJuego');
    
    if (resultadosStats) {
        const html = tablaTranspuesta ? 
            renderizarTablaTranspuesta(statsMap, `Mach actual #${estadoMachActual.numero} en curso`) : 
            renderizarTablaNormal(statsMap, `Mach actual #${estadoMachActual.numero} en curso`);
        resultadosStats.innerHTML = html;
    }
    
    if (vistaEstadisticas) vistaEstadisticas.style.display = 'block';
    if (vistaJuego) vistaJuego.style.display = 'none';
    
    const tituloStats = document.querySelector('#vistaEstadisticas h2');
    if (tituloStats) tituloStats.innerHTML = '📊 Estadísticas del Día';
    
    const filtrosDiv = document.querySelector('#vistaEstadisticas .filtros');
    if (filtrosDiv) filtrosDiv.style.display = 'none';
}

// ==================== ESTADÍSTICAS GLOBALES (CORREGIDO) ====================
function cargarEstadisticasGlobales(desde, hasta) {
    let diasFiltrados = almacenamiento.dias;
    if (desde) diasFiltrados = diasFiltrados.filter(d => d.fecha >= desde);
    if (hasta) diasFiltrados = diasFiltrados.filter(d => d.fecha <= hasta);
    const idsDiasFiltrados = new Set(diasFiltrados.map(d => d.id));

    const machsFiltrados = almacenamiento.machs.filter(m => idsDiasFiltrados.has(m.diaId));

    const statsTotales = new Map();
    for (const mach of machsFiltrados) {
        for (const participante of mach.participantes) {
            if (!participante.jugadorId) continue;
            const nombreJugador = participante.nombre;
            if (!statsTotales.has(nombreJugador)) {
                statsTotales.set(nombreJugador, {
                    machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                    capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                    paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                    patasPorEmpate: 0
                });
            }
            const stats = statsTotales.get(nombreJugador);
            if (participante.jugadorId === mach.ganadorId) stats.machs++;
            stats.patas += participante.patasFinales || 0;
            if (mach.manos) {
                for (const mano of mach.manos) {
                    if (mano.jugadorId !== participante.jugadorId) continue;
                    switch (mano.tipo) {
                        case 'forro': stats.forros++; break;
                        case 'agua': stats.aguas++; break;
                        case 'capicua': stats.capicuas++; break;
                        case 'cierre': stats.cierres++; break;
                        case 'pegado': stats.pegado++; break;
                        case 'paseMano':
                        case 'paseManoDado': stats.paseManoDados++; break;
                        case 'paseManoRecibido': stats.paseManoRecibidos++; break;
                    }
                }
            }
        }
    }

    const participacionesFiltradas = almacenamiento.participaciones.filter(p => idsDiasFiltrados.has(p.diaId));
    for (const p of participacionesFiltradas) {
        const jugador = almacenamiento.jugadores.find(j => j.id === p.jugadorId);
        if (!jugador) continue;
        const nombreJugador = jugador.nombre;
        if (!statsTotales.has(nombreJugador)) {
            statsTotales.set(nombreJugador, {
                machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                patasPorEmpate: 0
            });
        }
        const stats = statsTotales.get(nombreJugador);
        stats.pollonas += p.pollonas || 0;
        stats.empatesParticipados += p.empatesParticipados || 0;
        stats.empatesGanados += p.empatesGanados || 0;
        stats.patasPorEmpate += p.patasPorEmpate || 0;
    }

    const porFecha = new Map();
    for (const mach of machsFiltrados) {
        const dia = almacenamiento.dias.find(d => d.id === mach.diaId);
        if (!dia) continue;
        const fecha = formatearFechaDDMMYYYY(dia.fecha);
        if (!porFecha.has(fecha)) porFecha.set(fecha, []);
        porFecha.get(fecha).push(mach);
    }

    let fechasOrdenadas = Array.from(porFecha.keys()).sort((a, b) => {
        const [da, ma, aa] = a.split('/');
        const [db, mb, ab] = b.split('/');
        return new Date(ab, ma-1, da) - new Date(aa, mb-1, db);
    }).reverse();

    let html = '<div class="stats-container">';
    
    if (fechasOrdenadas.length > 1 && statsTotales.size > 0) {
        html += renderizarTablaResumen(statsTotales, tablaTranspuesta);
    }
    
    if (fechasOrdenadas.length === 0) {
        html += '<p class="stats-vacio">📭 No hay machs registrados en el período seleccionado.</p>';
    } else {
        for (const fecha of fechasOrdenadas) {
            const machsDia = porFecha.get(fecha);
            const statsDia = new Map();
            
            for (const mach of machsDia) {
                for (const p of mach.participantes) {
                    if (!p.jugadorId) continue;
                    const nombre = p.nombre;
                    if (!statsDia.has(nombre)) {
                        statsDia.set(nombre, {
                            machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                            capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                            paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                            patasPorEmpate: 0
                        });
                    }
                    const s = statsDia.get(nombre);
                    if (p.jugadorId === mach.ganadorId) s.machs++;
                    s.patas += p.patasFinales || 0;
                    if (mach.manos) {
                        for (const mano of mach.manos) {
                            if (mano.jugadorId !== p.jugadorId) continue;
                            switch (mano.tipo) {
                                case 'forro': s.forros++; break;
                                case 'agua': s.aguas++; break;
                                case 'capicua': s.capicuas++; break;
                                case 'cierre': s.cierres++; break;
                                case 'pegado': s.pegado++; break;
                                case 'paseMano':
                                case 'paseManoDado': s.paseManoDados++; break;
                                case 'paseManoRecibido': s.paseManoRecibidos++; break;
                            }
                        }
                    }
                }
            }
            
            const participacionesDia = almacenamiento.participaciones.filter(p => {
                const dia = almacenamiento.dias.find(d => d.id === p.diaId);
                return dia && formatearFechaDDMMYYYY(dia.fecha) === fecha;
            });
            for (const p of participacionesDia) {
                const jugador = almacenamiento.jugadores.find(j => j.id === p.jugadorId);
                if (!jugador) continue;
                if (!statsDia.has(jugador.nombre)) {
                    statsDia.set(jugador.nombre, {
                        machs: 0, patas: 0, forros: 0, aguas: 0, pollonas: 0,
                        capicuas: 0, cierres: 0, pegado: 0, paseManoDados: 0,
                        paseManoRecibidos: 0, empatesParticipados: 0, empatesGanados: 0,
                        patasPorEmpate: 0
                    });
                }
                const s = statsDia.get(jugador.nombre);
                s.pollonas += p.pollonas || 0;
                s.empatesParticipados += p.empatesParticipados || 0;
                s.empatesGanados += p.empatesGanados || 0;
                s.patasPorEmpate += p.patasPorEmpate || 0;
            }
            
            html += `<div class="dia-stats-block"><h4>📅 ${fecha}</h4>`;
            html += tablaTranspuesta ? renderizarTablaTranspuesta(statsDia, null) : renderizarTablaNormal(statsDia, null);
            html += `</div>`;
        }
    }
    html += '</div>';
    
    const resultadosStats = document.getElementById('resultadosStats');
    if (resultadosStats) resultadosStats.innerHTML = html;
    
    const filtrosDiv = document.querySelector('#vistaEstadisticas .filtros');
    if (filtrosDiv) {
        filtrosDiv.style.display = 'flex';
        filtrosDiv.style.flexWrap = 'wrap';
        filtrosDiv.style.gap = '0.5rem';
        filtrosDiv.style.alignItems = 'center';
        filtrosDiv.style.justifyContent = 'flex-start';
    }
}

function renderizarTablaResumen(statsTotales, modoTranspuesto) {
    if (!statsTotales || statsTotales.size === 0) return '';
    const metricas = [
        { key: 'machs', icono: '🏆', nombre: 'Machs' },
        { key: 'patas', icono: '🦶', nombre: 'Patas' },
        { key: 'pollonas', icono: '🐔', nombre: 'Pollonas' },
        { key: 'capicuas', icono: '🀰', nombre: 'Capicuas' },
        { key: 'cierres', icono: '🚪', nombre: 'Cierres' },
        { key: 'pegado', icono: '🏃', nombre: 'Pegados' },
        { key: 'forros', icono: '🧤', nombre: 'Forros' },
        { key: 'aguas', icono: '💧', nombre: 'Aguas' },
        { key: 'paseManoDados', icono: '🎯', nombre: 'PM Dados' },
        { key: 'paseManoRecibidos', icono: '📥', nombre: 'PM Recibidos' },
        { key: 'empatesParticipados', icono: '⚖️', nombre: 'Empates' },
        { key: 'empatesGanados', icono: '🏆⚖️', nombre: 'E. Ganados' },
        { key: 'patasPorEmpate', icono: '🧩', nombre: 'Patas x Empate' }
    ];
    const entries = Array.from(statsTotales.entries());
    const sortedEntries = ordenarJugadoresPorPrioridad(entries);
    let html = `<div class="resumen-general"><h3>📊 RESUMEN GENERAL (Todos los días)</h3><div class="table-responsive">`;
    
    if (modoTranspuesto) {
        const nombres = sortedEntries.map(e => e[0]);
        const totalesPorMetrica = {};
        for (let metrica of metricas) {
            totalesPorMetrica[metrica.key] = 0;
            for (let nombre of nombres) totalesPorMetrica[metrica.key] += statsTotales.get(nombre)[metrica.key] || 0;
        }
        html += `<table class="tabla-estadisticas"><thead>`;
        html += `<tr><th>Estadística</th>`;
        for (let nombre of nombres) html += `<th>${escapeHtml(nombre)}</th>`;
        html += `<th style="background:#f1f5f9;">📊 TOTAL</th></thead><tbody>`;
        for (let metrica of metricas) {
            html += `<tr>`;
            html += `<td><strong>${metrica.icono} ${metrica.nombre}</strong></td>`;
            for (let nombre of nombres) html += `<td class="text-center">${statsTotales.get(nombre)[metrica.key] || 0}</td>`;
            html += `<td class="text-center" style="background:#f1f5f9; font-weight:bold;">${totalesPorMetrica[metrica.key]}</td>`;
            html += `</tr>`;
        }
        html += `</tbody></table>`;
    } else {
        html += `<table class="tabla-estadisticas"><thead>`;
        html += `<tr><th>Jugador</th><th>🏆 Machs</th><th>🦶 Patas</th><th>🐔 Pollonas</th><th>🀰 Capicuas</th><th>🚪 Cierres</th><th>🏃 Pegados</th><th>🧤 Forros</th><th>💧 Aguas</th><th>🎯 PM Dados</th><th>📥 PM Recibidos</th><th>⚖️ Empates</th><th>🏆⚖️ E. Ganados</th><th>🧩 Patas x Empate</th></tr>`;
        html += `</thead><tbody>`;
        let totales = {};
        for (let metrica of metricas) totales[metrica.key] = 0;
        for (let [nombre, s] of sortedEntries) {
            html += `<tr>`;
            html += `<td><strong>${escapeHtml(nombre)}</strong></td>`;
            for (let metrica of metricas) {
                let val = s[metrica.key] || 0;
                html += `<td class="text-center">${val}</td>`;
                totales[metrica.key] += val;
            }
            html += `</tr>`;
        }
        html += `<tr style="background:#f1f5f9; font-weight:bold;">
            <td><strong>📊 TOTALES</strong></td>`;
        for (let metrica of metricas) html += `<td class="text-center"><strong>${totales[metrica.key]}</strong></td>`;
        html += `</tr>
        </tbody></table>`;
    }
    html += `</div></div><br>`;
    return html;
}

// ==================== VALIDACIÓN DE CONSISTENCIA ====================
function validarConsistenciaMachs() {
    console.log('🔍 Validando consistencia de machs...');
    const machsReales = new Map();
    for (let mach of almacenamiento.machs) {
        if (mach.ganadorId && mach.diaId) {
            const key = `${mach.diaId}-${mach.ganadorId}`;
            machsReales.set(key, (machsReales.get(key) || 0) + 1);
        }
    }
    let correcciones = 0;
    for (let part of almacenamiento.participaciones) {
        const key = `${part.diaId}-${part.jugadorId}`;
        const machsRealesJugador = machsReales.get(key) || 0;
        if (part.machsGanados !== machsRealesJugador) {
            part.machsGanados = machsRealesJugador;
            correcciones++;
        }
    }
    if (correcciones > 0) {
        guardarTodoEnLocalStorage();
        console.log(`✅ Se corrigieron ${correcciones} participaciones`);
    }
    return correcciones;
}

// ==================== LÍMITE DE 5 PATAS POR MACH ====================
function calcularPatasConTope(ganadorId, patasBase, multiplicadorEmpate) {
    const patasBrutas = patasBase * Math.pow(2, multiplicadorEmpate);
    const patasActuales = estadoMachActual.patasActuales.get(ganadorId) || 0;
    const patasNecesarias = 5 - patasActuales;
    if (patasBrutas <= patasNecesarias) {
        return patasBrutas;
    } else {
        const sobrantes = patasBrutas - patasNecesarias;
        console.log(`⚠️ Excedente de ${sobrantes} patas no contabilizadas (máximo 5 por mach)`);
        return patasNecesarias;
    }
}

// ==================== PLACEHOLDER DINÁMICO ====================
function renderInputsJugadores() {
    actualizarDatalistJugadores();
    agregarListenersInputs();
}

function agregarListenersInputs() {
    for(let i=1;i<=4;i++) {
        const input = document.getElementById(`jugador${i}`);
        if(input) {
            input.removeEventListener('input', actualizarColorBotonSorteo);
            input.addEventListener('input', actualizarColorBotonSorteo);
        }
    }
}

// ==================== ACCESO OCULTO A ADMIN ====================
let tapCount = 0;
let tapTimer = null;

function iniciarDeteccionAccesoAdmin() {
    if (window.location.search.includes('admin=true')) {
        mostrarPrompt('Contraseña de administrador:', '🔐 Acceso restringido').then(pwd => {
            if (pwd === "administrador") {
                window.location.href = 'admin.html';
            } else if (pwd !== null) {
                mostrarAlerta('Contraseña incorrecta', '❌ Error', 'error');
            }
        });
        return;
    }
    const detectarTaps = () => {
        const marcadorJ1 = document.querySelector('.tarjeta-jugador .patas');
        if (marcadorJ1) {
            marcadorJ1.addEventListener('click', () => {
                tapCount++;
                clearTimeout(tapTimer);
                tapTimer = setTimeout(() => tapCount = 0, 2000);
                if (tapCount === 5) {
                    mostrarPrompt('Contraseña de administrador:', '🔐 Acceso restringido').then(password => {
                        if (password === "administrador") {
                            window.location.href = "admin.html";
                        } else if (password !== null) {
                            mostrarAlerta('Contraseña incorrecta', '❌ Error', 'error');
                        }
                    });
                    tapCount = 0;
                }
            });
        }
    };
    const observer = new MutationObserver(() => detectarTaps());
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
        const creditosDiv = document.querySelector('.creditos');
        if (creditosDiv) {
            const parrafos = creditosDiv.querySelectorAll('p');
            for (let p of parrafos) {
                if (p.innerHTML.includes('Ricardo Castillo') || p.innerHTML.includes('Richard')) {
                    p.innerHTML = p.innerHTML.replace(/Richard/g, '<span id="adminLink" style="cursor:pointer; text-decoration:underline; color:#8b5cf6; font-weight:bold;">Richard</span>');
                    break;
                }
            }
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.onclick = (e) => {
                    e.preventDefault();
                    mostrarPrompt('Contraseña de administrador:', '🔐 Acceso restringido').then(password => {
                        if (password === "administrador") {
                            window.location.href = "admin.html";
                        } else if (password !== null) {
                            mostrarAlerta('Contraseña incorrecta', '❌ Error', 'error');
                        }
                    });
                };
            }
        }
    }, 500);
}

// ==================== MODAL DE SALIR DEL JUEGO ====================
function mostrarModalCerrarDia() {
    const modalSalir = document.createElement('div');
    modalSalir.className = 'modal';
    modalSalir.style.display = 'flex';
    modalSalir.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h3>🚪 Salir del juego</h3>
            <p style="margin: 0.5rem 0;">¿Estás seguro de que quieres salir?</p>
            <label style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 0.5rem 0; cursor: pointer;">
                <input type="checkbox" id="conservarPartidaCheck" checked style="width: 18px; height: 18px; margin: 0;">
                <span>💾 Conservar partida para continuar después</span>
            </label>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <button id="confirmarSalir" style="background: #b91c1c;">Sí, salir del juego</button>
                <button id="cancelarSalir" style="background: #475569;">No, volver al juego</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalSalir);
    const confirmarBtn = modalSalir.querySelector('#confirmarSalir');
    const cancelarBtn = modalSalir.querySelector('#cancelarSalir');
    const conservarCheck = modalSalir.querySelector('#conservarPartidaCheck');
    confirmarBtn.onclick = async () => {
        const conservarPartida = conservarCheck.checked;
        if (diaActivo) {
            if (conservarPartida) {
                console.log("📀 Saliendo del juego, conservando partida");
                guardarSesionCompleta();
            } else {
                console.log("🚪 Cerrando día definitivamente");
                let dia = almacenamiento.dias.find(d => d.id === diaActivo.id);
                if (dia) dia.activo = 0;
                guardarTodoEnLocalStorage();
                await guardarBackupAutomatico();
                limpiarSesionCompleta();
                localStorage.removeItem('sesionPintintinV2');
            }
        }
        diaActivo = null;
        jugadoresActuales = [];
        estadoMachActual = {
            numero: 1,
            patasActuales: new Map(),
            empatePendiente: null,
            empateMultiplicador: 0,
            jugadorQueSale: null,
            historialManos: [],
            historialGanadores: [],
            fechaHoraInicio: null
        };
        document.getElementById('vistaConfig').style.display = 'block';
        document.getElementById('vistaJuego').style.display = 'none';
        document.getElementById('vistaEstadisticas').style.display = 'none';
        renderInputsJugadores();
        const fechaDiaInput = document.getElementById('fechaDia');
        if (fechaDiaInput) fechaDiaInput.value = getFechaLocalISO();
        const resultadoSorteoDiv = document.getElementById('resultadoSorteo');
        if (resultadoSorteoDiv) resultadoSorteoDiv.innerHTML = '';
        actualizarColorBotonSorteo();
        document.body.removeChild(modalSalir);
    };
    cancelarBtn.onclick = () => {
        document.body.removeChild(modalSalir);
    };
    modalSalir.onclick = (e) => {
        if (e.target === modalSalir) document.body.removeChild(modalSalir);
    };
}

// ==================== SORTEO E INICIAR ====================
function tirarDado() { return Math.floor(Math.random() * 6) + 1; }

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
    console.log("🎲 sortearEIniciar() llamado. diaActivo:", diaActivo, "hayPartidaGuardada:", hayPartidaGuardada());
    const mantenerUbicacion = document.getElementById('mantenerUbicacion')?.checked || false;
    if (hayPartidaGuardada()) {
        console.log("📀 Intentando continuar partida guardada...");
        if (!diaActivo || jugadoresActuales.length === 0) {
            const cargada = cargarSesionCompleta();
            if (!cargada || !diaActivo || jugadoresActuales.length === 0) {
                limpiarSesionCompleta();
            } else {
                const activos = jugadoresActuales.filter(j => j.jugadorId !== null);
                if (activos.length >= 2) {
                    cargarVistaJuego();
                    reasignarTodosLosEventos();
                    actualizarColorBotonSorteo();
                    return;
                } else {
                    limpiarSesionCompleta();
                }
            }
        } else {
            cargarVistaJuego();
            reasignarTodosLosEventos();
            actualizarColorBotonSorteo();
            return;
        }
    }
    if (diaActivo) {
        const continuar = await mostrarConfirmacion('Ya hay una partida en curso. ¿Comenzar una nueva?', '⚠️ Atención', 'peligro');
        if (!continuar) return;
        limpiarSesionCompleta();
        actualizarColorBotonSorteo();
    }
    const nombres = [
        document.getElementById('jugador1')?.value.trim(),
        document.getElementById('jugador2')?.value.trim(),
        document.getElementById('jugador3')?.value.trim(),
        document.getElementById('jugador4')?.value.trim()
    ];
    const jugadoresValidos = nombres.filter(n => n !== null && n !== "");
    if(jugadoresValidos.length < 2) { 
        mostrarAlerta('Debe haber al menos 2 jugadores', '⚠️ Validación', 'error');
        return; 
    }
    const nombresSet = new Set(jugadoresValidos.map(s => s.toLowerCase()));
    if(nombresSet.size !== jugadoresValidos.length) { 
        mostrarAlerta('Los nombres no pueden repetirse', '⚠️ Validación', 'error');
        return; 
    }
    const fechaDiaInput = document.getElementById('fechaDia');
    let fecha = fechaDiaInput ? fechaDiaInput.value : '';
    if (!fecha) { 
        mostrarAlerta('Selecciona una fecha', '⚠️ Validación', 'error');
        return; 
    }
    if (!validarFechaISO(fecha)) { 
        mostrarAlerta('Fecha inválida. Usa el formato YYYY-MM-DD', '⚠️ Validación', 'error');
        return; 
    }
    const jugadoresConId = nombres.map(n => n ? obtenerOJugador(n) : null);
    let posicionesMap = new Map();
    if (mantenerUbicacion) {
        for (let i = 0; i < jugadoresConId.length; i++) {
            const jug = jugadoresConId[i];
            if (jug) {
                posicionesMap.set(i + 1, { jugadorId: jug.id, nombre: jug.nombre });
            }
        }
    } else {
        let jugadoresDados = jugadoresValidos.map(n => ({nombre:n, dado:tirarDado()}));
        let ordenFinal = resolverEmpates(jugadoresDados);
        let sillas = [1, 2, 3, 4];
        for(let i = sillas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sillas[i], sillas[j]] = [sillas[j], sillas[i]];
        }
        for(let i = 0; i < ordenFinal.length; i++) {
            const sillaAsignada = sillas[i];
            const jugador = ordenFinal[i];
            const jug = obtenerOJugador(jugador.nombre);
            posicionesMap.set(sillaAsignada, { jugadorId: jug.id, nombre: jug.nombre });
        }
    }
    let jugadoresPos = [];
    for(let silla = 1; silla <= 4; silla++) {
        if(posicionesMap.has(silla)) {
            const jug = posicionesMap.get(silla);
            jugadoresPos.push({ posicion: silla, jugadorId: jug.jugadorId, nombre: jug.nombre });
        } else {
            jugadoresPos.push({ posicion: silla, jugadorId: null, nombre: null });
        }
    }
    const diaId = generarNuevoId(almacenamiento.dias);
    almacenamiento.dias.push({ id: diaId, fecha, activo: 1 });
    diaActivo = { id: diaId, fecha };
    
    for(let j of jugadoresPos) {
        if(j.jugadorId) {
            const participacionId = generarNuevoId(almacenamiento.participaciones);
            almacenamiento.participaciones.push({
                id: participacionId, diaId, jugadorId: j.jugadorId,
                machsGanados:0, patasNetas:0, aguas:0, forros:0,
                pollonas:0, capicuas:0, cierres:0, pegado:0,
                paseManoDados:0, paseManoRecibidos:0,
                empatesParticipados:0, empatesGanados:0, empatesAcumulados:0,
                patasPorEmpate:0
            });
        }
    }
    jugadoresActuales = jugadoresPos;
    estadoMachActual = {
        numero:1,
        patasActuales: new Map(),
        empatePendiente: null,
        empateMultiplicador: 0,
        jugadorQueSale: null,
        historialManos: [],
        historialGanadores: [],
        fechaHoraInicio: new Date().toISOString()
    };
    jugadoresActuales.forEach(j => { if(j.jugadorId) estadoMachActual.patasActuales.set(j.jugadorId, 0); });
    ultimaJugadaFueAgua = false;
    ultimoGanadorId = null;
    penultimoGanadorId = null;
    guardarTodoEnLocalStorage();
    guardarSesionCompleta();
    actualizarColorBotonSorteo();
    cargarVistaJuego();
}

// ==================== REASIGNAR EVENTOS ====================
function reasignarTodosLosEventos() {
    console.log("🔄 Reasignando eventos después de restaurar partida");
    const btnEmpate = document.getElementById('btnEmpate');
    const btnGestionJugador = document.getElementById('btnGestionJugador');
    const btnRetirarJugador = document.getElementById('btnRetirarJugador');
    const btnStatsEnJuego = document.getElementById('btnStatsEnJuego');
    const btnEstadisticasGlobalesJuego = document.getElementById('btnEstadisticasGlobalesJuego');
    const btnCerrarDia = document.getElementById('btnCerrarDia');
    const btnAyuda = document.getElementById('btnAyuda');
    const btnGraficasConfig = document.getElementById('btnGraficasConfig');
    if (btnEmpate) btnEmpate.onclick = () => { if(diaActivo) procesarEmpate(); else mostrarAlerta('No hay un día activo', '⚠️ Atención', 'error'); };
    if (btnGestionJugador) btnGestionJugador.onclick = gestionarJugador;
    if (btnRetirarJugador) btnRetirarJugador.onclick = retirarJugador;
    if (btnStatsEnJuego) btnStatsEnJuego.onclick = mostrarEstadisticasDelDia;
    if (btnEstadisticasGlobalesJuego) btnEstadisticasGlobalesJuego.onclick = () => {
        if(!diaActivo) return mostrarAlerta('Inicia un día primero', '⚠️ Atención', 'error');
        inicializarFiltrosEstadisticasGlobales();
        const { desde, hasta } = getFechasDesdeHastaInput();
        cargarEstadisticasGlobales(desde, hasta);
        document.getElementById('vistaJuego').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='block';
        const titulo = document.querySelector('#vistaEstadisticas h2'); if(titulo) titulo.innerHTML = '📊 Estadísticas Globales';
        agregarBotonVolverSuperior();
    };
    if (btnCerrarDia) btnCerrarDia.onclick = () => { if(diaActivo) mostrarModalCerrarDia(); };
    if (btnAyuda) {
        btnAyuda.onclick = () => {
            const modalAyuda = document.getElementById('modalAyuda');
            const contenidoAyuda = document.getElementById('contenidoAyuda');
            if (contenidoAyuda) {
                contenidoAyuda.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando manual...</div>';
                fetch('manual_pintintin.html')
                    .then(response => response.text())
                    .then(html => {
                        contenidoAyuda.innerHTML = html;
                        const links = contenidoAyuda.querySelectorAll('a[href="#"]');
                        links.forEach(link => {
                            const onclickAttr = link.getAttribute('onclick');
                            if (onclickAttr) {
                                const idMatch = onclickAttr.match(/scrollToSection\('([^']+)'\)/);
                                if (idMatch) {
                                    const id = idMatch[1];
                                    link.onclick = (e) => {
                                        e.preventDefault();
                                        const target = contenidoAyuda.querySelector(`#${id}`);
                                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                                    };
                                }
                            }
                        });
                    })
                    .catch(err => {
                        console.error('Error cargando manual:', err);
                        contenidoAyuda.innerHTML = '<div style="text-align:center; padding:2rem; color:red;">❌ Error al cargar el manual. Verifica tu conexión.</div>';
                    });
            }
            if(modalAyuda) modalAyuda.style.display = 'flex';
        };
    }
    if (btnGraficasConfig) {
        btnGraficasConfig.onclick = () => {
            sessionStorage.setItem('viniendoDeGraficas', 'true');
            window.location.href = 'estadisticas_graficas.html';
        };
    }
    renderizarJugadores();
}

// ==================== FUNCIÓN PROCESAR EMPATE (MEJORADA) ====================
function procesarEmpate() {
    if(!diaActivo) {
        mostrarAlerta('No hay un día activo', '⚠️ Atención', 'error');
        return;
    }
    
    const jugadoresActivos = jugadoresActuales.filter(j => j.jugadorId !== null);
    
    if(jugadoresActivos.length === 2) {
        const idsEmpatados = jugadoresActivos.map(j => j.jugadorId);
        let multiplicadorActual = estadoMachActual.empateMultiplicador || 0;
        let nuevoMultiplicador = multiplicadorActual + 1;
        
        for (let jugadorId of idsEmpatados) {
            let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
            if (part) {
                part.empatesParticipados = (part.empatesParticipados || 0) + 1;
                part.empatesAcumulados = (part.empatesAcumulados || 0) + 1;
            }
        }
        
        for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) {
            if (!idsEmpatados.includes(part.jugadorId)) {
                part.empatesAcumulados = 0;
            }
        }
        
        let jugadorQueSaleId = null;
        if (ultimoGanadorId !== null) {
            const otrosJugadores = jugadoresActivos.filter(j => j.jugadorId !== ultimoGanadorId);
            if (otrosJugadores.length === 1) {
                jugadorQueSaleId = otrosJugadores[0].jugadorId;
            }
        }
        
        estadoMachActual.empatePendiente = { jugadoresIds: idsEmpatados, resuelto: false };
        estadoMachActual.empateMultiplicador = nuevoMultiplicador;
        estadoMachActual.jugadorQueSale = jugadorQueSaleId;
        
        guardarTodoEnLocalStorage();
        renderizarJugadores();
        actualizarAvisoEmpate();
        
        for (let jugadorId of idsEmpatados) {
            agregarAlHistorial(jugadorId, 'empate', 0);
        }
        
        return;
    }
    
    const checkEmpateDiv = document.getElementById('checkEmpate');
    const modalEmpate = document.getElementById('modalEmpate');
    
    if (checkEmpateDiv) {
        checkEmpateDiv.innerHTML = '';
        for(let j of jugadoresActivos) { 
            let l=document.createElement('label'); 
            l.innerHTML=`<input type="checkbox" value="${j.jugadorId}"> ${j.nombre}`; 
            checkEmpateDiv.appendChild(l); 
        }
    }
    if(modalEmpate) modalEmpate.style.display='flex';
}

function confirmarEmpateSeleccionado() {
    const checkEmpateDiv = document.getElementById('checkEmpate');
    const modalEmpate = document.getElementById('modalEmpate');
    
    if(!checkEmpateDiv || !diaActivo) return; 
    let checks = [...checkEmpateDiv.querySelectorAll('input:checked')]; 
    if(checks.length < 2) {
        mostrarAlerta('Selecciona al menos dos jugadores empatados', '⚠️ Empate', 'error');
        return;
    }
    
    const jugadoresEmpatados = checks.map(c => parseInt(c.value));
    let multiplicadorActual = estadoMachActual.empateMultiplicador || 0;
    let nuevoMultiplicador = multiplicadorActual + 1;
    
    for (let jugadorId of jugadoresEmpatados) {
        let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
        if (part) {
            part.empatesParticipados = (part.empatesParticipados || 0) + 1;
            part.empatesAcumulados = (part.empatesAcumulados || 0) + 1;
        }
    }
    
    for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) {
        if (!jugadoresEmpatados.includes(part.jugadorId)) {
            part.empatesAcumulados = 0;
        }
    }
    
    let jugadorQueSaleId = null;
    if (ultimoGanadorId !== null) {
        const todosActivos = jugadoresActuales.filter(j => j.jugadorId !== null);
        const otrosJugadores = todosActivos.filter(j => !jugadoresEmpatados.includes(j.jugadorId));
        if (otrosJugadores.length === 1) {
            jugadorQueSaleId = otrosJugadores[0].jugadorId;
        }
    }
    
    estadoMachActual.empatePendiente = { jugadoresIds: jugadoresEmpatados, resuelto: false };
    estadoMachActual.empateMultiplicador = nuevoMultiplicador;
    estadoMachActual.jugadorQueSale = jugadorQueSaleId;
    
    guardarTodoEnLocalStorage();
    renderizarJugadores();
    actualizarAvisoEmpate();
    
    if(modalEmpate) modalEmpate.style.display = 'none';
    
    for (let jugadorId of jugadoresEmpatados) {
        agregarAlHistorial(jugadorId, 'empate', 0);
    }
}

// --- FUNCIONES AUXILIARES ---
function obtenerOJugador(nombre) {
    nombre = nombre.trim();
    let existente = almacenamiento.jugadores.find(j => j.nombre.toLowerCase() === nombre.toLowerCase());
    if (existente) return existente;
    const nuevoId = generarNuevoId(almacenamiento.jugadores);
    const nuevoJugador = { id: nuevoId, nombre };
    almacenamiento.jugadores.push(nuevoJugador);
    guardarTodoEnLocalStorage();
    actualizarDatalistJugadores();
    return nuevoJugador;
}

function contarJugadoresActivos() {
    return jugadoresActuales.filter(j => j.jugadorId !== null).length;
}

function obtenerSillasVacantes() {
    let vacantes = [];
    for(let j of jugadoresActuales) {
        if(j.jugadorId === null) vacantes.push(j.posicion);
    }
    return vacantes;
}

function actualizarDatalistJugadores() {
    let datalist = document.getElementById('listaJugadores');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'listaJugadores';
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = '';
    const nombres = almacenamiento.jugadores.map(j => j.nombre).sort();
    for (let nombre of nombres) {
        const option = document.createElement('option');
        option.value = nombre;
        datalist.appendChild(option);
    }
}

function hayPartidaGuardada() {
    return localStorage.getItem('sesionPintintinV2') !== null;
}

function actualizarColorBotonSorteo() {
    const btn = document.getElementById('btnSortearEIniciar');
    if (!btn) return;
    const mantenerUbicacion = document.getElementById('mantenerUbicacion')?.checked || false;
    if (hayPartidaGuardada()) {
        btn.style.background = "#10b981";
        btn.textContent = "🎲 Continuar partida guardada";
        btn.style.display = "block";
        return;
    }
    if (diaActivo) {
        btn.style.background = "#8b5cf6";
        btn.textContent = "🎲 Iniciar NUEVA partida";
        btn.style.display = "block";
        return;
    }
    let nombresIngresados = 0;
    for (let i = 1; i <= 4; i++) {
        let n = document.getElementById(`jugador${i}`)?.value.trim();
        if (n && n !== "") nombresIngresados++;
    }
    if (nombresIngresados >= 2) {
        btn.style.background = "#8b5cf6";
        if (mantenerUbicacion) btn.textContent = "🎲 Iniciar juego (sin sorteo)";
        else btn.textContent = "🎲 Sortear sillas e iniciar";
    } else btn.textContent = "🎲 Sortear sillas e iniciar";
    btn.style.display = "block";
}

function actualizarVisibilidadBotones() {
    const btnGestion = document.getElementById('btnGestionJugador');
    const btnRetirar = document.getElementById('btnRetirarJugador');
    const jugadoresActivos = contarJugadoresActivos();
    if(!btnGestion) return;
    if(jugadoresActivos < 4) {
        btnGestion.textContent = "➕ Añadir jugador";
        btnGestion.style.background = "#8b5cf6";
        btnGestion.style.display = "block";
    } else if(jugadoresActivos === 4) {
        btnGestion.textContent = "🔄 Sustituir jugador";
        btnGestion.style.background = "#8b5cf6";
        btnGestion.style.display = "block";
    }
    if(btnRetirar) btnRetirar.style.display = (jugadoresActivos >= 3) ? "block" : "none";
}

// --- GESTIÓN DE JUGADORES ---
async function gestionarJugador() {
    if(!diaActivo) { 
        mostrarAlerta('Primero inicia un día', '⚠️ Atención', 'error');
        return; 
    }
    const jugadoresActivos = contarJugadoresActivos();
    const vacantes = obtenerSillasVacantes();
    if(jugadoresActivos < 4 && vacantes.length > 0) {
        const nuevoNombre = await mostrarPrompt('Nombre del nuevo jugador:', '➕ Añadir jugador');
        if(!nuevoNombre || nuevoNombre.trim() === "") return;
        const nombreExiste = jugadoresActuales.some(j => j.jugadorId !== null && j.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase());
        if(nombreExiste) { 
            mostrarAlerta('Ya hay un jugador con ese nombre', '⚠️ Validación', 'error');
            return; 
        }
        const jug = obtenerOJugador(nuevoNombre);
        const indiceAleatorio = Math.floor(Math.random() * vacantes.length);
        const posicionElegida = vacantes[indiceAleatorio];
        const idx = jugadoresActuales.findIndex(j => j.posicion === posicionElegida);
        if(idx !== -1) {
            jugadoresActuales[idx] = { posicion: posicionElegida, jugadorId: jug.id, nombre: jug.nombre };
            const existeParticipacion = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jug.id);
            if(!existeParticipacion) {
                const participacionId = generarNuevoId(almacenamiento.participaciones);
                almacenamiento.participaciones.push({
                    id: participacionId,
                    diaId: diaActivo.id,
                    jugadorId: jug.id,
                    machsGanados: 0, patasNetas: 0, aguas: 0, forros: 0,
                    pollonas: 0, capicuas: 0, cierres: 0, pegado: 0,
                    paseManoDados: 0, paseManoRecibidos: 0,
                    empatesParticipados: 0, empatesGanados: 0, empatesAcumulados: 0,
                    patasPorEmpate: 0
                });
            }
            if(!estadoMachActual.patasActuales.has(jug.id)) estadoMachActual.patasActuales.set(jug.id, 0);
            guardarTodoEnLocalStorage();
            guardarSesionCompleta();
            renderizarJugadores();
            actualizarVisibilidadBotones();
            mostrarToast(`${jug.nombre} se ha unido en la Silla ${posicionElegida}`, 'exito');
        }
    } else if(jugadoresActivos === 4) {
        const pos = await mostrarPrompt('Posición a sustituir (1-4):', '🔄 Sustituir jugador');
        if(!pos || pos<1 || pos>4) return;
        const nuevoNombre = await mostrarPrompt('Nombre del nuevo jugador:', '🔄 Sustituir jugador');
        if(!nuevoNombre || nuevoNombre.trim() === "") return;
        let idx = jugadoresActuales.findIndex(j => j.posicion === parseInt(pos));
        if(idx === -1) return;
        let jug = obtenerOJugador(nuevoNombre);
        jugadoresActuales[idx] = { posicion: parseInt(pos), jugadorId: jug.id, nombre: jug.nombre };
        let existe = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jug.id);
        if(!existe) {
            const participacionId = generarNuevoId(almacenamiento.participaciones);
            almacenamiento.participaciones.push({
                id: participacionId,
                diaId: diaActivo.id, jugadorId: jug.id,
                machsGanados: 0, patasNetas: 0, aguas: 0, forros: 0,
                pollonas: 0, capicuas: 0, cierres: 0, pegado: 0,
                paseManoDados: 0, paseManoRecibidos: 0,
                empatesParticipados: 0, empatesGanados: 0, empatesAcumulados: 0,
                patasPorEmpate: 0
            });
            guardarTodoEnLocalStorage();
        }
        if(!estadoMachActual.patasActuales.has(jug.id)) estadoMachActual.patasActuales.set(jug.id, 0);
        renderizarJugadores();
        guardarSesionCompleta();
        mostrarToast(`${jug.nombre} ocupa ahora la Silla ${pos}`, 'exito');
    }
}

async function retirarJugador() {
    if(!diaActivo) { 
        mostrarAlerta('Primero inicia un día', '⚠️ Atención', 'error');
        return; 
    }
    const jugadoresActivos = contarJugadoresActivos();
    if(jugadoresActivos <= 2) {
        mostrarAlerta('No se puede retirar más jugadores. Mínimo 2 jugadores en la mesa.', '⚠️ Atención', 'error');
        return;
    }
    let mensaje = "Selecciona la posición del jugador que se retira:\n";
    for(let j of jugadoresActuales) if(j.jugadorId !== null) mensaje += `${j.posicion} - ${j.nombre}\n`;
    const posicion = await mostrarPrompt(mensaje, '➖ Retirar jugador');
    if(!posicion) return;
    const posInt = parseInt(posicion);
    if(isNaN(posInt) || posInt < 1 || posInt > 4) return;
    const idx = jugadoresActuales.findIndex(j => j.posicion === posInt && j.jugadorId !== null);
    if(idx === -1) return;
    const nombreRetirado = jugadoresActuales[idx].nombre;
    const confirmado = await mostrarConfirmacion(`¿Seguro que ${nombreRetirado} se retira de la partida?`, '⚠️ Confirmar', 'peligro');
    if(confirmado) {
        jugadoresActuales[idx] = { posicion: posInt, jugadorId: null, nombre: null };
        guardarTodoEnLocalStorage();
        guardarSesionCompleta();
        renderizarJugadores();
        actualizarVisibilidadBotones();
        mostrarToast(`${nombreRetirado} se ha retirado. Silla ${posInt} queda vacante.`, 'info');
    }
}

// ==================== PASE DE MANO AUTOMÁTICO ====================
function obtenerJugadorQueRecibePM(jugadorQueDaId) {
    const jugadorQueDa = jugadoresActuales.find(j => j.jugadorId === jugadorQueDaId);
    if (!jugadorQueDa) return null;
    const posicion = jugadorQueDa.posicion;
    let ordenSiguiente;
    if (posicion === 1) ordenSiguiente = [4, 3, 2];
    else if (posicion === 2) ordenSiguiente = [1, 4, 3];
    else if (posicion === 3) ordenSiguiente = [2, 1, 4];
    else if (posicion === 4) ordenSiguiente = [3, 2, 1];
    else return null;
    for (let silla of ordenSiguiente) {
        const jugadorEnSilla = jugadoresActuales.find(j => j.posicion === silla && j.jugadorId !== null);
        if (jugadorEnSilla) return jugadorEnSilla.jugadorId;
    }
    return null;
}

async function registrarPaseManoAutomatico(jugadorId) {
    let partDador = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
    if(partDador) partDador.paseManoDados = (partDador.paseManoDados || 0) + 1;
    const jugadorRecibeId = obtenerJugadorQueRecibePM(jugadorId);
    if (jugadorRecibeId) {
        let partRecibidor = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorRecibeId);
        if(partRecibidor) partRecibidor.paseManoRecibidos = (partRecibidor.paseManoRecibidos || 0) + 1;
        estadoMachActual.historialManos.push({ tipo: 'paseMano', jugadorId: jugadorId, receptorId: jugadorRecibeId, patasAfectadas: 0, timestamp: new Date().toISOString() });
        const nombreDador = jugadoresActuales.find(j=>j.jugadorId===jugadorId)?.nombre;
        const nombreRecibe = jugadoresActuales.find(j=>j.jugadorId===jugadorRecibeId)?.nombre;
        mostrarToast(`Pase de mano: ${nombreDador} → ${nombreRecibe}`, 'info');
    } else {
        estadoMachActual.historialManos.push({ tipo: 'paseManoDado', jugadorId: jugadorId, patasAfectadas: 0, timestamp: new Date().toISOString() });
        const nombreDador = jugadoresActuales.find(j=>j.jugadorId===jugadorId)?.nombre;
        mostrarToast(`${nombreDador} dio el pase de mano (sin receptor)`, 'info');
    }
    ultimaJugadaFueAgua = false;
    guardarTodoEnLocalStorage();
    renderizarJugadores();
    guardarSesionCompleta();
}

// --- REGISTRO DE FORRO ---
async function registrarForro(jugadorId) {
    let actual = estadoMachActual.patasActuales.get(jugadorId) || 0;
    estadoMachActual.patasActuales.set(jugadorId, actual - 1);
    estadoMachActual.historialManos.push({ tipo:'forro', jugadorId, patasAfectadas:-1, timestamp:new Date().toISOString() });
    let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
    if(part) { part.forros = (part.forros || 0) + 1; guardarTodoEnLocalStorage(); }
    ultimaJugadaFueAgua = false;
    renderizarJugadores();
    guardarSesionCompleta();
}

// --- ACTUALIZACIÓN DE GANADORES Y REGISTRO EN HISTORIAL ---
function actualizarGanadores(ganadorId) {
    if (ganadorId === null) return;
    penultimoGanadorId = ultimoGanadorId;
    ultimoGanadorId = ganadorId;
    guardarSesionCompleta();
    renderizarJugadores();
}

function agregarAlHistorial(ganadorId, forma, patasGanadas) {
    const jugador = jugadoresActuales.find(j => j.jugadorId === ganadorId);
    if (!jugador) return;
    estadoMachActual.historialGanadores.push({
        jugadorId: ganadorId,
        nombre: jugador.nombre,
        forma: forma,
        patasGanadas: patasGanadas,
        timestamp: new Date().toISOString(),
        machNumero: estadoMachActual.numero
    });
    if (estadoMachActual.historialGanadores.length > 200) estadoMachActual.historialGanadores.shift();
    guardarSesionCompleta();
}

function registrarSalidaPorEmpate(jugadorId) {
    agregarAlHistorial(jugadorId, 'empate', 0);
}

function obtenerJugadorQueSale(ultimoGanadorId, jugadoresActuales) {
    if (ultimoGanadorId === null) return null;
    const jugadorUltimo = jugadoresActuales.find(j => j.jugadorId === ultimoGanadorId);
    if (!jugadorUltimo) return null;
    let posicionActual = jugadorUltimo.posicion;
    let posicionesOrdenadas = [];
    if (posicionActual === 1) posicionesOrdenadas = [4, 3, 2, 1];
    else if (posicionActual === 2) posicionesOrdenadas = [1, 4, 3, 2];
    else if (posicionActual === 3) posicionesOrdenadas = [2, 1, 4, 3];
    else if (posicionActual === 4) posicionesOrdenadas = [3, 2, 1, 4];
    for (let pos of posicionesOrdenadas) {
        if (pos === posicionActual) continue;
        const jugadorEnSilla = jugadoresActuales.find(j => j.posicion === pos && j.jugadorId !== null);
        if (jugadorEnSilla) return jugadorEnSilla;
    }
    return null;
}

function mostrarModalSalida(jugador) {
    const modalSalida = document.createElement('div');
    modalSalida.className = 'modal';
    modalSalida.style.display = 'flex';
    modalSalida.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 350px;">
            <h3>🎲 ¡COMENZAR PARTIDA!</h3>
            <div style="font-size: 1.8rem; margin: 0.5rem 0;">🎯</div>
            <p style="font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0; color: #8b5cf6;">${escapeHtml(jugador.nombre)}</p>
            <p style="font-size: 0.85rem; margin-bottom: 1rem;">Comienza la partida después del empate</p>
            <button id="cerrarModalSalida" style="background: #8b5cf6; padding: 0.5rem 1.5rem; width: auto; margin: 0 auto;">✅ Entendido</button>
        </div>
    `;
    document.body.appendChild(modalSalida);
    const cerrarBtn = modalSalida.querySelector('#cerrarModalSalida');
    cerrarBtn.onclick = () => document.body.removeChild(modalSalida);
    modalSalida.onclick = (e) => { if (e.target === modalSalida) document.body.removeChild(modalSalida); };
}

// ==================== MOSTRAR HISTORIAL ====================
function mostrarHistorialGanadores() {
    if (!diaActivo) {
        mostrarAlerta('No hay un día activo', '⚠️ Atención', 'error');
        return;
    }
    const historial = estadoMachActual.historialGanadores;
    if (historial.length === 0) {
        mostrarAlerta('Aún no se ha registrado ninguna mano ganada ni empate en el día.', '📜 Historial', 'info');
        return;
    }
    const modalHistorial = document.createElement('div');
    modalHistorial.className = 'modal';
    modalHistorial.style.display = 'flex';
    let html = `
        <div class="modal-content" style="max-width: 650px; max-height: 70vh; overflow-y: auto;">
            <h3>📜 Historial completo (manos ganadas y salidas por empate)</h3>
            <table style="width:100%; font-size:0.7rem;">
                <thead><tr><th>#</th><th>Jugador</th><th>Motivo / Forma</th><th>Patas</th><th>Mach</th><th>Hora</th></tr></thead>
                <tbody>
    `;
    const reverso = [...historial].reverse();
    reverso.forEach((item, idx) => {
        const hora = new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        let formaMostrada = '';
        if (item.forma === 'cierre') formaMostrada = '🚪 Cierre (Última ficha)';
        else if (item.forma === 'pegado') formaMostrada = '🏃 Pegado (Ficha que encaja por ambas cabezas)';
        else if (item.forma === 'capicua') formaMostrada = '🀰 Capicua';
        else if (item.forma === 'empate') formaMostrada = '⚖️ Empate (comienza partida)';
        else formaMostrada = item.forma;
        const machOrdinal = item.machNumero + 'º';
        html += `<tr><td class="text-center">${idx+1}</td><td class="text-center">${escapeHtml(item.nombre)}</td><td class="text-center">${formaMostrada}</td><td class="text-center">${item.patasGanadas}</td><td class="text-center">${machOrdinal}</td><td class="text-center">${hora}</td></tr>`;
    });
    html += `
                </tbody>
            </table>
            <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                <button id="cerrarHistorialBtn" class="btn-cancelar">Cerrar</button>
            </div>
        </div>
    `;
    modalHistorial.innerHTML = html;
    document.body.appendChild(modalHistorial);
    const cerrarBtn = modalHistorial.querySelector('#cerrarHistorialBtn');
    cerrarBtn.onclick = () => document.body.removeChild(modalHistorial);
    modalHistorial.onclick = (e) => { if (e.target === modalHistorial) document.body.removeChild(modalHistorial); };
}

// --- FUNCIÓN PARA ALTERNAR TABLAS TRANSPUESTAS ---
function alternarTablaTranspuesta() {
    tablaTranspuesta = !tablaTranspuesta;
    guardarTodoEnLocalStorage();
    const btnTransponer = document.getElementById('btnTransponer');
    if (btnTransponer) {
        btnTransponer.innerHTML = tablaTranspuesta ? '🔄 Modo Normal (filas)' : '🔄 Intercambiar (columnas)';
    }
    const vistaEstadisticas = document.getElementById('vistaEstadisticas');
    if (vistaEstadisticas && vistaEstadisticas.style.display === 'block') {
        const titulo = document.querySelector('#vistaEstadisticas h2');
        if (titulo && titulo.innerHTML === '📊 Estadísticas del Día') {
            mostrarEstadisticasDelDia();
        } else {
            const { desde, hasta } = getFechasDesdeHastaInput();
            cargarEstadisticasGlobales(desde, hasta);
        }
    }
}

// ==================== EXPORTACIÓN A PDF ====================
function exportarPDFGlobales() {
    if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
        mostrarAlerta('La librería PDF no está cargada. Recarga la página.', '❌ Error', 'error');
        return;
    }
    const { jsPDF } = window.jspdf || jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text("Estadisticas Globales - Domino Pintintin v6.0.6", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 30);
    const desdeInput = document.getElementById('fechaDesde');
    const hastaInput = document.getElementById('fechaHasta');
    const desde = desdeInput ? formatearFechaDDMMYYYY(desdeInput.value) : '';
    const hasta = hastaInput ? formatearFechaDDMMYYYY(hastaInput.value) : '';
    if (desde || hasta) doc.text(`Periodo: ${desde || 'inicio'} al ${hasta || 'hoy'}`, 20, 38);
    
    function limpiarTexto(texto) {
        if (!texto) return '';
        const emojis = /[🏆🦶🐔🀰🚪🏃🧤💧🎯📥⚖️🧩📅📊⭐🔄👑🥈🪑❓⚠️✅❌➕➖🔍📎🖨️📈📊🎲⚙️👥📋💾📂🔧🔬🔨🧹🔄🔐🔍🚪🎯🀰🐔💧🧤🏃🚪📥🎯⚖️🧩👥📅📊🏆🦶]/g;
        let limpio = texto.replace(emojis, '');
        limpio = limpio.replace(/\s+/g, ' ').trim();
        return limpio;
    }
    const container = document.getElementById('resultadosStats');
    let yOffset = 50;
    if (container) {
        const tablas = container.querySelectorAll('table');
        for (let i = 0; i < tablas.length; i++) {
            const tabla = tablas[i];
            const headers = [];
            const headerRows = tabla.querySelectorAll('thead tr');
            if (headerRows.length > 0) {
                const lastHeaderRow = headerRows[headerRows.length - 1];
                lastHeaderRow.querySelectorAll('th').forEach(th => {
                    let texto = limpiarTexto(th.innerText);
                    if (texto) headers.push(texto);
                });
            }
            if (headers.length === 0 && headerRows.length > 0) {
                headerRows[0].querySelectorAll('th').forEach(th => {
                    let texto = limpiarTexto(th.innerText);
                    if (texto) headers.push(texto);
                });
            }
            const data = [];
            const bodyRows = tabla.querySelectorAll('tbody tr');
            bodyRows.forEach(row => {
                const rowData = [];
                row.querySelectorAll('td').forEach(td => rowData.push(limpiarTexto(td.innerText)));
                if (rowData.length) data.push(rowData);
            });
            if (headers.length > 0 && data.length > 0 && data[0].length > 0) {
                if (yOffset > 250) { doc.addPage(); yOffset = 20; }
                const bloque = tabla.closest('.dia-stats-block');
                if (bloque) {
                    const tituloFecha = bloque.querySelector('h4');
                    if (tituloFecha) {
                        let tituloLimpio = limpiarTexto(tituloFecha.innerText);
                        if (tituloLimpio) {
                            doc.setFontSize(11);
                            doc.text(tituloLimpio, 20, yOffset);
                            yOffset += 8;
                            doc.setFontSize(7);
                        }
                    }
                } else if (tabla.closest('.resumen-general')) {
                    doc.setFontSize(11);
                    doc.text("RESUMEN GENERAL", 20, yOffset);
                    yOffset += 8;
                    doc.setFontSize(7);
                }
                doc.autoTable({
                    head: [headers],
                    body: data,
                    startY: yOffset,
                    theme: 'striped',
                    styles: { fontSize: 8, cellPadding: 1.5 },
                    headStyles: { fillColor: [139, 92, 246], textColor: 255 }
                });
                yOffset = doc.lastAutoTable.finalY + 10;
            }
        }
    }
    doc.save(`estadisticas_globales_${new Date().toISOString().slice(0,19)}.pdf`);
    mostrarToast("PDF exportado correctamente", "exito");
}

// ==================== VISTAS ====================
function cargarVistaJuego() {
    const vistaConfig = document.getElementById('vistaConfig');
    const vistaJuego = document.getElementById('vistaJuego');
    const vistaEstadisticas = document.getElementById('vistaEstadisticas');
    vistaConfig.style.display = 'none';
    vistaJuego.style.display = 'block';
    vistaEstadisticas.style.display = 'none';
    const fechaMostrada = document.getElementById('fechaMostrada');
    const numMachActualSpan = document.getElementById('numMachActual');
    if(fechaMostrada && diaActivo) fechaMostrada.innerText = `📅 ${formatearFechaDDMMYYYY(diaActivo.fecha)}  |  Mach #${estadoMachActual.numero}`;
    if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
    renderizarJugadores();
    actualizarAvisoEmpate();
    actualizarVisibilidadBotones();
}

// ==================== MODAL TERMINACIÓN CON TEXTOS CORREGIDOS ====================
function abrirModalTerminacion() {
    if(!ganadorPendiente) return;
    const ganadorNombre = jugadoresActuales.find(j => j.jugadorId === ganadorPendiente)?.nombre;
    const terminacionInfo = document.getElementById('terminacionInfo');
    if(terminacionInfo) terminacionInfo.innerText = `Ganador: ${ganadorNombre}`;
    
    // Actualizar textos de los botones para mayor claridad
    const btnCierre = document.getElementById('terminacionCierre');
    const btnPegado = document.getElementById('terminacionPegado');
    const btnCapicua = document.getElementById('terminacionCapicua');
    
    if (btnCierre) btnCierre.textContent = "🚪 Cierre (Última ficha)";
    if (btnPegado) btnPegado.textContent = "🏃 Pegado (Ficha que encaja por ambas cabezas)";
    if (btnCapicua) btnCapicua.textContent = "🀰 Capicua (Ficha doble, vale 2)";
    
    const modalTerminacion = document.getElementById('modalTerminacion');
    if(modalTerminacion) modalTerminacion.style.display = 'flex';
}

function cerrarModalTerminacion() { 
    const modalTerminacion = document.getElementById('modalTerminacion');
    if(modalTerminacion) modalTerminacion.style.display = 'none'; 
}

function aplicarModalTerminacion(forma) {
    if(!ganadorPendiente) return;
    let partGanador = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === ganadorPendiente);
    let empatesAcumulados = partGanador ? (partGanador.empatesAcumulados || 0) : 0;
    let patasBase = (forma === 'capicua') ? 2 : 1;
    let patasAApuntar = patasBase * Math.pow(2, empatesAcumulados);
    cerrarModalTerminacion();
    const jugadoresActivosConSilla = jugadoresActuales.filter(j => j.jugadorId !== null);
    if (jugadoresActivosConSilla.length === 2) {
        const jugadorAgua = jugadoresActivosConSilla.find(j => j.jugadorId !== ganadorPendiente);
        if (jugadorAgua) finalizarPataConAgua(ganadorPendiente, forma, patasAApuntar, empatesAcumulados, jugadorAgua.jugadorId);
    } else {
        mostrarModalAgua(jugadoresActivosConSilla, ganadorPendiente, forma, patasAApuntar, empatesAcumulados);
    }
}

function finalizarPataConAgua(ganadorId, forma, patasAApuntar, empatesAcumulados, jugadorAguaId) {
    let patasBase = (forma === 'capicua') ? 2 : 1;
    let patasConTope = calcularPatasConTope(ganadorId, patasBase, empatesAcumulados);
    let partGanador = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === ganadorId);
    if (empatesAcumulados > 0 && partGanador) {
        partGanador.empatesGanados = (partGanador.empatesGanados || 0) + 1;
        let extraPorEmpate = patasConTope - patasBase;
        if (extraPorEmpate > 0) partGanador.patasPorEmpate = (partGanador.patasPorEmpate || 0) + extraPorEmpate;
    }
    if (estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        estadoMachActual.empatePendiente = null;
        estadoMachActual.empateMultiplicador = 0;
        estadoMachActual.jugadorQueSale = null;
        actualizarAvisoEmpate();
    }
    let actual = estadoMachActual.patasActuales.get(ganadorId) || 0;
    estadoMachActual.patasActuales.set(ganadorId, actual + patasConTope);
    estadoMachActual.historialManos.push({ tipo: forma, jugadorId: ganadorId, patasAfectadas: patasConTope, timestamp: new Date().toISOString() });
    if (partGanador) {
        if (forma === 'capicua') partGanador.capicuas = (partGanador.capicuas || 0) + 1;
        else if (forma === 'cierre') partGanador.cierres = (partGanador.cierres || 0) + 1;
        else if (forma === 'pegado') partGanador.pegado = (partGanador.pegado || 0) + 1;
    }
    let partAgua = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorAguaId);
    if (partAgua) partAgua.aguas = (partAgua.aguas || 0) + 1;
    estadoMachActual.historialManos.push({ tipo: 'agua', jugadorId: jugadorAguaId, patasAfectadas: 0, timestamp: new Date().toISOString() });
    for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) part.empatesAcumulados = 0;
    ultimaJugadaFueAgua = true;
    guardarTodoEnLocalStorage();
    renderizarJugadores();
    agregarAlHistorial(ganadorId, forma, patasConTope);
    actualizarGanadores(ganadorId);
    let tempGanador = ganadorId;
    ganadorPendiente = null;
    verificarFinMach(tempGanador);
}

function renderizarJugadores() {
    const jugadoresGrid = document.getElementById('jugadoresGrid');
    if(!jugadoresGrid) return;
    jugadoresGrid.innerHTML = '';
    for(let j of jugadoresActuales) {
        let patas = (j.jugadorId && estadoMachActual.patasActuales.has(j.jugadorId)) ? estadoMachActual.patasActuales.get(j.jugadorId) : 0;
        let part = (j.jugadorId) ? almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === j.jugadorId) : null;
        let forrosDia = part ? part.forros : 0;
        let aguasDia = part ? part.aguas : 0;
        let pollonasDia = part ? part.pollonas : 0;
        let capicuasDia = part ? part.capicuas : 0;
        let cierresDia = part ? part.cierres : 0;
        let pegadoDia = part ? part.pegado : 0;
        let paseManoDados = part ? (part.paseManoDados || 0) : 0;
        let paseManoRecibidos = part ? (part.paseManoRecibidos || 0) : 0;
        let empatesPart = part ? (part.empatesParticipados || 0) : 0;
        let empatesGan = part ? (part.empatesGanados || 0) : 0;
        let patasPorEmpate = part ? (part.patasPorEmpate || 0) : 0;
        let color = coloresPosicion[(j.posicion-1) % coloresPosicion.length];
        let iconoGanador = '';
        if (j.jugadorId === ultimoGanadorId && ultimoGanadorId !== null) iconoGanador = '👑 ';
        else if (j.jugadorId === penultimoGanadorId && penultimoGanadorId !== null) iconoGanador = '🥈 ';
        let div = document.createElement('div'); div.className = 'tarjeta-jugador'; div.style.borderLeftColor = color;
        if(j.jugadorId) {
            div.innerHTML = `<div class="nombre" style="color:${color};">${iconoGanador}🪑 ${j.posicion} - ${j.nombre}</div>
                <div class="patas">${patas} 🦶</div>
                <div class="stats-mini">🚪${cierresDia} 🏃${pegadoDia} 🀰${capicuasDia} 🐔${pollonasDia} 🧤${forrosDia} 💧${aguasDia} 🎯${paseManoDados} 📥${paseManoRecibidos} ⚖️${empatesPart} 🏆⚖️${empatesGan} 🧩${patasPorEmpate}</div>
                <div class="botones-jugador">
                    <button class="btn-pata" data-id="${j.jugadorId}">🏆 Pata</button>
                    <button class="btn-forro" data-id="${j.jugadorId}">🧤 Forro</button>
                    <button class="btn-pm-dado" data-id="${j.jugadorId}">🎯 Da PM</button>
                </div>`;
        } else {
            div.innerHTML = `<div class="nombre" style="color:${color};">🪑 ${j.posicion} - Vacante</div>`;
        }
        jugadoresGrid.appendChild(div);
    }
    document.querySelectorAll('.btn-pata').forEach(b => b.onclick = () => { ganadorPendiente = parseInt(b.dataset.id); abrirModalTerminacion(); });
    document.querySelectorAll('.btn-forro').forEach(b => b.onclick = () => registrarForro(parseInt(b.dataset.id)));
    document.querySelectorAll('.btn-pm-dado').forEach(b => b.onclick = () => registrarPaseManoAutomatico(parseInt(b.dataset.id)));
}

// --- MODAL AGUA ---
const modalAgua = document.getElementById('modalAgua');
const checkAguaDiv = document.getElementById('checkAgua');
const confirmarAgua = document.getElementById('confirmarAgua');
const cancelarAgua = document.getElementById('cancelarAgua');

function mostrarModalAgua(jugadoresCandidatos, ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados) {
    if (!checkAguaDiv) {
        console.error("No se encontró el elemento checkAgua");
        const otroJugador = jugadoresCandidatos.find(j => j.jugadorId !== ganadorId);
        if (otroJugador) finalizarPataConAgua(ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados, otroJugador.jugadorId);
        return;
    }
    checkAguaDiv.innerHTML = '<p style="margin-bottom:0.5rem;">⚠️ Selecciona quién da AGUA (revolvió las fichas):</p>';
    let opciones = [];
    for (let j of jugadoresCandidatos) {
        if (j.jugadorId === ganadorId) continue;
        let label = document.createElement('label');
        label.style.display = 'block';
        label.style.margin = '0.3rem 0';
        label.style.padding = '0.3rem';
        label.style.borderRadius = '0.3rem';
        label.style.cursor = 'pointer';
        label.innerHTML = `<input type="radio" name="agua" value="${j.jugadorId}" style="margin-right:0.5rem;"> 🪑 ${j.posicion} - ${j.nombre}`;
        checkAguaDiv.appendChild(label);
        opciones.push(label);
    }
    if (opciones.length === 1) {
        const radio = opciones[0].querySelector('input');
        if (radio) radio.checked = true;
    }
    if (modalAgua) {
        modalAgua.style.display = 'flex';
    } else {
        console.error("Modal agua no encontrado en el DOM");
        const otroJugador = jugadoresCandidatos.find(j => j.jugadorId !== ganadorId);
        if (otroJugador) finalizarPataConAgua(ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados, otroJugador.jugadorId);
        return;
    }
    const confirmarHandler = () => {
        const seleccionado = document.querySelector('input[name="agua"]:checked');
        if (seleccionado) {
            const jugadorAguaId = parseInt(seleccionado.value);
            modalAgua.style.display = 'none';
            finalizarPataConAgua(ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados, jugadorAguaId);
            confirmarAgua.removeEventListener('click', confirmarHandler);
            cancelarAgua.removeEventListener('click', cancelarHandler);
        } else mostrarAlerta('Selecciona quién da agua', '⚠️ Agua', 'error');
    };
    const cancelarHandler = () => {
        modalAgua.style.display = 'none';
        confirmarAgua.removeEventListener('click', confirmarHandler);
        cancelarAgua.removeEventListener('click', cancelarHandler);
        ganadorPendiente = null;
    };
    confirmarAgua.removeEventListener('click', confirmarHandler);
    cancelarAgua.removeEventListener('click', cancelarHandler);
    confirmarAgua.addEventListener('click', confirmarHandler);
    cancelarAgua.addEventListener('click', cancelarHandler);
}

async function verificarFinMach(ganadorId) {
    let patasGanador = estadoMachActual.patasActuales.get(ganadorId);
    if(patasGanador >= 5) {
        let ganadorNombre = jugadoresActuales.find(j=>j.jugadorId===ganadorId).nombre;
        let esPollona = true;
        for(let j of jugadoresActuales) if(j.jugadorId && j.jugadorId !== ganadorId && (estadoMachActual.patasActuales.get(j.jugadorId) || 0) > 0) esPollona = false;
        let participantesMach = [];
        for(let j of jugadoresActuales) participantesMach.push({ jugadorId: j.jugadorId, nombre: j.nombre || `Silla ${j.posicion} Vacía`, patasFinales: j.jugadorId ? (estadoMachActual.patasActuales.get(j.jugadorId) || 0) : 0 });
        const machId = generarNuevoId(almacenamiento.machs);
        almacenamiento.machs.push({ 
            id: machId, 
            diaId: diaActivo.id, 
            numeroMach: estadoMachActual.numero, 
            fechaHora: new Date().toISOString(),
            fechaHoraInicio: estadoMachActual.fechaHoraInicio,
            ganadorId, 
            participantes: participantesMach, 
            manos: JSON.parse(JSON.stringify(estadoMachActual.historialManos)) 
        });
        for(let j of jugadoresActuales) {
            if(!j.jugadorId) continue;
            let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === j.jugadorId);
            if(part) {
                let patasNetasMach = estadoMachActual.patasActuales.get(j.jugadorId) || 0;
                let forrosMach = estadoMachActual.historialManos.filter(m => m.tipo === 'forro' && m.jugadorId === j.jugadorId).length;
                let aguasMach = estadoMachActual.historialManos.filter(m => m.tipo === 'agua' && m.jugadorId === j.jugadorId).length;
                let capicuasMach = estadoMachActual.historialManos.filter(m => m.tipo === 'capicua' && m.jugadorId === j.jugadorId).length;
                let cierresMach = estadoMachActual.historialManos.filter(m => m.tipo === 'cierre' && m.jugadorId === j.jugadorId).length;
                let pegadoMach = estadoMachActual.historialManos.filter(m => m.tipo === 'pegado' && m.jugadorId === j.jugadorId).length;
                let paseManoDadosMach = estadoMachActual.historialManos.filter(m => (m.tipo === 'paseManoDado' || m.tipo === 'paseMano') && m.jugadorId === j.jugadorId).length;
                let paseManoRecibidosMach = estadoMachActual.historialManos.filter(m => (m.tipo === 'paseManoRecibido' || (m.tipo === 'paseMano' && m.receptorId === j.jugadorId))).length;
                let nuevosMachs = (j.jugadorId === ganadorId) ? 1 : 0;
                part.machsGanados += nuevosMachs;
                part.patasNetas += patasNetasMach;
                part.forros = (part.forros || 0) + forrosMach;
                part.aguas = (part.aguas || 0) + aguasMach;
                part.capicuas = (part.capicuas || 0) + capicuasMach;
                part.cierres = (part.cierres || 0) + cierresMach;
                part.pegado = (part.pegado || 0) + pegadoMach;
                part.paseManoDados = (part.paseManoDados || 0) + paseManoDadosMach;
                part.paseManoRecibidos = (part.paseManoRecibidos || 0) + paseManoRecibidosMach;
                if(j.jugadorId === ganadorId && esPollona) part.pollonas = (part.pollonas || 0) + 1;
            }
        }
        guardarTodoEnLocalStorage();
        const ganadorMachMsg = document.getElementById('ganadorMachMsg');
        if(ganadorMachMsg) ganadorMachMsg.innerText = `🎉 ¡MACH para ${ganadorNombre} con ${patasGanador} patas!${esPollona ? ' 🐔 ¡POLLONA!' : ''}`;
        estadoMachActual.numero++;
        estadoMachActual.fechaHoraInicio = new Date().toISOString();
        estadoMachActual.patasActuales.clear();
        jugadoresActuales.forEach(j => { if(j.jugadorId) estadoMachActual.patasActuales.set(j.jugadorId, 0); });
        estadoMachActual.historialManos = [];
        estadoMachActual.empatePendiente = null;
        estadoMachActual.empateMultiplicador = 0;
        estadoMachActual.jugadorQueSale = null;
        ultimaJugadaFueAgua = false;
        renderizarJugadores();
        const numMachActualSpan = document.getElementById('numMachActual');
        const fechaMostrada = document.getElementById('fechaMostrada');
        if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
        if(fechaMostrada && diaActivo) fechaMostrada.innerText = `📅 ${formatearFechaDDMMYYYY(diaActivo.fecha)}  |  Mach #${estadoMachActual.numero}`;
        setTimeout(() => { if(ganadorMachMsg) ganadorMachMsg.innerText = ''; }, 4000);
    }
    guardarSesionCompleta();
}

// ==================== FUNCIONES AUXILIARES ADICIONALES ====================
function agregarBotonVolverSuperior() {
    const filtrosDiv = document.querySelector('#vistaEstadisticas .filtros');
    if (!filtrosDiv) return;
    if (document.getElementById('volverInicioStatsTop')) return;
    const btnVolverTop = document.createElement('button');
    btnVolverTop.id = 'volverInicioStatsTop';
    btnVolverTop.className = 'secundario';
    btnVolverTop.innerHTML = '← Volver al juego';
    btnVolverTop.onclick = () => {
        if (diaActivo) {
            document.getElementById('vistaEstadisticas').style.display = 'none';
            document.getElementById('vistaJuego').style.display = 'block';
        } else {
            document.getElementById('vistaEstadisticas').style.display = 'none';
            document.getElementById('vistaConfig').style.display = 'block';
        }
    };
    filtrosDiv.appendChild(btnVolverTop);
}

function agregarBotonGraficasYHistorial() {
    const forzarBotonGraficas = () => {
        const btn = document.getElementById('btnGraficasConfig');
        if (btn) {
            const nuevoBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(nuevoBtn, btn);
            nuevoBtn.onclick = function(e) {
                e.preventDefault();
                console.log("🖱️ Botón de gráficas pulsado");
                sessionStorage.setItem('viniendoDeGraficas', 'true');
                window.location.href = 'estadisticas_graficas.html';
                return false;
            };
            console.log("✅ Botón de gráficas configurado correctamente");
            return true;
        }
        return false;
    };
    if (!forzarBotonGraficas()) {
        let intentos = 0;
        const intervalo = setInterval(() => {
            intentos++;
            if (forzarBotonGraficas() || intentos > 50) {
                clearInterval(intervalo);
                if (intentos > 50) console.log("❌ No se pudo configurar el botón de gráficas");
            }
        }, 100);
    }
    const accionesGlobales = document.querySelector('.acciones-globales');
    if (accionesGlobales && !document.getElementById('btnHistorial')) {
        const btnHistorial = document.createElement('button');
        btnHistorial.id = 'btnHistorial';
        btnHistorial.className = 'secundario';
        btnHistorial.innerHTML = '📜 Historial';
        btnHistorial.onclick = mostrarHistorialGanadores;
        const statsDiaBtn = document.getElementById('btnStatsEnJuego');
        if (statsDiaBtn && statsDiaBtn.previousSibling) {
            accionesGlobales.insertBefore(btnHistorial, statsDiaBtn);
        } else {
            accionesGlobales.appendChild(btnHistorial);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FUNCIÓN GLOBAL PARA GRÁFICAS ====================
window.abrirGraficas = function() {
    console.log("🖱️ Abriendo gráficas desde función global");
    sessionStorage.setItem('viniendoDeGraficas', 'true');
    window.location.href = 'estadisticas_graficas.html';
};

function abrirAnalisis() {
    sessionStorage.setItem('viniendoDeAnalisis', 'true');
    window.location.href = 'analisis_jugador.html';
}

// ==================== EVENTO PRINCIPAL ====================
window.onload = () => {
    console.log("🚀 Iniciando Dominó Pintintín v6.0.6 (CORREGIDA)");
    cargarTodoDesdeLocalStorage();
    validarConsistenciaMachs();
    const btnAnalisis = document.getElementById('btnAnalisisRendimiento');
    if (btnAnalisis) btnAnalisis.onclick = abrirAnalisis;
    
    const confirmarEmpateBtn = document.getElementById('confirmarEmpate');
    const cancelarEmpateBtn = document.getElementById('cancelarEmpate');
    if (confirmarEmpateBtn) confirmarEmpateBtn.onclick = confirmarEmpateSeleccionado;
    if (cancelarEmpateBtn) cancelarEmpateBtn.onclick = () => {
        const modalEmpate = document.getElementById('modalEmpate');
        if(modalEmpate) modalEmpate.style.display = 'none';
    };
    
    const volviendoDeGraficas = sessionStorage.getItem('volviendoDeGraficas');
    if (volviendoDeGraficas === 'true') {
        sessionStorage.removeItem('volviendoDeGraficas');
        if (cargarSesionCompleta() && diaActivo) {
            cargarVistaJuego();
            reasignarTodosLosEventos();
        } else {
            document.getElementById('vistaConfig').style.display = 'block';
            document.getElementById('vistaJuego').style.display = 'none';
            document.getElementById('vistaEstadisticas').style.display = 'none';
        }
    } else if (hayPartidaGuardada()) {
        if (cargarSesionCompleta() && diaActivo && jugadoresActuales.length > 0) {
            cargarVistaJuego();
            reasignarTodosLosEventos();
        } else {
            document.getElementById('vistaConfig').style.display = 'block';
            document.getElementById('vistaJuego').style.display = 'none';
            document.getElementById('vistaEstadisticas').style.display = 'none';
        }
    } else {
        document.getElementById('vistaConfig').style.display = 'block';
        document.getElementById('vistaJuego').style.display = 'none';
        document.getElementById('vistaEstadisticas').style.display = 'none';
    }
    const fechaDiaInput = document.getElementById('fechaDia');
    if (fechaDiaInput && !fechaDiaInput.value) fechaDiaInput.value = getFechaLocalISO();
    renderInputsJugadores();
    actualizarDatalistJugadores();
    actualizarColorBotonSorteo();
    iniciarDeteccionAccesoAdmin();
    inicializarFiltrosEstadisticasGlobales();
    const btnSortearEIniciar = document.getElementById('btnSortearEIniciar');
    const btnGestionJugador = document.getElementById('btnGestionJugador');
    const btnRetirarJugador = document.getElementById('btnRetirarJugador');
    const btnCerrarDia = document.getElementById('btnCerrarDia');
    const btnStatsEnJuego = document.getElementById('btnStatsEnJuego');
    const btnEstadisticasGlobalesJuego = document.getElementById('btnEstadisticasGlobalesJuego');
    const irAEstadisticas = document.getElementById('irAEstadisticas');
    const btnBorrarTodo = document.getElementById('btnBorrarTodo');
    const btnExportarBackup = document.getElementById('btnExportarBackup');
    const importBackupInput = document.getElementById('importBackupInput');
    const btnEmpate = document.getElementById('btnEmpate');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnExportarCSV = document.getElementById('btnExportarCSV');
    const btnExportarPDF = document.getElementById('btnExportarPDF');
    const volverInicioStats = document.getElementById('volverInicioStats');
    const btnAyuda = document.getElementById('btnAyuda');
    const cerrarAyuda = document.getElementById('cerrarAyuda');
    const modalAyuda = document.getElementById('modalAyuda');
    const contenidoAyuda = document.getElementById('contenidoAyuda');
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    const terminacionCierre = document.getElementById('terminacionCierre');
    const terminacionPegado = document.getElementById('terminacionPegado');
    const terminacionCapicua = document.getElementById('terminacionCapicua');
    const cancelarTerminacion = document.getElementById('cancelarTerminacion');
    const btnTransponer = document.getElementById('btnTransponer');
    const btnVerMachsPorDia = document.getElementById('btnVerMachsPorDia');
    const btnGraficasConfig = document.getElementById('btnGraficasConfig');
    const chkMantenerUbicacion = document.getElementById('mantenerUbicacion');
    if (chkMantenerUbicacion) chkMantenerUbicacion.addEventListener('change', actualizarColorBotonSorteo);
    if (btnGraficasConfig) btnGraficasConfig.onclick = window.abrirGraficas;
    if (btnVerMachsPorDia) btnVerMachsPorDia.onclick = () => { window.location.href = 'ver_machs_por_dia.html'; };
    if(btnSortearEIniciar) btnSortearEIniciar.onclick = sortearEIniciar;
    if(btnGestionJugador) btnGestionJugador.onclick = gestionarJugador;
    if(btnRetirarJugador) btnRetirarJugador.onclick = retirarJugador;
    if(btnCerrarDia) btnCerrarDia.onclick = () => { if(diaActivo) mostrarModalCerrarDia(); };
    if(btnStatsEnJuego) btnStatsEnJuego.onclick = mostrarEstadisticasDelDia;
    if(btnEstadisticasGlobalesJuego) btnEstadisticasGlobalesJuego.onclick = () => {
        if(!diaActivo) return mostrarAlerta('Inicia un día primero', '⚠️ Atención', 'error');
        inicializarFiltrosEstadisticasGlobales();
        const { desde, hasta } = getFechasDesdeHastaInput();
        cargarEstadisticasGlobales(desde, hasta);
        document.getElementById('vistaJuego').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='block';
        const titulo = document.querySelector('#vistaEstadisticas h2'); if(titulo) titulo.innerHTML = '📊 Estadísticas Globales';
        agregarBotonVolverSuperior();
    };
    if(irAEstadisticas) irAEstadisticas.onclick = () => {
        inicializarFiltrosEstadisticasGlobales();
        const { desde, hasta } = getFechasDesdeHastaInput();
        cargarEstadisticasGlobales(desde, hasta);
        document.getElementById('vistaConfig').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='block';
        const titulo = document.querySelector('#vistaEstadisticas h2'); if(titulo) titulo.innerHTML = '📊 Estadísticas Globales';
        agregarBotonVolverSuperior();
    };
    if(volverInicioStats) volverInicioStats.onclick = () => {
        if(diaActivo) { document.getElementById('vistaEstadisticas').style.display='none'; document.getElementById('vistaJuego').style.display='block'; }
        else { document.getElementById('vistaEstadisticas').style.display='none'; document.getElementById('vistaConfig').style.display='block'; }
    };
    if(btnFiltrar) btnFiltrar.onclick = () => {
        const { desde, hasta } = getFechasDesdeHastaInput();
        cargarEstadisticasGlobales(desde, hasta);
        agregarBotonVolverSuperior();
    };
    if(btnBorrarTodo) btnBorrarTodo.onclick = () => { 
        mostrarPrompt('Contraseña para borrar todos los datos:', '⚠️ Confirmación', '').then(pass => {
            if(pass === "pintintin") { 
                localStorage.clear(); 
                mostrarAlerta('Datos borrados. Recargando la página...', '✅ Completado', 'exito');
                setTimeout(() => window.location.reload(), 2000);
            } else if(pass !== null) {
                mostrarAlerta('Contraseña incorrecta', '❌ Error', 'error');
            }
        });
    };
    if(btnExportarBackup) btnExportarBackup.onclick = exportarBackupManual;
    if(importBackupInput) importBackupInput.onchange = (e) => { if(e.target.files.length) importarBackup(e.target.files[0]); };
    if(btnExportarCSV) btnExportarCSV.onclick = () => { 
        let csv = "Fecha,Mach,Ganador\n"; 
        for(let m of almacenamiento.machs) { 
            const dia = almacenamiento.dias.find(d=>d.id===m.diaId); 
            let ganador = m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre || '?'; 
            csv += `${dia ? formatearFechaDDMMYYYY(dia.fecha) : '?'},${m.numeroMach},${ganador}\n`; 
        } 
        let blob = new Blob([csv], {type:'text/csv'}); 
        let a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = 'pintintin_stats.csv'; 
        a.click();
        mostrarToast("CSV exportado correctamente", "exito");
    };
    if(btnExportarPDF && window.jspdf) btnExportarPDF.onclick = exportarPDFGlobales;
    if(btnEmpate) btnEmpate.onclick = procesarEmpate;
    if(terminacionCierre) terminacionCierre.onclick = () => aplicarModalTerminacion('cierre');
    if(terminacionPegado) terminacionPegado.onclick = () => aplicarModalTerminacion('pegado');
    if(terminacionCapicua) terminacionCapicua.onclick = () => aplicarModalTerminacion('capicua');
    if(cancelarTerminacion) cancelarTerminacion.onclick = () => { cerrarModalTerminacion(); ganadorPendiente = null; };
    if(btnAyuda) {
        btnAyuda.onclick = () => {
            if(modalAyuda) {
                if(contenidoAyuda) {
                    contenidoAyuda.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando manual...</div>';
                    fetch('manual_pintintin.html')
                        .then(response => response.text())
                        .then(html => {
                            contenidoAyuda.innerHTML = html;
                            const links = contenidoAyuda.querySelectorAll('a[href="#"]');
                            links.forEach(link => {
                                const onclickAttr = link.getAttribute('onclick');
                                if (onclickAttr) {
                                    const idMatch = onclickAttr.match(/scrollToSection\('([^']+)'\)/);
                                    if (idMatch) {
                                        const id = idMatch[1];
                                        link.onclick = (e) => {
                                            e.preventDefault();
                                            const target = contenidoAyuda.querySelector(`#${id}`);
                                            if (target) target.scrollIntoView({ behavior: 'smooth' });
                                        };
                                    }
                                }
                            });
                        })
                        .catch(err => {
                            console.error('Error cargando manual:', err);
                            contenidoAyuda.innerHTML = '<div style="text-align:center; padding:2rem; color:red;">❌ Error al cargar el manual. Verifica tu conexión.</div>';
                        });
                }
                modalAyuda.style.display = 'flex';
                if(contenidoAyuda) contenidoAyuda.scrollTop = 0;
            }
        };
    }
    if(cerrarAyuda) cerrarAyuda.onclick = () => { if(modalAyuda) modalAyuda.style.display = 'none'; };
    if(modalAyuda) modalAyuda.onclick = (e) => { if (e.target === modalAyuda) modalAyuda.style.display = 'none'; };
    if(btnTransponer) {
        btnTransponer.onclick = alternarTablaTranspuesta;
        btnTransponer.style.display = 'inline-block';
        btnTransponer.style.background = '#8b5cf6';
        btnTransponer.style.color = 'white';
        btnTransponer.style.padding = '0.5rem 1rem';
        btnTransponer.style.borderRadius = '0.5rem';
        btnTransponer.style.cursor = 'pointer';
        btnTransponer.style.fontWeight = 'bold';
        btnTransponer.innerHTML = tablaTranspuesta ? '🔄 Modo Normal (filas)' : '🔄 Intercambiar (columnas)';
    }
    agregarBotonGraficasYHistorial();
};
