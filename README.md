# DynQRs

Sistema de código QR dinámico para soporte, alojado en GitHub Pages.

Publicado en: https://isra-up.github.io/qr-dinamicos/ (copia pública del repositorio, en `github.com/Isra-up/qr-dinamicos`, para que GitHub Pages gratuito funcione).

Código QR de prueba (`?k=soporte`), versión simple: `assets/qr-soporte.png`.

Código QR con diseño (color institucional + logo), misma URL: `assets/qr-soporte-styled.png` (también disponible en SVG para impresión en gran formato: `assets/qr-soporte-styled.svg`).

![QR de soporte con diseño](assets/qr-soporte-styled.png)

**Nota de diseño:** el color usado es un azul aproximado (`#002F6C`), no un Pantone/hex oficial de la marca — si se cuenta con el manual de marca, actualizar `BLUE` en el script de generación. Las esquinas del buscador (los 3 cuadros de las puntas) deben mantenerse en estilo `square`: se probó con esquinas redondeadas/tipo "dot" junto con el logo y varios lectores de QR dejan de decodificar el código — los puntos del cuerpo sí pueden ser `rounded` sin problema. El logo usa nivel de corrección de errores `H` (máximo) para tolerar la oclusión central.

## Funcionamiento

1. El código QR apunta siempre a la misma URL de GitHub Pages, con un parámetro `k` que identifica el destino (por ejemplo `https://isra-up.github.io/qr-dinamicos/?k=soporte`).
2. `index.html` toma ese `k` y consulta un Google Apps Script (`AS_URL_BASE`), que devuelve la URL de destino actual.
3. Si la URL devuelta es válida y usa un protocolo permitido (`http`, `https`, `mailto`, `tel`), el navegador redirige automáticamente.
4. Si no hay `k`, el servicio no responde, o la URL devuelta no es válida, se muestra un mensaje y un botón para reintentar en lugar de fallar en silencio.

El destino real (a dónde apunta cada `k`) se administra en el Google Apps Script / hoja de cálculo asociada, no en este repositorio. Esto permite cambiar el destino sin editar ni redeployar el HTML.

## Cambiar un destino

Editar la fuente de datos del Apps Script (hoja de cálculo) que resuelve `k -> URL`. No requiere cambios en este repositorio salvo que cambie el endpoint del Apps Script.

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
| Cambiar destino en la hoja de cálculo y re-escanear el mismo QR | Pendiente |
