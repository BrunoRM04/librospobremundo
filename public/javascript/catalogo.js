// MENÚ DESPLIEGUE
function toggleMenu() {
    var menu = document.getElementById("nav-menu");
    var body = document.body;
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        menu.classList.add('close');
        body.classList.remove('menu-open');
    } else {
        menu.classList.remove('close');
        menu.classList.add('open');
        body.classList.add('menu-open');
    }
}
// MENÚ DESPLIEGUE

// CATALOGO MANEJO
document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json')
        .then(response => response.json())
        .then(data => {
            const catalogoGrid = document.getElementById('catalogo-grid');
            data.forEach(libro => {
                const bookCard = document.createElement('div');
                bookCard.classList.add('catalogo-card');
                
                const precioOriginal = parseFloat(libro.precio.replace('UYU ', ''));
                const precioDescuento = Math.round(precioOriginal * 0.95);

                const bookStatus = libro.estado ? `<div class="book-status ${libro.estado}">${libro.estado.charAt(0).toUpperCase() + libro.estado.slice(1)}</div>` : '';

                bookCard.innerHTML = `
                    <img src="${libro.imagen}" alt="${libro.titulo}">
                    <div class="catalogo-info">
                        <h3 class="catalogo-title">${libro.titulo}</h3>
                        <p class="catalogo-author">${libro.autor}</p>
                        <p class="catalogo-price"><span class="original-price">UYU ${precioOriginal}</span> <span class="discounted-price">UYU ${precioDescuento}</span> (-5%)</p>
                        <button class="catalogo-button" onclick="verMas(${libro.id})">Ver más</button>
                    </div>
                    ${bookStatus}
                `;
                catalogoGrid.appendChild(bookCard);
            });
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
});

function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`;
}
// CATALOGO MANEJO