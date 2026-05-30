
---

## 📈 Módulo de gráficas interactivas

Accede desde el botón **📈 Gráficas interactivas** en la pantalla de inicio o de juego.

| Característica | Descripción |
|----------------|-------------|
| **Filtros por fechas** | Carga automática primera/última fecha registrada |
| **Selección de jugadores** | Orden prioritario (mismo que tablas de estadísticas) |
| **Tipos de gráfico** | Barras (múltiples indicadores), Líneas, Radar, Pastel, Polar |
| **Indicadores** | Todos los disponibles (Machs, Patas, Pollonas, etc.) |
| **Gráfico de barras** | Permite seleccionar múltiples indicadores sin límite (defecto: Machs, Patas, Aguas) |
| **Actualización** | Automática al cambiar cualquier filtro |
| **Exportación** | PNG (imagen) y CSV (datos subyacentes) |

---

## 🚀 Cómo instalar la app

### En tu móvil Android (recomendado)

1. Abre la aplicación en **Chrome**
2. Toca los tres puntos ⋮ en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirma el nombre "Dominó Pintintín"

✅ La app quedará instalada como una nativa y funcionará **sin internet**.

### Generar APK para distribución

1. Sube la app a un servidor HTTPS (GitHub Pages, Netlify)
2. Ve a [PWABuilder](https://www.pwabuilder.com)
3. Ingresa la URL y genera el APK

### En tu PC (navegador)

Solo abre el enlace y comienza a jugar. La interfaz es responsive y se adapta al tamaño de pantalla.

---

## 🎮 Cómo usar la aplicación

### 1. Pantalla de inicio

- Ingresa los nombres de los jugadores (mínimo 2, máximo 4)
- Toca **"🎲 Sortear sillas e iniciar"** (esto hace el sorteo y arranca el día)
- También puedes ver estadísticas globales, exportar respaldos o borrar datos

### 2. Pantalla de juego

Cada jugador tiene una **tarjeta de color** con:

- Su **posición y nombre** (👑 corona para el último ganador, 🥈 medalla para el penúltimo)
- **Patas actuales** (número grande)
- Estadísticas resumidas: 🚪C 🏃P 🀰C 🐔P 🧤F 💧A 🎯D 📥R ⚖️E 🏆⚖️EG 🧩PPE
- Tres botones: 🏆 Pata, 🧤 Forro, 🎯 Da PM

### 3. Botones inferiores

| Botón | Función |
|-------|---------|
| ⚖️ Declarar empate | Marca un empate entre dos o más jugadores (luego asigna agua automáticamente) |
| ➕ Añadir jugador | Agrega un jugador en silla vacante |
| ➖ Salida de jugador | Retira un jugador (mínimo 2 en mesa) |
| 📊 Estadísticas del día | Muestra tabla del día actual |
| 🌍 Estadísticas globales | Muestra todos los días (filtrable) |
| 📈 Gráficas interactivas | Abre el módulo de gráficas (nuevo en v4.5) |
| 🚪 Cerrar día y guardar | Finaliza la jornada y guarda respaldo |

### 4. Ayuda integrada

Toca el botón **❓** (flotante en la esquina superior derecha) para abrir el manual de usuario completo.

---

## 🛠️ Panel de Administración

Accede a `admin.html` con contraseña `admin`

| Función | Descripción |
|---------|-------------|
| 👥 Jugadores | CRUD completo, nombre único |
| 📅 Días | Crear, activar/desactivar, eliminar |
| 📈 Participaciones | Editar todos los campos estadísticos |
| 📊 Machs | Ver participantes, manos, cambiar ganador |
| 🔥 Eliminación completa | Borra mach y actualiza estadísticas automáticamente |
| 📎 Reporte general | Totales por jugador, exportable a CSV |
| 💾 Importar/Exportar | JSON completo de la base de datos |

---

## 💾 Respaldo de datos (Backup)

### Automático
Al cerrar un día, se genera un archivo llamado `Pinti_v45_lun.json` (según el día de la semana). Si se juega el mismo día de la semana, el archivo se **actualiza** (no se duplica).

### Manual
- **Exportar**: Toca 💾 Exportar respaldo (genera `Pinti_v45_ddmmyy.json`)
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
| Dexie.js | Capa de abstracción para IndexedDB (admin.html) |
| Chart.js | Librería para gráficas interactivas (nuevo en v4.5) |
| jsPDF + AutoTable | Exportación a PDF |
| Service Worker | Funcionamiento offline e instalación como PWA |

---

## 📁 Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura principal de la aplicación |
| `admin.html` | Panel de administración |
| `estadisticas_graficas.html` | Módulo de gráficas interactivas (nuevo en v4.5) |
| `styles.css` | Estilos visuales y diseño responsive |
| `app.js` | Toda la lógica del juego (v4.5) |
| `manifest.json` | Configuración de la PWA (iconos, colores, nombre) |
| `sw.js` | Service Worker para funcionamiento offline |
| `manual_pintintin.html` | Manual de usuario completo |
| `icon-192.png` | Icono de 192×192 píxeles |
| `icon-512.png` | Icono de 512×512 píxeles |
| `icon-maskable-192.png` | Icono adaptable de 192×192 píxeles |
| `icon-maskable-512.png` | Icono adaptable de 512×512 píxeles |
| `README.md` | Este archivo de documentación |

---

## 🧑‍💻 Créditos

- **Desarrollador:** Ricardo Castillo (Richard)
- **Ubicación:** La Demajagua, Isla de la Juventud, Cuba
- **Versión:** 4.5 (Mayo 2026)
- **Email:** (opcional - pon tu correo si quieres)
- **GitHub:** (opcional - pon tu perfil si quieres)

---

## 📄 Licencia

MIT © Ricardo Castillo (Richard)

---

## 🙏 Agradecimientos

A la peña de dominó de La Demajagua: **Tito, Noel, Idiol y Osvaldo** — por sus ideas, pruebas y pasión por el juego.

> *"El dominó no se juega con las manos, se juega con la cabeza"*

---

## 📞 Contacto

Para sugerencias, reportar errores o mejoras, puedes abrir un issue en este repositorio.

---

## 🎯 ¡A botar gorda!

Que corran los dados, que vuelen las fichas y que nunca falte una buena "agua" para revolucionarlas.

🇨🇺 **Hecho en La Demajagua, Isla de la Juventud, Cuba** 🇨🇺

---

*"El dominó no se juega con las manos, se juega con la cabeza"*
