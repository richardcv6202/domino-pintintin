# ?? Dominó Pintintín

**Versión 5.2.0** — Aplicación para campeonatos de dominó individual (4 jugadores)

> Creada por **Ricardo Castillo (Richard)** — La Demajagua, Isla de la Juventud, Cuba

[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-5.2.0-blue)

---

## ?? Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Novedades de la versión 5.2.0](#-novedades-de-la-versión-520)
- [Características principales](#-características-principales)
- [Instalación (PWA y APK)](#-instalación-pwa-y-apk)
- [Guía de uso rápido](#-guía-de-uso-rápido)
- [Reglas del juego](#-reglas-del-juego-modalidad-individual)
- [Módulo de estadísticas globales](#-módulo-de-estadísticas-globales)
- [?? Gráficas interactivas](#-gráficas-interactivas)
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

## ?? Capturas de pantalla

| Pantalla de inicio | Pantalla de juego | Estadísticas |
|:---:|:---:|:---:|
| ![Configuración](docs/config.png) | ![Juego](docs/juego.png) | ![Estadísticas](docs/estadisticas.png) |

> *Nota: Las imágenes son ilustrativas. Puedes generarlas con tu dispositivo.*

---

## ?? Novedades de la versión 5.2.0

| Característica | Descripción |
|----------------|-------------|
| **?? Métricas de tiempo reales** | Cada mach ahora registra `fechaHoraInicio` y `fechaHora` (fin). Permite calcular duración real de cada mach y de sesiones completas. |
| **?? Nuevas gráficas de tiempo** | En el módulo de gráficas, nuevo modo "?? Métricas de tiempo" con: Tiempo total jugado, Promedio por mach, Tiempo por mach ganado. |
| **?? Nueva pestaña "Tiempo" en admin** | Muestra por día: total de machs, hora primer/último mach, duración total de sesión y promedio por mach. Exportable a CSV. |
| **?? Verificación avanzada** | Detecta participaciones duplicadas, fantasmas (todos ceros), días duplicados e inconsistencias entre machs y participaciones. |
| **?? Reparación automática** | Elimina duplicados, reconstruye participaciones corruptas y recalcula estadísticas desde los machs. |
| **? Herramienta actualizar_tiempos.html** | Script auxiliar para asignar horas de inicio aleatorias a machs antiguos (entre 8-15 minutos antes de su hora de finalización). |
| **?? Formato de fecha dd-mm-yyyy** | En el módulo "Ver machs por día" las fechas se muestran en formato cubano. |
| **?? Hora de finalización visible** | En la tabla de machs por día se añadió columna con la hora exacta (hh:mm a.m./p.m.) de finalización. |
| **?? Numeración secuencial de machs** | Los machs se numeran consecutivamente dentro de la fecha según orden cronológico. |

---

## ? Características principales

- ? **Registro completo** de patas, machs, forros, aguas, pases de mano y empates.
- ? **Estadísticas detalladas** por día y globales (con filtro de fechas y exportación a CSV/PDF).
- ? **Gráficas interactivas** (líneas, barras múltiples, radar, pastel, polar) con Chart.js.
- ? **Métricas de tiempo** en gráficas y panel de administración (nuevo en v5.2.0).
- ? **Persistencia de datos** en `localStorage` y respaldos automáticos/manuales en JSON.
- ? **Funcionamiento offline** (PWA) — ideal para zonas con mala o nula conexión.
- ? **Sorteo aleatorio** de posiciones con dados virtuales y resolución de empates.
- ? **Sustitución y retirada** de jugadores en medio de la partida (mínimo 2 en mesa).
- ? **Historial de manos ganadas y empates** con timestamp y número de mach.
- ? **Identificación visual** del último ganador (??) y penúltimo (??).
- ? **Límite de 5 patas por mach** (excedente no contabilizado).
- ? **Panel de administración** con CRUD completo, verificación avanzada y reparación automática.
- ? **Acceso oculto** al panel para administradores (contraseña "administrador").
- ? **Manual de usuario** integrado (botón ?) con explicaciones detalladas y ejemplos.

---

## ?? Instalación (PWA y APK)

### En tu móvil Android (recomendado)

1. Abre la aplicación en **Chrome** (desde la URL de GitHub Pages o local).
2. Toca los tres puntos ? en la esquina superior derecha.
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

## ??? Guía de uso rápido

### 1. Pantalla de inicio

- **Fecha:** Por defecto la fecha actual. Se puede cambiar manualmente.
- **Jugadores:** Ingresa los nombres (mínimo 2, máximo 4). En un juego nuevo, los dos primeros son obligatorios; los demás opcionales. Si hay partida guardada, todos son opcionales.
- **Botón principal:** "?? Sortear sillas e iniciar" (morado). Si existe partida guardada y no hay día activo, el botón se vuelve verde y dice "?? Continuar partida guardada".
- **Botones secundarios:** ?? Estadísticas globales, ?? Gráficas interactivas, ?? Ver machs por día, ?? Borrar datos, ?? Exportar respaldo, ?? Importar respaldo.

### 2. Pantalla de juego

Cada jugador tiene una **tarjeta de color** con:

- **Posición y nombre** (?? corona para el último ganador, ?? medalla para el penúltimo).
- **Patas actuales** (número grande).
- **Estadísticas resumidas del día** (todos los indicadores).
- **Tres botones:** ?? Pata, ?? Forro, ?? Da PM.

### 3. Botones globales

| Botón | Función |
|-------|---------|
| **?? Declarar empate** | Marca un empate entre dos o más jugadores. |
| **? Añadir jugador** | Agrega un jugador en una silla vacante (aleatoria). |
| **? Salida de jugador** | Retira un jugador (mínimo 2 en mesa). |
| **?? Estadísticas del día** | Muestra tabla con acumulados del día actual. |
| **?? Estadísticas globales** | Abre vista de estadísticas históricas. |
| **?? Gráficas interactivas** | Abre el módulo de gráficas. |
| **?? Salir del juego** | Abre modal para salir conservando o no la partida. |
| **? Ayuda** | Botón flotante superior derecho. Abre el manual completo. |
| **?? Historial** | Muestra todas las manos ganadas del día actual. |

---

## ?? Reglas del juego (modalidad individual)

### Conceptos clave

- **?? Pata:** Unidad de puntuación. Se otorga al ganador de una mano.
- **?? Forro:** Penalización de 1 pata (se resta).
- **?? Agua:** Se asigna al jugador que revolvió las fichas (solo estadística).
- **?? Pase de mano:** Ceder el turno intencionalmente.
- **?? Empate:** Acumula multiplicador para la próxima mano (base × 2n).
- **?? Mach:** Conjunto de 5 patas. Cuando un jugador llega a 5, gana un mach y se reinician las patas.
- **?? Pollona:** Mach en el que ningún otro jugador sumó ninguna pata.

### Formas de terminación de una mano

| Forma | Patas base | Descripción |
|-------|------------|-------------|
| **?? Cierre** | 1 | Un jugador coloca su última ficha y termina la mano. |
| **?? Pegado (normal)** | 1 | El juego se bloquea y gana el que tenga menos puntos. |
| **?? Capicua (pegue especial)** | 2 | Ficha no doble que encaja en ambas cabezas y termina la partida. |

### ?? Límite de 5 patas por mach

Si el cálculo de patas (base × 2n) supera las necesarias para llegar a 5, el jugador solo recibe las patas necesarias. El excedente se refleja en "Patas por Empate".

---

## ?? Módulo de estadísticas globales

- **Filtro por fechas:** Permite seleccionar un rango (desde/hasta). Por defecto, últimos 30 días.
- **Vista normal:** Jugadores como filas, indicadores como columnas.
- **Vista transpuesta:** Indicadores como filas, jugadores como columnas (botón ??).
- **Exportación:** CSV y PDF.
- **Resumen general:** Tabla con totales de todos los días.

---

## ?? Gráficas interactivas

Accede desde el botón **?? Gráficas interactivas**.

| Característica | Descripción |
|----------------|-------------|
| **Filtros por fechas** | Carga automática primera/última fecha registrada. |
| **Selección de jugadores** | Orden prioritario (machs, patas, etc.). |
| **Tipos de gráfico** | Líneas, Barras (múltiples indicadores), Radar, Pastel, Polar. |
| **Modo juego** | Indicadores tradicionales (Machs, Patas, etc.). |
| **Modo tiempo (NUEVO)** | Tiempo total jugado, Promedio por mach, Tiempo por mach ganado. |
| **Exportación** | PNG (imagen) y CSV (datos subyacentes). |

---

## ?? Ver machs por día

Módulo independiente (acceso desde botón ??) que muestra:

- **Selector de fechas:** Solo días con machs registrados. Carga automáticamente la última fecha jugada.
- **Tabla de machs:** Número, ganador, participantes y patas finales. **NUEVO:** Columna con hora de finalización.
- **Exportación a CSV** de los machs mostrados.
- **Resumen del día:** Solo jugadores reales (excluye sillas vacías).
- **Resumen acumulado general:** Suma de todos los días.
- **Formato de fecha dd-mm-yyyy** (formato cubano).

---

## ?? Métricas de tiempo

A partir de la versión **5.2.0**, se han incorporado dos nuevos módulos para analizar el tiempo de juego:

### En el módulo de gráficas interactivas
- **Tiempo total jugado (minutos):** Suma de la duración de todos los machs del jugador.
- **Promedio de tiempo por mach (minutos):** Tiempo total / cantidad de machs.
- **Tiempo por mach ganado (minutos):** Promedio de tiempo de los machs que ganó.

### En el panel de administración (pestaña "?? Tiempo")
- Fecha (dd-mm-yyyy)
- Total de machs
- Hora del primer mach (hh:mm a.m./p.m.)
- Hora del último mach (hh:mm a.m./p.m.)
- Duración total de la sesión (minutos)
- Promedio por mach (minutos)

Filtro por rango de fechas y exportación a CSV.

---

## ??? Panel de administración

Accede mediante `admin.html` con contraseña **`admin`** (después de haber accedido por el método oculto).

| Función | Descripción |
|---------|-------------|
| **?? Machs** | Ver, filtrar, cambiar ganador, eliminar mach. Botón "Ver detalle". |
| **?? Jugadores** | CRUD completo, nombre único. |
| **?? Días** | Crear, activar/desactivar, forzar cierre de día, eliminar. |
| **?? Participaciones** | Editar todos los campos estadísticos. |
| **?? Reporte General** | Totales acumulados por jugador con filtro de fechas. |
| **?? Tiempo** | Estadísticas de tiempo por día (NUEVO en v5.2.0). |
| **?? Verificar integridad** | Detecta y repara inconsistencias básicas. |
| **?? Verificación Avanzada** | Detecta duplicados, fantasmas e inconsistencias profundas. |
| **?? Reparación Automática** | Corrige automáticamente los problemas detectados. |
| **?? Importar/Exportar** | Respaldo completo de la base de datos en JSON. |

---

## ?? Verificación avanzada y reparación automática

### ?? Verificación Avanzada
Detecta automáticamente:
- **Participaciones duplicadas:** Mismo (día, jugador) con dos registros diferentes.
- **Participaciones fantasma:** Todos los valores estadísticos en cero.
- **Días duplicados:** Misma fecha con diferentes IDs.
- **Inconsistencias:** MachsGanados que exceden los machs reales.
- **Jugadores sin participación:** Aparecen en machs pero no tienen registro.

### ?? Reparación Automática
Realiza las siguientes acciones:
- Elimina participaciones fantasma.
- Unifica días duplicados.
- Recalcula machsGanados desde los machs reales.
- Reconstruye participaciones faltantes.
- Reindexa IDs para mantener consistencia.

> ?? **Recomendación:** Siempre exporta un backup antes de ejecutar la reparación automática.

---

## ? Herramienta actualizar_tiempos.html

Esta es una herramienta **de USO ÚNICO** diseñada para corregir machs antiguos que no tienen `fechaHoraInicio` (creados antes de la versión 5.2.0).

### ¿Cómo funciona?
1. Abre `actualizar_tiempos.html` desde el panel de administración o directamente.
2. Haz clic en **"?? Analizar machs antiguos"** para ver cuántos machs necesitan actualización.
3. Haz clic en **"?? Actualizar machs"** para asignar horas de inicio aleatorias (entre 8 y 15 minutos antes de su hora de finalización).
4. Verifica en la aplicación que los machs tengan hora de inicio visible.

> ?? **Importante:** Esta herramienta NO afecta los machs que ya tienen `fechaHoraInicio`. Es segura de usar.

---

## ?? Respaldo de datos (Backup)

### Automático

Cada vez que se **cierra un día definitivamente** (saliendo sin conservar partida), la aplicación genera un archivo JSON con nombre `Pinti_v520_XXX.json` donde `XXX` es el día de la semana abreviado (lun, mar, mié, …). Si se juega el mismo día de la semana, el archivo se sobrescribe (solo se mantiene el último backup de ese día).

### Manual

- **Exportar:** Botón "?? Exportar respaldo" ? genera `Pinti_v520_ddmmyy.json`.
- **Importar:** Botón "?? Importar respaldo" ? permite cargar un JSON previamente exportado (reemplaza toda la base de datos).

> ?? La importación borra los datos actuales. Siempre haz una copia de seguridad antes.

---

## ?? Acceso oculto al panel de administración

Para evitar que los jugadores comunes accedan al panel, se han implementado **tres métodos ocultos**, todos protegidos por la misma contraseña: **`administrador`** (minúsculas, sin comillas). Una vez dentro del panel, se pide la contraseña `admin` (doble autenticación).

1. **Parámetro en URL:** Añade `?admin=true` a la URL principal. Ej: `index.html?admin=true`.
2. **5 taps en el marcador de puntos:** En la pantalla de juego, haz clic 5 veces rápidamente en el **número grande de patas (??)** del jugador 1.
3. **Enlace en los créditos:** En la pantalla de inicio, al final, el nombre **Richard** aparece subrayado en morado. Haz clic en él.

---

## ?? Borrar todos los datos

Botón **"?? Borrar datos"** en la pantalla de configuración. Pide la contraseña **`pintintin`**. Esta acción es **irreversible** y elimina todos los registros de jugadores, días, participaciones y machs. Siempre exporta un respaldo antes de borrar.

---

## ??? Tecnologías utilizadas

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

## ?? Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura principal de la aplicación (con registro del Service Worker). |
| `app.js` | Toda la lógica del juego (v5.2.0). |
| `admin.html` | Panel de administración (con verificación avanzada y reparación). |
| `actualizar_tiempos.html` | Herramienta para corregir tiempos de machs antiguos. |
| `estadisticas_graficas.html` | Módulo de gráficas interactivas (con métricas de tiempo). |
| `ver_machs_por_dia.html` | Módulo para consultar machs por fecha. |
| `styles.css` | Estilos visuales y diseño responsive. |
| `manifest.json` | Configuración de la PWA (iconos, colores, nombre). |
| `sw.js` | Service Worker para funcionamiento offline. |
| `generar_iconos.html` | Herramienta para generar los iconos PWA. |
| `icon-192.png` | Icono general de 192×192 píxeles. |
| `icon-512.png` | Icono general de 512×512 píxeles. |
| `icon-maskable-192.png` | Icono adaptable (maskable) de 192×192 píxeles. |
| `icon-maskable-512.png` | Icono adaptable (maskable) de 512×512 píxeles. |
| `manual_pintintin.html` | Manual de usuario completo. |
| `README.md` | Este archivo de documentación. |

---

## ?? Créditos y agradecimientos

- **Desarrollador:** Ricardo Castillo (Richard) — La Demajagua, Isla de la Juventud, Cuba.
- **Colaboradores y probadores:** Tito, Noel, Idiol, Osvaldo, Mario, Reinier, Osmany, Marisol y todos los miembros de la peña de dominó de La Demajagua.
- **Agradecimientos especiales:** A la peña de dominó de La Demajagua por sus ideas, pruebas y pasión por el juego.

> *"El dominó no se juega con las manos, se juega con la cabeza"*

---

## ?? Licencia

MIT © Ricardo Castillo (Richard)

---

## ?? Contacto

¿Tienes sugerencias, reportaste un error o quieres proponer mejoras?

- **?? Autor:** Ricardo Castillo Valdés
- **?? Email:** [3sayricardo@gmail.com](mailto:3sayricardo@gmail.com)
- **?? WhatsApp:** [+53 55031725](https://wa.me/5355031725)
- **?? Ubicación:** La Demajagua, Isla de la Juventud, Cuba

> *Puedes escribirme directamente por WhatsApp o email. Agradezco cada sugerencia y reporte de error.*

---

## ?? ¡A botar gorda!

Que corran los dados, que vuelen las fichas y que nunca falte una buena "agua" para revolucionarlas.

**Hecho en La Demajagua, Isla de la Juventud, Cuba**

---

*"El dominó no se juega con las manos, se juega con la cabeza"*
