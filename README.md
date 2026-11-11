# Invitación digital · Colación de Grado II-2026

Réplica progresiva en HTML, CSS y JavaScript de la portada, contraportada y
once páginas interiores. Los mosaicos de las cinco carreras incluyen retratos
y nombres. La presentación incluye la foto grupal.
No incluye confirmación de asistencia.

Orden actual: portada, presentación de la colación, invitación, misión y visión,
agradecimientos, programa, dos páginas de Software Comercial, Contaduría Pública,
Contaduría Pública y Derecho, Sistemas, Educación y contraportada.
Las páginas mantienen el formato apaisado en escritorio; los
interiores se adaptan a lectura vertical con texto ampliado en pantallas pequeñas.

## Abrir

Abrir `index.html` en el navegador; no necesita instalación ni compilación.
También se puede servir la carpeta con `python -m http.server 8080`.
Para compartir por WhatsApp mediante un enlace habrá que alojar la carpeta en
un servicio web estático; todavía no se ha publicado.

Navegación con botones, flechas del teclado y deslizamiento horizontal en móvil.
Los recursos se guardan localmente para no depender de servidores externos al leer.

## Fidelidad y referencias

- Se recrean fondo azul petróleo, títulos dorados, franja lateral y composición.
- La presentación usa `assets/portada-web.webp`, una copia de `assets/portada.jpeg`
  enderezada y colocada detrás de la diagonal azul. En pantallas pequeñas usa
  el recorte `assets/graduacion-movil.webp`.
- Los adornos florales son una aproximación vectorial, no un calco de los originales.
- El birrete y diploma de agradecimientos también se recrearon como una
  ilustración SVG aproximada; no es el recorte exacto de la fotografía.
- `assets/image1.jpeg` y `assets/image2.jpeg` son las fotos impresas de Software
  Comercial. El retrato de Fernando Mauricio se recortó de `assets/mau.jpeg`.
- `assets/logo-universidad-original.png` procede del sitio oficial:
  https://www.usalesiana.edu.bo/static/assets/images/logousb_blue.png
- `assets/escudo-dorado.png` es una adaptación del escudo oficial. No reproduce
  exactamente el relieve dorado de la fotografía. Para mayor fidelidad se podrá
  reemplazar con un recorte frontal, nítido y sin reflejos del escudo de la tarjeta.
- La portada usa la tipografía Great Vibes, guardada localmente con su licencia
  en `assets/OFL-Great-Vibes.txt`.

## Continuar

### Mosaicos

- Software Comercial: 29 retratos en dos páginas (5+5+5 y 5+5+4).
- Contaduría Pública: 18 retratos de `assets/image3.jpeg` y `assets/image4.jpeg`.
- Derecho: 5 retratos debajo del título de la carrera en `assets/image4.jpeg`.
- Sistemas: 8 retratos (4+4) de `assets/image6.jpeg`.
- Educación: 3 retratos de `assets/image5.jpeg` y firma institucional aproximada en texto.
- Los recortes están en `assets/retratos/` y se cargan desde una copia incrustada
  en `mosaicos.js`, junto con los nombres transcritos de las fotos.

