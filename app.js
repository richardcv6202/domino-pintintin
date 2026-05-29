// ==================== DOMINÓ PINTINTÍN - VERSIÓN 4.0 FINAL ====================
// Creado por Ricardo Castillo (Richard) - La Demajagua, Isla de la Juventud, Cuba
// CORRECCIONES: Manual completo en ayuda, botón superior "Volver al juego" en estadísticas
console.log("🎲 Dominó Pintintín - Versión 4.0 FINAL: Manual completo, botón superior en estadísticas");

// --- CONFIGURACIÓN INICIAL ---
let diaActivo = null;
let jugadoresActuales = [];
let estadoMachActual = { numero: 1, patasActuales: new Map(), empatePendiente: null, historialManos: [] };
let almacenamiento = { jugadores: [], dias: [], participaciones: [], machs: [] };
let ganadorPendiente = null;
let ultimaJugadaFueAgua = false;

// Preferencia para tablas transpuestas (false = normal, true = transpuesta)
let tablaTranspuesta = false;

// Colores para cada posición
const coloresPosicion = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

// --- FUNCIONES DE PERSISTENCIA ---
function guardarTodoEnLocalStorage() {
    localStorage.setItem('pintintin_jugadores', JSON.stringify(almacenamiento.jugadores));
    localStorage.setItem('pintintin_dias', JSON.stringify(almacenamiento.dias));
    localStorage.setItem('pintintin_participaciones', JSON.stringify(almacenamiento.participaciones));
    localStorage.setItem('pintintin_machs', JSON.stringify(almacenamiento.machs));
    localStorage.setItem('pintintin_preferencia', JSON.stringify({ tablaTranspuesta: tablaTranspuesta }));
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
    }
}

function guardarSesionCompleta() {
    const sesion = {
        diaActivo: diaActivo,
        jugadoresActuales: jugadoresActuales,
        estadoMachActual: {
            numero: estadoMachActual.numero,
            patasActuales: Array.from(estadoMachActual.patasActuales.entries()),
            empatePendiente: estadoMachActual.empatePendiente,
            historialManos: estadoMachActual.historialManos
        }
    };
    localStorage.setItem('sesionPintintinV2', JSON.stringify(sesion));
}

function cargarSesionCompleta() {
    const sesionGuardada = localStorage.getItem('sesionPintintinV2');
    if (!sesionGuardada) return false;
    const data = JSON.parse(sesionGuardada);
    if (!data.diaActivo) return false;
    const diaExiste = almacenamiento.dias.find(d => d.id === data.diaActivo.id && d.activo === 1);
    if (!diaExiste) return false;
    diaActivo = data.diaActivo;
    jugadoresActuales = data.jugadoresActuales;
    estadoMachActual = {
        numero: data.estadoMachActual.numero,
        patasActuales: new Map(data.estadoMachActual.patasActuales),
        empatePendiente: data.estadoMachActual.empatePendiente,
        historialManos: data.estadoMachActual.historialManos
    };
    return true;
}

function limpiarSesionCompleta() {
    localStorage.removeItem('sesionPintintinV2');
}

// --- RESPALDO AUTOMÁTICO ---
function getDiaSemanaAbreviatura() {
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return dias[new Date().getDay()];
}

function formatearFechaParaNombre() {
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
    const nombreArchivo = `Pinti_v40_${getDiaSemanaAbreviatura()}.json`;
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
}

async function exportarBackupManual() {
    const data = { jugadores: almacenamiento.jugadores, dias: almacenamiento.dias, participaciones: almacenamiento.participaciones, machs: almacenamiento.machs, fecha: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const link = document.createElement('a');
    const nombreArchivo = `Pinti_v40_${formatearFechaParaNombre()}.json`;
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
            almacenamiento = { jugadores: data.jugadores || [], dias: data.dias || [], participaciones: data.participaciones || [], machs: data.machs || [] };
            guardarTodoEnLocalStorage();
            alert("Respaldo importado. Recargando...");
            window.location.reload();
        } catch (error) { alert("Archivo inválido"); }
    };
    reader.readAsText(file);
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

// --- FUNCIONES AUXILIARES ---
function obtenerOJugador(nombre) {
    nombre = nombre.trim();
    let existente = almacenamiento.jugadores.find(j => j.nombre.toLowerCase() === nombre.toLowerCase());
    if (existente) return existente;
    const nuevoId = almacenamiento.jugadores.length + 1;
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

// --- AUTOCOMPLETADO DE NOMBRES ---
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

// --- FUNCIÓN PARA VERIFICAR SI HAY PARTIDA GUARDADA ---
function hayPartidaGuardada() {
    const sesionGuardada = localStorage.getItem('sesionPintintinV2');
    if (!sesionGuardada) return false;
    const data = JSON.parse(sesionGuardada);
    return (data.diaActivo && data.jugadoresActuales && data.jugadoresActuales.some(j => j.jugadorId !== null));
}

function actualizarColorBotonSorteo() {
    const btn = document.getElementById('btnSortearEIniciar');
    if (!btn) return;
    let nombresIngresados = 0;
    for (let i = 1; i <= 4; i++) {
        let n = document.getElementById(`jugador${i}`)?.value.trim();
        if (n && n !== "") nombresIngresados++;
    }
    if (nombresIngresados >= 2) {
        btn.style.background = "#8b5cf6";
        btn.textContent = "🎲 Sortear sillas e iniciar";
    } 
    else if (hayPartidaGuardada()) {
        btn.style.background = "#10b981";
        btn.textContent = "🎲 Continuar partida guardada";
    } 
    else {
        btn.style.background = "#8b5cf6";
        btn.textContent = "🎲 Sortear sillas e iniciar";
    }
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
    if(btnRetirar) {
        btnRetirar.style.display = (jugadoresActivos >= 3) ? "block" : "none";
    }
}

// --- GESTIÓN DE JUGADORES ---
async function gestionarJugador() {
    if(!diaActivo) { alert("Primero inicia un día"); return; }
    const jugadoresActivos = contarJugadoresActivos();
    const vacantes = obtenerSillasVacantes();
    
    if(jugadoresActivos < 4 && vacantes.length > 0) {
        const nuevoNombre = prompt("📝 Nombre del nuevo jugador:");
        if(!nuevoNombre || nuevoNombre.trim() === "") return;
        const nombreExiste = jugadoresActuales.some(j => j.jugadorId !== null && j.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase());
        if(nombreExiste) { alert("Ya hay un jugador con ese nombre"); return; }
        const jug = obtenerOJugador(nuevoNombre);
        const indiceAleatorio = Math.floor(Math.random() * vacantes.length);
        const posicionElegida = vacantes[indiceAleatorio];
        const idx = jugadoresActuales.findIndex(j => j.posicion === posicionElegida);
        if(idx !== -1) {
            jugadoresActuales[idx] = { posicion: posicionElegida, jugadorId: jug.id, nombre: jug.nombre };
            const existeParticipacion = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jug.id);
            if(!existeParticipacion) {
                almacenamiento.participaciones.push({
                    id: almacenamiento.participaciones.length + 1,
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
            alert(`✅ ${jug.nombre} se ha unido en la Silla ${posicionElegida}`);
        }
    } else if(jugadoresActivos === 4) {
        let pos = prompt("Posición a sustituir (1-4):");
        if(!pos || pos<1 || pos>4) return;
        let nuevoNombre = prompt("Nombre del nuevo jugador:");
        if(!nuevoNombre || nuevoNombre.trim() === "") return;
        let idx = jugadoresActuales.findIndex(j => j.posicion === parseInt(pos));
        if(idx === -1) return;
        let jug = obtenerOJugador(nuevoNombre);
        jugadoresActuales[idx] = { posicion: parseInt(pos), jugadorId: jug.id, nombre: jug.nombre };
        let existe = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jug.id);
        if(!existe) {
            almacenamiento.participaciones.push({
                id: almacenamiento.participaciones.length+1,
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
        alert(`✅ ${jug.nombre} ocupa ahora la Silla ${pos}`);
    }
}

async function retirarJugador() {
    if(!diaActivo) { alert("Primero inicia un día"); return; }
    const jugadoresActivos = contarJugadoresActivos();
    if(jugadoresActivos <= 2) {
        alert("⚠️ No se puede retirar más jugadores. Mínimo 2 jugadores en la mesa.");
        return;
    }
    let mensaje = "Selecciona la posición del jugador que se retira:\n";
    for(let j of jugadoresActuales) if(j.jugadorId !== null) mensaje += `${j.posicion} - ${j.nombre}\n`;
    const posicion = prompt(mensaje);
    if(!posicion) return;
    const posInt = parseInt(posicion);
    if(isNaN(posInt) || posInt < 1 || posInt > 4) return;
    const idx = jugadoresActuales.findIndex(j => j.posicion === posInt && j.jugadorId !== null);
    if(idx === -1) return;
    const nombreRetirado = jugadoresActuales[idx].nombre;
    if(confirm(`⚠️ ¿Seguro que ${nombreRetirado} se retira de la partida?`)) {
        jugadoresActuales[idx] = { posicion: posInt, jugadorId: null, nombre: null };
        guardarTodoEnLocalStorage();
        guardarSesionCompleta();
        renderizarJugadores();
        actualizarVisibilidadBotones();
        alert(`👋 ${nombreRetirado} se ha retirado. Silla ${posInt} queda vacante.`);
    }
}

// ==================== PASE DE MANO AUTOMÁTICO (con sillas vacantes) ====================
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
        alert(`🎯 Pase de mano: ${nombreDador} → ${nombreRecibe}`);
    } else {
        estadoMachActual.historialManos.push({ tipo: 'paseManoDado', jugadorId: jugadorId, patasAfectadas: 0, timestamp: new Date().toISOString() });
        alert(`🎯 ${jugadoresActuales.find(j=>j.jugadorId===jugadorId)?.nombre} dio el pase de mano (sin receptor)`);
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
            const fechaDesde = document.getElementById('fechaDesde');
            const fechaHasta = document.getElementById('fechaHasta');
            cargarEstadisticasGlobales(fechaDesde ? fechaDesde.value : '', fechaHasta ? fechaHasta.value : '');
        }
    }
}

// --- SORTEO DE POSICIONES ---
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
    let nombresIngresados = 0;
    for (let i = 1; i <= 4; i++) {
        let n = document.getElementById(`jugador${i}`)?.value.trim();
        if (n && n !== "") nombresIngresados++;
    }
    
    if (nombresIngresados >= 2) {
        limpiarSesionCompleta();
        actualizarColorBotonSorteo();
        
        const fechaDiaInput = document.getElementById('fechaDia');
        const fecha = fechaDiaInput ? fechaDiaInput.value : '';
        if (!fecha) { alert("Selecciona fecha"); return; }
        let nombres = [];
        for (let i=1; i<=4; i++) {
            let n = document.getElementById(`jugador${i}`).value.trim();
            nombres.push(n || null);
        }
        const jugadoresValidos = nombres.filter(n => n !== null);
        if(jugadoresValidos.length < 2) { alert("Debe haber al menos 2 jugadores"); return; }
        if(new Set(jugadoresValidos.map(s=>s.toLowerCase())).size !== jugadoresValidos.length) { alert("Los nombres no pueden repetirse"); return; }
        
        let jugadoresDados = jugadoresValidos.map(n => ({nombre:n, dado:tirarDado()}));
        let ordenFinal = resolverEmpates(jugadoresDados);
        let sillas = [1, 2, 3, 4];
        for(let i = sillas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sillas[i], sillas[j]] = [sillas[j], sillas[i]];
        }
        let posicionesMap = new Map();
        for(let i = 0; i < ordenFinal.length; i++) {
            const sillaAsignada = sillas[i];
            const jugador = ordenFinal[i];
            const jug = obtenerOJugador(jugador.nombre);
            posicionesMap.set(sillaAsignada, { jugadorId: jug.id, nombre: jug.nombre });
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
        
        const diaId = almacenamiento.dias.length + 1;
        almacenamiento.dias.push({ id: diaId, fecha, activo: 1 });
        diaActivo = { id: diaId, fecha };
        for(let j of jugadoresPos) {
            if(j.jugadorId) {
                almacenamiento.participaciones.push({ 
                    id: almacenamiento.participaciones.length+1, diaId, jugadorId: j.jugadorId, 
                    machsGanados:0, patasNetas:0, aguas:0, forros:0,
                    pollonas:0, capicuas:0, cierres:0, pegado:0,
                    paseManoDados:0, paseManoRecibidos:0,
                    empatesParticipados:0, empatesGanados:0, empatesAcumulados:0,
                    patasPorEmpate:0
                });
            }
        }
        jugadoresActuales = jugadoresPos;
        estadoMachActual = { numero:1, patasActuales: new Map(), empatePendiente: null, historialManos:[] };
        jugadoresActuales.forEach(j => { if(j.jugadorId) estadoMachActual.patasActuales.set(j.jugadorId, 0); });
        ultimaJugadaFueAgua = false;
        guardarTodoEnLocalStorage();
        guardarSesionCompleta();
        actualizarColorBotonSorteo();
        cargarVistaJuego();
        return;
    }
    
    const sesionGuardada = localStorage.getItem('sesionPintintinV2');
    if (sesionGuardada && !diaActivo) {
        const data = JSON.parse(sesionGuardada);
        if (data.diaActivo && data.jugadoresActuales && data.jugadoresActuales.some(j => j.jugadorId !== null)) {
            const continuar = confirm("🔄 Se encontró una partida guardada. ¿Quieres continuar donde la dejaste?");
            if (continuar) {
                await cargarSesionCompleta();
                if (diaActivo) {
                    cargarVistaJuego();
                    return;
                }
            } else {
                limpiarSesionCompleta();
                actualizarColorBotonSorteo();
            }
        }
    }
    
    if (diaActivo) {
        const continuar = confirm("⚠️ Ya hay una partida en curso. ¿Comenzar una nueva? Se perderá el progreso actual.");
        if (!continuar) return;
        limpiarSesionCompleta();
        actualizarColorBotonSorteo();
    }
    
    const fechaDiaInput = document.getElementById('fechaDia');
    const fecha = fechaDiaInput ? fechaDiaInput.value : '';
    if (!fecha) { alert("Selecciona fecha"); return; }
    let nombres = [];
    for (let i=1; i<=4; i++) {
        let n = document.getElementById(`jugador${i}`).value.trim();
        nombres.push(n || null);
    }
    const jugadoresValidos = nombres.filter(n => n !== null);
    if(jugadoresValidos.length < 2) { alert("Debe haber al menos 2 jugadores"); return; }
    if(new Set(jugadoresValidos.map(s=>s.toLowerCase())).size !== jugadoresValidos.length) { alert("Los nombres no pueden repetirse"); return; }
    
    let jugadoresDados = jugadoresValidos.map(n => ({nombre:n, dado:tirarDado()}));
    let ordenFinal = resolverEmpates(jugadoresDados);
    let sillas = [1, 2, 3, 4];
    for(let i = sillas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sillas[i], sillas[j]] = [sillas[j], sillas[i]];
    }
    let posicionesMap = new Map();
    for(let i = 0; i < ordenFinal.length; i++) {
        const sillaAsignada = sillas[i];
        const jugador = ordenFinal[i];
        const jug = obtenerOJugador(jugador.nombre);
        posicionesMap.set(sillaAsignada, { jugadorId: jug.id, nombre: jug.nombre });
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
    
    const diaId = almacenamiento.dias.length + 1;
    almacenamiento.dias.push({ id: diaId, fecha, activo: 1 });
    diaActivo = { id: diaId, fecha };
    for(let j of jugadoresPos) {
        if(j.jugadorId) {
            almacenamiento.participaciones.push({ 
                id: almacenamiento.participaciones.length+1, diaId, jugadorId: j.jugadorId, 
                machsGanados:0, patasNetas:0, aguas:0, forros:0,
                pollonas:0, capicuas:0, cierres:0, pegado:0,
                paseManoDados:0, paseManoRecibidos:0,
                empatesParticipados:0, empatesGanados:0, empatesAcumulados:0,
                patasPorEmpate:0
            });
        }
    }
    jugadoresActuales = jugadoresPos;
    estadoMachActual = { numero:1, patasActuales: new Map(), empatePendiente: null, historialManos:[] };
    jugadoresActuales.forEach(j => { if(j.jugadorId) estadoMachActual.patasActuales.set(j.jugadorId, 0); });
    ultimaJugadaFueAgua = false;
    guardarTodoEnLocalStorage();
    guardarSesionCompleta();
    actualizarColorBotonSorteo();
    cargarVistaJuego();
}

// --- VISTAS ---
function cargarVistaJuego() {
    const vistaConfig = document.getElementById('vistaConfig');
    const vistaJuego = document.getElementById('vistaJuego');
    const vistaEstadisticas = document.getElementById('vistaEstadisticas');
    vistaConfig.style.display = 'none'; 
    vistaJuego.style.display = 'block'; 
    vistaEstadisticas.style.display = 'none';
    const fechaMostrada = document.getElementById('fechaMostrada');
    const numMachActualSpan = document.getElementById('numMachActual');
    if(fechaMostrada) fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
    if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
    renderizarJugadores();
    actualizarAvisoEmpate();
    actualizarVisibilidadBotones();
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
        let div = document.createElement('div'); div.className = 'tarjeta-jugador'; div.style.borderLeftColor = color;
        if(j.jugadorId) {
            div.innerHTML = `<div class="nombre" style="color:${color};">🪑 ${j.posicion} - ${j.nombre}</div>
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
        if (otroJugador) {
            finalizarPataConAgua(ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados, otroJugador.jugadorId);
        }
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
        if (otroJugador) {
            finalizarPataConAgua(ganadorId, formaTerminacion, patasAApuntar, empatesAcumulados, otroJugador.jugadorId);
        }
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
        } else {
            alert("Selecciona quién da agua");
        }
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

function finalizarPataConAgua(ganadorId, forma, patasAApuntar, empatesAcumulados, jugadorAguaId) {
    let partGanador = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === ganadorId);
    
    if (empatesAcumulados > 0 && partGanador) {
        partGanador.empatesGanados = (partGanador.empatesGanados || 0) + 1;
        let patasBase = (forma === 'capicua') ? 2 : 1;
        let patasExtra = patasAApuntar - patasBase;
        partGanador.patasPorEmpate = (partGanador.patasPorEmpate || 0) + patasExtra;
    }
    
    if (estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        estadoMachActual.empatePendiente = null;
        actualizarAvisoEmpate();
    }
    
    let actual = estadoMachActual.patasActuales.get(ganadorId) || 0;
    estadoMachActual.patasActuales.set(ganadorId, actual + patasAApuntar);
    estadoMachActual.historialManos.push({ tipo: forma, jugadorId: ganadorId, patasAfectadas: patasAApuntar, timestamp: new Date().toISOString() });
    
    if (partGanador) { 
        if (forma === 'capicua') partGanador.capicuas = (partGanador.capicuas || 0) + 1; 
        else if (forma === 'cierre') partGanador.cierres = (partGanador.cierres || 0) + 1; 
        else if (forma === 'pegado') partGanador.pegado = (partGanador.pegado || 0) + 1; 
    }
    
    // Registrar agua
    let partAgua = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorAguaId);
    if (partAgua) {
        partAgua.aguas = (partAgua.aguas || 0) + 1;
    }
    estadoMachActual.historialManos.push({ tipo: 'agua', jugadorId: jugadorAguaId, patasAfectadas: 0, timestamp: new Date().toISOString() });
    
    // Reiniciar empates acumulados
    for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) {
        part.empatesAcumulados = 0;
    }
    
    ultimaJugadaFueAgua = true;
    
    guardarTodoEnLocalStorage();
    renderizarJugadores();
    let tempGanador = ganadorId;
    ganadorPendiente = null;
    verificarFinMach(tempGanador);
}

// --- MODAL TERMINACIÓN ---
const modalTerminacion = document.getElementById('modalTerminacion');
const terminacionInfo = document.getElementById('terminacionInfo');

function abrirModalTerminacion() {
    if(!ganadorPendiente) return;
    const ganadorNombre = jugadoresActuales.find(j => j.jugadorId === ganadorPendiente)?.nombre;
    if(terminacionInfo) terminacionInfo.innerText = `Ganador: ${ganadorNombre}`;
    if(modalTerminacion) modalTerminacion.style.display = 'flex';
}

function cerrarModalTerminacion() { 
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
        if (jugadorAgua) {
            finalizarPataConAgua(ganadorPendiente, forma, patasAApuntar, empatesAcumulados, jugadorAgua.jugadorId);
        }
    } else {
        mostrarModalAgua(jugadoresActivosConSilla, ganadorPendiente, forma, patasAApuntar, empatesAcumulados);
    }
}

function actualizarAvisoEmpate() {
    const avisoEmpateDiv = document.getElementById('avisoEmpate');
    if(avisoEmpateDiv) {
        if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
            let nombres = estadoMachActual.empatePendiente.jugadoresIds.map(id => jugadoresActuales.find(j=>j.jugadorId===id)?.nombre).join(', ');
            avisoEmpateDiv.innerText = `⚠️ EMPATE entre: ${nombres}. Al ganar suma 2ⁿ patas (potencia de 2 según empates acumulados).`;
        } else avisoEmpateDiv.innerText = '';
    }
}

async function verificarFinMach(ganadorId) {
    let patasGanador = estadoMachActual.patasActuales.get(ganadorId);
    if(patasGanador >= 5) {
        let ganadorNombre = jugadoresActuales.find(j=>j.jugadorId===ganadorId).nombre;
        let esPollona = true;
        for(let j of jugadoresActuales) if(j.jugadorId && j.jugadorId !== ganadorId && (estadoMachActual.patasActuales.get(j.jugadorId) || 0) > 0) esPollona = false;
        let participantesMach = [];
        for(let j of jugadoresActuales) participantesMach.push({ jugadorId: j.jugadorId, nombre: j.nombre || `Silla ${j.posicion} Vacía`, patasFinales: j.jugadorId ? (estadoMachActual.patasActuales.get(j.jugadorId) || 0) : 0 });
        almacenamiento.machs.push({ id: almacenamiento.machs.length+1, diaId: diaActivo.id, numeroMach: estadoMachActual.numero, fechaHora: new Date().toISOString(), ganadorId, participantes: participantesMach, manos: JSON.parse(JSON.stringify(estadoMachActual.historialManos)) });
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
        estadoMachActual.patasActuales.clear(); 
        jugadoresActuales.forEach(j => { if(j.jugadorId) estadoMachActual.patasActuales.set(j.jugadorId, 0); }); 
        estadoMachActual.historialManos = []; 
        estadoMachActual.empatePendiente = null;
        ultimaJugadaFueAgua = false;
        renderizarJugadores();
        const numMachActualSpan = document.getElementById('numMachActual');
        const fechaMostrada = document.getElementById('fechaMostrada');
        if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
        if(fechaMostrada) fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
        setTimeout(() => { if(ganadorMachMsg) ganadorMachMsg.innerText = ''; }, 4000);
    }
    guardarSesionCompleta();
}

// --- FUNCIÓN DE ORDENAMIENTO DE JUGADORES ---
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

// ==================== FUNCIONES DE RENDERIZADO DE TABLAS ====================
function renderizarTablaNormal(stats, titulo) {
    if (!stats || stats.size === 0) {
        return `<div class="stats-container"><p class="stats-vacio">📭 No hay estadísticas registradas.</p></div>`;
    }
    
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
    
    const entries = Array.from(stats.entries());
    const sortedEntries = ordenarJugadoresPorPrioridad(entries);
    const nombres = sortedEntries.map(e => e[0]);
    const totalesPorMetrica = {};
    for (let metrica of metricas) {
        totalesPorMetrica[metrica.key] = 0;
        for (let nombre of nombres) totalesPorMetrica[metrica.key] += stats.get(nombre)[metrica.key] || 0;
    }
    let html = `<div class="stats-container"><div class="table-responsive"><table class="tabla-estadisticas"><thead><tr><th>Jugador</th>`;
    for (let metrica of metricas) html += `<th>${metrica.icono} ${metrica.nombre}</th>`;
    html += `</thead><tbody>`;
    for (let nombre of nombres) {
        html += `<tr><td><strong>${escapeHtml(nombre)}</strong></td>`;
        for (let metrica of metricas) html += `<td class="text-center">${stats.get(nombre)[metrica.key] || 0}</td>`;
        html += `</tr>`;
    }
    html += `<tr style="background:#f1f5f9; font-weight:bold;"><td><strong>📊 TOTALES</strong></td>`;
    for (let metrica of metricas) html += `<td class="text-center"><strong>${totalesPorMetrica[metrica.key]}</strong></td>`;
    html += `</tr></tbody></table></div>`;
    if (titulo) html += `<p class="stats-nota">⚡ ${titulo}</p>`;
    html += `</div>`;
    return html;
}

// Modo transpuesto: columna TOTAL al final (suma de cada fila)
function renderizarTablaTranspuesta(stats, titulo) {
    if (!stats || stats.size === 0) {
        return `<div class="stats-container"><p class="stats-vacio">📭 No hay estadísticas registradas.</p></div>`;
    }
    
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
    for (let nombre of nombres) {
        html += `<th>${escapeHtml(nombre)}</th>`;
    }
    html += `<th style="background:#f1f5f9;">📊 TOTAL</th>`;
    html += `</thead><tbody>`;
    
    for (let metrica of metricas) {
        html += `<tr>`;
        html += `<td><strong>${metrica.icono} ${metrica.nombre}</strong></td>`;
        for (let nombre of nombres) {
            let valor = stats.get(nombre)[metrica.key] || 0;
            html += `<td class="text-center">${valor}</td>`;
        }
        html += `<td class="text-center" style="background:#f1f5f9; font-weight:bold;">${totalesPorMetrica[metrica.key]}</td>`;
        html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    if (titulo) html += `<p class="stats-nota">⚡ ${titulo}</p>`;
    html += `</div>`;
    return html;
}

// Resumen general (modo normal y transpuesto)
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
        for (let nombre of nombres) {
            html += `<th>${escapeHtml(nombre)}</th>`;
        }
        html += `<th style="background:#f1f5f9;">📊 TOTAL</th>`;
        html += `</thead><tbody>`;
        
        for (let metrica of metricas) {
            html += `<tr>`;
            html += `<td><strong>${metrica.icono} ${metrica.nombre}</strong></td>`;
            for (let nombre of nombres) {
                let valor = statsTotales.get(nombre)[metrica.key] || 0;
                html += `<td class="text-center">${valor}</td>`;
            }
            html += `<td class="text-center" style="background:#f1f5f9; font-weight:bold;">${totalesPorMetrica[metrica.key]}</td>`;
            html += `</tr>`;
        }
        html += `</tbody><table>`;
    } else {
        // Modo normal: totales como fila al final
        html += `<table class="tabla-estadisticas"><thead>`;
        html += `<tr><th>Jugador</th><th>🏆 Machs</th><th>🦶 Patas</th><th>🐔 Pollonas</th><th>🀰 Capicuas</th><th>🚪 Cierres</th><th>🏃 Pegados</th><th>🧤 Forros</th><th>💧 Aguas</th><th>🎯 PM Dados</th><th>📥 PM Recibidos</th><th>⚖️ Empates</th><th>🏆⚖️ E. Ganados</th><th>🧩 Patas x Empate</th>`;
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
        html += `<tr style="background:#f1f5f9; font-weight:bold;"><td><strong>📊 TOTALES</strong></td>`;
        for (let metrica of metricas) html += `<td class="text-center"><strong>${totales[metrica.key]}</strong></td>`;
        html += `</tr></tbody></table>`;
    }
    html += `</div></div><br>`;
    return html;
}

// --- ESTADÍSTICAS DEL DÍA ---
function mostrarEstadisticasDelDia() {
    if (!diaActivo) return alert('Inicia un día primero');
    let machsDelDia = almacenamiento.machs.filter(m => m.diaId === diaActivo.id);
    let stats = new Map();
    for (let m of machsDelDia) {
        for (let p of m.participantes) {
            if (!p.jugadorId) continue;
            let s = stats.get(p.nombre) || { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 };
            if (p.jugadorId === m.ganadorId) s.machs++;
            s.patas += p.patasFinales;
            s.forros += m.manos.filter(h => h.tipo === 'forro' && h.jugadorId === p.jugadorId).length;
            s.aguas += m.manos.filter(h => h.tipo === 'agua' && h.jugadorId === p.jugadorId).length;
            s.capicuas += m.manos.filter(h => h.tipo === 'capicua' && h.jugadorId === p.jugadorId).length;
            s.cierres += m.manos.filter(h => h.tipo === 'cierre' && h.jugadorId === p.jugadorId).length;
            s.pegado += m.manos.filter(h => h.tipo === 'pegado' && h.jugadorId === p.jugadorId).length;
            s.paseManoDados += m.manos.filter(h => (h.tipo === 'paseManoDado' || h.tipo === 'paseMano') && h.jugadorId === p.jugadorId).length;
            s.paseManoRecibidos += m.manos.filter(h => (h.tipo === 'paseManoRecibido' || (h.tipo === 'paseMano' && h.receptorId === p.jugadorId))).length;
            stats.set(p.nombre, s);
        }
    }
    for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) {
        const jugador = almacenamiento.jugadores.find(j => j.id === part.jugadorId);
        if (!jugador) continue;
        let s = stats.get(jugador.nombre) || { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 };
        s.empatesParticipados = (s.empatesParticipados || 0) + (part.empatesParticipados || 0);
        s.empatesGanados = (s.empatesGanados || 0) + (part.empatesGanados || 0);
        s.pollonas = (s.pollonas || 0) + (part.pollonas || 0);
        s.patasPorEmpate = (s.patasPorEmpate || 0) + (part.patasPorEmpate || 0);
        stats.set(jugador.nombre, s);
    }
    if (diaActivo && jugadoresActuales) {
        for (let j of jugadoresActuales) {
            if (!j.jugadorId) continue;
            let s = stats.get(j.nombre) || { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 };
            let patasActual = estadoMachActual.patasActuales.get(j.jugadorId) || 0;
            s.patas += patasActual;
            s.forros += estadoMachActual.historialManos.filter(h => h.tipo === 'forro' && h.jugadorId === j.jugadorId).length;
            s.aguas += estadoMachActual.historialManos.filter(h => h.tipo === 'agua' && h.jugadorId === j.jugadorId).length;
            s.capicuas += estadoMachActual.historialManos.filter(h => h.tipo === 'capicua' && h.jugadorId === j.jugadorId).length;
            s.cierres += estadoMachActual.historialManos.filter(h => h.tipo === 'cierre' && h.jugadorId === j.jugadorId).length;
            s.pegado += estadoMachActual.historialManos.filter(h => h.tipo === 'pegado' && h.jugadorId === j.jugadorId).length;
            s.paseManoDados += estadoMachActual.historialManos.filter(h => (h.tipo === 'paseManoDado' || h.tipo === 'paseMano') && h.jugadorId === j.jugadorId).length;
            s.paseManoRecibidos += estadoMachActual.historialManos.filter(h => (h.tipo === 'paseManoRecibido' || (h.tipo === 'paseMano' && h.receptorId === j.jugadorId))).length;
            stats.set(j.nombre, s);
        }
    }
    const resultadosStats = document.getElementById('resultadosStats');
    const vistaEstadisticas = document.getElementById('vistaEstadisticas');
    const vistaJuego = document.getElementById('vistaJuego');
    let html = tablaTranspuesta ? renderizarTablaTranspuesta(stats, `Mach actual #${estadoMachActual.numero} en curso`) : renderizarTablaNormal(stats, `Mach actual #${estadoMachActual.numero} en curso`);
    if (resultadosStats) resultadosStats.innerHTML = html;
    if (vistaEstadisticas) vistaEstadisticas.style.display = 'block';
    if (vistaJuego) vistaJuego.style.display = 'none';
    const tituloStats = document.querySelector('#vistaEstadisticas h2');
    if (tituloStats) tituloStats.innerHTML = '📊 Estadísticas del Día';
}

// --- ESTADÍSTICAS GLOBALES ---
function cargarEstadisticasGlobales(desde, hasta) {
    let machsFiltrados = almacenamiento.machs;
    if (desde && hasta) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha >= desde && dia.fecha <= hasta; });
    else if (desde) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha >= desde; });
    else if (hasta) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha <= hasta; });
    
    let statsTotales = new Map();
    for (let m of machsFiltrados) {
        for (let p of m.participantes) {
            if (!p.jugadorId) continue;
            let s = statsTotales.get(p.nombre) || { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 };
            if (p.jugadorId === m.ganadorId) s.machs++;
            s.patas += p.patasFinales;
            s.forros += m.manos.filter(h=>h.tipo==='forro' && h.jugadorId===p.jugadorId).length;
            s.aguas += m.manos.filter(h=>h.tipo==='agua' && h.jugadorId===p.jugadorId).length;
            s.capicuas += m.manos.filter(h=>h.tipo==='capicua' && h.jugadorId===p.jugadorId).length;
            s.cierres += m.manos.filter(h=>h.tipo==='cierre' && h.jugadorId===p.jugadorId).length;
            s.pegado += m.manos.filter(h=>h.tipo==='pegado' && h.jugadorId===p.jugadorId).length;
            s.paseManoDados += m.manos.filter(h=>(h.tipo==='paseManoDado' || h.tipo==='paseMano') && h.jugadorId===p.jugadorId).length;
            s.paseManoRecibidos += m.manos.filter(h=>(h.tipo==='paseManoRecibido' || (h.tipo==='paseMano' && h.receptorId===p.jugadorId))).length;
            statsTotales.set(p.nombre, s);
        }
    }
    for (let p of almacenamiento.participaciones) {
        const jugador = almacenamiento.jugadores.find(j => j.id === p.jugadorId);
        if (!jugador) continue;
        const dia = almacenamiento.dias.find(d => d.id === p.diaId);
        if (dia && desde && hasta && (dia.fecha < desde || dia.fecha > hasta)) continue;
        if (!statsTotales.has(jugador.nombre)) statsTotales.set(jugador.nombre, { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 });
        let s = statsTotales.get(jugador.nombre);
        s.empatesParticipados = (s.empatesParticipados || 0) + (p.empatesParticipados || 0);
        s.empatesGanados = (s.empatesGanados || 0) + (p.empatesGanados || 0);
        s.patasPorEmpate = (s.patasPorEmpate || 0) + (p.patasPorEmpate || 0);
        s.pollonas = (s.pollonas || 0) + (p.pollonas || 0);
        statsTotales.set(jugador.nombre, s);
    }
    
    let porFecha = new Map();
    for (let m of machsFiltrados) {
        const dia = almacenamiento.dias.find(d => d.id === m.diaId);
        if (!dia) continue;
        const fecha = dia.fecha;
        if (!porFecha.has(fecha)) porFecha.set(fecha, []);
        porFecha.get(fecha).push(m);
    }
    let fechasOrdenadas = Array.from(porFecha.keys()).sort((a,b) => new Date(b) - new Date(a));
    let hayMultiplesDias = fechasOrdenadas.length > 1;
    let html = '<div class="stats-container">';
    if (hayMultiplesDias && statsTotales.size > 0) html += renderizarTablaResumen(statsTotales, tablaTranspuesta);
    if (fechasOrdenadas.length === 0) html += '<p class="stats-vacio">📭 No hay machs registrados en el período seleccionado.</p>';
    else {
        for (let fecha of fechasOrdenadas) {
            let machsDia = porFecha.get(fecha);
            let statsJugador = new Map();
            for (let m of machsDia) {
                for (let p of m.participantes) {
                    if (!p.jugadorId) continue;
                    let s = statsJugador.get(p.nombre) || { machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 };
                    if (p.jugadorId === m.ganadorId) s.machs++;
                    s.patas += p.patasFinales;
                    s.forros += m.manos.filter(h=>h.tipo==='forro' && h.jugadorId===p.jugadorId).length;
                    s.aguas += m.manos.filter(h=>h.tipo==='agua' && h.jugadorId===p.jugadorId).length;
                    s.capicuas += m.manos.filter(h=>h.tipo==='capicua' && h.jugadorId===p.jugadorId).length;
                    s.cierres += m.manos.filter(h=>h.tipo==='cierre' && h.jugadorId===p.jugadorId).length;
                    s.pegado += m.manos.filter(h=>h.tipo==='pegado' && h.jugadorId===p.jugadorId).length;
                    s.paseManoDados += m.manos.filter(h=>(h.tipo==='paseManoDado' || h.tipo==='paseMano') && h.jugadorId===p.jugadorId).length;
                    s.paseManoRecibidos += m.manos.filter(h=>(h.tipo==='paseManoRecibido' || (h.tipo==='paseMano' && h.receptorId===p.jugadorId))).length;
                    statsJugador.set(p.nombre, s);
                }
            }
            for (let m of machsDia) {
                for (let p of m.participantes) {
                    if (!p.jugadorId) continue;
                    let part = almacenamiento.participaciones.find(part => part.diaId === m.diaId && part.jugadorId === p.jugadorId);
                    if (part && statsJugador.has(p.nombre)) {
                        let s = statsJugador.get(p.nombre);
                        s.pollonas = (s.pollonas || 0) + (part.pollonas || 0);
                        s.empatesParticipados = (s.empatesParticipados || 0) + (part.empatesParticipados || 0);
                        s.empatesGanados = (s.empatesGanados || 0) + (part.empatesGanados || 0);
                        s.patasPorEmpate = (s.patasPorEmpate || 0) + (part.patasPorEmpate || 0);
                        statsJugador.set(p.nombre, s);
                    }
                }
            }
            html += `<div class="dia-stats-block"><h4>📅 ${fecha}</h4>`;
            html += tablaTranspuesta ? renderizarTablaTranspuesta(statsJugador, null) : renderizarTablaNormal(statsJugador, null);
            html += `</div>`;
        }
    }
    html += '</div>';
    const resultadosStats = document.getElementById('resultadosStats');
    if (resultadosStats) resultadosStats.innerHTML = html;
}

// --- FUNCIONES DE UI Y EVENTOS ---
function renderInputsJugadores() { 
    const jugadoresInputsContainer = document.getElementById('jugadoresInputsContainer');
    if(!jugadoresInputsContainer) return;
    jugadoresInputsContainer.innerHTML = ''; 
    let datalist = document.getElementById('listaJugadores');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'listaJugadores';
        document.body.appendChild(datalist);
    }
    actualizarDatalistJugadores();
    for(let i=1;i<=4;i++) {
        jugadoresInputsContainer.innerHTML += `<div><label>🎲 Jugador ${i}</label><input type="text" id="jugador${i}" list="listaJugadores" placeholder="Nombre (opcional)" autocomplete="off"></div>`; 
    }
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFechaLocal() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// --- MANUAL DE USUARIO COMPLETO (versión aprobada) ---
const manualHTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Manual Dominó Pintintín v4.0</title>
<style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:2rem;line-height:1.6;color:#1e293b}
    .manual-container{max-width:1200px;margin:0 auto;background:white;border-radius:1rem;box-shadow:0 10px 25px rgba(0,0,0,0.1);padding:2rem}
    h1{color:#1e293b;text-align:center;border-bottom:3px solid #8b5cf6;padding-bottom:0.5rem;margin-bottom:1rem}
    .subtitulo{text-align:center;color:#475569;margin-bottom:2rem}
    .version-badge{display:inline-block;background:#8b5cf6;color:white;padding:0.2rem 0.8rem;border-radius:2rem;font-size:0.8rem;margin-left:0.5rem}
    .creador{text-align:center;background:#e0e7ff;padding:1rem;border-radius:1rem;margin-bottom:2rem;font-size:0.9rem}
    h2{color:#334155;margin-top:1.5rem;margin-bottom:1rem;border-left:4px solid #8b5cf6;padding-left:1rem}
    h3{color:#475569;margin-top:1rem;margin-bottom:0.5rem}
    table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.85rem}
    th,td{border:1px solid #cbd5e1;padding:0.5rem;text-align:left;vertical-align:top}
    th{background:#e2e8f0;font-weight:bold}
    ul,ol{margin:0.5rem 0 1rem 1.5rem}
    li{margin:0.3rem 0}
    code{background:#f1f5f9;padding:0.2rem 0.4rem;border-radius:0.3rem;font-family:monospace}
    .footer{margin-top:2rem;padding-top:1rem;text-align:center;font-size:0.8rem;color:#64748b;border-top:1px solid #e2e8f0}
    .badge{display:inline-block;background:#8b5cf6;color:white;padding:0.2rem 0.5rem;border-radius:1rem;font-size:0.7rem;margin-right:0.5rem}
    .badge-nuevo{background:#10b981}
    .badge-warning{background:#dc2626}
    .ejemplo{background:#f1f5f9;padding:1rem;border-radius:0.5rem;margin:1rem 0;border-left:4px solid #8b5cf6}
    .indice{background:#f8fafc;padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;columns:2;column-gap:2rem}
    @media (max-width:768px){body{padding:1rem}.manual-container{padding:1rem}.indice{columns:1}}
</style>
</head>
<body>
<div class="manual-container">
<h1>📖 MANUAL DE USUARIO <span class="version-badge">Versión 4.0</span></h1>
<div class="subtitulo">🀰 DOMINÓ PINTINTÍN - Aplicación para Campeonato de Dominó (4 jugadores individuales)</div>
<div class="creador"><strong>Creado por:</strong> Ricardo Castillo (Richard)<br><strong>Ubicación:</strong> La Demajagua, Isla de la Juventud, Cuba<br><strong>Versión actual:</strong> 4.0 - "La definitiva con automatizaciones"</div>
<h2>📋 ÍNDICE</h2>
<div class="indice"><ol><li><a href="#" onclick="scrollToSection('intro')">Introducción</a></li><li><a href="#" onclick="scrollToSection('historia')">Historia</a></li><li><a href="#" onclick="scrollToSection('versiones')">Versiones</a></li><li><a href="#" onclick="scrollToSection('pwa')">PWA</a></li><li><a href="#" onclick="scrollToSection('instalacion')">Instalación</a></li><li><a href="#" onclick="scrollToSection('reglas')">Reglas</a></li><li><a href="#" onclick="scrollToSection('inicio')">Inicio</a></li><li><a href="#" onclick="scrollToSection('sorteo')">Sorteo</a></li><li><a href="#" onclick="scrollToSection('juego')">Juego</a></li><li><a href="#" onclick="scrollToSection('gestion')">Gestión jugadores</a></li><li><a href="#" onclick="scrollToSection('empate')">Empate</a></li><li><a href="#" onclick="scrollToSection('pata')">Registrar pata</a></li><li><a href="#" onclick="scrollToSection('pase-mano')">Pase mano</a></li><li><a href="#" onclick="scrollToSection('estadisticas')">Estadísticas</a></li><li><a href="#" onclick="scrollToSection('empatesStats')">Estadísticas empates</a></li><li><a href="#" onclick="scrollToSection('verificacion')">Verificación patas</a></li><li><a href="#" onclick="scrollToSection('autocompletado')">Autocompletado</a></li><li><a href="#" onclick="scrollToSection('backup')">Respaldo</a></li><li><a href="#" onclick="scrollToSection('persistencia')">Persistencia</a></li><li><a href="#" onclick="scrollToSection('admin')">Administración</a></li><li><a href="#" onclick="scrollToSection('borrar')">Borrar datos</a></li><li><a href="#" onclick="scrollToSection('problemas')">Problemas</a></li><li><a href="#" onclick="scrollToSection('faq')">FAQ</a></li><li><a href="#" onclick="scrollToSection('creditos')">Créditos</a></li></ol></div>
<h2 id="intro">1. INTRODUCCIÓN</h2>
<p><strong>Dominó Pintintín</strong> es una aplicación para campeonatos de dominó individual (4 jugadores). La versión 4.0 automatiza el registro de 💧 Agua (tras cada pata mediante modal) y 🎯 Pase de Mano (sentido antihorario saltando sillas vacantes). Elimina botones redundantes, reduciendo errores.</p>
<h2 id="historia">2. HISTORIA Y EVOLUCIÓN</h2>
<p>Nace en La Demajagua, Cuba. Es un juego individual donde cada jugador juega para sí mismo. Conceptos: "agache", "botar gorda", "sin respeto de reglas".</p>
<h2 id="versiones">3. HISTORIAL DE VERSIONES</h2>
<table><thead><tr><th>Versión</th><th>Fecha</th><th>Novedades</th></tr></thead><tbody>
<tr><td>1.0</td><td>8/5/2026</td><td>Registro básico</td></tr>
<tr><td>2.0</td><td>11/5/2026</td><td>PWA, persistencia</td></tr>
<tr><td>3.0</td><td>14/5/2026</td><td>Estadísticas completas</td></tr>
<tr><td>3.5</td><td>26/5/2026</td><td>Empates, orden personalizado</td></tr>
<tr><td>4.0</td><td>28/5/2026</td><td>🧩 Patas por Empate, autocompletado, backups con versión, <strong>eliminación de botones 💧 y 📥</strong>, 💧 agua automática mediante modal, 🎯 pase de mano automático (salta vacantes), fórmula de verificación.</td></tr>
</tbody></table>
<h2 id="pwa">4. PWA</h2>
<p>Progressive Web App: se instala como app nativa, funciona offline.</p>
<h2 id="instalacion">5. INSTALACIÓN</h2>
<p>Usar Chrome en Android: ⋮ → "Instalar aplicación". También puede generar APK con pwabuilder.com.</p>
<h2 id="reglas">6. REGLAS DEL JUEGO</h2>
<p><strong>Conceptos:</strong> 🏆 Pata (+1 o 2ⁿ), 🧤 Forro (-1), 💧 Agua (quien revuelve, automático), 🎯 Pase Mano (automático), ⚖️ Empate (acumula, ganador suma 2ⁿ), 🏆 Mach (5 patas, reinicio), 🐔 Pollona (Mach sin otros con patas positivas).</p>
<p><strong>Formas de terminación:</strong> 🚪 Cierre (1 pata base), 🏃 Pegado (1), 🀰 Capicua (2). Con empates: base × 2ⁿ.</p>
<h2 id="inicio">7. PANTALLA DE INICIO</h2>
<p>📅 Fecha local automática. 👥 Autocompletado de nombres. Botones: 🎲 Sortear, 📊 Estadísticas globales, ⚠️ Borrar (clave: pintintin), 💾 Exportar respaldo, 📂 Importar respaldo.</p>
<h2 id="sorteo">8. SORTEO DE POSICIONES</h2>
<p>Dados virtuales, resolución de empates, mezcla de sillas (1-4). Cualquier silla puede quedar vacante.</p>
<h2 id="juego">9. PANTALLA DE JUEGO</h2>
<p>Cada jugador tiene 🏆 Pata, 🧤 Forro, 🎯 Da PM. Los botones 💧 Agua y 📥 Recibe PM han sido eliminados (ahora automáticos).</p>
<h2 id="gestion">10. GESTIÓN DE JUGADORES</h2>
<p>➕ Añadir (sillas vacantes), 🔄 Sustituir (cuando hay 4), ➖ Retirar (mínimo 2 jugadores).</p>
<h2 id="empate">11. DECLARAR EMPATE Y POTENCIAS DE 2</h2>
<p>Pulsa ⚖️ Declarar empate, selecciona los empatados (mínimo 2). Acumulan n. Al ganar: suma 2ⁿ patas. Los no implicados reinician. Se registran 🏆⚖️ E. Ganados y 🧩 Patas por Empate.</p>
<h2 id="pata">12. REGISTRO DE UNA PATA (PASO A PASO)</h2>
<ol><li>Pulsa 🏆 Pata en el ganador.</li><li>Elige forma (🚪 Cierre, 🏃 Pegado, 🀰 Capicua).</li><li>Si hay >2 jugadores, modal para elegir quién da 💧 Agua; si son 2, se asigna automático.</li><li>Se registra la pata, el agua, y si aplica, los empates.</li><li>Si alcanza ≥5 patas → MACH, reinicio de patas.</li></ol>
<h2 id="pase-mano">13. PASE DE MANO AUTOMÁTICO</h2>
<p>Pulsa 🎯 Da PM en el dador. El sistema busca el siguiente jugador activo en sentido antihorario (1→4→3→2→1) saltando sillas vacantes, y registra tanto el dado como el recibido.</p>
<h2 id="estadisticas">14. ESTADÍSTICAS</h2>
<p>📊 Estadísticas del día, 🌍 Estadísticas globales (filtro por fechas, exportación CSV/PDF). Botón 🔄 Intercambiar columnas: en modo transpuesto las estadísticas son filas y los jugadores columnas, con una columna TOTAL que suma cada fila. No hay fila de totales por jugador en modo transpuesto.</p>
<h2 id="empatesStats">15. ESTADÍSTICAS DE EMPATES Y PATAS POR EMPATE</h2>
<p>⚖️ Empates: veces que participó en empate.<br>🏆⚖️ E. Ganados: veces que ganó estando en empate.<br>🧩 Patas por Empate: patas extra por potencias de 2.</p>
<h2 id="verificacion">16. FÓRMULA DE VERIFICACIÓN DE PATAS NETAS</h2>
<div class="ejemplo"><code>🦶 Patas Netas = 🚪 Cierres + 🏃 Pegados + 2×🀰 Capicuas + 🧩 Patas por Empate - 🧤 Forros</code></div>
<h2 id="autocompletado">17. AUTOCOMPLETADO DE NOMBRES</h2>
<p>Los campos de nombre sugieren nombres existentes. Si escribes uno nuevo, se añade a la base de datos.</p>
<h2 id="backup">18. RESPALDO DE DATOS CON VERSIÓN</h2>
<p>Exportación manual: <code>Pinti_v40_ddmmyy.json</code>. Automático al cerrar día: <code>Pinti_v40_lun.json</code>, etc.</p>
<h2 id="persistencia">19. PERSISTENCIA Y CONTINUACIÓN DE PARTIDAS</h2>
<p>El estado se guarda tras cada acción. Al abrir, pregunta si continuar.</p>
<h2 id="admin">20. PANEL DE ADMINISTRACIÓN</h2>
<p><code>admin.html</code> con contraseña <code>admin</code>. Permite gestionar machs, jugadores, días, participaciones, reportes y exportar/importar.</p>
<h2 id="borrar">21. BORRAR TODOS LOS DATOS</h2>
<p><span class="badge badge-warning">⚠️ ADVERTENCIA</span> Botón "⚠️ Borrar datos" con contraseña <code>pintintin</code>. Acción irreversible.</p>
<h2 id="problemas">22. SOLUCIÓN DE PROBLEMAS</h2>
<ul><li>Fecha incorrecta: la aplicación usa fecha local (formato YYYY-MM-DD).</li><li>Modal agua no aparece: asegúrate de que el HTML contenga <code>&lt;div id="modalAgua"&gt;</code>. Con 2 jugadores es automático.</li><li>Pase de mano no asigna bien: verifica las posiciones de las sillas (1,2,3,4). El sistema salta vacantes.</li></ul>
<h2 id="faq">23. PREGUNTAS FRECUENTES</h2>
<ul><li>¿Funciona sin internet? Sí, como PWA.</li><li>¿Puedo jugar con menos de 4? Sí, con 2 o 3.</li><li>¿Qué significa 🧩 Patas por Empate? Patas extra por regla 2ⁿ.</li><li>¿Cómo exportar a Excel? Botón "📎 Exportar CSV".</li></ul>
<h2 id="creditos">24. CRÉDITOS</h2>
<p>Desarrollador: Ricardo Castillo (Richard) - La Demajagua, Isla de la Juventud, Cuba. Agradecimientos a la peña de dominó de La Demajagua.</p>
<div class="footer"><p>🎲 ¡A BOTAR GORDA! 🎲</p><p>Hecho en La Demajagua, Isla de la Juventud, Cuba</p><p><strong>Versión 4.0 - La definitiva (Mayo 2026)</strong></p></div>
</div>
<script>function scrollToSection(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});}</script>
</body>
</html>`;

// --- AGREGAR BOTÓN SUPERIOR "VOLVER AL JUEGO" EN ESTADÍSTICAS GLOBALES ---
function agregarBotonVolverSuperior() {
    const filtrosDiv = document.querySelector('#vistaEstadisticas .filtros');
    if (!filtrosDiv) return;
    // Evitar duplicados
    if (document.getElementById('volverInicioStatsTop')) return;
    const btnVolverTop = document.createElement('button');
    btnVolverTop.id = 'volverInicioStatsTop';
    btnVolverTop.className = 'secundario';
    btnVolverTop.innerHTML = '← Volver al juego';
    btnVolverTop.style.marginLeft = '0.5rem';
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

// --- EVENTOS AL CARGAR LA PÁGINA ---
window.scrollToSection = function(id) {
    const contenidoAyuda = document.getElementById('contenidoAyuda');
    const iframeDoc = contenidoAyuda?.contentDocument || contenidoAyuda?.contentWindow?.document;
    const elemento = iframeDoc ? iframeDoc.getElementById(id) : contenidoAyuda?.querySelector(`#${id}`);
    if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
};

window.onload = () => { 
    cargarTodoDesdeLocalStorage(); 
    validarConsistenciaMachs();
    
    const fechaDiaInput = document.getElementById('fechaDia');
    if (fechaDiaInput && !fechaDiaInput.value) {
        fechaDiaInput.value = getFechaLocal();
    }
    
    renderInputsJugadores(); 
    agregarListenersInputs();
    actualizarColorBotonSorteo();
    actualizarDatalistJugadores();
    
    if(cargarSesionCompleta()) { 
        if(confirm("🔄 Partida en curso. ¿Continuar?")) {
            cargarVistaJuego(); 
        } else { 
            limpiarSesionCompleta(); 
            actualizarColorBotonSorteo();
            document.getElementById('vistaConfig').style.display='block';
            document.getElementById('vistaJuego').style.display='none';
            document.getElementById('vistaEstadisticas').style.display='none';
        } 
    } else { 
        document.getElementById('vistaConfig').style.display='block';
        document.getElementById('vistaJuego').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='none';
    } 
    
    // Configurar eventos de los botones principales
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
    const confirmarEmpate = document.getElementById('confirmarEmpate');
    const cancelarEmpate = document.getElementById('cancelarEmpate');
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
    const modalEmpate = document.getElementById('modalEmpate');
    const checkEmpateDiv = document.getElementById('checkEmpate');
    const btnTransponer = document.getElementById('btnTransponer');
    
    if(btnSortearEIniciar) btnSortearEIniciar.onclick = sortearEIniciar;
    if(btnGestionJugador) btnGestionJugador.onclick = gestionarJugador;
    if(btnRetirarJugador) btnRetirarJugador.onclick = retirarJugador;
    if(btnCerrarDia) btnCerrarDia.onclick = async () => { 
        if(!diaActivo) return; 
        if(confirm("💾 ¿Quieres conservar los datos del día para continuar después?")) { 
            if(diaActivo) { let dia = almacenamiento.dias.find(d=>d.id===diaActivo.id); if(dia) dia.activo = 1; guardarTodoEnLocalStorage(); await guardarBackupAutomatico(); } 
            guardarSesionCompleta();
            diaActivo = null; jugadoresActuales = []; estadoMachActual = { numero:1, patasActuales: new Map(), empatePendiente: null, historialManos:[] };
            document.getElementById('vistaConfig').style.display='block';
            document.getElementById('vistaJuego').style.display='none'; 
            renderInputsJugadores(); 
            if(fechaDiaInput) fechaDiaInput.value = getFechaLocal();
            const resultadoSorteoDiv = document.getElementById('resultadoSorteo'); if(resultadoSorteoDiv) resultadoSorteoDiv.innerHTML = ''; 
            actualizarColorBotonSorteo();
        } 
    };
    if(btnStatsEnJuego) btnStatsEnJuego.onclick = mostrarEstadisticasDelDia;
    if(btnEstadisticasGlobalesJuego) btnEstadisticasGlobalesJuego.onclick = () => { 
        if(!diaActivo) return alert('Inicia un día'); 
        let fechas = almacenamiento.machs.map(m=>{const d=almacenamiento.dias.find(dia=>dia.id===m.diaId); return d?d.fecha:null;}).filter(f=>f); 
        let minFecha = fechas.length ? [...fechas].sort()[0] : getFechaLocal(); 
        let maxFecha = getFechaLocal(); 
        if(fechaDesde) fechaDesde.value = minFecha; if(fechaHasta) fechaHasta.value = maxFecha; 
        cargarEstadisticasGlobales(minFecha, maxFecha); 
        document.getElementById('vistaJuego').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='block'; 
        const titulo = document.querySelector('#vistaEstadisticas h2'); if(titulo) titulo.innerHTML = '📊 Estadísticas Globales'; 
        agregarBotonVolverSuperior(); // añadir botón superior cada vez que se carga la vista
    };
    if(irAEstadisticas) irAEstadisticas.onclick = () => { 
        let fechas = almacenamiento.machs.map(m=>{const d=almacenamiento.dias.find(dia=>dia.id===m.diaId); return d?d.fecha:null;}).filter(f=>f); 
        let minFecha = fechas.length ? [...fechas].sort()[0] : getFechaLocal(); 
        let maxFecha = getFechaLocal(); 
        if(fechaDesde) fechaDesde.value = minFecha; if(fechaHasta) fechaHasta.value = maxFecha; 
        cargarEstadisticasGlobales(minFecha, maxFecha); 
        document.getElementById('vistaConfig').style.display='none';
        document.getElementById('vistaEstadisticas').style.display='block'; 
        const titulo = document.querySelector('#vistaEstadisticas h2'); if(titulo) titulo.innerHTML = '📊 Estadísticas Globales'; 
        agregarBotonVolverSuperior();
    };
    if(volverInicioStats) volverInicioStats.onclick = () => { 
        if(diaActivo) { document.getElementById('vistaEstadisticas').style.display='none'; document.getElementById('vistaJuego').style.display='block'; } 
        else { document.getElementById('vistaEstadisticas').style.display='none'; document.getElementById('vistaConfig').style.display='block'; } 
    };
    if(btnFiltrar) btnFiltrar.onclick = () => { cargarEstadisticasGlobales(fechaDesde ? fechaDesde.value : '', fechaHasta ? fechaHasta.value : ''); agregarBotonVolverSuperior(); };
    if(btnBorrarTodo) btnBorrarTodo.onclick = () => { let pass = prompt("🔐 Contraseña:"); if(pass === "pintintin") { localStorage.clear(); almacenamiento = { jugadores:[], dias:[], participaciones:[], machs:[] }; alert("Datos borrados. Recargando..."); window.location.reload(); } else alert("Contraseña incorrecta"); };
    if(btnExportarBackup) btnExportarBackup.onclick = exportarBackupManual;
    if(importBackupInput) importBackupInput.onchange = (e) => { if(e.target.files.length) importarBackup(e.target.files[0]); };
    if(btnExportarCSV) btnExportarCSV.onclick = () => { let csv = "Fecha,Mach,Ganador\n"; for(let m of almacenamiento.machs) { const dia = almacenamiento.dias.find(d=>d.id===m.diaId); let ganador = m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre || '?'; csv += `${dia ? dia.fecha : '?'},${m.numeroMach},${ganador}\n`; } let blob = new Blob([csv], {type:'text/csv'}); let a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pintintin_stats.csv'; a.click(); };
    if(btnExportarPDF && window.jspdf) btnExportarPDF.onclick = () => { let { jsPDF } = window.jspdf; let doc = new jsPDF(); doc.text("Estadísticas Dominó Pintintín", 20,20); let data = almacenamiento.machs.map(m=>{ const dia = almacenamiento.dias.find(d=>d.id===m.diaId); return [dia ? dia.fecha : '?', m.numeroMach, m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre]; }); doc.autoTable({ head:[['Fecha','Mach #','Ganador']], body:data, startY:30 }); doc.save('pintintin_stats.pdf'); };
    if(btnEmpate) btnEmpate.onclick = () => { 
        if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) return alert('Ya hay empate'); 
        if(checkEmpateDiv) checkEmpateDiv.innerHTML = ''; 
        for(let j of jugadoresActuales) if(j.jugadorId) { let l=document.createElement('label'); l.innerHTML=`<input type="checkbox" value="${j.jugadorId}"> ${j.nombre}`; if(checkEmpateDiv) checkEmpateDiv.appendChild(l); } 
        if(modalEmpate) modalEmpate.style.display='flex'; 
    };
    if(confirmarEmpate) confirmarEmpate.onclick = () => { 
        if(!checkEmpateDiv) return; let checks = [...checkEmpateDiv.querySelectorAll('input:checked')]; if(checks.length<2) return alert('Selecciona al menos dos'); 
        const jugadoresEmpatados = checks.map(c=>parseInt(c.value));
        for (let jugadorId of jugadoresEmpatados) { let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId); if (part) { part.empatesParticipados = (part.empatesParticipados || 0) + 1; part.empatesAcumulados = (part.empatesAcumulados || 0) + 1; } }
        for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) { if (!jugadoresEmpatados.includes(part.jugadorId)) part.empatesAcumulados = 0; }
        estadoMachActual.empatePendiente = { jugadoresIds: jugadoresEmpatados, resuelto: false }; actualizarAvisoEmpate(); if(modalEmpate) modalEmpate.style.display='none'; guardarSesionCompleta(); guardarTodoEnLocalStorage(); renderizarJugadores();
    };
    if(cancelarEmpate) cancelarEmpate.onclick = () => { if(modalEmpate) modalEmpate.style.display='none'; };
    if(terminacionCierre) terminacionCierre.onclick = () => aplicarModalTerminacion('cierre');
    if(terminacionPegado) terminacionPegado.onclick = () => aplicarModalTerminacion('pegado');
    if(terminacionCapicua) terminacionCapicua.onclick = () => aplicarModalTerminacion('capicua');
    if(cancelarTerminacion) cancelarTerminacion.onclick = () => { cerrarModalTerminacion(); ganadorPendiente = null; };
    
    // Cargar manual completo en el iframe o directamente en el div
    if(contenidoAyuda) {
        // Insertar el manual completo como HTML
        contenidoAyuda.innerHTML = manualHTML;
        // Reemplazar los enlaces del índice para que funcionen dentro del modal
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
    }
    if(btnAyuda) btnAyuda.onclick = () => { if(modalAyuda) modalAyuda.style.display = 'flex'; if(contenidoAyuda) contenidoAyuda.scrollTop = 0; };
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
};
