# 🀰 Dominó Pintintín

**Versión 5.0.2** — Aplicación para campeonatos de dominó individual (4 jugadores)

> Creada por **Ricardo Castillo (Richard)** — La Demajagua, Isla de la Juventud, Cuba

[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-5.0.2-blue)

---

## 📖 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Novedades de la versión 5.0.2](#-novedades-de-la-versión-502)
- [Características principales](#-características-principales)
- [Instalación (PWA y APK)](#-instalación-pwa-y-apk)
- [Guía de uso rápido](#-guía-de-uso-rápido)
  - [Pantalla de inicio](#1-pantalla-de-inicio)
  - [Pantalla de juego](#2-pantalla-de-juego)
  - [Botones globales](#3-botones-globales)
- [Reglas del juego (modalidad individual)](#-reglas-del-juego-modalidad-individual)
- [Módulo de estadísticas globales](#-módulo-de-estadísticas-globales)
- [📈 Gráficas interactivas](#-gráficas-interactivas)
- [📋 Ver machs por día](#-ver-machs-por-día)
- [🛠️ Panel de administración](#️-panel-de-administración)
- [💾 Respaldo de datos (Backup)](#-respaldo-de-datos-backup)
- [🚪 Acceso oculto al panel de administración](#-acceso-oculto-al-panel-de-administración)
- [⚠️ Borrar todos los datos](#️-borrar-todos-los-datos)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Créditos y agradecimientos](#-créditos-y-agradecimientos)
- [Licencia](#-licencia)

---

## 🎯 Descripción general

**Dominó Pintintín** es una aplicación diseñada para **campeonatos de dominó individual** (4 jugadores, cada uno juega para sí mismo). Nace en la peña de dominó de La Demajagua, donde el nivel de los jugadores es muy heterogéneo y jugar por parejas resultaba frustrante. La modalidad individual elimina las desigualdades de pareja, es inclusiva (pueden jugar niños, mujeres, hombres y mayores) y fomenta la diversión familiar.

La app automatiza el registro de patas, machs, forros, aguas, pases de mano y empates, permitiendo a los jugadores concentrarse en el juego. Es una **PWA** (Progressive Web App), por lo que puede instalarse en el móvil y funciona **sin conexión a internet** después de la primera carga.

---

## 📸 Capturas de pantalla

| Pantalla de inicio | Pantalla de juego | Estadísticas |
|:---:|:---:|:---:|
| ![Configuración](docs/config.png) | ![Juego](docs/juego.png) | ![Estadísticas](docs/estadisticas.png) |

> *Nota: Las imágenes son ilustrativas. Puedes generarlas con tu dispositivo.*

---

## 🎉 Novedades de la versión 5.0.2

| Característica | Descripción |
|----------------|-------------|
| **🐛 Restauración de partida CORREGIDA** | Al hacer clic en "Continuar partida guardada" ahora carga correctamente los jugadores y el estado del juego, sin pedir nombres nuevos. |
| **🚪 Nueva lógica de salida** | El modal ahora se llama "Salir del juego". Si marcas "Conservar partida", sales sin cerrar el día (el día sigue activo y la sesión se guarda). Si lo desmarcas, se cierra el día definitivamente y se descarta la partida. |
| **🔐 Acceso oculto a admin mejorado** | Se pide contraseña **"administrador"** (palabra completa) para acceder a `admin.html`. Dentro del panel, la contraseña sigue siendo `admin` (doble autenticación). También hay un enlace en los créditos (el nombre "Richard"). |
| **📊 Tablas de administración corregidas** | La tabla de machs muestra los datos correctamente alineados en sus columnas. El reporte general ordena por machs ganados (descendente) y luego por patas netas. |
| **📋 Ver Machs por Día mejorado** | Los resúmenes ya no incluyen sillas vacías (solo jugadores reales). Nombres alineados a la izquierda y botones centrados. Tabla responsive. Carga automática de la última fecha jugada. |
| **⚠️ Límite de 5 patas por mach** | Si un jugador ganaría más de 5 patas en una mano, solo recibe las necesarias para llegar a 5. El excedente no se contabiliza para el mach (aunque se refleja en "Patas por Empate"). |

---

## ✨ Características principales

- ✅ **Registro completo** de patas, machs, forros, aguas, pases de mano y empates.
- ✅ **Estadísticas detalladas** por día y globales (con filtro de fechas y exportación a CSV/PDF).
- ✅ **Gráficas interactivas** (líneas, barras múltiples, radar, pastel, polar) con Chart.js.
- ✅ **Persistencia de datos** en `localStorage` y respaldos automáticos/manuales en JSON.
- ✅ **Funcionamiento offline** (PWA) — ideal para zonas con mala o nula conexión.
- ✅ **Sorteo aleatorio** de posiciones con dados virtuales y resolución de empates.
- ✅ **Sustitución y retirada** de jugadores en medio de la partida (mínimo 2 en mesa).
- ✅ **Historial de manos ganadas y empates** con timestamp y número de mach.
- ✅ **Identificación visual** del último ganador (👑) y penúltimo (🥈).
- ✅ **Límite de 5 patas por mach** (excedente no contabilizado).
- ✅ **Panel de administración** con CRUD completo, verificación de integridad y edición de participaciones.
- ✅ **Acceso oculto** al panel para administradores (contraseña "administrador").
- ✅ **Manual de usuario** integrado (botón ❓) con explicaciones detalladas y ejemplos.

---

## 📲 Instalación (PWA y APK)

### En tu móvil Android (recomendado)

1. Abre la aplicación en **Chrome** (desde la URL de GitHub Pages o local).
2. Toca los tres puntos ⋮ en la esquina superior derecha.
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**.
4. Confirma el nombre "Dominó Pintintín".
5. La app quedará instalada como una nativa y funcionará **sin internet** (después de la primera carga con conexión).

### Generar APK para distribución

1. Sube la app a un servidor HTTPS (GitHub Pages, Netlify).
2. Ve a [PWABuilder](https://www.pwabuilder.com).
3. Ingresa la URL de tu sitio (ej: `https://tusuario.github.io/pintintin/`).
4. La herramienta analizará tu PWA y te permitirá generar el APK para Android.
5. Descarga y distribuye el APK.

### En tu PC (navegador)

Abre el enlace y comienza a jugar. La interfaz es responsive y se adapta al tamaño de pantalla.

---

## 🕹️ Guía de uso rápido

### 1. Pantalla de inicio

- **Fecha:** Por defecto la fecha actual. Se puede cambiar manualmente.
- **Jugadores:** Ingresa los nombres (mínimo 2, máximo 4). En un juego nuevo, los dos primeros son obligatorios (placeholder "Nombre (obligatorio)"); los demás opcionales. Si hay partida guardada, todos son opcionales.
- **Botón principal:** "🎲 Sortear sillas e iniciar" (morado). Si existe partida guardada y no hay día activo, el botón se vuelve verde y dice "🎲 Continuar partida guardada".
- **Botones secundarios:** 📊 Estadísticas globales, 📈 Gráficas interactivas, 📋 Ver machs por día, ⚠️ Borrar datos, 💾 Exportar respaldo, 📂 Importar respaldo.

### 2. Pantalla de juego

Cada jugador tiene una **tarjeta de color** con:

- **Posición y nombre** (👑 corona para el último ganador, 🥈 medalla para el penúltimo).
- **Patas actuales** (número grande).
- **Estadísticas resumidas del día:** 🚪 Cierres, 🏃 Pegados, 🀰 Capicuas, 🐔 Pollonas, 🧤 Forros, 💧 Aguas, 🎯 PM Dados, 📥 PM Recibidos, ⚖️ Empates, 🏆⚖️ E. Ganados, 🧩 Patas por Empate.
- **Tres botones:** 🏆 Pata, 🧤 Forro, 🎯 Da PM.

### 3. Botones globales

| Botón | Función |
|-------|---------|
| **⚖️ Declarar empate** | Marca un empate entre dos o más jugadores (asigna agua automáticamente y determina quién comienza). |
| **➕ Añadir jugador** | Agrega un jugador en una silla vacante (aleatoria). Si ya hay 4 jugadores, el botón cambia a "🔄 Sustituir jugador". |
| **➖ Salida de jugador** | Retira un jugador (deja su silla vacante). Mínimo 2 jugadores en la mesa. |
| **📊 Estadísticas del día** | Muestra una tabla con los acumulados del día actual (se puede alternar vista transpuesta). |
| **🌍 Estadísticas globales** | Abre la vista de estadísticas históricas con filtro de fechas y exportación. |
| **📈 Gráficas interactivas** | Abre el módulo de gráficas (acceso también desde configuración). |
| **🚪 Salir del juego** | Abre modal para salir conservando o no la partida. |
| **❓ Ayuda** | Botón flotante superior derecho. Abre el manual completo. |
| **📜 Historial** | Muestra todas las manos ganadas y salidas por empate del día actual. |

---

## 📏 Reglas del juego (modalidad individual)

### Conceptos clave

- **🏆 Pata:** Unidad de puntuación. Se otorga al ganador de una mano.
- **🧤 Forro:** Penalización de 1 pata (se resta).
- **💧 Agua:** Se asigna al jugador que revolvió las fichas (solo estadística).
- **🎯 Pase de mano:** Ceder el turno intencionalmente.
- **⚖️ Empate:** Acumula multiplicador para la próxima mano (base × 2ⁿ).
- **🏆 Mach:** Conjunto de 5 patas. Cuando un jugador llega a 5, gana un mach y se reinician las patas.
- **🐔 Pollona:** Mach en el que ningún otro jugador sumó ninguna pata.

### Formas de terminación de una mano

| Forma | Patas base | Descripción |
|-------|------------|-------------|
| **🚪 Cierre** | 1 | Un jugador coloca su última ficha y termina la mano. |
| **🏃 Pegado (normal)** | 1 | El juego se bloquea (nadie puede jugar) y gana el que tenga menos puntos. También ocurre si un jugador, con ficha no doble, solo tiene una opción de colocación. |
| **🀰 Capicua (pegue especial)** | 2 | Un jugador, con una ficha **que no es doble**, puede colocarla por **cualquiera de las dos cabezas** y con esa jugada termina la partida. |

### ⚠️ Límite de 5 patas por mach

Si el cálculo de patas (base × 2ⁿ) supera las necesarias para llegar a 5, el jugador solo recibe las patas necesarias. El excedente no se contabiliza para el mach (aunque se refleja en la estadística "Patas por Empate").

### Ejemplo de límite

Un jugador tiene 2 patas y gana una capicua (base=2) con 2 empates acumulados (2²=4). Patas brutas = 8. Necesita 3 para llegar a 5 → recibe 3. El excedente (5) no se contabiliza.

---

## 📊 Módulo de estadísticas globales

- **Filtro por fechas:** Permite seleccionar un rango (desde/hasta). Por defecto, últimos 30 días.
- **Vista normal:** Jugadores como filas, indicadores como columnas.
- **Vista transpuesta:** Indicadores como filas, jugadores como columnas (botón 🔄).
- **Exportación:** CSV (compatible con Excel) y PDF (con jsPDF).
- **Resumen general:** Tabla con totales de todos los días, ordenada por machs ganados y patas netas.

---

## 📈 Gráficas interactivas

Accede desde el botón **📈 Gráficas interactivas** en la pantalla de inicio o de juego.

| Característica | Descripción |
|----------------|-------------|
| **Filtros por fechas** | Carga automática primera/última fecha registrada. |
| **Selección de jugadores** | Orden prioritario (mismos criterios que tablas de estadísticas). |
| **Tipos de gráfico** | Líneas, Barras (múltiples indicadores), Radar, Pastel, Polar. |
| **Indicadores** | Todos los disponibles (Machs, Patas netas, Pollonas, Capicuas, Cierres, Pegados, Forros, Aguas, PM Dados, PM Recibidos, Empates, E. Ganados, Patas por Empate). |
| **Gráfico de barras** | Permite seleccionar múltiples indicadores sin límite (defecto: Machs, Patas, Aguas). |
| **Actualización** | Automática al cambiar cualquier filtro. |
| **Exportación** | PNG (imagen) y CSV (datos subyacentes). |

---

## 📋 Ver machs por día

Módulo independiente (acceso desde botón 📋) que muestra:

- **Selector de fechas:** Solo aparecen días con machs registrados. Carga automáticamente la última fecha jugada.
- **Tabla de machs:** Número, ganador y participantes (incluyendo sillas vacías) con sus patas finales. Tabla responsive con scroll horizontal.
- **Exportación a CSV** de los machs mostrados.
- **Resumen del día:** Solo jugadores reales (excluye sillas vacías), con machs ganados y patas totales. Nombres alineados a la izquierda.
- **Resumen acumulado general:** Suma de todos los días.

---

## 🛠️ Panel de administración

Accede mediante `admin.html` con contraseña **`admin`** (después de haber accedido por el método oculto).

| Función | Descripción |
|---------|-------------|
| **📊 Machs** | Ver, filtrar, cambiar ganador, eliminar mach (solo el registro) o eliminar completamente (resta estadísticas). Botón "Ver detalle" con información completa. |
| **👥 Jugadores** | CRUD completo, nombre único. Al eliminar un jugador, se borran sus participaciones y machs ganados. |
| **📅 Días** | Crear, activar/desactivar (checkbox), forzar cierre de día, eliminar. |
| **📈 Participaciones** | Editar todos los campos estadísticos de cada jugador por día. |
| **📊 Reporte General** | Totales acumulados por jugador con filtro de fechas, ordenado por machs y patas, exportable a CSV. |
| **💾 Importar/Exportar** | Respaldo completo de la base de datos en JSON. |
| **🔍 Verificar integridad** | Detecta y repara inconsistencias (machs huérfanos, participaciones mal contadas). |

---

## 💾 Respaldo de datos (Backup)

### Automático

Cada vez que se **cierra un día definitivamente** (saliendo sin conservar partida), la aplicación genera un archivo JSON con nombre `Pinti_v502_XXX.json` donde `XXX` es el día de la semana abreviado (lun, mar, mié, …). Si se juega el mismo día de la semana, el archivo se sobrescribe (solo se mantiene el último backup de ese día).

### Manual

- **Exportar:** Botón "💾 Exportar respaldo" → genera `Pinti_v502_ddmmyy.json`.
- **Importar:** Botón "📂 Importar respaldo" → permite cargar un JSON previamente exportado (reemplaza toda la base de datos).

> ⚠️ La importación borra los datos actuales. Siempre haz una copia de seguridad antes.

---

## 🚪 Acceso oculto al panel de administración

Para evitar que los jugadores comunes accedan al panel, se han implementado **tres métodos ocultos**, todos protegidos por la misma contraseña: **`administrador`** (minúsculas, sin comillas). Una vez dentro del panel, se pide la contraseña `admin` (doble autenticación).

1. **Parámetro en URL:** Añade `?admin=true` a la URL principal. Ej: `index.html?admin=true`.
2. **5 taps en el marcador de puntos:** En la pantalla de juego, haz clic 5 veces rápidamente en el **número grande de patas (🦶)** del jugador 1.
3. **Enlace en los créditos:** En la pantalla de inicio, al final, el nombre **Richard** aparece subrayado en morado. Haz clic en él.

---

## ⚠️ Borrar todos los datos

Botón **"⚠️ Borrar datos"** en la pantalla de configuración. Pide la contraseña **`pintintin`**. Esta acción es **irreversible** y elimina todos los registros de jugadores, días, participaciones y machs. Siempre exporta un respaldo antes de borrar.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| HTML5, CSS3 | Estructura y estilos |
| JavaScript (Vanilla) | Lógica completa de la app |
| localStorage | Almacenamiento de datos (sin servidor) |
| Chart.js | Gráficas interactivas |
| jsPDF + AutoTable | Exportación a PDF |
| Service Worker | Funcionamiento offline e instalación como PWA |
| Manifest.json | Configuración de la PWA (iconos, colores, nombre) |

---

## 📂 Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura principal de la aplicación (con registro del Service Worker). |
| `app.js` | Toda la lógica del juego (v5.0.2). |
| `admin.html` | Panel de administración. |
| `estadisticas_graficas.html` | Módulo de gráficas interactivas. |
| `ver_machs_por_dia.html` | Módulo para consultar machs por fecha. |
| `styles.css` | Estilos visuales y diseño responsive. |
| `manifest.json` | Configuración de la PWA (iconos, colores, nombre). |
| `sw.js` | Service Worker para funcionamiento offline. |
| `generar_iconos.html` | Herramienta para generar los iconos PWA. |
| `icon-192.png` | Icono general de 192×192 píxeles. |
| `icon-512.png` | Icono general de 512×512 píxeles. |
| `icon-maskable-192.png` | Icono adaptable (maskable) de 192×192 píxeles. |
| `icon-maskable-512.png` | Icono adaptable (maskable) de 512×512 píxeles. |
| `README.md` | Este archivo de documentación. |

---

## 👥 Créditos y agradecimientos

- **Desarrollador:** Ricardo Castillo (Richard) — La Demajagua, Isla de la Juventud, Cuba.
- **Colaboradores y probadores:** Tito, Noel, Idiol, Osvaldo, Mario, Reinier, Osmany, Marisol y todos los miembros de la peña de dominó de La Demajagua.
- **Agradecimientos especiales:** A la peña de dominó de La Demajagua por sus ideas, pruebas y pasión por el juego.

> *"El dominó no se juega con las manos, se juega con la cabeza"*

---

## 📄 Licencia

MIT © Ricardo Castillo (Richard)

---

## 📧 Contacto

Para sugerencias, reportar errores o mejoras, puedes abrir un **issue** en este repositorio o contactar al desarrollador a través de los medios proporcionados en los créditos.

---

## 🎲 ¡A botar gorda!

Que corran los dados, que vuelen las fichas y que nunca falte una buena "agua" para revolucionarlas.

**Hecho en La Demajagua, Isla de la Juventud, Cuba**

---

*"El dominó no se juega con las manos, se juega con la cabeza"*
