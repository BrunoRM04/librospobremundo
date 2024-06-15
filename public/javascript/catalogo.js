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
                bookCard.innerHTML = `
                    <img src="${libro.imagen}" alt="${libro.titulo}">
                    <div class="catalogo-info">
                        <h3 class="catalogo-title">${libro.titulo}</h3>
                        <p class="catalogo-author">${libro.autor}</p>
                        <p class="catalogo-price">${libro.precio}</p>
                        <button class="catalogo-button" onclick="verMas(${libro.id})">Ver más</button>
                    </div>
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