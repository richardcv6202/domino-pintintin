# ?? Dominó Pintintín

**Versión 6.0.0 FINAL** — Aplicación para campeonatos de dominó individual (4 jugadores)

> Creada por **Ricardo Castillo Valdés (Richard)** — La Demajagua, Isla de la Juventud, Cuba

[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-6.0.0-blue)
![Stable](https://img.shields.io/badge/status-stable-brightgreen)

---

## ?? Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Novedades de la versión 6.0.0 FINAL](#-novedades-de-la-versión-600-final)
- [Características principales](#-características-principales)
- [Instalación (PWA y APK)](#-instalación-pwa-y-apk)
- [Guía de uso rápido](#-guía-de-uso-rápido)
- [Reglas del juego](#-reglas-del-juego-modalidad-individual)
- [?? Módulo de Análisis de Rendimiento](#-módulo-de-análisis-de-rendimiento)
- [?? Análisis de Eficiencia Relativa (NUEVO)](#-análisis-de-eficiencia-relativa-nuevo)
- [?? Módulo de gráficas interactivas](#-módulo-de-gráficas-interactivas)
- [?? Ver machs por día](#-ver-machs-por-día)
- [?? Métricas de tiempo](#?-métricas-de-tiempo)
- [??? Panel de administración](#?-panel-de-administración)
- [?? Verificación avanzada y reparación automática](#-verificación-avanzada-y-reparación-automática)
- [? Herramienta actualizar_tiempos.html](#-herramienta-actualizar_tiemposhtml)
- [?? Respaldo de datos](#-respaldo-de-datos-backup)
- [?? Acceso oculto al panel de administración](#-acceso-oculto-al-panel-de-administración)
- [?? Borrar todos los datos](#?-borrar-todos-los-datos)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Créditos y agradecimientos](#-créditos-y-agradecimientos)
- [Licencia](#-licencia)

---

## ?? Descripción general

**Dominó Pintintín** es una aplicación diseñada para **campeonatos de dominó individual** (4 jugadores, cada uno juega para sí mismo). Nace en la peña de dominó de La Demajagua, donde el nivel de los jugadores es muy heterogéneo y jugar por parejas resultaba frustrante. La modalidad individual elimina las desigualdades de pareja, es inclusiva (pueden jugar niños, mujeres, hombres y mayores) y fomenta la diversión familiar.

La app automatiza el registro de patas, machs, forros, aguas, pases de mano y empates, permitiendo a los jugadores concentrarse en el juego. Es una **PWA** (Progressive Web App), por lo que puede instalarse en el móvil y funciona **sin conexión a internet** después de la primera carga.

---

## ?? Novedades de la versión 6.0.0 FINAL

| Característica | Descripción |
|----------------|-------------|
| **?? Análisis de Eficiencia Relativa** | Nuevo módulo que normaliza errores por Machs jugados, Machs ganados y Patas logradas. Incluye índices compuestos IER e IDC. |
| **?? Índice de Eficiencia Relativa (IER)** | Fórmula: (MachsGanados × 10) / (Forros × 5 + Aguas × 1). Mide eficiencia global. |
| **?? Índice de Disciplina Corregido (IDC)** | Fórmula: (MachsGanados × PatasTotales) / (Forros × 100 + Aguas × 10). Premia disciplina y eficiencia. |
| **?? Insights Estratégicos Automáticos** | Al comparar dos jugadores, el sistema genera conclusiones automáticas sobre quién es mejor en cada aspecto. |
| **?? Costo de Oportunidad** | Calcula cuántas patas "cuesta" cada forro o cada agua, identificando qué error afecta más a cada jugador. |
| **??? Exportación a PDF corregida** | Ahora funciona correctamente en todos los módulos, con limpieza de emojis para mejor legibilidad. |
| **?? Gráficas redimensionadas** | Las gráficas ocupan todo el ancho disponible y se redimensionan automáticamente. |
| **? Análisis automático** | Sin botón "Analizar" — los datos se actualizan al cambiar de jugador, fechas o modo. |
| **?? Corrección de consistencia** | Los indicadores se calculan directamente desde los machs, garantizando consistencia total. |

---

## ? Características principales

- ?? **Registro completo** de patas, machs, forros, aguas, pases de mano y empates.
- ?? **Estadísticas detalladas** por día y globales (filtro de fechas, exportación CSV/PDF).
- ?? **Gráficas interactivas** (líneas, barras, radar, pastel, polar) con Chart.js.
- ?? **Métricas de tiempo** en gráficas y panel de administración.
- ?? **Persistencia de datos** en `localStorage` y respaldos automáticos/manuales.
- ?? **Funcionamiento offline** (PWA) — ideal para zonas sin conexión.
- ?? **Sorteo aleatorio** de posiciones con dados virtuales.
- ?? **Modo mantener ubicación** (sin sorteo) para partidas rápidas.
- ?? **Sustitución y retirada** de jugadores en medio de la partida.
- ?? **Historial de manos ganadas** con timestamp y número de mach.
- ?? **Identificación visual** del último ganador (??) y penúltimo (??).
- ?? **Límite de 5 patas por mach** (excedente no contabilizado).
- ??? **Panel de administración** con CRUD completo y verificación avanzada.
- ?? **Acceso oculto** al panel para administradores.
- ?? **Manual de usuario** integrado (botón ?) con más de 40 FAQ.
- ?? **Análisis de Rendimiento** con 13+ indicadores.
- ?? **Análisis de Eficiencia Relativa** con índices IER e IDC.

---

## ?? Instalación (PWA y APK)

### En tu móvil Android (recomendado)

1. Abre la aplicación en **Chrome** (desde la URL de GitHub Pages o local).
2. Toca los tres puntos ? en la esquina superior derecha.
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**.
4. Confirma el nombre "Dominó Pintintín".
5. La app quedará instalada como una nativa y funcionará **sin internet**.

### Generar APK para distribución

1. Sube la app a un servidor HTTPS (GitHub Pages, Netlify).
2. Ve a [PWABuilder](https://www.pwabuilder.com).
3. Ingresa la URL de tu sitio.
4. La herramienta analizará tu PWA y te permitirá generar el APK para Android.

---

## ?? Guía de uso rápido

### 1. Pantalla de inicio

- **?? Fecha:** Por defecto la fecha actual.
- **?? Nombres (obligatorios):** Jugadores 1 y 2.
- **?? Nombres (opcionales):** Jugadores 3 y 4.
- **?? Mantener ubicación:** Ubica a los jugadores en el orden de ingreso (sin sorteo).
- **Botón principal:** "?? Sortear sillas e iniciar" o "?? Iniciar juego (sin sorteo)".

### 2. Pantalla de juego

Cada jugador tiene una **tarjeta de color** con:
- Posición, nombre, ??/?? para últimos ganadores
- Patas actuales (número grande)
- Estadísticas resumidas del día
- Botones: ?? Pata, ?? Forro, ?? Da PM

### 3. Botones globales

| Botón | Función |
|-------|---------|
| ?? Declarar empate | Marca empate entre jugadores |
| ? Añadir jugador | Agrega jugador en silla vacante |
| ? Salida de jugador | Retira jugador (mínimo 2) |
| ?? Estadísticas del día | Tabla del día actual |
| ?? Estadísticas globales | Estadísticas históricas |
| ?? Gráficas interactivas | Módulo de gráficas |
| ?? Análisis de rendimiento | Análisis avanzado |
| ?? Salir del juego | Salir conservando/no la partida |
| ? Ayuda | Manual completo |
| ?? Historial | Manos ganadas del día |

---

## ?? Reglas del juego (modalidad individual)

### Conceptos clave

- **?? Pata:** Unidad de puntuación.
- **?? Mach:** Conjunto de 5 patas.
- **?? Pollona:** Mach sin patas de otros jugadores.
- **?? Forro:** Penalización de -1 pata.
- **?? Agua:** Revolver las fichas (solo estadística).
- **?? Pase de mano:** Ceder el turno.
- **?? Empate:** Acumula multiplicador (base × 2n).

### Formas de terminación

| Forma | Patas | Descripción |
|-------|-------|-------------|
| ?? Cierre | 1 | Colocar última ficha |
| ?? Pegado | 1 | Bloqueo del juego |
| ?? Capicua | 2 | Ficha no doble que encaja en ambas cabezas |

---

## ?? Módulo de Análisis de Rendimiento

| Indicador | Descripción |
|-----------|-------------|
| ?? Machs jugados | Total de machs participados |
| ?? Machs ganados | Machs ganados |
| ? Machs perdidos | Jugados - Ganados |
| ?? Efectividad (%) | (Ganados / Jugados) × 100 |
| ?? Patas netas | Suma total de patas |
| ?? Eficiencia | (Ganados × 5 / Patas) × 100 |
| ?? Racha máxima | Machs consecutivos ganados |
| ?? Consistencia (s) | Desviación estándar de patas |
| ?? Forros | Cantidad de forros |
| ?? Aguas | Cantidad de aguas |
| ?? Patas por Empate | Patas extra por empates |
| ?? Disciplina | (Forros + Aguas) / Machs |

---

## ?? Análisis de Eficiencia Relativa (NUEVO)

### Normalización por Machs Jugados
- ?? Forros / Mach
- ?? Aguas / Mach
- ?? Errores totales / Mach

### Normalización por Machs Ganados
- ?? Forros / Mach ganado
- ?? Aguas / Mach ganado
- ?? Errores / Mach ganado

### Normalización por Patas Logradas
- ?? Forros / Pata
- ?? Aguas / Pata
- ?? Errores / Pata

### Índices Compuestos
- **IER (Índice Eficiencia Relativa)**: `(MachsGanados × 10) / (Forros × 5 + Aguas × 1)` — mayor es mejor
- **IDC (Índice Disciplina Corregido)**: `(MachsGanados × PatasTotales) / (Forros × 100 + Aguas × 10)` — mayor es mejor
- **?? Costo por Forro / Agua**: Patas totales / errores — mayor = más costoso

### Insights Automáticos
Al comparar dos jugadores, el sistema genera conclusiones como:
- "X tiene MENOS forros por mach ? es más disciplinado"
- "X tiene mejor IER ? convierte mejor sus victorias"
- "Los forros de X son más costosos ? cada forro le duele más"

---

## ?? Módulo de gráficas interactivas

| Característica | Descripción |
|----------------|-------------|
| **Filtros por fechas** | Desde/hasta |
| **Selección de jugadores** | Orden prioritario |
| **Tipos de gráfico** | Líneas, Barras, Radar, Pastel, Polar |
| **Modo juego** | Indicadores tradicionales |
| **Modo tiempo** | Tiempo total, promedio, tiempo por mach ganado |
| **Exportación** | PNG, CSV, PDF |

---

## ?? Ver machs por día

- Selector de fechas (solo días con machs)
- Tabla con hora inicio/fin, duración, ganador, participantes
- Exportación CSV y PDF
- Resumen del día y global

---

## ?? Métricas de tiempo

### En gráficas interactivas
- Tiempo total jugado
- Promedio por mach
- Tiempo por mach ganado

### En panel de administración
- Fecha, total machs, hora primer/último mach
- Duración total, promedio por mach
- Exportación CSV/PDF

---

## ??? Panel de administración

Acceso: `admin.html` con contraseña `admin`

| Función | Descripción |
|---------|-------------|
| ?? Machs | Ver, filtrar, eliminar, detalle con horas |
| ?? Jugadores | CRUD completo |
| ?? Días | Crear, activar/desactivar, eliminar |
| ?? Participaciones | Editar estadísticas |
| ?? Reporte General | Totales por jugador, exportación CSV/PDF |
| ?? Tiempo | Estadísticas de tiempo |
| ?? Verificación Avanzada | Detecta duplicados, fantasmas |
| ?? Reparación Automática | Corrige inconsistencias |

---

## ?? Acceso oculto al panel de administración

Tres métodos, contraseña: **`administrador`**:

1. `?admin=true` en la URL
2. 5 taps rápidos en las patas del jugador 1
3. Clic en "Richard" en los créditos

Luego dentro del panel: contraseña `admin`

---

## ?? Borrar todos los datos

Botón "?? Borrar datos" con contraseña **`pintintin`** — acción irreversible.

---

## ??? Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| HTML5, CSS3 | Estructura y estilos |
| JavaScript (Vanilla) | Lógica completa |
| localStorage | Almacenamiento de datos |
| Chart.js | Gráficas interactivas |
| jsPDF + AutoTable | Exportación a PDF |
| Service Worker | Funcionamiento offline |
| Manifest.json | Configuración PWA |

---

## ?? Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura principal |
| `app.js` | Lógica completa v6.0.0 |
| `admin.html` | Panel de administración |
| `analisis_jugador.html` | Análisis de Rendimiento |
| `estadisticas_graficas.html` | Gráficas interactivas |
| `ver_machs_por_dia.html` | Machs por día |
| `actualizar_tiempos.html` | Corregir tiempos |
| `styles.css` | Estilos |
| `manifest.json` | Configuración PWA |
| `sw.js` | Service Worker |
| `manual_pintintin.html` | Manual de usuario |
| `README.md` | Este archivo |

---

## ?? Créditos y agradecimientos

- **Desarrollador:** Ricardo Castillo Valdés (Richard) — La Demajagua, Isla de la Juventud, Cuba.
- **Colaboradores y probadores:** Tito, Noel, Idiol, Osvaldo, Mario, Reinier, Osmany, Marisol y todos los miembros de la peña de dominó de La Demajagua.

> *"El dominó no se juega con las manos, se juega con la cabeza"*

---

## ?? Licencia

MIT © Ricardo Castillo Valdés (Richard)

---

## ?? Contacto

- **?? Autor:** Ricardo Castillo Valdés
- **?? Email:** [3sayricardo@gmail.com](mailto:3sayricardo@gmail.com)
- **?? WhatsApp:** [+53 55031725](https://wa.me/5355031725)
- **?? Ubicación:** La Demajagua, Isla de la Juventud, Cuba

---

## ?? ¡A botar gorda!

Que corran los dados, que vuelen las fichas y que nunca falte una buena "agua" para revolucionarlas.

**Hecho en La Demajagua, Isla de la Juventud, Cuba**

---

*"El dominó no se juega con las manos, se juega con la cabeza"*
