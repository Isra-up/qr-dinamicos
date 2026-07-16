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
