# 🀰 Dominó Pintintín

**Aplicación para campeonato de dominó (4 jugadores individuales)**  
Creada por **Ricardo Castillo (Richard)** – La Demajagua, Isla de la Juventud, Cuba

![Versión](https://img.shields.io/badge/versión-1.0-blue)
![PWA](https://img.shields.io/badge/PWA-lista-purple)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

---

## 🎲 ¿Qué es Dominó Pintintín?

Es una aplicación **PWA (Progressive Web App)** diseñada específicamente para llevar la puntuación de un campeonato de dominó con **4 jugadores individuales** (no por parejas), con reglas especiales propias del dominó callejero cubano.

### Características principales

- ✅ **Juego individual** (cada jugador juega para sí mismo, sin parejas)
- ✅ **Puntuación por patas** (no por puntos de fichas)
- ✅ **Un MACH se gana al alcanzar 5 patas**
- ✅ **Forros**: restan 1 pata al jugador que comete un error
- ✅ **Agua**: estadística para quien revuelve las fichas (no afecta las patas)
- ✅ **Empates**: bonificación de 2 patas al ganador de la siguiente mano
- ✅ **Sorteo de sillas** con dados virtuales
- ✅ **Estadísticas del día y globales**
- ✅ **Respaldo automático** (backup) al cerrar el día
- ✅ **Exportación a CSV y PDF**
- ✅ **Funciona sin conexión a internet** (una vez instalada)
- ✅ **Instalable como app nativa** en móviles Android

---

## 📱 Reglas del juego

| Concepto | Explicación |
|----------|-------------|
| **Pata** | Una mano ganada. El jugador que gana suma 1 pata (o 2 si venía de un empate). |
| **Mach** | Se completa cuando un jugador alcanza 5 patas. Se reinicia el contador de todos. |
| **Forro** | Error del jugador (jugar una ficha que no corresponde). Resta 1 pata. |
| **Agua** | El jugador que revuelve las fichas al final de la mano. Solo estadística. |
| **Empate** | Cuando la mano termina trancada y dos o más jugadores empatan en puntos. |

---

## 🚀 Cómo instalar la app

### En tu móvil Android (recomendado)

1. Abre la aplicación en **Chrome**
2. Toca los tres puntos ⋮ en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirma el nombre "Dominó Pintintín"

✅ La app quedará instalada como una nativa y funcionará **sin internet**.

### En tu PC (navegador)

Solo abre el enlace y comienza a jugar. La interfaz es responsive y se adapta al tamaño de pantalla.

---

## 🎮 Cómo usar la aplicación

### 1. Pantalla de inicio

- Ingresa los 4 nombres de los jugadores
- Toca **"🎲 Sortear sillas e iniciar"** (esto hace el sorteo y arranca el día)
- También puedes ver estadísticas globales, exportar respaldos o borrar datos

### 2. Pantalla de juego

Cada jugador tiene una **tarjeta de color** con:

- Su **posición y nombre**
- **Patas actuales** (número grande)
- **Forros y Aguas** acumulados en el día
- Tres botones: 🏆 Pata, 🧤 Forro, 💧 Agua

### 3. Botones inferiores

| Botón | Función |
|-------|---------|
| ⚖️ Declarar empate | Marca un empate entre dos o más jugadores |
| 🔄 Sustituir jugador | Cambia un jugador por otro (después de un mach) |
| 📊 Estadísticas del día | Muestra tabla del día actual |
| 🌍 Estadísticas globales | Muestra todos los días (filtrable) |
| 🚪 Cerrar día y guardar | Finaliza la jornada y guarda respaldo |

### 4. Ayuda integrada

Toca el botón **❓** (flotante en la esquina superior derecha) para abrir el manual de usuario completo.

---

## 📊 Estadísticas

### Estadísticas del día
Muestra para cada jugador del día actual:
- Machs ganados
- Patas netas (ganadas - forros)
- Forros cometidos
- Aguas realizadas

### Estadísticas globales
- Filtrables por rango de fechas
- Exportables a **CSV** (Excel) y **PDF**
- Agrupadas por día, ordenadas por machs descendente

---

## 💾 Respaldo de datos (Backup)

### Automático
Al cerrar un día, se genera un archivo llamado `pintintin_lun.json` (según el día de la semana). Si se juega el mismo día de la semana, el archivo se **actualiza** (no se duplica).

### Manual
- **Exportar**: Toca 💾 Exportar respaldo
- **Importar**: Toca 📂 Importar respaldo y selecciona un archivo `.json`

---

## 🔐 Borrar todos los datos

**¡CUIDADO! Esta acción es irreversible.**

1. Toca ⚠️ Borrar datos
2. Ingresa la contraseña: `pintintin`
3. Confirma

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| HTML5, CSS3 | Estructura y estilos |
| JavaScript (Vanilla) | Lógica completa de la app |
| localStorage | Almacenamiento de datos (sin servidor) |
| Dexie.js | Capa de abstracción para IndexedDB |
| jsPDF + AutoTable | Exportación a PDF |
| Service Worker | Funcionamiento offline e instalación como PWA |

---

## 📁 Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura principal de la aplicación |
| `styles.css` | Estilos visuales y diseño responsive |
| `app.js` | Toda la lógica del juego (patas, forros, aguas, empates) |
| `manifest.json` | Configuración de la PWA (iconos, colores, nombre) |
| `sw.js` | Service Worker para funcionamiento offline |
| `icon-192.png` | Icono de 192×192 píxeles |
| `icon-512.png` | Icono de 512×512 píxeles |
| `icon-maskable-192.png` | Icono adaptable de 192×192 píxeles |
| `icon-maskable-512.png` | Icono adaptable de 512×512 píxeles |
| `README.md` | Este archivo de documentación |

---

## 🧑‍💻 Créditos

- **Desarrollador:** Ricardo Castillo (Richard)
- **Ubicación:** La Demajagua, Isla de la Juventud, Cuba
- **Versión:** 1.0 Final
- **Email:** (opcional - pon tu correo si quieres)
- **GitHub:** (opcional - pon tu perfil si quieres)

---

## 📄 Licencia

Este proyecto es de uso libre para la comunidad dominera. ¡A botar gorda! 🎲

---

## 🙏 Agradecimientos

A todos los jugadores de dominó de La Demajagua que inspiraron esta herramienta. Que los dados siempre caigan a tu favor.

---

## 📞 Contacto

Para sugerencias, reportar errores o mejoras, puedes abrir un issue en este repositorio.

---

## 🎯 ¡A botar gorda!

Que corran los dados, que vuelen las fichas y que nunca falte una buena "agua" para revolucionarlas.

🇨🇺 **Hecho en La Demajagua, Isla de la Juventud, Cuba** 🇨🇺

---

*"El dominó no se juega con las manos, se juega con la cabeza"*
