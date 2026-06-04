// ==================== DOMINÓ PINTINTÍN - VERSIÓN 5.3.0 ====================
// Creado por Ricardo Castillo Valdés (Richard) - La Demajagua, Isla de la Juventud, Cuba

console.log("🎲 Dominó Pintintín - Versión 5.3.0");

// --- CONFIGURACIÓN INICIAL ---
let diaActivo = null;
let jugadoresActuales = [];
let estadoMachActual = {
    numero: 1,
    patasActuales: new Map(),
    empatePendiente: null,
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
    if (!sesionGuardada) {
        console.log("No hay sesión guardada");
        return false;
    }
    
    try {
        const data = JSON.parse(sesionGuardada);
        if (!data.diaActivo) {
            console.log("Sesión sin día activo");
            return false;
        }
        
        const dia = almacenamiento.dias.find(d => d.id === data.diaActivo.id);
        if (!dia) {
            console.log("Día de la sesión no existe en la base de datos");
            limpiarSesionCompleta();
            return false;
        }
        
        if (dia.activo !== 1) {
            console.log("⚠️ Día estaba cerrado pero hay sesión guardada. Reactivando día.");
            dia.activo = 1;
            guardarTodoEnLocalStorage();
        }
        
        diaActivo = data.diaActivo;
        jugadoresActuales = data.jugadoresActuales;
        estadoMachActual = {
            numero: data.estadoMachActual.numero,
            patasActuales: new Map(data.estadoMachActual.patasActuales),
            empatePendiente: data.estadoMachActual.empatePendiente,
            historialManos: data.estadoMachActual.historialManos || [],
            historialGanadores: data.estadoMachActual.historialGanadores || [],
            fechaHoraInicio: data.estadoMachActual.fechaHoraInicio || null
        };
        ultimoGanadorId = data.ultimoGanadorId || null;
        penultimoGanadorId = data.penultimoGanadorId || null;
        
        console.log("✅ Sesión cargada correctamente. Día activo:", diaActivo.fecha, "Jugadores:", jugadoresActuales.length);
        return true;
    } catch (e) {
        console.error("Error al cargar sesión:", e);
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
    const nombreArchivo = `Pinti_v530_${getDiaSemanaAbreviatura()}.json`;
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
    const nombreArchivo = `Pinti_v530_${formatearFechaParaNombre()}.json`;
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
            for (let m of almacenamiento.machs) {
                if (m.fechaHoraInicio === undefined) m.fechaHoraInicio = null;
            }
            guardarTodoEnLocalStorage();
            limpiarSesionCompleta();
            diaActivo = null;
            jugadoresActuales = [];
            estadoMachActual = {
                numero: 1,
                patasActuales: new Map(),
                empatePendiente: null,
                historialManos: [],
                historialGanadores: [],
                fechaHoraInicio: null
            };
            
            if (document.getElementById('vistaConfig')) {
                renderInputsJugadores();
                actualizarDatalistJugadores();
                actualizarColorBotonSorteo();
            }
            
            alert("✅ Datos importados correctamente");
        } catch (error) { 
            alert("❌ Archivo inválido: " + error.message); 
        }
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
        const pwd = prompt("🔐 Contraseña de administrador:");
        if (pwd === "administrador") {
            window.location.href = 'admin.html';
        } else {
            alert("Contraseña incorrecta");
        }
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
                    const password = prompt("🔐 Contraseña de administrador:");
                    if (password === "administrador") {
                        window.location.href = "admin.html";
                    } else {
                        alert("Contraseña incorrecta");
                    }
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
                    const password = prompt("🔐 Contraseña de administrador:");
                    if (password === "administrador") {
                        window.location.href = "admin.html";
                    } else {
                        alert("Contraseña incorrecta");
                    }
                };
            }
        }
    }, 500);
}

// ==================== MENSAJE DE EMPATE PERSISTENTE ====================
function actualizarAvisoEmpate() {
    const avisoEmpateDiv = document.getElementById('avisoEmpate');
    if(avisoEmpateDiv) {
        if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
            let nombres = estadoMachActual.empatePendiente.jugadoresIds.map(id => jugadoresActuales.find(j=>j.jugadorId===id)?.nombre).join(', ');
            avisoEmpateDiv.innerHTML = `⚠️ EMPATE entre: ${nombres}. ¡Comienza la siguiente mano!`;
            avisoEmpateDiv.style.display = 'block';
        } else {
            avisoEmpateDiv.innerHTML = '';
            avisoEmpateDiv.style.display = 'none';
        }
    }
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
                console.log("📀 Saliendo del juego, conservando partida (día sigue activo)");
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
            historialManos: [],
            historialGanadores: [],
            fechaHoraInicio: null
        };
        
        document.getElementById('vistaConfig').style.display = 'block';
        document.getElementById('vistaJuego').style.display = 'none';
        document.getElementById('vistaEstadisticas').style.display = 'none';
        
        renderInputsJugadores();
        const fechaDiaInput = document.getElementById('fechaDia');
        if (fechaDiaInput) fechaDiaInput.value = getFechaLocal();
        
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

// ==================== SORTEO E INICIAR (con checkbox mantener ubicación) ====================
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
            console.log("Sesión cargada:", cargada, "diaActivo:", diaActivo, "jugadores:", jugadoresActuales.length);
            if (!cargada || !diaActivo || jugadoresActuales.length === 0) {
                console.log("⚠️ No se pudo cargar la sesión. Limpiando...");
                limpiarSesionCompleta();
            } else {
                const activos = jugadoresActuales.filter(j => j.jugadorId !== null);
                if (activos.length >= 2) {
                    console.log("✅ Partida restaurada exitosamente. Jugadores activos:", activos.length);
                    cargarVistaJuego();
                    reasignarTodosLosEventos();
                    actualizarColorBotonSorteo();
                    return;
                } else {
                    console.log("⚠️ Partida guardada sin suficientes jugadores activos");
                    limpiarSesionCompleta();
                }
            }
        } else {
            console.log("✅ Partida ya estaba cargada, mostrando juego");
            cargarVistaJuego();
            reasignarTodosLosEventos();
            actualizarColorBotonSorteo();
            return;
        }
    }
    
    if (diaActivo) {
        const continuar = confirm("⚠️ Ya hay una partida en curso. ¿Comenzar una nueva? Se perderá el progreso actual.");
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
    if(jugadoresValidos.length < 2) { alert("Debe haber al menos 2 jugadores"); return; }
    
    const nombresSet = new Set(jugadoresValidos.map(s => s.toLowerCase()));
    if(nombresSet.size !== jugadoresValidos.length) { alert("Los nombres no pueden repetirse"); return; }
    
    const fechaDiaInput = document.getElementById('fechaDia');
    const fecha = fechaDiaInput ? fechaDiaInput.value : '';
    if (!fecha) { alert("Selecciona fecha"); return; }
    
    const jugadoresConId = nombres.map(n => n ? obtenerOJugador(n) : null);
    
    let posicionesMap = new Map();
    
    if (mantenerUbicacion) {
        console.log("🎲 Modo mantener ubicación: NO se sortean las sillas");
        for (let i = 0; i < jugadoresConId.length; i++) {
            const jug = jugadoresConId[i];
            if (jug) {
                posicionesMap.set(i + 1, { jugadorId: jug.id, nombre: jug.nombre });
            }
        }
    } else {
        console.log("🎲 Modo sorteo: se sortean las sillas aleatoriamente");
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
    estadoMachActual = {
        numero:1,
        patasActuales: new Map(),
        empatePendiente: null,
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
    
    if (btnEmpate) btnEmpate.onclick = () => { if(diaActivo) document.getElementById('modalEmpate').style.display = 'flex'; else alert("No hay un día activo"); };
    if (btnGestionJugador) btnGestionJugador.onclick = gestionarJugador;
    if (btnRetirarJugador) btnRetirarJugador.onclick = retirarJugador;
    if (btnStatsEnJuego) btnStatsEnJuego.onclick = mostrarEstadisticasDelDia;
    if (btnEstadisticasGlobalesJuego) btnEstadisticasGlobalesJuego.onclick = () => {
        if(!diaActivo) return alert('Inicia un día');
        let fechas = almacenamiento.machs.map(m=>{const d=almacenamiento.dias.find(dia=>dia.id===m.diaId); return d?d.fecha:null;}).filter(f=>f);
        let minFecha = fechas.length ? [...fechas].sort()[0] : getFechaLocal();
        let maxFecha = getFechaLocal();
        const fechaDesde = document.getElementById('fechaDesde');
        const fechaHasta = document.getElementById('fechaHasta');
        if(fechaDesde) fechaDesde.value = minFecha; if(fechaHasta) fechaHasta.value = maxFecha;
        cargarEstadisticasGlobales(minFecha, maxFecha);
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
        if (mantenerUbicacion) {
            btn.textContent = "🎲 Iniciar juego (sin sorteo)";
        } else {
            btn.textContent = "🎲 Sortear sillas e iniciar";
        }
    } else {
        btn.style.background = "#8b5cf6";
        btn.textContent = "🎲 Sortear sillas e iniciar";
    }
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
        alert("No hay un día activo");
        return;
    }
    const historial = estadoMachActual.historialGanadores;
    if (historial.length === 0) {
        alert("Aún no se ha registrado ninguna mano ganada ni empate en el día.");
        return;
    }
    const modalHistorial = document.createElement('div');
    modalHistorial.className = 'modal';
    modalHistorial.style.display = 'flex';
    let html = `
        <div class="modal-content" style="max-width: 650px; max-height: 70vh; overflow-y: auto;">
            <h3>📜 Historial completo (manos ganadas y salidas por empate)</h3>
            <table style="width:100%; font-size:0.7rem;">
                <thead>
                    <tr><th>#</th><th>Jugador</th><th>Motivo / Forma</th><th>Patas</th><th>Mach</th><th>Hora</th></td>
                </thead>
                <tbody>
    `;
    const reverso = [...historial].reverse();
    reverso.forEach((item, idx) => {
        const hora = new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        let formaMostrada = '';
        if (item.forma === 'cierre') formaMostrada = '🚪 Cierre';
        else if (item.forma === 'pegado') formaMostrada = '🏃 Pegado';
        else if (item.forma === 'capicua') formaMostrada = '🀰 Capicua';
        else if (item.forma === 'empate') formaMostrada = '⚖️ Empate (comienza partida)';
        else formaMostrada = item.forma;
        const machOrdinal = item.machNumero + 'º';
        html += `<tr>
            <td>${idx+1}</td>
            <td>${escapeHtml(item.nombre)}</td>
            <td class="text-center">${formaMostrada}</td>
            <td class="text-center">${item.patasGanadas}</td>
            <td class="text-center">${machOrdinal}</td>
            <td class="text-center">${hora}</td>
        </tr>`;
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
            const fechaDesde = document.getElementById('fechaDesde');
            const fechaHasta = document.getElementById('fechaHasta');
            cargarEstadisticasGlobales(fechaDesde ? fechaDesde.value : '', fechaHasta ? fechaHasta.value : '');
        }
    }
}

// ==================== EXPORTACIÓN A PDF ====================
function exportarPDFGlobales() {
    if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
        alert('❌ La librería PDF no está cargada. Recarga la página.');
        return;
    }
    
    const { jsPDF } = window.jspdf || jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.text("Estadisticas Globales - Domino Pintintin", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 30);
    
    const desde = document.getElementById('fechaDesde').value;
    const hasta = document.getElementById('fechaHasta').value;
    if (desde || hasta) {
        doc.text(`Periodo: ${desde || 'inicio'} al ${hasta || 'hoy'}`, 20, 38);
    }
    
    // Función para eliminar emojis y caracteres especiales
    function limpiarTexto(texto) {
        if (!texto) return '';
        // Lista completa de emojis a eliminar
        const emojis = /[🏆🦶🐔🀰🚪🏃🧤💧🎯📥⚖️🧩📅📊⭐🔄👑🥈🪑❓⚠️✅❌➕➖🔍📎🖨️📈📊🎲⚙️👥📋💾📂🔧🔬🔨🧹🔄🔐🔍🚪🎯🀰🐔💧🧤🏃🚪📥🎯⚖️🧩👥📅📊🏆🦶]/g;
        let limpio = texto.replace(emojis, '');
        // Eliminar también espacios múltiples
        limpio = limpio.replace(/\s+/g, ' ').trim();
        return limpio;
    }
    
    const container = document.getElementById('resultadosStats');
    let yOffset = 50;
    
    if (container) {
        const tablas = container.querySelectorAll('table');
        
        for (let i = 0; i < tablas.length; i++) {
            const tabla = tablas[i];
            
            // Obtener encabezados (usar la última fila que tiene texto plano)
            const headers = [];
            const headerRows = tabla.querySelectorAll('thead tr');
            
            if (headerRows.length > 0) {
                // Usar la última fila de encabezados (sin emojis)
                const lastHeaderRow = headerRows[headerRows.length - 1];
                lastHeaderRow.querySelectorAll('th').forEach(th => {
                    let texto = limpiarTexto(th.innerText);
                    if (texto) headers.push(texto);
                });
            }
            
            // Si no se encontraron headers, usar la primera fila limpiada
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
                row.querySelectorAll('td').forEach(td => {
                    rowData.push(limpiarTexto(td.innerText));
                });
                if (rowData.length) data.push(rowData);
            });
            
            if (headers.length > 0 && data.length > 0 && data[0].length > 0) {
                if (yOffset > 250) {
                    doc.addPage();
                    yOffset = 20;
                }
                
                // Título de la sección (día o resumen general)
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
    alert("✅ PDF exportado correctamente");
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
    if(fechaMostrada && diaActivo) fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
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
        } else alert("Selecciona quién da agua");
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

// ==================== FUNCIÓN FINALIZAR PATA CON TOPE DE 5 ====================
function finalizarPataConAgua(ganadorId, forma, patasAApuntar, empatesAcumulados, jugadorAguaId) {
    let patasBase = (forma === 'capicua') ? 2 : 1;
    let patasConTope = calcularPatasConTope(ganadorId, patasBase, empatesAcumulados);
    
    let partGanador = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === ganadorId);
    if (empatesAcumulados > 0 && partGanador) {
        partGanador.empatesGanados = (partGanador.empatesGanados || 0) + 1;
        let extraPorEmpate = patasConTope - patasBase;
        if (extraPorEmpate > 0) {
            partGanador.patasPorEmpate = (partGanador.patasPorEmpate || 0) + extraPorEmpate;
        }
    }
    if (estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
        estadoMachActual.empatePendiente = null;
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

// --- MODAL TERMINACIÓN ---
const modalTerminacion = document.getElementById('modalTerminacion');
const terminacionInfo = document.getElementById('terminacionInfo');

function abrirModalTerminacion() {
    if(!ganadorPendiente) return;
    const ganadorNombre = jugadoresActuales.find(j => j.jugadorId === ganadorPendiente)?.nombre;
    if(terminacionInfo) terminacionInfo.innerText = `Ganador: ${ganadorNombre}`;
    if(modalTerminacion) modalTerminacion.style.display = 'flex';
}

function cerrarModalTerminacion() { if(modalTerminacion) modalTerminacion.style.display = 'none'; }

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

async function verificarFinMach(ganadorId) {
    let patasGanador = estadoMachActual.patasActuales.get(ganadorId);
    if(patasGanador >= 5) {
        let ganadorNombre = jugadoresActuales.find(j=>j.jugadorId===ganadorId).nombre;
        let esPollona = true;
        for(let j of jugadoresActuales) if(j.jugadorId && j.jugadorId !== ganadorId && (estadoMachActual.patasActuales.get(j.jugadorId) || 0) > 0) esPollona = false;
        let participantesMach = [];
        for(let j of jugadoresActuales) participantesMach.push({ jugadorId: j.jugadorId, nombre: j.nombre || `Silla ${j.posicion} Vacía`, patasFinales: j.jugadorId ? (estadoMachActual.patasActuales.get(j.jugadorId) || 0) : 0 });
        
        almacenamiento.machs.push({ 
            id: almacenamiento.machs.length+1, 
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
        ultimaJugadaFueAgua = false;
        renderizarJugadores();
        const numMachActualSpan = document.getElementById('numMachActual');
        const fechaMostrada = document.getElementById('fechaMostrada');
        if(numMachActualSpan) numMachActualSpan.innerText = estadoMachActual.numero;
        if(fechaMostrada && diaActivo) fechaMostrada.innerText = `📅 ${diaActivo.fecha}  |  Mach #${estadoMachActual.numero}`;
        setTimeout(() => { if(ganadorMachMsg) ganadorMachMsg.innerText = ''; }, 4000);
    }
    guardarSesionCompleta();
}

// ==================== NUEVA LÓGICA DE EMPATE ====================
function procesarEmpateConAguaYSalida(jugadoresEmpatadosIds) {
    const jugadoresActivos = jugadoresActuales.filter(j => j.jugadorId !== null);
    const jugadoresNoEmpatados = jugadoresActivos.filter(j => !jugadoresEmpatadosIds.includes(j.jugadorId));
    
    const despuesDeAsignarAgua = () => {
        const jugadorSale = obtenerJugadorQueSale(ultimoGanadorId, jugadoresActuales);
        if (jugadorSale) {
            registrarSalidaPorEmpate(jugadorSale.jugadorId);
            mostrarModalSalida(jugadorSale);
            actualizarGanadores(jugadorSale.jugadorId);
        } else {
            const avisoEmpateDiv = document.getElementById('avisoEmpate');
            if (avisoEmpateDiv) {
                let nombres = jugadoresEmpatadosIds.map(id => jugadoresActuales.find(j=>j.jugadorId===id)?.nombre).join(', ');
                avisoEmpateDiv.innerHTML = `⚠️ EMPATE entre: ${nombres}. ¡Comienza la siguiente mano!`;
                avisoEmpateDiv.style.display = 'block';
                setTimeout(() => { if(avisoEmpateDiv) avisoEmpateDiv.style.display = 'none'; }, 5000);
            }
        }
        estadoMachActual.empatePendiente = { jugadoresIds: jugadoresEmpatadosIds, resuelto: false };
        guardarSesionCompleta();
        guardarTodoEnLocalStorage();
        renderizarJugadores();
    };
    
    if (jugadoresNoEmpatados.length === 0) {
        despuesDeAsignarAgua();
    } else if (jugadoresNoEmpatados.length === 1) {
        const jugadorAgua = jugadoresNoEmpatados[0];
        let partAgua = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorAgua.jugadorId);
        if (partAgua) {
            partAgua.aguas = (partAgua.aguas || 0) + 1;
            guardarTodoEnLocalStorage();
            renderizarJugadores();
        }
        despuesDeAsignarAgua();
    } else {
        if (!checkAguaDiv) { console.error("No se encontró el elemento checkAgua"); despuesDeAsignarAgua(); return; }
        checkAguaDiv.innerHTML = '<p style="margin-bottom:0.5rem;">⚠️ Selecciona quién da AGUA (revolvió las fichas tras el empate):</p>';
        for (let j of jugadoresNoEmpatados) {
            let label = document.createElement('label');
            label.style.display = 'block';
            label.style.margin = '0.3rem 0';
            label.style.padding = '0.3rem';
            label.style.borderRadius = '0.3rem';
            label.style.cursor = 'pointer';
            label.innerHTML = `<input type="radio" name="aguaEmpate" value="${j.jugadorId}" style="margin-right:0.5rem;"> 🪑 ${j.posicion} - ${j.nombre}`;
            checkAguaDiv.appendChild(label);
        }
        if (modalAgua) {
            modalAgua.style.display = 'flex';
            const confirmarOriginal = confirmarAgua.onclick;
            const cancelarOriginal = cancelarAgua.onclick;
            const confirmarHandler = () => {
                const seleccionado = document.querySelector('input[name="aguaEmpate"]:checked');
                if (seleccionado) {
                    const jugadorAguaId = parseInt(seleccionado.value);
                    modalAgua.style.display = 'none';
                    let partAgua = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorAguaId);
                    if (partAgua) {
                        partAgua.aguas = (partAgua.aguas || 0) + 1;
                        guardarTodoEnLocalStorage();
                        renderizarJugadores();
                    }
                    confirmarAgua.onclick = confirmarOriginal;
                    cancelarAgua.onclick = cancelarOriginal;
                    despuesDeAsignarAgua();
                } else {
                    alert("Selecciona quién da agua");
                }
            };
            const cancelarHandler = () => {
                modalAgua.style.display = 'none';
                confirmarAgua.onclick = confirmarOriginal;
                cancelarAgua.onclick = cancelarOriginal;
                despuesDeAsignarAgua();
            };
            confirmarAgua.onclick = confirmarHandler;
            cancelarAgua.onclick = cancelarHandler;
        } else {
            console.error("Modal agua no encontrado");
            despuesDeAsignarAgua();
        }
    }
}

// ==================== FUNCIONES DE RENDERIZADO DE TABLAS ====================
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
    html += `<tr><th>Jugador</th>`;
    for (let metrica of metricas) html += `<th>${metrica.icono} ${metrica.nombre}</th>`;
    html += `</thead><tbody>`;
    for (let nombre of nombres) {
        html += `<tr>
            <td><strong>${escapeHtml(nombre)}</strong></td>`;
        for (let metrica of metricas) html += `<td class="text-center">${stats.get(nombre)[metrica.key] || 0}</td>`;
        html += `</tr>`;
    }
    html += `<tr style="background:#f1f5f9; font-weight:bold;">
        <td><strong>📊 TOTALES</strong></tr>`;
    for (let metrica of metricas) html += `<td class="text-center"><strong>${totalesPorMetrica[metrica.key]}</strong></td>`;
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
    for (let nombre of nombres) html += `<th>${escapeHtml(nombre)}</th>`;
    html += `<th style="background:#f1f5f9;">📊 TOTAL</th></thead><tbody>`;
    for (let metrica of metricas) {
        html += `<tr>`;
        html += `<td><strong>${metrica.icono} ${metrica.nombre}</strong></td>`;
        for (let nombre of nombres) html += `<td class="text-center">${stats.get(nombre)[metrica.key] || 0}</td>`;
        html += `<td class="text-center" style="background:#f1f5f9; font-weight:bold;">${totalesPorMetrica[metrica.key]}</td>`;
        html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    if (titulo) html += `<p class="stats-nota">⚡ ${titulo}</p>`;
    html += `</div>`;
    return html;
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

// ==================== ESTADÍSTICAS DEL DÍA ====================
function mostrarEstadisticasDelDia() {
    if (!diaActivo) return alert('Inicia un día primero');
    let machsDelDia = almacenamiento.machs.filter(m => m.diaId === diaActivo.id);
    let stats = new Map();
    for (let m of machsDelDia) {
        for (let p of m.participantes) {
            if (!p.jugadorId) continue;
            let s = stats.get(p.nombre) || { 
                machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
            };
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
        let s = stats.get(jugador.nombre);
        if (!s) {
            s = { 
                machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
            };
        }
        s.empatesParticipados = (s.empatesParticipados || 0) + (part.empatesParticipados || 0);
        s.empatesGanados = (s.empatesGanados || 0) + (part.empatesGanados || 0);
        s.pollonas = (s.pollonas || 0) + (part.pollonas || 0);
        s.patasPorEmpate = (s.patasPorEmpate || 0) + (part.patasPorEmpate || 0);
        stats.set(jugador.nombre, s);
    }
    if (diaActivo && jugadoresActuales) {
        for (let j of jugadoresActuales) {
            if (!j.jugadorId) continue;
            let s = stats.get(j.nombre);
            if (!s) {
                s = { 
                    machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                    paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
                };
            }
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

// ==================== ESTADÍSTICAS GLOBALES ====================
function cargarEstadisticasGlobales(desde, hasta) {
    let machsFiltrados = almacenamiento.machs;
    if (desde && hasta) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha >= desde && dia.fecha <= hasta; });
    else if (desde) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha >= desde; });
    else if (hasta) machsFiltrados = machsFiltrados.filter(m => { const dia = almacenamiento.dias.find(d => d.id === m.diaId); return dia && dia.fecha <= hasta; });
    let statsTotales = new Map();
    for (let m of machsFiltrados) {
        for (let p of m.participantes) {
            if (!p.jugadorId) continue;
            let s = statsTotales.get(p.nombre) || { 
                machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
            };
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
        if (!statsTotales.has(jugador.nombre)) {
            statsTotales.set(jugador.nombre, { 
                machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
            });
        }
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
                    let s = statsJugador.get(p.nombre) || { 
                        machs:0, patas:0, forros:0, aguas:0, pollonas:0, capicuas:0, cierres:0, pegado:0, 
                        paseManoDados:0, paseManoRecibidos:0, empatesParticipados:0, empatesGanados:0, patasPorEmpate:0 
                    };
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

function getFechaLocal() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// ==================== FUNCIÓN GLOBAL PARA GRÁFICAS ====================
window.abrirGraficas = function() {
    console.log("🖱️ Abriendo gráficas desde función global");
    sessionStorage.setItem('viniendoDeGraficas', 'true');
    window.location.href = 'estadisticas_graficas.html';
};

// ==================== BOTÓN ANÁLISIS DE RENDIMIENTO ====================
function abrirAnalisis() {
    // Intentar varias rutas posibles por si el archivo está en diferentes ubicaciones
    const rutasPosibles = [
        './analisis_jugador.html',
        'analisis_jugador.html',
        '/analisis_jugador.html'
    ];
    
    // Usar la primera ruta (relativa a la raíz)
    window.location.href = 'analisis_jugador.html';
}

// ==================== EVENTO PRINCIPAL ====================
window.onload = () => {
    console.log("🚀 Iniciando Dominó Pintintín v5.3.0");
    cargarTodoDesdeLocalStorage();
    validarConsistenciaMachs();
    
    const btnAnalisis = document.getElementById('btnAnalisisRendimiento');
    if (btnAnalisis) {
        btnAnalisis.onclick = abrirAnalisis;
    }
    
    const volviendoDeGraficas = sessionStorage.getItem('volviendoDeGraficas');
    if (volviendoDeGraficas === 'true') {
        sessionStorage.removeItem('volviendoDeGraficas');
        console.log("📊 Volviendo de gráficas");
        if (cargarSesionCompleta() && diaActivo) {
            console.log("✅ Restaurando juego después de gráficas");
            cargarVistaJuego();
            reasignarTodosLosEventos();
        } else {
            document.getElementById('vistaConfig').style.display = 'block';
            document.getElementById('vistaJuego').style.display = 'none';
            document.getElementById('vistaEstadisticas').style.display = 'none';
        }
    } 
    else if (hayPartidaGuardada()) {
        console.log("📀 Detectada partida guardada, restaurando...");
        if (cargarSesionCompleta() && diaActivo && jugadoresActuales.length > 0) {
            console.log("✅ Partida restaurada exitosamente en onload");
            cargarVistaJuego();
            reasignarTodosLosEventos();
        } else {
            console.log("⚠️ Error al restaurar partida en onload");
            document.getElementById('vistaConfig').style.display = 'block';
            document.getElementById('vistaJuego').style.display = 'none';
            document.getElementById('vistaEstadisticas').style.display = 'none';
        }
    } 
    else {
        console.log("🆕 Modo configuración - sin partida activa");
        document.getElementById('vistaConfig').style.display = 'block';
        document.getElementById('vistaJuego').style.display = 'none';
        document.getElementById('vistaEstadisticas').style.display = 'none';
    }
    
    const fechaDiaInput = document.getElementById('fechaDia');
    if (fechaDiaInput && !fechaDiaInput.value) fechaDiaInput.value = getFechaLocal();
    renderInputsJugadores();
    actualizarDatalistJugadores();
    actualizarColorBotonSorteo();
    
    iniciarDeteccionAccesoAdmin();
    
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
    const btnVerMachsPorDia = document.getElementById('btnVerMachsPorDia');
    const btnGraficasConfig = document.getElementById('btnGraficasConfig');
    const chkMantenerUbicacion = document.getElementById('mantenerUbicacion');
    
    if (chkMantenerUbicacion) {
        chkMantenerUbicacion.addEventListener('change', actualizarColorBotonSorteo);
    }
    
    if (btnGraficasConfig) {
        btnGraficasConfig.onclick = window.abrirGraficas;
    }
    
    if (btnVerMachsPorDia) {
        btnVerMachsPorDia.onclick = () => { window.location.href = 'ver_machs_por_dia.html'; };
    }
    
    if(btnSortearEIniciar) btnSortearEIniciar.onclick = sortearEIniciar;
    if(btnGestionJugador) btnGestionJugador.onclick = gestionarJugador;
    if(btnRetirarJugador) btnRetirarJugador.onclick = retirarJugador;
    if(btnCerrarDia) btnCerrarDia.onclick = () => { if(diaActivo) mostrarModalCerrarDia(); };
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
        agregarBotonVolverSuperior();
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
    if(btnBorrarTodo) btnBorrarTodo.onclick = () => { let pass = prompt("🔐 Contraseña:"); if(pass === "pintintin") { localStorage.clear(); alert("Datos borrados. Recargando..."); window.location.reload(); } else alert("Contraseña incorrecta"); };
    if(btnExportarBackup) btnExportarBackup.onclick = exportarBackupManual;
    if(importBackupInput) importBackupInput.onchange = (e) => { if(e.target.files.length) importarBackup(e.target.files[0]); };
    if(btnExportarCSV) btnExportarCSV.onclick = () => { let csv = "Fecha,Mach,Ganador\n"; for(let m of almacenamiento.machs) { const dia = almacenamiento.dias.find(d=>d.id===m.diaId); let ganador = m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre || '?'; csv += `${dia ? dia.fecha : '?'},${m.numeroMach},${ganador}\n`; } let blob = new Blob([csv], {type:'text/csv'}); let a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pintintin_stats.csv'; a.click(); };
    if(btnExportarPDF && window.jspdf) {
        btnExportarPDF.onclick = exportarPDFGlobales;
    }
    if(btnEmpate) {
        btnEmpate.onclick = () => {
            if(!diaActivo) return alert("No hay un día activo");
            if(checkEmpateDiv) checkEmpateDiv.innerHTML = '';
            for(let j of jugadoresActuales) if(j.jugadorId) { 
                let l=document.createElement('label'); 
                l.innerHTML=`<input type="checkbox" value="${j.jugadorId}"> ${j.nombre}`; 
                if(checkEmpateDiv) checkEmpateDiv.appendChild(l); 
            }
            if(modalEmpate) modalEmpate.style.display='flex';
        };
    }
    if(confirmarEmpate) {
        confirmarEmpate.onclick = () => {
            if(!checkEmpateDiv || !diaActivo) return; 
            let checks = [...checkEmpateDiv.querySelectorAll('input:checked')]; 
            if(checks.length < 2) return alert('Selecciona al menos dos jugadores empatados');
            const jugadoresEmpatados = checks.map(c => parseInt(c.value));
            for (let jugadorId of jugadoresEmpatados) {
                let part = almacenamiento.participaciones.find(p => p.diaId === diaActivo.id && p.jugadorId === jugadorId);
                if (part) {
                    part.empatesParticipados = (part.empatesParticipados || 0) + 1;
                    part.empatesAcumulados = (part.empatesAcumulados || 0) + 1;
                }
            }
            for (let part of almacenamiento.participaciones.filter(p => p.diaId === diaActivo.id)) {
                if (!jugadoresEmpatados.includes(part.jugadorId)) part.empatesAcumulados = 0;
            }
            guardarTodoEnLocalStorage();
            renderizarJugadores();
            if(modalEmpate) modalEmpate.style.display = 'none';
            procesarEmpateConAguaYSalida(jugadoresEmpatados);
        };
    }
    if(cancelarEmpate) cancelarEmpate.onclick = () => { if(modalEmpate) modalEmpate.style.display='none'; };
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
