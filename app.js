// ============================================
// DOMINÓ PINTINTÍN - VERSIÓN 6.0.1
// Autor: Ricardo Castillo (Richard)
// Desde La Demajagua, Isla de la Juventud, Cuba
// ============================================

// ==================== VARIABLES GLOBALES ====================
let jugadores = [];
let partidaEnCurso = false;
let partidaTerminada = false;
let turnoActual = 0;
let juegosPorJugador = [];
let fichasEnMesa = [];
let extremos = { izquierdo: null, derecho: null };
let partidasJugadas = 0;
let partidaActual = null;
let hayGanador = false;
let ganadorUltimaPartida = null;
let nombreJugadorGanador = '';
let totalPartidasGanadas = [0, 0, 0, 0];
let totalPuntajes = [0, 0, 0, 0];
let puntajeAcumuladoPartida = [0, 0, 0, 0];
let estadisticasPartidas = [];
let partidasRegistradas = [];
let rondasGanadasPorJugador = [0, 0, 0, 0];
let rondasPerdidasPorJugador = [0, 0, 0, 0];
let rondasCapicuaPorJugador = [0, 0, 0, 0];
let partidasGuardadas = [];
let totalPuntosEnContra = [0, 0, 0, 0];
let puntosEnContraPartidaActual = [0, 0, 0, 0];
let fichasIniciales = [];

// Variables para métricas de tiempo
let tiempoInicioPartida = null;
let metricasTiempo = {
    partidas: [],
    tiempoTotalJugado: 0,
    tiempoPromedioPartida: 0
};

// Máximo de patas por mach
const MAX_PATAS_POR_MACH = 5;

// Función auxiliar para formatear fechas a dd/mm/yyyy
function formatearFecha(date) {
    if (!date) return '';
    const d = new Date(date);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function formatearFechaDesdeString(fechaStr) {
    if (!fechaStr) return '';
    // Si viene en formato YYYY-MM-DD
    if (fechaStr.includes('-')) {
        const [anio, mes, dia] = fechaStr.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    return fechaStr;
}

// ==================== FUNCIONES AUXILIARES ====================
function guardarEstadoLocal() {
    const estado = {
        jugadores, partidaEnCurso, partidaTerminada, turnoActual,
        juegosPorJugador: juegosPorJugador.map(j => ({
            fichas: j.fichas, indice: j.indice, nombre: j.nombre
        })),
        fichasEnMesa, extremos, partidasJugadas, partidaActual,
        hayGanador, ganadorUltimaPartida, nombreJugadorGanador,
        totalPartidasGanadas, totalPuntajes, puntajeAcumuladoPartida,
        estadisticasPartidas, partidasRegistradas, rondasGanadasPorJugador,
        rondasPerdidasPorJugador, rondasCapicuaPorJugador, partidasGuardadas,
        totalPuntosEnContra, puntosEnContraPartidaActual, fichasIniciales,
        metricasTiempo, tiempoInicioPartida, MAX_PATAS_POR_MACH
    };
    localStorage.setItem('dominoPintintin_estado', JSON.stringify(estado));
}

function cargarEstadoLocal() {
    const guardado = localStorage.getItem('dominoPintintin_estado');
    if (guardado) {
        try {
            const estado = JSON.parse(guardado);
            jugadores = estado.jugadores || [];
            partidaEnCurso = estado.partidaEnCurso || false;
            partidaTerminada = estado.partidaTerminada || false;
            turnoActual = estado.turnoActual || 0;
            juegosPorJugador = estado.juegosPorJugador || [];
            fichasEnMesa = estado.fichasEnMesa || [];
            extremos = estado.extremos || { izquierdo: null, derecho: null };
            partidasJugadas = estado.partidasJugadas || 0;
            partidaActual = estado.partidaActual || null;
            hayGanador = estado.hayGanador || false;
            ganadorUltimaPartida = estado.ganadorUltimaPartida || null;
            nombreJugadorGanador = estado.nombreJugadorGanador || '';
            totalPartidasGanadas = estado.totalPartidasGanadas || [0, 0, 0, 0];
            totalPuntajes = estado.totalPuntajes || [0, 0, 0, 0];
            puntajeAcumuladoPartida = estado.puntajeAcumuladoPartida || [0, 0, 0, 0];
            estadisticasPartidas = estado.estadisticasPartidas || [];
            partidasRegistradas = estado.partidasRegistradas || [];
            rondasGanadasPorJugador = estado.rondasGanadasPorJugador || [0, 0, 0, 0];
            rondasPerdidasPorJugador = estado.rondasPerdidasPorJugador || [0, 0, 0, 0];
            rondasCapicuaPorJugador = estado.rondasCapicuaPorJugador || [0, 0, 0, 0];
            partidasGuardadas = estado.partidasGuardadas || [];
            totalPuntosEnContra = estado.totalPuntosEnContra || [0, 0, 0, 0];
            puntosEnContraPartidaActual = estado.puntosEnContraPartidaActual || [0, 0, 0, 0];
            fichasIniciales = estado.fichasIniciales || [];
            metricasTiempo = estado.metricasTiempo || { partidas: [], tiempoTotalJugado: 0, tiempoPromedioPartida: 0 };
            tiempoInicioPartida = estado.tiempoInicioPartida || null;
            
            if (juegosPorJugador.length > 0 && jugadores.length > 0) {
                for (let i = 0; i < juegosPorJugador.length && i < jugadores.length; i++) {
                    if (juegosPorJugador[i] && jugadores[i]) {
                        juegosPorJugador[i].nombre = jugadores[i].nombre;
                    }
                }
            }
            return true;
        } catch(e) { console.error('Error al cargar estado:', e); }
    }
    return false;
}

function limpiarEstadoLocal() {
    localStorage.removeItem('dominoPintintin_estado');
}

function obtenerFichasCompletas() {
    const fichas = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            fichas.push([i, j]);
        }
    }
    return fichas;
}

function obtenerFichaAleatoria(fichasDisponibles) {
    const indice = Math.floor(Math.random() * fichasDisponibles.length);
    return fichasDisponibles.splice(indice, 1)[0];
}

function obtenerValorFicha(ficha) {
    return ficha[0] + ficha[1];
}

function puedeJugar(indiceJugador) {
    if (!juegosPorJugador[indiceJugador]) return false;
    for (const ficha of juegosPorJugador[indiceJugador].fichas) {
        if (extremos.izquierdo === null || ficha[0] === extremos.izquierdo || ficha[0] === extremos.derecho || 
            ficha[1] === extremos.izquierdo || ficha[1] === extremos.derecho) {
            return true;
        }
    }
    return false;
}

function actualizarLogPartida(mensaje) {
    const logElement = document.getElementById('logPartida');
    if (logElement) {
        const entrada = document.createElement('div');
        entrada.textContent = mensaje;
        entrada.style.padding = '4px';
        entrada.style.borderBottom = '1px solid #ddd';
        entrada.style.fontSize = '12px';
        logElement.appendChild(entrada);
        logElement.scrollTop = logElement.scrollHeight;
        
        while (logElement.children.length > 100) {
            logElement.removeChild(logElement.firstChild);
        }
    }
}

function actualizarTurnoUI() {
    const turnoDiv = document.getElementById('turnoActual');
    if (turnoDiv && jugadores[turnoActual]) {
        turnoDiv.innerHTML = `Turno: ${jugadores[turnoActual].nombre}`;
        turnoDiv.className = 'turno-activo';
    }
}

function esCapicua(ficha, extremo) {
    return ficha[0] === ficha[1] && (ficha[0] === extremo || ficha[1] === extremo);
}

function verificarGanador() {
    for (let i = 0; i < juegosPorJugador.length; i++) {
        if (juegosPorJugador[i] && juegosPorJugador[i].fichas.length === 0) {
            hayGanador = true;
            ganadorUltimaPartida = i;
            nombreJugadorGanador = jugadores[i].nombre;
            return true;
        }
    }
    return false;
}

function calcularPuntajeJugador(indiceJugador) {
    let total = 0;
    if (juegosPorJugador[indiceJugador]) {
        for (const ficha of juegosPorJugador[indiceJugador].fichas) {
            total += obtenerValorFicha(ficha);
        }
    }
    return total;
}

function finalizarPartida() {
    if (!partidaEnCurso || partidaTerminada) return;
    
    if (tiempoInicioPartida) {
        const duracionMs = Date.now() - tiempoInicioPartida;
        metricasTiempo.partidas.push({
            duracionMs: duracionMs,
            timestamp: new Date().toISOString(),
            ganador: ganadorUltimaPartida !== null ? jugadores[ganadorUltimaPartida]?.nombre : 'Empate'
        });
        
        if (metricasTiempo.partidas.length > 100) {
            metricasTiempo.partidas.shift();
        }
        
        metricasTiempo.tiempoTotalJugado = metricasTiempo.partidas.reduce((sum, p) => sum + p.duracionMs, 0);
        metricasTiempo.tiempoPromedioPartida = metricasTiempo.partidas.length > 0 ? 
            metricasTiempo.tiempoTotalJugado / metricasTiempo.partidas.length : 0;
    }
    
    partidaTerminada = true;
    partidaEnCurso = false;
    
    for (let i = 0; i < juegosPorJugador.length; i++) {
        if (i !== ganadorUltimaPartida) {
            const puntos = calcularPuntajeJugador(i);
            puntosEnContraPartidaActual[i] = puntos;
            totalPuntosEnContra[i] += puntos;
            totalPuntajes[i] += puntos;
        } else {
            puntosEnContraPartidaActual[i] = 0;
        }
    }
    
    if (ganadorUltimaPartida !== null) {
        const puntosGanador = calcularPuntajeJugador(ganadorUltimaPartida);
        totalPuntajes[ganadorUltimaPartida] += puntosGanador;
    }
    
    const estadisticaPartida = {
        fecha: new Date().toISOString(),
        fechaLegible: formatearFecha(new Date()),
        ganador: ganadorUltimaPartida !== null ? jugadores[ganadorUltimaPartida].nombre : 'Empate',
        puntajes: juegosPorJugador.map((j, idx) => ({
            jugador: jugadores[idx].nombre,
            puntos: calcularPuntajeJugador(idx),
            fichasRestantes: j ? j.fichas.length : 0
        }))
    };
    estadisticasPartidas.push(estadisticaPartida);
    
    let mensajeGanador = '';
    if (ganadorUltimaPartida !== null) {
        mensajeGanador = `${jugadores[ganadorUltimaPartida].nombre} ha ganado la partida`;
        actualizarLogPartida(mensajeGanador);
        
        for (let i = 0; i < jugadores.length; i++) {
            if (i !== ganadorUltimaPartida && puntosEnContraPartidaActual[i] > 0) {
                actualizarLogPartida(`${jugadores[i].nombre} tiene ${puntosEnContraPartidaActual[i]} puntos en contra.`);
            }
        }
    } else {
        mensajeGanador = 'La partida ha terminado en empate';
        actualizarLogPartida(mensajeGanador);
    }
    
    const resultadoDiv = document.getElementById('resultadoPartida');
    if (resultadoDiv) {
        resultadoDiv.innerHTML = `<div class="mensaje-ganador">${mensajeGanador}</div>`;
        resultadoDiv.style.display = 'block';
        setTimeout(() => {
            resultadoDiv.style.display = 'none';
        }, 5000);
    }
    
    actualizarTablaPuntajes();
    actualizarRanking();
    guardarEstadoLocal();
    actualizarBotonesPostPartida();
}

function actualizarBotonesPostPartida() {
    const btnNuevaPartida = document.getElementById('btnNuevaPartida');
    const btnReiniciarMach = document.getElementById('btnReiniciarMach');
    const btnTerminarMach = document.getElementById('btnTerminarMach');
    
    if (btnNuevaPartida) btnNuevaPartida.disabled = false;
    if (btnReiniciarMach) btnReiniciarMach.disabled = false;
    if (btnTerminarMach) btnTerminarMach.disabled = false;
}

function iniciarNuevaPartida() {
    const avisoDiv = document.getElementById('avisoEmpate');
    if (avisoDiv) {
        avisoDiv.style.display = 'none';
        avisoDiv.innerHTML = '';
    }
    
    if (partidaEnCurso && !partidaTerminada) {
        if (!confirm('Esta seguro? La partida actual se perdera.')) {
            return;
        }
    }
    
    if (partidasJugadas >= MAX_PATAS_POR_MACH) {
        alert(`Se ha alcanzado el limite de ${MAX_PATAS_POR_MACH} patas para este mach. Finalice el mach para comenzar otro.`);
        return;
    }
    
    partidaEnCurso = true;
    partidaTerminada = false;
    hayGanador = false;
    turnoActual = 0;
    fichasEnMesa = [];
    extremos = { izquierdo: null, derecho: null };
    puntosEnContraPartidaActual = [0, 0, 0, 0];
    
    const fichasTotales = obtenerFichasCompletas();
    for (let i = 0; i < juegosPorJugador.length; i++) {
        juegosPorJugador[i].fichas = [];
        for (let j = 0; j < 7; j++) {
            juegosPorJugador[i].fichas.push(obtenerFichaAleatoria(fichasTotales));
        }
    }
    fichasIniciales = JSON.parse(JSON.stringify(juegosPorJugador.map(j => j.fichas)));
    
    let mejorFicha = -1;
    let jugadorInicial = 0;
    for (let i = 0; i < juegosPorJugador.length; i++) {
        for (const ficha of juegosPorJugador[i].fichas) {
            if (ficha[0] === ficha[1] && ficha[0] > mejorFicha) {
                mejorFicha = ficha[0];
                jugadorInicial = i;
            }
        }
    }
    turnoActual = jugadorInicial;
    
    const logElement = document.getElementById('logPartida');
    if (logElement) logElement.innerHTML = '';
    
    actualizarLogPartida(`Nueva partida ${partidasJugadas + 1}/${MAX_PATAS_POR_MACH}`);
    actualizarLogPartida(`Comienza ${jugadores[turnoActual].nombre} con la ficha doble mas alta`);
    
    tiempoInicioPartida = Date.now();
    
    actualizarInterfaz();
    guardarEstadoLocal();
    actualizarBotonesDurantePartida();
    
    if (!puedeJugar(turnoActual)) {
        pasarTurno(true);
    }
}

function actualizarBotonesDurantePartida() {
    const btnNuevaPartida = document.getElementById('btnNuevaPartida');
    const btnReiniciarMach = document.getElementById('btnReiniciarMach');
    const btnTerminarMach = document.getElementById('btnTerminarMach');
    
    if (btnNuevaPartida) btnNuevaPartida.disabled = true;
    if (btnReiniciarMach) btnReiniciarMach.disabled = false;
    if (btnTerminarMach) btnTerminarMach.disabled = false;
}

function pasarTurno(mostrarLog = false) {
    if (!partidaEnCurso || partidaTerminada || hayGanador) return;
    
    if (mostrarLog) {
        actualizarLogPartida(`${jugadores[turnoActual].nombre} no puede jugar y pasa el turno.`);
    }
    
    turnoActual = (turnoActual + 1) % 4;
    actualizarTurnoUI();
    
    let todosPasan = true;
    for (let i = 0; i < 4; i++) {
        if (puedeJugar(i)) {
            todosPasan = false;
            break;
        }
    }
    
    if (todosPasan) {
        declararEmpate();
    }
}

function colocarFicha(indiceJugador, indiceFicha, lado) {
    if (!partidaEnCurso || partidaTerminada || hayGanador) return false;
    if (indiceJugador !== turnoActual) {
        actualizarLogPartida(`No es el turno de ${jugadores[indiceJugador].nombre}`);
        return false;
    }
    
    const jugador = juegosPorJugador[indiceJugador];
    const ficha = jugador.fichas[indiceFicha];
    if (!ficha) return false;
    
    let colocarValido = false;
    let esCapicuaJugada = false;
    let ladoUsado = lado;
    
    if (lado === 'izquierdo') {
        if (extremos.izquierdo === null || ficha[0] === extremos.izquierdo) {
            fichasEnMesa.unshift(ficha);
            extremos.izquierdo = ficha[1];
            colocarValido = true;
            if (ficha[0] === ficha[1]) esCapicuaJugada = true;
        } else if (ficha[1] === extremos.izquierdo) {
            fichasEnMesa.unshift([ficha[1], ficha[0]]);
            extremos.izquierdo = ficha[0];
            colocarValido = true;
            if (ficha[0] === ficha[1]) esCapicuaJugada = true;
        }
    } else if (lado === 'derecho') {
        if (extremos.derecho === null || ficha[0] === extremos.derecho) {
            fichasEnMesa.push(ficha);
            extremos.derecho = ficha[1];
            colocarValido = true;
            if (ficha[0] === ficha[1]) esCapicuaJugada = true;
        } else if (ficha[1] === extremos.derecho) {
            fichasEnMesa.push([ficha[1], ficha[0]]);
            extremos.derecho = ficha[0];
            colocarValido = true;
            if (ficha[0] === ficha[1]) esCapicuaJugada = true;
        }
    }
    
    if (colocarValido) {
        jugador.fichas.splice(indiceFicha, 1);
        
        if (esCapicuaJugada) {
            actualizarLogPartida(`CAPICUA! ${jugador.nombre} jugo un ${ficha[0]}-${ficha[1]} como pegue especial`);
            rondasCapicuaPorJugador[indiceJugador]++;
        }
        
        actualizarLogPartida(`${jugador.nombre} jugo ${ficha[0]}-${ficha[1]} en el lado ${lado}`);
        
        if (verificarGanador()) {
            finalizarPartida();
        } else {
            turnoActual = (turnoActual + 1) % 4;
            actualizarTurnoUI();
            
            if (!puedeJugar(turnoActual)) {
                pasarTurno(true);
            }
        }
        
        actualizarInterfaz();
        guardarEstadoLocal();
        return true;
    }
    
    actualizarLogPartida(`Movimiento invalido: no se puede colocar ${ficha[0]}-${ficha[1]} en el lado ${lado}`);
    return false;
}

function declararEmpate() {
    if (partidaEnCurso && !partidaTerminada && !hayGanador) {
        const jugadoresQuePasan = [];
        for (let i = 0; i < 4; i++) {
            if (!puedeJugar(i)) {
                jugadoresQuePasan.push(i);
            }
        }
        
        if (juegosPorJugador.some(jugador => jugador.fichas.length > 0)) {
            let todosPasan = true;
            for (let i = 0; i < 4; i++) {
                if (puedeJugar(i)) {
                    todosPasan = false;
                    break;
                }
            }
            
            if (todosPasan) {
                const empateData = {
                    timestamp: new Date().toISOString(),
                    jugadores: jugadoresQuePasan.map(i => jugadores[i].nombre),
                    fichasRestantes: juegosPorJugador.map(j => j.fichas.length)
                };
                
                if (!partidaActual) partidaActual = {};
                if (!partidaActual.empates) {
                    partidaActual.empates = [];
                }
                partidaActual.empates.push(empateData);
                
                const jugadoresEmpatados = jugadoresQuePasan.map(i => jugadores[i].nombre).join(', ');
                const jugadorQueComienza = turnoActual;
                
                let mensajeEmpate = `EMPATE\n`;
                mensajeEmpate += `Jugadores sin movimientos: ${jugadoresEmpatados}\n`;
                mensajeEmpate += `Comienza la proxima partida: ${jugadores[jugadorQueComienza].nombre}\n`;
                mensajeEmpate += `Se reparten nuevas fichas (agua)`;
                
                mostrarAvisoEmpate(mensajeEmpate, true);
                
                actualizarLogPartida(`EMPATE - Sin movimientos: ${jugadoresEmpatados}. Comienza ${jugadores[jugadorQueComienza].nombre}`);
                
                partidasJugadas++;
                
                setTimeout(() => {
                    if (partidasJugadas < MAX_PATAS_POR_MACH) {
                        iniciarNuevaPartida();
                    } else {
                        actualizarLogPartida(`Se alcanzo el limite de ${MAX_PATAS_POR_MACH} patas. Finalice el mach.`);
                        partidaEnCurso = false;
                        partidaTerminada = true;
                        actualizarBotonesPostPartida();
                        guardarEstadoLocal();
                    }
                }, 3000);
                
                return true;
            }
        }
    }
    return false;
}

function mostrarAvisoEmpate(mensaje, esEmpate = false) {
    const avisoDiv = document.getElementById('avisoEmpate');
    if (!avisoDiv) return;
    
    if (esEmpate) {
        avisoDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin-top: 15px;
                text-align: center;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: slideUp 0.5s ease-out;
                border: 2px solid #ffd43b;
            ">
                <div style="font-size: 24px; margin-bottom: 8px;">EMPATE</div>
                <div style="font-size: 16px; margin-bottom: 12px; white-space: pre-line;">${mensaje}</div>
                <div style="font-size: 14px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 5px;">
                    Nueva partida en 3 segundos...
                </div>
            </div>
        `;
        avisoDiv.style.display = 'block';
        
        setTimeout(() => {
            if (avisoDiv) {
                avisoDiv.style.opacity = '0';
                setTimeout(() => {
                    if (avisoDiv) {
                        avisoDiv.style.display = 'none';
                        avisoDiv.style.opacity = '1';
                    }
                }, 500);
            }
        }, 8000);
    } else {
        avisoDiv.innerHTML = `<div style="background: #ffd43b; padding: 10px; border-radius: 5px; text-align: center;">${mensaje}</div>`;
        avisoDiv.style.display = 'block';
        setTimeout(() => {
            if (avisoDiv) {
                avisoDiv.style.display = 'none';
            }
        }, 3000);
    }
}

function reiniciarMach() {
    if (partidaEnCurso && !partidaTerminada) {
        if (!confirm('Reiniciar todo el mach? Se perderan todas las patas jugadas.')) {
            return;
        }
    }
    
    partidasJugadas = 0;
    totalPartidasGanadas = [0, 0, 0, 0];
    totalPuntajes = [0, 0, 0, 0];
    puntajeAcumuladoPartida = [0, 0, 0, 0];
    rondasGanadasPorJugador = [0, 0, 0, 0];
    rondasPerdidasPorJugador = [0, 0, 0, 0];
    rondasCapicuaPorJugador = [0, 0, 0, 0];
    totalPuntosEnContra = [0, 0, 0, 0];
    puntosEnContraPartidaActual = [0, 0, 0, 0];
    estadisticasPartidas = [];
    
    if (jugadores.length === 4) {
        juegosPorJugador = jugadores.map((j, idx) => ({
            indice: idx,
            nombre: j.nombre,
            fichas: []
        }));
    }
    
    iniciarNuevaPartida();
    actualizarRanking();
    actualizarTablaPuntajes();
    guardarEstadoLocal();
}

function terminarMach() {
    if (partidaEnCurso && !partidaTerminada) {
        if (!confirm('Terminar el mach actual? La partida en curso se contabilizara como finalizada.')) {
            return;
        }
        finalizarPartida();
    }
    
    const machCompleto = {
        fecha: new Date().toISOString(),
        fechaLegible: formatearFecha(new Date()),
        partidas: estadisticasPartidas,
        ganadoresPorPartida: totalPartidasGanadas,
        puntajesTotales: totalPuntajes,
        rondasGanadas: rondasGanadasPorJugador,
        rondasCapicua: rondasCapicuaPorJugador,
        totalPuntosEnContra: totalPuntosEnContra
    };
    
    const machsGuardados = localStorage.getItem('pintintin_machs_completados');
    let listaMachs = machsGuardados ? JSON.parse(machsGuardados) : [];
    listaMachs.push(machCompleto);
    localStorage.setItem('pintintin_machs_completados', JSON.stringify(listaMachs));
    
    alert(`Mach completado. Se han guardado las estadisticas.\nTotal de patas: ${partidasJugadas}`);
    
    reiniciarMach();
}

function actualizarTablaPuntajes() {
    const tbody = document.getElementById('tablaPuntajes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    for (let i = 0; i < jugadores.length; i++) {
        const fila = document.createElement('tr');
        const puntosPartidaActual = puntosEnContraPartidaActual[i] || 0;
        const puntosAcumulados = totalPuntajes[i] || 0;
        
        fila.innerHTML = `
            <td>${jugadores[i].nombre}</td>
            <td>${juegosPorJugador[i] ? juegosPorJugador[i].fichas.length : 0}</td>
            <td>${puntosPartidaActual}</td>
            <td>${puntosAcumulados}</td>
        `;
        tbody.appendChild(fila);
    }
}

function actualizarRanking() {
    const rankingBody = document.getElementById('rankingBody');
    if (!rankingBody) return;
    
    const stats = [];
    for (let i = 0; i < jugadores.length; i++) {
        stats.push({
            nombre: jugadores[i].nombre,
            partidasGanadas: totalPartidasGanadas[i],
            puntosAcumulados: totalPuntajes[i],
            capicuas: rondasCapicuaPorJugador[i],
            puntosEnContra: totalPuntosEnContra[i]
        });
    }
    
    stats.sort((a, b) => b.partidasGanadas - a.partidasGanadas);
    
    rankingBody.innerHTML = '';
    for (let i = 0; i < stats.length; i++) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${i + 1}</td>
            <td>${stats[i].nombre}</td>
            <td>${stats[i].partidasGanadas}</td>
            <td>${stats[i].puntosAcumulados}</td>
            <td>${stats[i].capicuas}</td>
            <td>${stats[i].puntosEnContra}</td>
        `;
        rankingBody.appendChild(fila);
    }
}

function actualizarInterfaz() {
    actualizarTablaPuntajes();
    actualizarTurnoUI();
    actualizarMesa();
    actualizarFichasJugadores();
    actualizarProgresoPatas();
}

function actualizarMesa() {
    const mesaDiv = document.getElementById('mesaFichas');
    if (!mesaDiv) return;
    
    mesaDiv.innerHTML = '';
    if (fichasEnMesa.length === 0) {
        mesaDiv.innerHTML = '<div class="mesa-vacia">Coloque la primera ficha</div>';
        return;
    }
    
    const contenedor = document.createElement('div');
    contenedor.className = 'fichas-mesa';
    
    for (let i = 0; i < fichasEnMesa.length; i++) {
        const ficha = fichasEnMesa[i];
        const fichaDiv = document.createElement('div');
        fichaDiv.className = 'ficha-mesa';
        fichaDiv.innerHTML = `<div class="ficha-contenido"><span class="numero">${ficha[0]}</span><span class="separador">:</span><span class="numero">${ficha[1]}</span></div>`;
        contenedor.appendChild(fichaDiv);
    }
    
    mesaDiv.appendChild(contenedor);
}

function actualizarFichasJugadores() {
    for (let i = 0; i < jugadores.length; i++) {
        const containerId = `jugador${i}Fichas`;
        const container = document.getElementById(containerId);
        if (!container) continue;
        
        const jugador = juegosPorJugador[i];
        if (!jugador) continue;
        
        container.innerHTML = '';
        const esTurno = (turnoActual === i && partidaEnCurso && !partidaTerminada && !hayGanador);
        
        jugador.fichas.forEach((ficha, idx) => {
            const fichaDiv = document.createElement('div');
            fichaDiv.className = `ficha-jugador ${esTurno ? 'turno-activo' : ''}`;
            fichaDiv.innerHTML = `<div class="ficha-contenido"><span class="numero">${ficha[0]}</span><span class="separador">:</span><span class="numero">${ficha[1]}</span></div>`;
            
            if (esTurno) {
                fichaDiv.onclick = () => mostrarOpcionesColocacion(i, idx, ficha);
            }
            
            container.appendChild(fichaDiv);
        });
    }
}

function mostrarOpcionesColocacion(indiceJugador, indiceFicha, ficha) {
    if (!partidaEnCurso || partidaTerminada || hayGanador) return;
    if (indiceJugador !== turnoActual) {
        alert(`Es el turno de ${jugadores[turnoActual].nombre}`);
        return;
    }
    
    const izquierdoValido = (extremos.izquierdo === null || ficha[0] === extremos.izquierdo || ficha[1] === extremos.izquierdo);
    const derechoValido = (extremos.derecho === null || ficha[0] === extremos.derecho || ficha[1] === extremos.derecho);
    
    if (!izquierdoValido && !derechoValido) {
        alert('No puedes colocar esta ficha en ningun extremo');
        return;
    }
    
    if (izquierdoValido && derechoValido) {
        const lado = confirm(`Colocar ${ficha[0]}-${ficha[1]} en el extremo IZQUIERDO?\nAceptar = Izquierdo, Cancelar = Derecho`);
        if (lado) {
            colocarFicha(indiceJugador, indiceFicha, 'izquierdo');
        } else {
            colocarFicha(indiceJugador, indiceFicha, 'derecho');
        }
    } else if (izquierdoValido) {
        colocarFicha(indiceJugador, indiceFicha, 'izquierdo');
    } else if (derechoValido) {
        colocarFicha(indiceJugador, indiceFicha, 'derecho');
    }
}

function actualizarProgresoPatas() {
    const progresoDiv = document.getElementById('progresoPatas');
    if (progresoDiv) {
        progresoDiv.innerHTML = `Pata ${partidasJugadas} de ${MAX_PATAS_POR_MACH}`;
    }
}

function mostrarManual() {
    window.open('manual_pintintin.html', '_blank');
}

function verificarAccesoAdmin() {
    const contrasena = prompt('Ingrese la contrasena de administrador:');
    if (contrasena === 'administrador') {
        window.location.href = 'admin.html';
    } else if (contrasena !== null) {
        alert('Contrasena incorrecta');
    }
}

function inicializarJuego() {
    if (cargarEstadoLocal() && jugadores.length === 4) {
        actualizarInterfaz();
        actualizarRanking();
        actualizarProgresoPatas();
        if (partidaEnCurso && !partidaTerminada) {
            actualizarBotonesDurantePartida();
        } else {
            actualizarBotonesPostPartida();
        }
    } else {
        jugadores = [
            { nombre: 'Jugador 1' },
            { nombre: 'Jugador 2' },
            { nombre: 'Jugador 3' },
            { nombre: 'Jugador 4' }
        ];
        
        juegosPorJugador = jugadores.map((j, idx) => ({
            indice: idx,
            nombre: j.nombre,
            fichas: []
        }));
        
        iniciarNuevaPartida();
    }
    
    const btnNuevaPartida = document.getElementById('btnNuevaPartida');
    const btnReiniciarMach = document.getElementById('btnReiniciarMach');
    const btnTerminarMach = document.getElementById('btnTerminarMach');
    const btnAdmin = document.getElementById('btnAdmin');
    const btnManual = document.getElementById('btnManual');
    
    if (btnNuevaPartida) btnNuevaPartida.onclick = iniciarNuevaPartida;
    if (btnReiniciarMach) btnReiniciarMach.onclick = reiniciarMach;
    if (btnTerminarMach) btnTerminarMach.onclick = terminarMach;
    if (btnAdmin) btnAdmin.onclick = verificarAccesoAdmin;
    if (btnManual) btnManual.onclick = mostrarManual;
}

document.addEventListener('DOMContentLoaded', inicializarJuego);
