// ==================== DOMINÓ PINTINTÍN - VERSIÓN 5.0.2 (CORREGIDA) ====================
// CORRECCIONES v5.0.2:
// - NUEVA LÓGICA: "Salir del juego" con opción de conservar partida (sin cerrar día)
// - Arreglada restauración de partida (ya no falla por día inactivo)
// - Contraseña doble: acceso oculto pide "administrador", admin.html pide "admin"
// - Botón de continuación ahora funciona correctamente
// - MANUAL DE USUARIO ACTUALIZADO (versión extensa y detallada)
//
// Creado por Ricardo Castillo (Richard) - La Demajagua, Isla de la Juventud, Cuba

console.log("🎲 Dominó Pintintín - Versión 5.0.2 (corregida)");

// --- CONFIGURACIÓN INICIAL ---
let diaActivo = null;
let jugadoresActuales = [];
let estadoMachActual = {
    numero: 1,
    patasActuales: new Map(),
    empatePendiente: null,
    historialManos: [],
    historialGanadores: []
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
            historialGanadores: estadoMachActual.historialGanadores
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
            historialGanadores: data.estadoMachActual.historialGanadores || []
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
    const nombreArchivo = `Pinti_v502_${getDiaSemanaAbreviatura()}.json`;
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
    const nombreArchivo = `Pinti_v502_${formatearFechaParaNombre()}.json`;
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
            guardarTodoEnLocalStorage();
            limpiarSesionCompleta();
            diaActivo = null;
            jugadoresActuales = [];
            estadoMachActual = {
                numero: 1,
                patasActuales: new Map(),
                empatePendiente: null,
                historialManos: [],
                historialGanadores: []
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

// ==================== PUNTO 5: LÍMITE DE 5 PATAS POR MACH ====================
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

// ==================== PUNTO 13: PLACEHOLDER DINÁMICO ====================
function renderInputsJugadores() {
    const jugadoresInputsContainer = document.getElementById('jugadoresInputsContainer');
    if(!jugadoresInputsContainer) return;
    jugadoresInputsContainer.innerHTML = '';
    
    const hayPartidaGuardada = localStorage.getItem('sesionPintintinV2') !== null;
    
    for(let i = 1; i <= 4; i++) {
        let placeholder = "Nombre (opcional)";
        if (!hayPartidaGuardada) {
            if (i <= 2) placeholder = "Nombre (obligatorio)";
            else placeholder = "Nombre (opcional)";
        }
        jugadoresInputsContainer.innerHTML += `<div><label>🎲 Jugador ${i}</label><input type="text" id="jugador${i}" list="listaJugadores" placeholder="${placeholder}" autocomplete="off"></div>`;
    }
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

// ==================== ACCESO OCULTO A ADMIN (CONTRASEÑA "administrador") ====================
let tapCount = 0;
let tapTimer = null;

function iniciarDeteccionAccesoAdmin() {
    // Método 1: URL con parámetro
    if (window.location.search.includes('admin=true')) {
        const pwd = prompt("🔐 Contraseña de administrador:");
        if (pwd === "administrador") {
            window.location.href = 'admin.html';
        } else {
            alert("Contraseña incorrecta");
        }
        return;
    }
    
    // Método 2: 5 taps en el marcador de puntos del jugador 1
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
    
    // Método 3: Enlace oculto en créditos (clic en "Richard")
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

// ==================== PUNTO 4: MENSAJE DE EMPATE PERSISTENTE ====================
function actualizarAvisoEmpate() {
    const avisoEmpateDiv = document.getElementById('avisoEmpate');
    if(avisoEmpateDiv) {
        if(estadoMachActual.empatePendiente && !estadoMachActual.empatePendiente.resuelto) {
            let nombres = estadoMachActual.empatePendiente.jugadoresIds.map(id => jugadoresActuales.find(j=>j.jugadorId===id)?.nombre).join(', ');
            avisoEmpateDiv.innerText = `⚠️ EMPATE entre: ${nombres}.`;
            avisoEmpateDiv.style.display = 'block';
        } else {
            avisoEmpateDiv.innerText = '';
            avisoEmpateDiv.style.display = 'none';
        }
    }
}

// ==================== MODAL DE SALIR DEL JUEGO (NUEVA LÓGICA) ====================
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
            historialGanadores: []
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

// ==================== SORTEO E INICIAR (CORREGIDO) ====================
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
    
    let nombresIngresados = 0;
    for (let i = 1; i <= 4; i++) {
        let n = document.getElementById(`jugador${i}`)?.value.trim();
        if (n && n !== "") nombresIngresados++;
    }
    
    if (nombresIngresados < 2) {
        alert("❌ Debe haber al menos 2 jugadores para iniciar un nuevo juego");
        return;
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
    estadoMachActual = {
        numero:1,
        patasActuales: new Map(),
        empatePendiente: null,
        historialManos: [],
        historialGanadores: []
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
            if(contenidoAyuda) contenidoAyuda.innerHTML = manualHTML;
            if(modalAyuda) modalAyuda.style.display = 'flex';
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
    
    if (hayPartidaGuardada()) {
        btn.style.background = "#10b981";
        btn.textContent = "🎲 Continuar partida guardada";
        btn.style.display = "block";
        return;
    }
    
    if (diaActivo) {
        btn.style.background = "#8b5cf6";
        btn.textContent = "🎲 Sortear e iniciar NUEVA";
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
        btn.textContent = "🎲 Sortear sillas e iniciar";
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
                    <tr><th>#</th><th>Jugador</th><th>Motivo / Forma</th><th>Patas</th><th>Mach</th><th>Hora</th></tr>
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
                    <td>${formaMostrada}</td>
                    <td>${item.patasGanadas}</td>
                    <td>${machOrdinal}</td>
                    <td>${hora}</td>
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
                avisoEmpateDiv.innerText = `⚠️ EMPATE entre: ${nombres}. No hay un claro salidor.`;
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
        <td><strong>📊 TOTALES</strong></td>`;
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
    const botonesSecundarios = document.querySelector('.botones-secundarios');
    if (botonesSecundarios && !document.getElementById('btnGraficasConfig')) {
        const btnGraficas = document.createElement('button');
        btnGraficas.id = 'btnGraficasConfig';
        btnGraficas.className = 'secundario';
        btnGraficas.innerHTML = '📈 Gráficas interactivas';
        btnGraficas.onclick = () => {
            sessionStorage.setItem('viniendoDeGraficas', 'true');
            window.location.href = 'estadisticas_graficas.html';
        };
        const estadisticasBtn = document.getElementById('irAEstadisticas');
        if (estadisticasBtn && estadisticasBtn.nextSibling) {
            botonesSecundarios.insertBefore(btnGraficas, estadisticasBtn.nextSibling);
        } else {
            botonesSecundarios.appendChild(btnGraficas);
        }
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

// ==================== MANUAL DE USUARIO (ACTUALIZADO v5.0.2 - VERSIÓN EXTENSA) ====================
const manualHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Usuario - Dominó Pintintín v5.0.2</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
            background: #f1f5f9;
            padding: 2rem;
            line-height: 1.6;
            color: #1e293b;
        }
        .manual-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            padding: 2rem;
        }
        h1 {
            color: #1e293b;
            text-align: center;
            border-bottom: 3px solid #8b5cf6;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        .subtitulo {
            text-align: center;
            color: #475569;
            margin-bottom: 2rem;
        }
        .version-badge {
            display: inline-block;
            background: #8b5cf6;
            color: white;
            padding: 0.2rem 0.8rem;
            border-radius: 2rem;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }
        .creador {
            text-align: center;
            background: #e0e7ff;
            padding: 1rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .creador span {
            color: #8b5cf6;
            cursor: pointer;
            text-decoration: underline;
            font-weight: bold;
        }
        h2 {
            color: #334155;
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-left: 4px solid #8b5cf6;
            padding-left: 1rem;
        }
        h3 {
            color: #475569;
            margin-top: 1.2rem;
            margin-bottom: 0.5rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.85rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 0.5rem;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #e2e8f0;
            font-weight: bold;
        }
        ul, ol {
            margin: 0.5rem 0 1rem 1.5rem;
        }
        li {
            margin: 0.3rem 0;
        }
        code {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
            font-family: monospace;
            font-size: 0.9em;
        }
        .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            text-align: center;
            font-size: 0.8rem;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .badge {
            display: inline-block;
            background: #8b5cf6;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.7rem;
            margin-right: 0.5rem;
        }
        .badge-nuevo {
            background: #10b981;
        }
        .badge-warning {
            background: #dc2626;
        }
        .ejemplo {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            border-left: 4px solid #8b5cf6;
        }
        .indice {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            columns: 2;
            column-gap: 2rem;
        }
        .indice a {
            text-decoration: none;
            color: #4f46e5;
        }
        .indice a:hover {
            text-decoration: underline;
        }
        .nota {
            background: #fef9c3;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
            font-size: 0.85rem;
        }
        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }
            .manual-container {
                padding: 1rem;
            }
            .indice {
                columns: 1;
            }
        }
    </style>
</head>
<body>
<div class="manual-container">
    <h1>📖 MANUAL DE USUARIO <span class="version-badge">Versión 5.0.2</span></h1>
    <div class="subtitulo">🀰 DOMINÓ PINTINTÍN - Aplicación para Campeonato de Dominó (4 jugadores individuales)</div>
    <div class="creador">
        <strong>Creado por:</strong> Ricardo Castillo (<span id="manualAdminLink">Richard</span>)<br>
        <strong>Ubicación:</strong> La Demajagua, Isla de la Juventud, Cuba<br>
        <strong>Versión actual:</strong> 5.0.2 - "Restauración de partida CORREGIDA y acceso oculto a admin"
    </div>

    <script>
        setTimeout(() => {
            const link = document.getElementById('manualAdminLink');
            if (link) {
                link.style.cursor = 'pointer';
                link.style.color = '#8b5cf6';
                link.style.textDecoration = 'underline';
                link.onclick = () => {
                    const pwd = prompt("🔐 Contraseña de administrador:");
                    if (pwd === "administrador") window.location.href = "admin.html";
                    else alert("Contraseña incorrecta");
                };
            }
        }, 100);
    </script>

    <h2>📋 ÍNDICE GENERAL</h2>
    <div class="indice">
        <ol>
            <li><a href="#intro">Introducción y filosofía del juego</a></li>
            <li><a href="#novedades502">🎉 Novedades de la versión 5.0.2</a></li>
            <li><a href="#historia">Historia y evolución del Pintintín (por qué jugamos individual)</a></li>
            <li><a href="#versiones">Historial de versiones</a></li>
            <li><a href="#pwa">¿Qué es una PWA? Ventajas</a></li>
            <li><a href="#instalacion">Instalación de la aplicación</a></li>
            <li><a href="#reglas">Reglas del juego (explicación detallada)</a></li>
            <li><a href="#inicio">Pantalla de inicio (Configuración)</a></li>
            <li><a href="#sorteo">Sorteo de posiciones (con ejemplos)</a></li>
            <li><a href="#juego">Pantalla de juego y sus elementos</a></li>
            <li><a href="#ganadores">👑 Identificación de ganadores (último y penúltimo)</a></li>
            <li><a href="#historial">📜 Historial de ganadores (manos y empates)</a></li>
            <li><a href="#empate">Declarar empate – Paso a paso</a></li>
            <li><a href="#agua-empate">💧 Asignación de agua después del empate</a></li>
            <li><a href="#gestion">Gestión de jugadores (añadir, sustituir, retirar)</a></li>
            <li><a href="#pata">Registro de una pata – Flujo completo</a></li>
            <li><a href="#pase-mano">Pase de mano automático (cómo funciona)</a></li>
            <li><a href="#estadisticas">Estadísticas (del día, globales, exportación)</a></li>
            <li><a href="#graficas">📈 Módulo de gráficas interactivas</a></li>
            <li><a href="#machsPorDia">📋 Ver Machs por Día – Explicación detallada</a></li>
            <li><a href="#empatesStats">Estadísticas de Empates y Patas por Empate</a></li>
            <li><a href="#limitePatas">⚠️ Límite de 5 patas por mach (casos prácticos)</a></li>
            <li><a href="#autocompletado">Autocompletado de nombres</a></li>
            <li><a href="#backup">Respaldo de datos (automático y manual)</a></li>
            <li><a href="#persistencia">Persistencia y continuación de partidas</a></li>
            <li><a href="#admin">Panel de administración – Funciones avanzadas</a></li>
            <li><a href="#adminAcceso">🔐 Acceso oculto al Panel de Administración</a></li>
            <li><a href="#borrar">Borrar todos los datos (con contraseña)</a></li>
            <li><a href="#ayuda">Ayuda integrada (botón ❓)</a></li>
            <li><a href="#problemas">Solución de problemas comunes</a></li>
            <li><a href="#faq">Preguntas frecuentes (más de 20 preguntas)</a></li>
            <li><a href="#creditos">Créditos y agradecimientos</a></li>
        </ol>
    </div>

    <!-- ==================== SECCIONES DETALLADAS ==================== -->

    <h2 id="intro">1. INTRODUCCIÓN Y FILOSOFÍA DEL JUEGO</h2>
    <p><strong>Dominó Pintintín</strong> es una aplicación diseñada específicamente para <strong>campeonatos de dominó individual</strong> (4 jugadores, cada uno juega para sí mismo). Nace en la peña de dominó de La Demajagua, Isla de la Juventud, Cuba, donde se juega con reglas propias: "agache", "botar gorda", "sin respeto de reglas". La aplicación automatiza el registro de puntos, patas, machs, forros, aguas, pases de mano y empates, permitiendo a los jugadores concentrarse en el juego.</p>
    <p>La app es una <strong>PWA (Progressive Web App)</strong>, por lo que puede instalarse en el móvil y funciona sin conexión a internet después de la primera carga. También es totalmente responsive, adaptándose a cualquier tamaño de pantalla.</p>
    <div class="nota">📌 <strong>Filosofía:</strong> "El dominó no se juega con las manos, se juega con la cabeza". La aplicación está pensada para ser justa, rápida y transparente, con trazabilidad completa de cada mano.</div>

    <h2 id="novedades502">🎉 2. NOVEDADES DE LA VERSIÓN 5.0.2</h2>
    <table>
        <thead><tr><th>Característica</th><th>Descripción</th></tr></thead>
        <tbody>
            <tr><td><strong>🐛 Restauración de partida CORREGIDA</strong></td><td>Al hacer clic en "Continuar partida guardada" ahora carga correctamente los jugadores y el estado del juego, sin pedir nombres nuevos. Ya no aparece el error "Debe haber al menos 2 jugadores".</td></tr>
            <tr><td><strong>🚪 Nueva lógica de salida</strong></td><td>El modal ahora se llama "Salir del juego". Si marcas "Conservar partida", sales sin cerrar el día (el día sigue activo y la sesión se guarda). Si lo desmarcas, se cierra el día definitivamente (activo=0) y se descarta la partida.</td></tr>
            <tr><td><strong>🔐 Acceso oculto a admin mejorado</strong></td><td>Ahora se pide contraseña <strong>"administrador"</strong> (palabra completa) para acceder a admin.html. Dentro del panel, la contraseña sigue siendo <code>admin</code> (doble autenticación). También hay un enlace en los créditos (el nombre "Richard").</td></tr>
            <tr><td><strong>📊 Tablas de administración corregidas</strong></td><td>La tabla de machs en el panel de admin muestra los datos correctamente alineados en sus columnas. El reporte general ordena por machs ganados (descendente) y luego por patas netas.</td></tr>
            <tr><td><strong>📋 Ver Machs por Día mejorado</strong></td><td>Los resúmenes ya no incluyen sillas vacías (solo jugadores reales). Nombres alineados a la izquierda y botones centrados. Tabla responsive.</td></tr>
            <tr><td><strong>⚠️ Límite de 5 patas por mach</strong></td><td>Si un jugador ganaría más de 5 patas en una mano, solo recibe las necesarias para llegar a 5. El excedente no se contabiliza para el mach (aunque se refleja en patas por empate).</td></tr>
        </tbody>
    </table>

    <h2 id="historia">3. HISTORIA Y EVOLUCIÓN DEL PINTINTÍN (POR QUÉ JUGAMOS INDIVIDUAL)</h2>
    <p>El nombre <strong>"Pintintín"</strong> surge de una expresión local en la peña de La Demajagua. El dominó tradicional se juega por parejas, y aunque es muy divertido, a menudo nos encontrábamos con un problema: <strong>la diferencia de nivel entre los jugadores</strong> es tan grande que al formar las parejas, el resultado solía ser muy desequilibrado. Los jugadores más experimentados se frustraban porque debían “cargar” a sus compañeros menos hábiles, y los principiantes se sentían presionados o menospreciados. Esto hacía que la partida no fuera realmente competitiva ni agradable para todos.</p>
    <p>Fue entonces que decidimos <strong>adoptar la modalidad individual</strong>. Cada jugador juega para sí mismo, sin depender de un compañero. Esta variante:</p>
    <ul>
        <li><strong>Elimina las desigualdades de pareja:</strong> Ya no importa quién es más fuerte o más débil; cada uno es responsable de su propia estrategia y suerte.</li>
        <li><strong>Es más participativa e inclusiva:</strong> Pueden jugar niños, niñas, mujeres, hombres y personas mayores, todos al mismo nivel de exigencia. No hay presión por “defraudar” a un compañero.</li>
        <li><strong>Fomenta la diversión familiar:</strong> En reuniones familiares, cualquier combinación de personas puede sentarse a jugar sin tener que preocuparse por equilibrar las parejas.</li>
        <li><strong>Mantiene la esencia competitiva:</strong> Cada jugador busca ganar por sí mismo, lo que hace el juego más intenso y emocionante.</li>
    </ul>
    <p>Así nació <strong>Dominó Pintintín</strong>: una aplicación que registra automáticamente todo lo que sucede en esta modalidad individual, liberando a los jugadores de las anotaciones manuales y permitiéndoles concentrarse en el placer del juego.</p>

    <h2 id="versiones">4. HISTORIAL DE VERSIONES</h2>
    <table>
        <thead><tr><th>Versión</th><th>Fecha</th><th>Novedades principales</th></tr></thead>
        <tbody>
            <tr><td>1.0</td><td>8/5/2026</td><td>Registro básico de patas, machs, forros y aguas.</td></tr>
            <tr><td>2.0</td><td>11/5/2026</td><td>PWA, persistencia de datos, respaldos automáticos.</td></tr>
            <tr><td>3.0</td><td>14/5/2026</td><td>Estadísticas completas: capicuas, cierres, pegados, pase de mano.</td></tr>
            <tr><td>3.5</td><td>26/5/2026</td><td>Estadísticas de empates.</td></tr>
            <tr><td>4.0</td><td>28/5/2026</td><td>🧩 Patas por Empate, autocompletado, backups, 💧 agua automática.</td></tr>
            <tr><td>4.5</td><td>29/5/2026</td><td>📈 Gráficas, 👑 identificación de ganadores.</td></tr>
            <tr><td>4.5.1</td><td>30/5/2026</td><td>📜 Historial de ganadores del día.</td></tr>
            <tr><td>4.5.7</td><td>31/5/2026</td><td>Modal cerrar día con opción de conservar partida.</td></tr>
            <tr><td>4.6.1</td><td>31/5/2026</td><td>Tablas corregidas, nuevo botón "Ver machs por día".</td></tr>
            <tr><td>5.0.0</td><td>31/5/2026</td><td>⚠️ Límite de 5 patas por mach, ver machs por día mejorado, acceso oculto a admin.</td></tr>
            <tr><td>5.0.1</td><td>1/6/2026</td><td>Corrección de continuación de partida (parcial).</td></tr>
            <tr><td><strong>5.0.2</strong></td><td><strong>1/6/2026</strong></td><td><strong>Restauración definitiva, nueva lógica de salida, doble contraseña para admin, correcciones visuales en tablas.</strong></td></tr>
        </tbody>
    </table>

    <h2 id="pwa">5. ¿QUÉ ES UNA PWA? VENTAJAS</h2>
    <p>Una PWA (Progressive Web App) es una aplicación web que se comporta como una nativa. Ventajas:</p>
    <ul>
        <li><strong>Instalable</strong> en la pantalla de inicio del móvil sin pasar por una tienda de aplicaciones.</li>
        <li><strong>Funciona offline</strong> (después de la primera carga).</li>
        <li><strong>Actualizaciones automáticas</strong> (el Service Worker cachea los nuevos archivos).</li>
        <li><strong>Segura</strong> (sirve a través de HTTPS en producción).</li>
    </ul>
    <p>Para instalarla en Android con Chrome, toca el menú de tres puntos y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".</p>

    <h2 id="instalacion">6. INSTALACIÓN DE LA APLICACIÓN</h2>
    <h3>En tu móvil Android (recomendado)</h3>
    <ol>
        <li>Abre la aplicación en <strong>Chrome</strong> (si la tienes alojada en un servidor HTTPS o en localhost).</li>
        <li>Toca los tres puntos ⋮ en la esquina superior derecha.</li>
        <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</li>
        <li>Confirma el nombre "Dominó Pintintín".</li>
        <li>La app quedará instalada como una nativa y funcionará sin internet.</li>
    </ol>
    <h3>Generar APK para distribución</h3>
    <p>Sube la app a un servidor HTTPS (GitHub Pages, Netlify), luego ve a <a href="https://pwabuilder.com" target="_blank">PWABuilder</a>, ingresa la URL y genera el APK.</p>
    <h3>En PC (navegador)</h3>
    <p>Solo abre el enlace y comienza a jugar. La interfaz es responsive y se adapta al tamaño de pantalla.</p>

    <h2 id="reglas">7. REGLAS DEL JUEGO (EXPLICACIÓN DETALLADA)</h2>
    <p>El dominó individual se juega con 4 jugadores, cada uno con sus 7 fichas (o 5 en la variante de 55). El objetivo es sumar patas hasta alcanzar 5 patas en un "mach". Cada mano termina cuando un jugador coloca su última ficha o cuando se bloquea el juego y gana el que tenga menos puntos (pegado). También existe la capicua, que es una forma especial de pegado.</p>
    
    <h3>Conceptos clave</h3>
    <ul>
        <li><strong>🏆 Pata:</strong> Unidad de puntuación. Se otorga al ganador de una mano (1 por cierre o pegado, 2 por capicua).</li>
        <li><strong>🧤 Forro:</strong> Penalización de 1 pata (se resta). Se asigna cuando un jugador comete una infracción o decide tomarlo voluntariamente.</li>
        <li><strong>💧 Agua:</strong> Se asigna al jugador que revolvió las fichas después de una mano (no afecta las patas, solo se contabiliza en estadísticas).</li>
        <li><strong>🎯 Pase de mano:</strong> Cuando un jugador cede su turno intencionalmente (pasa). El siguiente en sentido antihorario recibe el pase.</li>
        <li><strong>⚖️ Empate:</strong> Se declara cuando dos o más jugadores quedan empatados en una situación (por ejemplo, ambos se quedan sin jugada al mismo tiempo). Acumula un multiplicador para la próxima mano.</li>
        <li><strong>🏆 Mach:</strong> Conjunto de 5 patas. Cuando un jugador llega a 5, gana un mach y se reinician las patas a cero para todos.</li>
        <li><strong>🐔 Pollona:</strong> Mach en el que ningún otro jugador sumó ninguna pata (el ganador hizo todas las patas del mach). Otorga un punto extra en estadísticas.</li>
    </ul>

    <h3>Formas de terminación de una mano</h3>
    <table>
        <thead><tr><th>Forma</th><th>Patas base</th><th>Descripción</th></tr></thead>
        <tbody>
            <tr><td>🚪 Cierre</td><td>1</td><td>Un jugador coloca su última ficha y termina la mano. Puede ser cualquier ficha, doble o no, siempre que encaje en la cabeza correspondiente.</td></tr>
            <tr><td>🏃 Pegado (normal)</td><td>1</td><td>El juego se bloquea (nadie puede jugar) y gana el que tenga menos puntos en sus fichas restantes. También ocurre cuando un jugador, con una ficha que no es doble, solo tiene una opción de colocación (una sola cabeza) y al ponerla termina la partida.</td></tr>
            <tr><td>🀰 Capicua (pegue especial)</td><td>2</td><td>Ocurre cuando un jugador, con una ficha <strong>que no es doble</strong>, puede colocarla por <strong>cualquiera de las dos cabezas</strong> del tablero (es decir, la ficha encaja tanto en la cabeza izquierda como en la derecha) y con esa jugada <strong>termina la partida</strong> (se queda sin fichas). Es una variante más difícil y se premia con 2 patas. Si la ficha fuera un doble, o solo encajara en una cabeza, se considera pegado normal (1 pata).</td></tr>
        </tbody>
    </table>
    <div class="ejemplo">
        <strong>📌 EJEMPLO DE CAPICUA:</strong> El tablero tiene cabezas con valores 3 y 5. Un jugador tiene la ficha [3-5] (que no es doble). Esta ficha puede colocarse tanto en la cabeza de 3 como en la de 5. Si el jugador la coloca y se queda sin fichas, <strong>es capicua</strong> y recibe 2 patas.<br>
        <strong>📌 PEGADO NORMAL:</strong> Si la misma ficha [3-5] solo pudiera colocarse en una cabeza (por ejemplo, porque la otra cabeza no coincide), entonces sería un pegado normal y recibe 1 pata.
    </div>

    <h3>Efecto de los empates</h3>
    <p>Cuando hay empates consecutivos sin que nadie gane una mano, el multiplicador se acumula: base × 2ⁿ donde n = número de empates. Ejemplo: si hay 2 empates seguidos, la próxima mano que gane alguno de los empatados le dará base × 4 patas.</p>
    <div class="ejemplo">
        <strong>📌 EJEMPLO DE EMPATES:</strong><br>
        Jugadores: Tito, Richard, Osvaldo. Empate 1: Tito y Richard empatan (n=1). Acumulan 1. Luego otro empate (n=2). Luego Osvaldo gana con un cierre. Base=1, multiplicador 2²=4 → Osvaldo recibe 4 patas.
    </div>

    <h3>⚠️ Límite de 5 patas por mach (v5.0.2)</h3>
    <p>Si el cálculo anterior arrojara más de 5 patas (ej: base=2, n=3 → 2×8=16), el jugador solo recibe las patas necesarias para llegar a 5 (si ya tenía 0, recibe 5; si tenía 2, recibe 3). El excedente no se contabiliza para el mach, pero se guarda en la estadística "Patas por Empate" a modo informativo. Esto evita que un mach se alargue artificialmente.</p>

    <h2 id="inicio">8. PANTALLA DE INICIO (CONFIGURACIÓN)</h2>
    <p>Al abrir la app, si no hay partida guardada o se ha cerrado el día, se muestra la pantalla de configuración.</p>
    <h3>Campos y botones</h3>
    <ul>
        <li><strong>📅 Fecha:</strong> Por defecto la fecha actual. Se puede cambiar manualmente. Es importante para el registro histórico.</li>
        <li><strong>👥 Jugadores:</strong> Cuatro campos. En un juego nuevo, los dos primeros son obligatorios (placeholder "Nombre (obligatorio)"), los otros opcionales. Si hay partida guardada, todos son "Nombre (opcional)".</li>
        <li><strong>🎲 Sortear e iniciar:</strong> Botón principal (morado). Si existe partida guardada y no hay día activo, el botón se vuelve verde y dice "Continuar partida guardada".</li>
        <li><strong>📊 Estadísticas globales:</strong> Abre una vista con todas las estadísticas históricas, con filtro de fechas y exportación.</li>
        <li><strong>📈 Gráficas interactivas:</strong> Abre el módulo de gráficas.</li>
        <li><strong>📋 Ver machs por día:</strong> Abre el módulo que lista los machs de una fecha seleccionada.</li>
        <li><strong>⚠️ Borrar datos:</strong> Elimina toda la base de datos (pide contraseña <code>pintintin</code>).</li>
        <li><strong>💾 Exportar respaldo:</strong> Descarga un JSON con todos los datos.</li>
        <li><strong>📂 Importar respaldo:</strong> Permite cargar un JSON previamente exportado.</li>
    </ul>
    <div class="nota">📌 <strong>Consejo:</strong> Siempre exporta un respaldo antes de borrar datos o cerrar un día importante.</div>

    <h2 id="sorteo">9. SORTEO DE POSICIONES (CON EJEMPLOS)</h2>
    <p>El sorteo determina qué silla (1 a 4) ocupará cada jugador. Se simula una tirada de dados para cada jugador, se resuelven empates con nuevas tiradas, y luego se mezclan las sillas aleatoriamente.</p>
    <div class="ejemplo">
        <strong>🎲 EJEMPLO DE SORTEO:</strong><br>
        Jugadores: Tito (dado 5), Richard (dado 3), Osvaldo (dado 5), El Niche (dado 2).<br>
        - Empate entre Tito y Osvaldo: vuelven a tirar. Tito saca 6, Osvaldo 4 → orden: Tito, Osvaldo, Richard, El Niche.<br>
        - Se mezclan las sillas: [3,1,4,2].<br>
        - Asignación: Tito → silla 3, Osvaldo → silla 1, Richard → silla 4, El Niche → silla 2.<br>
        El orden de juego (sentido antihorario) será: silla 1 (Osvaldo) → silla 4 (Richard) → silla 3 (Tito) → silla 2 (El Niche) → vuelta a silla 1.
    </div>
    <p><strong>Importante:</strong> El sorteo se hace en orden de las manecillas del reloj (para decidir la precedencia), pero <strong>el juego y los pases de mano se realizan en sentido antihorario</strong> (por convención del dominó). La aplicación respeta esta dinámica.</p>

    <h2 id="juego">10. PANTALLA DE JUEGO Y SUS ELEMENTOS</h2>
    <p>Una vez iniciado el día, se muestra la pantalla de juego con cuatro tarjetas (una por silla, aunque estén vacías). Cada tarjeta de jugador activo contiene:</p>
    <ul>
        <li><strong>🪑 Posición y nombre:</strong> Con un color distintivo. Si es el último ganador, aparece 👑; si es el penúltimo, 🥈.</li>
        <li><strong>Patas actuales:</strong> Número grande. Es la cantidad de patas que lleva en el mach actual.</li>
        <li><strong>Estadísticas mini:</strong> Íconos con valores del día: 🚪 Cierres, 🏃 Pegados, 🀰 Capicuas, 🐔 Pollonas, 🧤 Forros, 💧 Aguas, 🎯 PM Dados, 📥 PM Recibidos, ⚖️ Empates, 🏆⚖️ E. Ganados, 🧩 Patas por Empate.</li>
        <li><strong>Botones:</strong> 🏆 Pata, 🧤 Forro, 🎯 Da PM.</li>
    </ul>
    <p><strong>Botones globales inferiores:</strong></p>
    <ul>
        <li><strong>⚖️ Declarar empate:</strong> Abre un modal para seleccionar los jugadores empatados.</li>
        <li><strong>➕ Añadir jugador / 🔄 Sustituir jugador:</strong> Cambia según si hay sillas vacantes o ya están ocupadas las cuatro.</li>
        <li><strong>➖ Salida de jugador:</strong> Retira a un jugador (mínimo 2 en mesa).</li>
        <li><strong>📊 Estadísticas del día:</strong> Muestra una tabla con los acumulados del día actual.</li>
        <li><strong>🌍 Estadísticas globales:</strong> Abre la vista de estadísticas históricas.</li>
        <li><strong>🚪 Salir del juego:</strong> Abre modal para salir conservando o no la partida.</li>
        <li><strong>❓ Ayuda:</strong> Botón flotante superior derecho.</li>
        <li><strong>📜 Historial:</strong> Botón (a veces aparece en la fila de botones globales) que muestra el historial de manos y empates.</li>
    </ul>

    <h2 id="ganadores">👑 11. IDENTIFICACIÓN DE GANADORES (ÚLTIMO Y PENÚLTIMO)</h2>
    <p>La aplicación mantiene un registro de los dos últimos ganadores de una pata (o salida por empate). Esto es crucial para saber quién comienza después de un empate (el siguiente al último ganador en sentido antihorario).</p>
    <div class="ejemplo">
        <strong>📌 SECUENCIA:</strong><br>
        - Tito gana una pata → 👑 Tito, 🥈 (vacío).<br>
        - Richard gana la siguiente pata → 👑 Richard, 🥈 Tito.<br>
        - Osvaldo gana → 👑 Osvaldo, 🥈 Richard.<br>
        - Se declara empate → el que comienza es el jugador siguiente a Osvaldo en sentido antihorario (por ejemplo, si Osvaldo está en silla 1, el siguiente en antihorario es silla 4). Ese jugador recibe la corona 👑 y el anterior 👑 pasa a 🥈.
    </div>

    <h2 id="historial">📜 12. HISTORIAL DE GANADORES (MANOS Y EMPATES)</h2>
    <p>Al pulsar el botón 📜 (visible en la pantalla de juego), se abre un modal con una tabla que muestra todas las manos registradas en el día actual, incluyendo:</p>
    <ul>
        <li>Número de orden (#).</li>
        <li>Jugador ganador o que salió por empate.</li>
        <li>Motivo: Cierre, Pegado, Capicua o Empate.</li>
        <li>Patas otorgadas (0 en caso de empate).</li>
        <li>Número de mach en que ocurrió.</li>
        <li>Hora exacta (timestamp).</li>
    </ul>
    <p>Esto permite reconstruir la partida y resolver disputas.</p>

    <h2 id="empate">13. DECLARAR EMPATE – PASO A PASO</h2>
    <ol>
        <li>Pulsa el botón <strong>⚖️ Declarar empate</strong>.</li>
        <li>En el modal, marca los <strong>checkboxes de los jugadores empatados</strong> (mínimo 2).</li>
        <li>Pulsa <strong>Aceptar</strong>.</li>
        <li>La aplicación incrementa los contadores de <strong>empates participados</strong> y <strong>empates acumulados</strong> de esos jugadores.</li>
        <li>Luego asigna el agua (ver siguiente punto).</li>
        <li>Determina quién comienza la partida (el jugador siguiente al último ganador en sentido antihorario) y muestra un modal.</li>
        <li>Registra la salida en el historial como "Empate (comienza partida)".</li>
        <li>Actualiza la corona 👑 al jugador que sale.</li>
    </ol>
    <div class="ejemplo">
        <strong>🎯 CASO PRÁCTICO:</strong> Último ganador: Richard (silla 2). Sentido antihorario: sillas 2 → 1 → 4 → 3 → 2. Los jugadores empatados son Tito (silla 1) y Osvaldo (silla 4). El siguiente a Richard en antihorario es silla 1 (Tito). Por tanto, Tito sale a jugar y recibe la corona.
    </div>

    <h2 id="agua-empate">💧 14. ASIGNACIÓN DE AGUA DESPUÉS DEL EMPATE</h2>
    <p>El agua (quien revuelve las fichas) se asigna automáticamente a un jugador que <strong>no esté empatado</strong>. La lógica es:</p>
    <ul>
        <li>Si hay un solo jugador no empatado, se le asigna el agua automáticamente.</li>
        <li>Si hay varios, se abre un modal para que el usuario elija quién da agua.</li>
        <li>Si todos los jugadores están empatados, no se asigna agua.</li>
    </ul>
    <p>El agua queda registrada en las estadísticas del jugador correspondiente (aumenta su contador de 💧 Aguas).</p>

    <h2 id="gestion">15. GESTIÓN DE JUGADORES (AÑADIR, SUSTITUIR, RETIRAR)</h2>
    <h3>➕ Añadir jugador</h3>
    <p>Cuando hay sillas vacantes, el botón "➕ Añadir jugador" está visible. Al pulsarlo, se pide el nombre y se asigna a una silla vacante <strong>aleatoria</strong>. Se crea automáticamente una participación para ese jugador en el día actual (con todas las estadísticas a cero).</p>
    <h3>🔄 Sustituir jugador</h3>
    <p>Cuando ya hay 4 jugadores, el botón cambia a "🔄 Sustituir jugador". Pide la posición (1-4) a sustituir y el nombre del nuevo jugador. Reemplaza al anterior manteniendo la misma silla. Las estadísticas del nuevo jugador se inicializan a cero; las del sustituido se conservan en el historial pero ya no participa.</p>
    <h3>➖ Salida de jugador</h3>
    <p>Solo visible si hay al menos 3 jugadores activos. Permite retirar a un jugador (deja su silla vacante). Útil si un jugador abandona la partida. Mínimo 2 jugadores en la mesa.</p>

    <h2 id="pata">16. REGISTRO DE UNA PATA – FLUJO COMPLETO</h2>
    <ol>
        <li>Pulsa <strong>🏆 Pata</strong> en la tarjeta del jugador que ganó la mano.</li>
        <li>Selecciona la forma de terminación: 🚪 Cierre, 🏃 Pegado o 🀰 Capicua.</li>
        <li>Si hay más de 2 jugadores, se abre modal para elegir quién da 💧 Agua. Si solo hay 2 jugadores, el agua se asigna automáticamente al otro.</li>
        <li>La aplicación calcula las patas base (1 o 2) y aplica el multiplicador por empates acumulados (base × 2ⁿ).</li>
        <li><strong>⚠️ Límite de 5 patas:</strong> Si las patas a sumar superan las necesarias para llegar a 5, se suman solo las necesarias. El excedente se descarta (pero se registra en patasPorEmpate).</li>
        <li>Se actualizan las patas actuales del ganador y se registra la mano en el historial.</li>
        <li>Se incrementan las estadísticas del ganador (cierres/pegados/capicuas según corresponda) y del que da agua (aguas).</li>
        <li>Se actualizan las coronas (último y penúltimo ganador).</li>
        <li>Si después de sumar las patas, el ganador alcanza 5 o más, se declara <strong>MACH</strong>:
            <ul>
                <li>Se guarda el mach en la base de datos con los participantes y sus patas finales.</li>
                <li>Se actualizan las estadísticas de los jugadores (machs ganados, patas netas, etc.) y se verifica si fue pollona (ningún otro sumó patas).</li>
                <li>Se reinician las patas de todos a 0 y se incrementa el número de mach en uno.</li>
                <li>Se muestra un mensaje de felicitación durante 4 segundos.</li>
            </ul>
        </li>
    </ol>
    <div class="ejemplo">
        <strong>🎯 EJEMPLO CON LÍMITE DE 5:</strong><br>
        Situación: Tito tiene 2 patas, empates acumulados = 2, gana una capicua (base=2).<br>
        Patas brutas = 2 × 2² = 8. Necesita 3 patas para llegar a 5. Solo recibe 3 patas. Alcanza el mach. Las 5 patas excedentes no se contabilizan para este mach.
    </div>

    <h2 id="pase-mano">17. PASE DE MANO AUTOMÁTICO (CÓMO FUNCIONA)</h2>
    <p>El pase de mano se registra pulsando <strong>🎯 Da PM</strong> en el jugador que da el pase. El sistema automáticamente:</p>
    <ul>
        <li>Determina el siguiente jugador activo en <strong>sentido antihorario</strong> (1→4→3→2→1) saltando sillas vacías.</li>
        <li>Incrementa el contador de "PM Dados" del dador y "PM Recibidos" del receptor.</li>
        <li>Registra el evento en el historial de manos (tipo 'paseMano').</li>
        <li>Muestra un mensaje emergente indicando quién dio y quién recibió el pase.</li>
    </ul>
    <p>Si no hay receptor (por ejemplo, solo un jugador activo), solo se registra el pase dado.</p>

    <h2 id="estadisticas">18. ESTADÍSTICAS (DEL DÍA, GLOBALES, EXPORTACIÓN)</h2>
    <h3>Estadísticas del día</h3>
    <p>Muestra una tabla con los acumulados del día actual, incluyendo patas del mach en curso. Se puede alternar entre vista normal (jugadores como filas) y transpuesta (indicadores como filas) mediante el botón 🔄.</p>
    <h3>Estadísticas globales</h3>
    <p>Permite filtrar por rango de fechas (desde/hasta) y ver los acumulados de todos los machs en ese período. También incluye un <strong>resumen general</strong> (todos los días) y una tabla por día. Se pueden exportar los datos a CSV (compatible con Excel) o a PDF (usando jsPDF).</p>
    <h3>Botón de exportación</h3>
    <ul>
        <li><strong>CSV:</strong> Exporta una tabla con columnas: Fecha, Mach #, Ganador. Útil para análisis externo.</li>
        <li><strong>PDF:</strong> Genera un documento con la misma tabla (requiere la librería jsPDF).</li>
    </ul>

    <h2 id="graficas">📈 19. MÓDULO DE GRÁFICAS INTERACTIVAS</h2>
    <p>Acceso desde el botón <strong>📈 Gráficas interactivas</strong> en la pantalla de configuración. Características:</p>
    <ul>
        <li><strong>Filtro por fechas:</strong> Se cargan automáticamente la primera y última fecha con datos.</li>
        <li><strong>Selección de jugadores:</strong> Lista ordenada por rendimiento (más machs, más patas, etc.) con checkbox para incluir/excluir.</li>
        <li><strong>Tipo de gráfico:</strong> Líneas, Barras (múltiples indicadores), Radar, Pastel, Polar.</li>
        <li><strong>Indicadores:</strong> Todos los disponibles (Machs, Patas netas, Pollonas, Capicuas, Cierres, Pegados, Forros, Aguas, PM Dados, PM Recibidos, Empates, E. Ganados, Patas por Empate).</li>
        <li><strong>Gráfico de barras:</strong> Permite seleccionar múltiples indicadores (por defecto: Machs, Patas, Aguas).</li>
        <li><strong>Exportación:</strong> Imagen PNG del gráfico o CSV con los datos subyacentes.</li>
    </ul>
    <p>Al volver al juego (<strong>← Volver al juego</strong>), la aplicación restaura la partida automáticamente (si había una).</p>

    <h2 id="machsPorDia">📋 20. VER MACHS POR DÍA – EXPLICACIÓN DETALLADA</h2>
    <p>Este módulo (acceso desde el botón <strong>📋 Ver machs por día</strong>) permite consultar el historial de machs de una fecha concreta. Interfaz:</p>
    <ul>
        <li><strong>Selector de fechas:</strong> Solo aparecen días que tienen al menos un mach registrado. No muestra la etiqueta "(activo)" para evitar confusiones.</li>
        <li><strong>Botón "Ver machs del día":</strong> Carga la tabla y los resúmenes.</li>
        <li><strong>Botón "Exportar CSV":</strong> Descarga los machs mostrados en formato CSV (con columnas: N° Mach, Ganador, Participantes).</li>
        <li><strong>Tabla principal:</strong> Muestra cada mach con su número, ganador y lista de participantes (incluyendo sillas vacías si las hubo) con sus patas finales. La tabla tiene scroll horizontal para móviles.</li>
        <li><strong>Resumen del día:</strong> Tabla con los <strong>jugadores reales</strong> (excluye sillas vacías) mostrando machs ganados y patas totales en ese día. Nombres alineados a la izquierda.</li>
        <li><strong>Resumen acumulado general:</strong> Similar al anterior pero sumando todos los días (toda la historia de la base de datos).</li>
    </ul>
    <div class="nota">📌 Esta herramienta es muy útil para revisar el desempeño de los jugadores en jornadas pasadas o para preparar estadísticas de un torneo.</div>

    <h2 id="empatesStats">21. ESTADÍSTICAS DE EMPATES Y PATAS POR EMPATE</h2>
    <ul>
        <li><strong>⚖️ Empates:</strong> Número de veces que el jugador ha participado en un empate (se incrementa cada vez que se declara un empate y el jugador está seleccionado).</li>
        <li><strong>🏆⚖️ E. Ganados:</strong> Número de veces que el jugador ha ganado una mano <strong>estando en empate</strong> (es decir, con empates acumulados > 0).</li>
        <li><strong>🧩 Patas por Empate:</strong> Total de patas <strong>extra</strong> ganadas por efecto de los empates. Se calcula como (patas realmente otorgadas - patas base). Si se aplicó el límite de 5 patas, el extra se calcula sobre las patas realmente sumadas. Por ejemplo, si un jugador tenía 2 patas, base=1, multiplicador=4 → patas brutas=4, pero solo necesitaba 3 para llegar a 5 → se le dan 3. El extra sería 3 - 1 = 2, no 3. Esto evita distorsiones.</li>
    </ul>

    <h2 id="limitePatas">⚠️ 22. LÍMITE DE 5 PATAS POR MACH – CASOS PRÁCTICOS</h2>
    <p>Esta es una de las mejoras más importantes de la versión 5.0.2. Antes, un jugador podía ganar más de 5 patas en una sola mano, lo que rompía la definición de mach (5 patas). Ahora se aplica un tope.</p>
    <div class="ejemplo">
        <strong>📌 CASO 1:</strong> Jugador con 0 patas, gana una capicua (base=2) con 3 empates acumulados (multiplicador 8). Patas brutas = 16. Necesita 5 para llegar a mach. Recibe 5. El excedente (11) no se contabiliza. El mach se cierra inmediatamente.<br>
        <strong>📌 CASO 2:</strong> Jugador con 3 patas, gana un cierre (base=1) con 2 empates (multiplicador 4). Patas brutas = 4. Necesita 2 para llegar a 5. Recibe 2. Alcanza el mach.<br>
        <strong>📌 CASO 3:</strong> Jugador con 4 patas, gana un pegado (base=1) con 0 empates. Patas brutas = 1. Necesita 1 → recibe 1. Mach.
    </div>
    <p>El sistema muestra en la consola del navegador (para el administrador) un mensaje de "Excedente de X patas no contabilizadas". Las estadísticas de patas por empate reflejan el extra realmente otorgado.</p>

    <h2 id="autocompletado">23. AUTOCOMPLETADO DE NOMBRES</h2>
    <p>Los campos de entrada de jugadores utilizan un <code>&lt;datalist&gt;</code> que sugiere nombres de jugadores ya registrados en la base de datos. Si escribes un nombre nuevo, al iniciar el juego se crea automáticamente un nuevo jugador en la tabla de jugadores. Esto evita tener que agregarlos manualmente desde el panel de administración.</p>

    <h2 id="backup">24. RESPALDO DE DATOS (AUTOMÁTICO Y MANUAL)</h2>
    <h3>Respaldo automático</h3>
    <p>Cada vez que se <strong>cierra un día definitivamente</strong> (saliendo sin conservar partida), la aplicación genera un archivo JSON con nombre <code>Pinti_v502_XXX.json</code> donde XXX es el día de la semana abreviado (lun, mar, mié, etc.). Si se juega el mismo día de la semana y se cierra otro día, el archivo se sobrescribe (solo se mantiene el último backup del día).</p>
    <h3>Respaldo manual</h3>
    <p>Botón <strong>💾 Exportar respaldo</strong> en la pantalla de configuración. Genera un archivo con la fecha exacta (<code>Pinti_v502_ddmmyy.json</code>). El botón <strong>📂 Importar respaldo</strong> permite cargar un archivo JSON previamente exportado y reemplaza toda la base de datos.</p>
    <div class="nota">⚠️ La importación borra los datos actuales, así que asegúrate de hacer una copia de seguridad antes.</div>

    <h2 id="persistencia">25. PERSISTENCIA Y CONTINUACIÓN DE PARTIDAS</h2>
    <p>La aplicación guarda automáticamente el estado después de cada acción (pata, forro, pase, empate, etc.) en <code>localStorage</code>. Cuando se pulsa <strong>Salir del juego</strong> y se marca <strong>"Conservar partida para continuar después"</strong>, el día <strong>no se cierra</strong> (sigue activo) y la sesión completa se almacena. Al volver a abrir la app (o recargar la página), el botón principal se pondrá verde con el texto <strong>"🎲 Continuar partida guardada"</strong>. Al pulsarlo, se restaura el juego exactamente donde se dejó: mismos jugadores, mismas patas, mismo historial, misma corona, etc.</p>
    <p>Si en lugar de conservar la partida se elige cerrar el día (desmarcando el checkbox), el día se marca como inactivo y se descarta la sesión; ya no se podrá continuar. Además, se genera un backup automático (como se explicó).</p>
    <div class="nota">📌 <strong>Importante:</strong> Si cierras el navegador sin salir explícitamente (por ejemplo, por un cierre forzado), la partida se conserva igualmente porque la sesión se guarda constantemente. Al volver a abrir la app, se restaurará automáticamente (sin necesidad de pulsar el botón verde) porque detectará la partida guardada.</div>

    <h2 id="admin">26. PANEL DE ADMINISTRACIÓN – FUNCIONES AVANZADAS</h2>
    <p>El panel de administración (<code>admin.html</code>) es una herramienta poderosa para gestionar la base de datos. Requiere contraseña <code>admin</code> después de haber accedido por el método oculto.</p>
    <h3>Pestañas disponibles</h3>
    <ul>
        <li><strong>📊 Machs:</strong> Lista todos los machs con opciones de:
            <ul>
                <li>🔍 Ver detalle: Muestra un modal con la información completa del mach (participantes, manos).</li>
                <li>✏️ Cambiar ganador: Permite corregir el ganador del mach (solo entre los participantes).</li>
                <li>🗑️ Eliminar: Borra solo el registro del mach (no afecta estadísticas).</li>
                <li>🔥 Eliminar MACH completo: Borra el mach y <strong>resta</strong> las estadísticas de los jugadores (machs ganados, patas, etc.) para mantener la coherencia. Esta acción es peligrosa y pide confirmación adicional.</li>
            </ul>
        </li>
        <li><strong>👥 Jugadores:</strong> CRUD completo (crear, editar, eliminar). Al eliminar un jugador, se borran automáticamente sus participaciones y los machs donde haya sido ganador.</li>
        <li><strong>📅 Días:</strong> Gestión de días. Se puede activar/desactivar un día con un checkbox, forzar el cierre de un día (sin eliminar datos), o eliminar el día junto con todas sus participaciones y machs.</li>
        <li><strong>📈 Participaciones:</strong> Permite editar todos los campos estadísticos de cada jugador por día. Es útil para corregir errores puntuales. También se pueden agregar participaciones manualmente.</li>
        <li><strong>📊 Reporte General:</strong> Muestra totales acumulados con filtro por rango de fechas. Exportable a CSV. Los datos se ordenan automáticamente por machs ganados (descendente) y luego por patas netas.</li>
    </ul>
    <p>Además, hay botones de <strong>Exportar todos los datos (JSON)</strong>, <strong>Importar datos</strong>, <strong>Limpiar toda la base de datos</strong> y <strong>Verificar integridad</strong> (detecta y repara inconsistencias).</p>
    <div class="nota">⚠️ El panel de administración es para usuarios avanzados. Cualquier cambio mal realizado puede corromper las estadísticas. Se recomienda hacer un respaldo antes de operar.</div>

    <h2 id="adminAcceso">🔐 27. ACCESO OCULTO AL PANEL DE ADMINISTRACIÓN</h2>
    <p>Para evitar que los jugadores comunes accedan al panel, se han implementado tres métodos ocultos, todos protegidos por la misma contraseña: <strong>"administrador"</strong> (en minúsculas, sin comillas).</p>
    <ol>
        <li><strong>Parámetro en URL:</strong> Añade <code>?admin=true</code> a la URL principal. Ejemplo: <code>index.html?admin=true</code>. Aparecerá un prompt pidiendo la contraseña. Si es correcta, redirige a <code>admin.html</code>. Una vez allí, se pedirá la contraseña <code>admin</code> del propio panel (doble autenticación).</li>
        <li><strong>5 taps en el marcador de puntos:</strong> En la pantalla de juego, haz clic o toca <strong>5 veces rápidamente</strong> en el <strong>número grande de patas (🦶)</strong> del jugador 1 (la primera tarjeta). Aparecerá un prompt. Si introduces "administrador", irás al panel.</li>
        <li><strong>Enlace en los créditos:</strong> En la pantalla de inicio (configuración), al final, en el texto "Creado por Ricardo Castillo (Richard)", el nombre <strong>Richard</strong> aparece subrayado en morado. Haz clic en él, escribe la contraseña y accederás al panel.</li>
    </ol>
    <p>Este sistema es lo suficientemente discreto para que los jugadores no lo descubran accidentalmente, pero accesible para el administrador del torneo.</p>

    <h2 id="borrar">28. BORRAR TODOS LOS DATOS</h2>
    <p>En la pantalla de configuración, el botón <strong>⚠️ Borrar datos</strong> permite eliminar por completo la base de datos. Para evitar pulsaciones accidentales, se pide una contraseña: <code>pintintin</code> (sin comillas). Tras confirmar, se recarga la página con todos los datos limpios.</p>
    <div class="nota">🚨 Esta acción es irreversible. Siempre exporta un respaldo antes de borrar.</div>

    <h2 id="ayuda">29. AYUDA INTEGRADA (BOTÓN ❓)</h2>
    <p>En la esquina superior derecha de cualquier pantalla hay un botón flotante con un signo de interrogación. Al pulsarlo, se abre un <strong>modal</strong> que muestra este mismo manual de usuario completo, permitiendo consultar cualquier duda sin salir de la aplicación.</p>

    <h2 id="problemas">30. SOLUCIÓN DE PROBLEMAS COMUNES</h2>
    <ul>
        <li><strong>El botón "Continuar partida guardada" no funciona o pide jugadores:</strong> En v5.0.2 está completamente solucionado. Si aún así ocurre, verifica que no hayas cerrado el día sin conservar. También puedes limpiar la caché del navegador (o desinstalar la PWA y reinstalarla).</li>
        <li><strong>La pantalla se queda en blanco o no responde:</strong> Puede deberse a un error en el almacenamiento local. Abre la consola del navegador (F12) y busca errores. Prueba a borrar los datos desde el botón correspondiente (con contraseña).</li>
        <li><strong>Las gráficas no muestran nada:</strong> Asegúrate de que haya al menos un mach registrado. Si no hay datos, el módulo muestra un mensaje de advertencia.</li>
        <li><strong>No aparecen las coronas 👑 o 🥈:</strong> Debe haber al menos una mano ganada o un empate con salida. El sistema actualiza las coronas solo cuando ocurre una pata o un empate con salida.</li>
        <li><strong>Las patas por empate (🧩) parecen incorrectas:</strong> Recuerda que solo reflejan el <strong>extra</strong> (patas sumadas menos la base). Además, si se aplicó el límite de 5, el extra se calcula sobre las patas realmente otorgadas, no sobre las brutas. Por tanto, puede ser menor de lo esperado.</li>
        <li><strong>El agua tras empate no se asigna correctamente:</strong> Con esta versión, si hay un solo candidato se asigna automáticamente. Si hay varios, se abre un modal para elegir. Si no aparece, asegúrate de que el modal no esté bloqueado por el navegador.</li>
        <li><strong>No puedo acceder al panel de administración:</strong> Prueba los tres métodos explicados. La contraseña es <strong>"administrador"</strong> (en minúsculas). Una vez dentro, la contraseña del panel es <code>admin</code>.</li>
        <li><strong>La tabla de machs en el panel de admin se ve desordenada:</strong> En v5.0.2 se corrigió, pero si persiste, actualiza la página o limpia la caché. Verifica que el CSS tenga la clase <code>.tabla-responsive</code>.</li>
    </ul>

    <h2 id="faq">31. PREGUNTAS FRECUENTES (FAQ) – MÁS DE 20 PREGUNTAS</h2>
    <ul>
        <li><strong>¿Funciona sin internet?</strong> Sí, después de la primera carga como PWA.</li>
        <li><strong>¿Puedo jugar con menos de 4 jugadores?</strong> Sí, con 2 o 3 jugadores. Las sillas vacías se muestran como "Vacante".</li>
        <li><strong>¿Qué significa el ícono 🧩 Patas por Empate?</strong> Es el total de patas extra ganadas por efecto de empates (patas otorgadas menos la base).</li>
        <li><strong>¿Cómo exporto las estadísticas a Excel?</strong> Usa el botón "📎 Exportar CSV" en las estadísticas globales. Luego abre el CSV con Excel (puede necesitar importar como texto UTF-8).</li>
        <li><strong>¿Cómo sé quién comienza después de un empate?</strong> Aparece un modal emergente indicando el jugador que comienza (el siguiente al último ganador en sentido antihorario). También puedes ver la corona 👑 en la tarjeta de ese jugador.</li>
        <li><strong>¿Puedo recuperar una partida cerrada sin conservar?</strong> No, si saliste sin marcar "Conservar partida", el día se cierra y la sesión se borra.</li>
        <li><strong>¿Cómo veo los machs de un día específico?</strong> Usa el botón "📋 Ver machs por día" en la pantalla de configuración.</li>
        <li><strong>¿Qué pasa si un jugador gana más de 5 patas en una mano?</strong> Solo recibe las necesarias para llegar a 5. El excedente no cuenta para el mach.</li>
        <li><strong>¿Cómo accedo al panel de administración?</strong> Por acceso oculto: 5 taps en el marcador del jugador 1, o clic en "Richard" en los créditos, o <code>?admin=true</code>. Contraseña: <code>administrador</code>.</li>
        <li><strong>¿Puedo personalizar los iconos de la PWA?</strong> Sí, utiliza el archivo <code>generar_iconos.html</code> que se incluye en el proyecto. Permite subir una imagen y generar los tamaños necesarios.</li>
        <li><strong>¿Hay límite de almacenamiento?</strong> localStorage tiene un límite de ~5-10 MB, suficiente para miles de machs. Si la app crece mucho, en el futuro se migrará a IndexedDB.</li>
        <li><strong>¿Cómo reporto un error o sugiero una mejora?</strong> Contacta al desarrollador a través de los medios indicados en los créditos.</li>
        <li><strong>¿El sorteo de posiciones es realmente aleatorio?</strong> Sí, combina dados virtuales (Math.random) con resolución de empates y mezcla de sillas.</li>
        <li><strong>¿Qué diferencia hay entre "Salir del juego" y cerrar el día?</strong> "Salir del juego" es la acción principal. Al salir, puedes conservar la partida (día sigue activo) o cerrar el día definitivamente (día inactivo).</li>
        <li><strong>¿Puedo jugar con más de 4 jugadores rotando?</strong> No está soportado directamente, pero puedes sustituir jugadores manualmente usando la función de sustitución.</li>
        <li><strong>¿La app guarda la hora exacta de cada mano?</strong> Sí, cada mano registra un timestamp ISO completo, visible en el historial.</li>
        <li><strong>¿Qué significa "pollona"?</strong> Es un mach en el que el ganador hizo todas las patas y ningún otro jugador sumó ninguna pata (todos los demás quedaron en 0). Aporta un punto extra en las estadísticas.</li>
        <li><strong>¿Puedo ver las estadísticas de días anteriores?</strong> Sí, desde "Estadísticas globales" puedes seleccionar un rango de fechas y ver todos los machs de ese período.</li>
        <li><strong>¿Los backups automáticos se guardan en la nube?</strong> No, se descargan localmente en la carpeta de descargas del dispositivo. Debes guardarlos manualmente.</li>
        <li><strong>¿Qué hago si la app se vuelve lenta?</strong> Intenta exportar un respaldo, luego borra los datos y vuelve a importar el respaldo. Esto limpia posibles basuras en localStorage.</li>
        <li><strong>¿Puedo usar la app en varios dispositivos a la vez?</strong> No, los datos se almacenan localmente en cada dispositivo. Para compartir datos, exporta/importa el JSON.</li>
        <li><strong>¿Por qué el botón de ayuda a veces no muestra el manual?</strong> En v5.0.2 está corregido; el manual se recarga cada vez que se abre el modal.</li>
        <li><strong>¿Cómo actualizo la PWA a una nueva versión?</strong> Si publicas nuevos archivos, el Service Worker los detectará y los actualizará en segundo plano. El usuario debe recargar la página o cerrar y volver a abrir la app.</li>
    </ul>

    <h2 id="creditos">32. CRÉDITOS Y AGRADECIMIENTOS</h2>
    <p><strong>Desarrollador:</strong> Ricardo Castillo (Richard) - La Demajagua, Isla de la Juventud, Cuba.</p>
    <p><strong>Colaboradores y probadores:</strong> Tito, Noel, Idiol, Osvaldo, Mario, Reinier, Osmany, Marisol y todos los miembros de la peña de dominó de La Demajagua. Gracias por sus ideas, pruebas y paciencia.</p>
    <p><strong>Tecnologías utilizadas:</strong> HTML5, CSS3, JavaScript (Vanilla), Chart.js, jsPDF, AutoTable, localStorage, Service Workers, Manifest.json.</p>
    <p>¡Gracias por usar Dominó Pintintín! Que nunca falte una buena "agua" para revolucionar las fichas.</p>

    <div class="footer">
        <p>🎲 ¡A BOTAR GORDA! 🎲</p>
        <p>Hecho en La Demajagua, Isla de la Juventud, Cuba</p>
        <p><strong>Versión 5.0.2 - Junio 2026</strong></p>
    </div>
</div>
</body>
</html>`;

// ==================== EVENTO PRINCIPAL ====================
window.onload = () => {
    console.log("🚀 Iniciando Dominó Pintintín v5.0.2 (corregida)");
    cargarTodoDesdeLocalStorage();
    validarConsistenciaMachs();
    
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
    
    // Asignar eventos globales
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
    if(btnExportarPDF && window.jspdf) btnExportarPDF.onclick = () => { let { jsPDF } = window.jspdf; let doc = new jsPDF(); doc.text("Estadísticas Dominó Pintintín", 20,20); let data = almacenamiento.machs.map(m=>{ const dia = almacenamiento.dias.find(d=>d.id===m.diaId); return [dia ? dia.fecha : '?', m.numeroMach, m.participantes.find(p=>p.jugadorId===m.ganadorId)?.nombre]; }); doc.autoTable({ head:[['Fecha','Mach #','Ganador']], body:data, startY:30 }); doc.save('pintintin_stats.pdf'); };
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
    if(contenidoAyuda) {
        contenidoAyuda.innerHTML = manualHTML;
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
    
    agregarBotonGraficasYHistorial();
};
