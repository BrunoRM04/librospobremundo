/******************************************/
/*               MENÚ DESPLIEGUE          */
/******************************************/

// Función para alternar la visibilidad del menú de navegación
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
// FIN MENÚ DESPLIEGUE


/******************************************/
/*        VARIABLES / CARGAR DATOS        */
/******************************************/

let librosData = [];

// Al cargar el DOM, obtenemos los datos del JSON
document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json') // Obtener datos de libros desde el archivo JSON
        .then(response => response.json())
        .then(data => {
            librosData = data; // Guardamos en la variable global
            shuffleArray(librosData); // Aleatorizar (opcional)

            // Mostramos TODOS los libros inicialmente
            displayBooks(librosData);

            // Configuramos y actualizamos el carrito al cargar la página
            updateCartCount();
            displayCart();

            // Activamos la lógica de filtrado por categorías
            setupCategoryFilters();
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
});


/******************************************/
/*         MOSTRAR LIBROS (CATÁLOGO)      */
/******************************************/

// Función para "pintar" (mostrar) los libros en el grid
function displayBooks(booksArray) {
    const catalogoGrid = document.getElementById('catalogo-grid');
    catalogoGrid.innerHTML = ''; // Limpiamos el contenedor antes de volver a llenarlo

    booksArray.forEach(libro => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('catalogo-card'); // Tarjeta individual

        const precioOriginal = parseFloat(libro.precio.replace('UYU ', ''));
        const precioDescuento = Math.round(precioOriginal * 0.95);

        const bookStatus = libro.estado
            ? `<div class="book-status ${libro.estado}">${libro.estado.charAt(0).toUpperCase() + libro.estado.slice(1)}</div>`
            : '';

        // Aquí envolvemos la imagen en .catalogo-image-wrapper
        bookCard.innerHTML = `
        <div class="catalogo-image-wrapper">
            <img src="${libro.imagen}" alt="${libro.titulo}">
        </div>
        <div class="catalogo-info">
            <h3 class="catalogo-title">${libro.titulo}</h3>
            <p class="catalogo-author">${libro.autor}</p>
            <p class="catalogo-price">
              <span class="original-price">UYU ${precioOriginal}</span> 
              <span class="discounted-price">UYU ${precioDescuento}</span> (-5%)
            </p>
            <div class="catalogo-buttons">
                <button class="catalogo-vermas-button" onclick="verMas(${libro.id})">Ver más</button>
                <button class="catalogo-cart-button" onclick="addToCart(${libro.id})">
                  <i class="fas fa-shopping-cart"></i> Añadir
                </button>
            </div>
        </div>
        ${bookStatus}
      `;

        catalogoGrid.appendChild(bookCard);
    });
}


/******************************************/
/*        FILTROS POR CATEGORÍA           */
/******************************************/

// Función para asociar el clic de cada <li> de categoría con el filtrado
function setupCategoryFilters() {
    // Seleccionamos todos los <li> que representan una categoría
    const categoryItems = document.querySelectorAll('.lista-categorias li');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Obtenemos el texto de la categoría, p.e. "Filosofía", "Novela contemporánea", etc.
            const category = item.textContent.trim();

            // Filtramos los libros según la categoría
            const filteredBooks = librosData.filter(libro => libro.categoria === category);

            // Mostramos SOLO los libros filtrados
            displayBooks(filteredBooks);

            // Opcional: cerramos la barra lateral después de hacer clic
            alternarBarraCategorias();
        });
    });
}


/******************************************/
/*            FUNCIÓN: ALEATORIZAR        */
/******************************************/

// Función para aleatorizar un array (algoritmo Fisher-Yates, opcional)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/******************************************/
/*      VER MÁS DETALLES DE UN LIBRO      */
/******************************************/

// Función para ver más detalles del libro (redirige a la página detalle)
function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`;
}


/******************************************/
/*                CARRITO                 */
/******************************************/

// Añadir un libro al carrito
function addToCart(bookId) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (!cart.includes(bookId)) {
        cart.push(bookId);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCart();
    }
}

// Eliminar un libro del carrito
function removeFromCart(bookId) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== bookId);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.length;
}

// Mostrar el contenido del carrito en pantalla
function displayCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartList = document.getElementById('cart-list');
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    cartList.innerHTML = ''; // Limpiamos la lista actual

    cart.forEach(bookId => {
        const book = librosData.find(libro => libro.id === bookId);
        if (book) {
            const bookElement = document.createElement('div');
            bookElement.className = 'cart-book';
            bookElement.innerHTML = `
        <img src="${book.imagen}" alt="${book.titulo}">
        <div class="cart-info">
          <h3>${book.titulo}</h3>
          <p>${book.autor}</p>
          <button onclick="removeFromCart(${book.id})">Eliminar</button>
        </div>
      `;
            cartList.appendChild(bookElement);
        }
    });

    // Si el carrito está vacío, ocultar el contenedor
    cartContainer.style.display = cart.length > 0 ? 'block' : 'none';
}


// Enviar el carrito a WhatsApp
function sendCartToWhatsApp() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const selectedBooks = cart.map(bookId => {
        const book = librosData.find(libro => libro.id === bookId);
        return `${book.titulo} de ${book.autor}`;
    }).join(', ');

    const whatsappNumber = '59894090711';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola. Estoy interesado en los siguientes libros: ${selectedBooks}`;
    window.open(whatsappUrl, '_blank');
}

// Mostrar/ocultar el contenedor del carrito cuando se hace clic en el ícono
document.getElementById('cart-icon-container').addEventListener('click', () => {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
});


/******************************************/
/*   BARRA LATERAL DE CATEGORÍAS (toggle) */
/******************************************/

// Función para abrir/cerrar la barra lateral de categorías
function alternarBarraCategorias() {
    const barra = document.getElementById('barra-categorias');
    const boton = document.getElementById('boton-categorias');

    if (barra.classList.contains('abierta')) {
        barra.classList.remove('abierta');
        boton.style.display = 'block';
    } else {
        barra.classList.add('abierta');
        boton.style.display = 'none';
    }
}
// FIN DE catalogo.js
