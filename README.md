# DynQRs

Sistema de código QR dinámico para soporte, alojado en GitHub Pages.

## Funcionamiento

1. El código QR apunta siempre a la misma URL de GitHub Pages, con un parámetro `k` que identifica el destino (por ejemplo `https://usuario.github.io/DynQRs/?k=soporte`).
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
