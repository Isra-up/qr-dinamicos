# DynQRs

Sistema de código QR dinámico para soporte, alojado en GitHub Pages.

Publicado en: https://isra-up.github.io/qr-dinamicos/ (copia pública del repositorio, en `github.com/Isra-up/qr-dinamicos`, para que GitHub Pages gratuito funcione).

Código QR de prueba (`?k=soporte`), versión simple: `assets/qr-soporte.png`.

Código QR con diseño (color institucional + logo), misma URL: `assets/qr-soporte-styled.png` (también disponible en SVG para impresión en gran formato: `assets/qr-soporte-styled.svg`).

![QR de soporte con diseño](assets/qr-soporte-styled.png)

**Nota de diseño:** el color usado es un azul aproximado (`#002F6C`), no un Pantone/hex oficial de la marca — si se cuenta con el manual de marca, actualizar `BLUE` en el script de generación. Las esquinas del buscador (los 3 cuadros de las puntas) deben mantenerse en estilo `square`: se probó con esquinas redondeadas/tipo "dot" junto con el logo y varios lectores de QR dejan de decodificar el código — los puntos del cuerpo sí pueden ser `rounded` sin problema. El logo usa nivel de corrección de errores `H` (máximo) para tolerar la oclusión central.

## Generar nuevos QR sin instalar nada

`tools/generar-qr.html` es una página que corre 100% en el navegador (sin Node, sin instalar dependencias) para generar un QR con diseño para cualquier `k` nuevo. Basta con abrirla localmente o vía GitHub Pages (`https://isra-up.github.io/qr-dinamicos/tools/generar-qr.html`), escribir el código y el color, y descargar el PNG/SVG. Usa las mismas librerías vendorizadas en `tools/vendor/` (`qr-code-styling.js`, `jsQR.js`) y aplica las mismas restricciones de diseño seguras (esquinas cuadradas, corrección `H`); cada QR generado se verifica automáticamente con `jsQR` antes de habilitar la descarga. Recuerda dar de alta el `k` correspondiente en la hoja de cálculo del Apps Script antes de usar el QR generado.

## Funcionamiento

1. El código QR apunta siempre a la misma URL de GitHub Pages, con un parámetro `k` que identifica el destino (por ejemplo `https://isra-up.github.io/qr-dinamicos/?k=soporte`).
2. `index.html` toma ese `k` y consulta un Google Apps Script (`AS_URL_BASE`), que devuelve la URL de destino actual.
3. Si la URL devuelta es válida y usa un protocolo permitido (`http`, `https`, `mailto`, `tel`), el navegador redirige automáticamente.
4. Si no hay `k`, el servicio no responde, o la URL devuelta no es válida, se muestra un mensaje y un botón para reintentar en lugar de fallar en silencio.

El destino real (a dónde apunta cada `k`) se administra en el Google Apps Script / hoja de cálculo asociada, no en este repositorio. Esto permite cambiar el destino sin editar ni redeployar el HTML.

## Cambiar un destino

Editar la fuente de datos del Apps Script (hoja de cálculo) que resuelve `k -> URL`. No requiere cambios en este repositorio salvo que cambie el endpoint del Apps Script.

## QR de WiFi con contraseña que cambia (ej. red de visitantes)

Un QR de WiFi normal (formato `WIFI:T:WPA;S:...;P:...;;`) trae la contraseña incrustada en la imagen, así que cambiarla obliga a reimprimir. Para evitarlo, `wifi.html` reutiliza el mismo mecanismo `k -> valor` de la hoja de cálculo, pero interpretando el valor como datos de WiFi en vez de una URL de redirección (no requiere cambios en el Apps Script).

**Configuración (una sola vez):**

1. En la hoja `Destinos`, agrega una fila con el `k` que quieras (ej. `wifi-visitantes`) y como valor el formato: `WIFI|<T>|<ssid>|<password>|<oculta>`, donde `T` es `WPA`, `WEP` o `nopass`, y `<oculta>` es `true`/`false`. Ejemplo: `WIFI|WPA|RedVisitantes|ClaveDeEstaSemana|false`. (El SSID y la contraseña no pueden contener el carácter `|`.)
2. Genera el QR **impreso, fijo**, con `tools/generar-qr.html`: en "URL base" escribe `https://isra-up.github.io/qr-dinamicos/wifi.html` y en "Código (k)" el mismo `k` de la fila (ej. `wifi-visitantes`). Este QR ya no cambia nunca.

**Cada semana:** solo edita la contraseña en esa misma fila de la hoja de cálculo. El QR impreso sigue funcionando sin reimprimir.

**Qué ve el visitante al escanear:** `wifi.html` consulta el mismo Apps Script, muestra el nombre de la red y la contraseña como texto (con botón de copiar), y genera al vuelo un segundo QR en pantalla, ese sí en formato nativo `WIFI:...`, para que puedan conectarse con un toque en vez de teclear la contraseña. Ese segundo QR se verifica con `jsQR` antes de mostrarse; si algo falla, se oculta y queda solo el texto como respaldo.

## Seguridad

- La cuenta que administra el Apps Script/hoja de cálculo debe tener 2FA activado.
- No se debe guardar en este repositorio ninguna credencial, token o dato personal.
- El redirector valida el protocolo de la URL de destino antes de redirigir (bloquea `javascript:`, `data:`, etc.), pero quien administre el Apps Script sigue siendo responsable de no configurar destinos maliciosos.

## Referencia para fases futuras: análisis de QRServer-API

[`mesacarlos/QRServer-API`](https://github.com/mesacarlos/QRServer-API) ("TusCódigosQR", con frontend hermano en `QRServer-web`) es un backend PHP 8 / Laravel Lumen + MySQL de un proyecto final de carrera que implementa el mismo concepto de QR dinámico, pero como aplicación multiusuario completa con panel de administración. Corresponde a lo que este proyecto llama "Fase 3/4" (backend propio + VPS).

**Está abandonado** (último commit: diciembre 2021, 1 star, sin licencia declarada en el repo) — no se recomienda usarlo como dependencia, solo como referencia de diseño.

Comparación con la arquitectura actual de DynQRs:

| Concepto | DynQRs (este repo) | QRServer-API |
|---|---|---|
| Identificador del QR | `?k=soporte` (query param) | `/q/{id}` (parte de la ruta) |
| Resolución del destino | Google Apps Script + hoja de cálculo | Tabla MySQL `qr_codes` (`id`, `user_id`, `destination_url`) |
| Redirección | JS en el navegador (`fetch` + `location.replace`) | Servidor: redirect HTTP 302 real (`PublicController::qrRedirect`) |
| Administración de destinos | Cuenta Google (2FA) | Sistema de usuarios propio + tokens + verificación de email |
| Analítica | Ninguna | Tabla `qr_clicks` (fecha, IP, país, browser, OS, idioma, tipo de dispositivo), expuesta agregada en `/api/v1/qrcode/{id}/stats` |
| Personalización del QR | `scripts/generate-qr.js` (`qr-code-styling` + `canvas`/`sharp`) | Endpoint que usa `simplesoftwareio/simple-qrcode`: color, color de fondo, estilo de punto, tamaño, logo |

Aprendizajes útiles para este proyecto:

- Usan corrección de errores `H` y fusionan el logo con un ratio ~0.3 del tamaño del QR — coincide con lo que ya usamos en `scripts/generate-qr.js` (`imageSize: 0.22`), confirmando que esos parámetros son razonables.
- Su redirección es un 302 real hecho por el servidor (más rápido, funciona sin JS), a diferencia de nuestro `fetch()` desde el navegador — es la limitación inherente de resolver el destino desde el cliente en vez del servidor.
- Si en el futuro se quisiera analítica básica sin migrar a un backend completo, se podría loguear en la misma hoja de Google Sheets (vía el Apps Script) campos similares a su tabla `qr_clicks`: fecha, IP/país, browser, OS, idioma, dispositivo.
- Su redirect tampoco valida el destino contra ningún allowlist (mismo tipo de riesgo de open redirect que ya mitigamos aquí con la validación de protocolo).

**Recomendación:** no migrar a esto en la fase actual — implicaría saltar a un VPS con PHP/MySQL y mantener un repo huérfano desde 2021. Queda documentado como referencia si más adelante se justifica construir un backend propio.

## Tabla de versiones

| Versión | Fecha | Commit | Cambios |
|---|---|---|---|
| v1.0 | 2022-01-19 | `8d00f98` | Versión inicial: redirección estática vía JavaScript. |
| v1.1 | 2022-01-19 | `fe37ff8` | Se agrega integración con Google Apps Script (`AS_URL_BASE`) y parámetro `k`. |
| v1.2 | 2025-01-18 | `fd30afe` | Actualización del endpoint del Apps Script. |
| v1.3 | 2026-07-16 | `14f4959` | Mejoras de robustez y seguridad: parseo de `k` con `URLSearchParams`, validación de protocolo antes de redirigir, mensaje y botón de reintento cuando falla la redirección automática, `README.md` con documentación y esta tabla de versiones. |
| v1.4 | 2026-07-16 | `9c2201f` | Copia pública del repo (`qr-dinamicos`) publicada con GitHub Pages activado; nuevo Apps Script desplegado con acceso público y `AS_URL_BASE` actualizado para apuntar a él. |
| v1.5 | 2026-07-16 | `043ffd1` | Se agrega `assets/qr-soporte.png`, código QR generado para `https://isra-up.github.io/qr-dinamicos/?k=soporte`. |
| v1.6 | 2026-07-16 | `acef41f` | Se agrega versión con diseño del QR (`qr-soporte-styled.png`/`.svg`): color azul institucional aproximado, puntos redondeados y logo institucional al centro; verificado que sigue siendo decodificable. |
| v1.7 | 2026-07-16 | `033095c` | Se confirma por el usuario que el QR con diseño escanea correctamente desde celular; se actualiza el registro de pruebas. |
| v1.8 | 2026-07-16 | `2e873d5` | Se agrega sección de referencia con el análisis de `mesacarlos/QRServer-API`, comparándolo contra la arquitectura actual y documentando aprendizajes para posibles fases futuras. |
| v1.9 | 2026-07-16 | `69e9967` | Se agrega `tools/generar-qr.html`: generador de QR con diseño 100% en el navegador (sin Node), usando `qr-code-styling` y `jsQR` vendorizados; verificado con Playwright/Chromium real. |
| v1.10 | 2026-07-16 | `c25ebc5` | Corrección de una carrera en `tools/generar-qr.html`: el timeout fijo de 300ms fallaba en producción (red real) porque la carga del logo tardaba más; se cambia a esperar la promesa real de dibujo. Verificado en `https://isra-up.github.io/qr-dinamicos/tools/generar-qr.html`. |
| v1.11 | 2026-07-17 | `df4fb51` | Corrección de un cuelgue en `tools/generar-qr.html`: si el logo elegido por el usuario no es una imagen válida (archivo dañado o formato no soportado), la librería vendorizada nunca resolvía la promesa de dibujo (no maneja `onerror`) y la UI se quedaba en "Generando…" para siempre. Se agrega una validación previa con `Image().onload/onerror` que detecta el fallo y muestra un mensaje claro. Verificado en producción con Playwright, reproduciendo el cuelgue original y confirmando el fix. |
| v1.12 | 2026-07-17 | `dd9d155` | Se confirma por el usuario que, tras cambiar el destino de `soporte` en la hoja de cálculo, el mismo QR ya impreso redirige correctamente al nuevo destino sin necesidad de regenerar la imagen; se actualiza el registro de pruebas (era la única prueba pendiente). |
| v1.13 | 2026-07-17 | `a86c701` | Se agrega `wifi.html`: QR fijo para WiFi de visitantes cuya contraseña cambia semanalmente sin reimprimir, reutilizando el mismo mecanismo `k -> valor` de la hoja de cálculo (sin cambios en el Apps Script). Muestra la red/contraseña como texto y genera al vuelo un segundo QR en formato nativo `WIFI:...`, verificado con `jsQR`. Se corrige además un bug en `tools/generar-qr.html`: la "URL base" siempre forzaba una barra final, rompiendo URLs que terminan en un archivo (como `wifi.html`). |

## Registro de pruebas

| Prueba | Resultado |
|---|---|
| Apps Script accesible sin sesión de Google | OK — responde `HTTP 200` tras redirect 302 propio de Apps Script |
| `k=soporte` devuelve URL de destino válida | OK — devuelve una URL `https://drive.google.com/...` |
| `k` inexistente o ausente devuelve vacío | OK — el redirector muestra el mensaje de fallback en vez de redirigir |
| GitHub Pages sirve `index.html` en el repo público | OK — `https://isra-up.github.io/qr-dinamicos/` responde `HTTP 200` |
| Prueba end-to-end en navegador con `?k=soporte` | OK |
| Escaneo desde celular (cámara) | OK — confirmado por el usuario |
| Verificación por software de que el QR con diseño sigue siendo decodificable | OK — decodifica exactamente a la URL esperada |
| Escaneo del QR con diseño desde celular | OK — confirmado por el usuario |
| Cambiar destino en la hoja de cálculo y re-escanear el mismo QR | OK — confirmado por el usuario: el mismo QR redirige al nuevo destino sin regenerar la imagen |
| `tools/generar-qr.html`: genera y verifica un QR nuevo en Chromium real (Playwright) | OK — decodifica exactamente a la URL esperada, para `k=soporte` y `k=fixpc` |
| `tools/generar-qr.html`: validación al dejar `k` vacío | OK — muestra "Ingresa un código (k)." sin intentar generar |
| `tools/generar-qr.html` en producción real (`isra-up.github.io/qr-dinamicos`), con Playwright | OK — falló con timeout fijo (300ms), se corrigió y se re-verificó OK |
| `tools/generar-qr.html`: logo con archivo inválido (no decodifica como imagen) | OK — antes se colgaba en "Generando…" indefinidamente; se corrigió y ahora muestra "⚠️ El logo no es una imagen válida…"; verificado en local y en producción |
| `wifi.html`: red WPA con caracteres especiales (`;`, `"`) en SSID/contraseña | OK (con respuesta simulada del Apps Script vía Playwright) — se muestran correctamente como texto y el QR `WIFI:...` generado decodifica exactamente al valor esperado tras escapar los caracteres |
| `wifi.html`: red abierta (`nopass`) | OK (con respuesta simulada) — se muestra "(red abierta, sin contraseña)" y no se incluye campo `P:` en el QR |
| `wifi.html`: `k` sin fila válida en la hoja | OK (con respuesta simulada) — muestra el mensaje de fallback en vez de quedarse cargando |
| `tools/generar-qr.html`: "URL base" que termina en un archivo (ej. `wifi.html`) en vez de un directorio | OK — antes generaba `wifi.html/?k=...` (ruta rota); se corrigió y ahora genera `wifi.html?k=...`; no rompe el caso original con URL base tipo directorio |
| `wifi.html` con datos reales de la hoja de cálculo (fila `WIFI\|...` real) y escaneo desde celular | Pendiente — falta que el usuario dé de alta la fila y pruebe con un teléfono real |
