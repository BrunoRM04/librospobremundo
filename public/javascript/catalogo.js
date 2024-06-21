// MENÚ DESPLIEGUE
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

let librosData = [];

// Función para cargar los libros en el catálogo
document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json') // Obtener datos de libros desde un archivo JSON
        .then(response => response.json())
        .then(data => {
            librosData = data; // Guardar datos de libros en una variable global
            const catalogoGrid = document.getElementById('catalogo-grid'); // Elemento donde se mostrarán los libros
            data.forEach(libro => {
                const bookCard = document.createElement('div');
                bookCard.classList.add('catalogo-card'); // Crear tarjeta para cada libro

                const precioOriginal = parseFloat(libro.precio.replace('UYU ', ''));
                const precioDescuento = Math.round(precioOriginal * 0.95); // Calcular precio con descuento

                // Estado del libro (nuevo o usado)
                const bookStatus = libro.estado ? `<div class="book-status ${libro.estado}">${libro.estado.charAt(0).toUpperCase() + libro.estado.slice(1)}</div>` : '';

                // Estructura HTML de cada tarjeta de libro
                bookCard.innerHTML = `
                    <img src="${libro.imagen}" alt="${libro.titulo}">
                    <div class="catalogo-info">
                        <h3 class="catalogo-title">${libro.titulo}</h3>
                        <p class="catalogo-author">${libro.autor}</p>
                        <p class="catalogo-price"><span class="original-price">UYU ${precioOriginal}</span> <span class="discounted-price">UYU ${precioDescuento}</span> (-5%)</p>
                        <div class="catalogo-buttons">
                            <button class="catalogo-vermas-button" onclick="verMas(${libro.id})">Ver más</button>
                            <button class="catalogo-cart-button" onclick="addToCart(${libro.id})"><i class="fas fa-shopping-cart"></i> Añadir</button>
                        </div>
                    </div>
                    ${bookStatus}
                `;
                catalogoGrid.appendChild(bookCard); // Añadir tarjeta al catálogo
            });
            // Actualizar el carrito al cargar la página
            updateCartCount();
            displayCart();
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error)); // Manejo de errores al cargar JSON
});

// Función para ver más detalles del libro
function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`; // Redirigir a la página de detalles del libro
}

// Función para añadir un libro al carrito
function addToCart(bookId) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Obtener carrito de sessionStorage
    if (!cart.includes(bookId)) {
        cart.push(bookId); // Añadir libro al carrito si no está ya en él
        sessionStorage.setItem('cart', JSON.stringify(cart)); // Guardar carrito actualizado en sessionStorage
        updateCartCount(); // Actualizar contador del carrito
        displayCart(); // Mostrar contenido del carrito
    }
}

// Función para eliminar un libro del carrito
function removeFromCart(bookId) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Obtener carrito de sessionStorage
    cart = cart.filter(id => id !== bookId); // Eliminar libro del carrito
    sessionStorage.setItem('cart', JSON.stringify(cart)); // Guardar carrito actualizado en sessionStorage
    updateCartCount(); // Actualizar contador del carrito
    displayCart(); // Mostrar contenido del carrito
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Obtener carrito de sessionStorage
    document.getElementById('cart-count').textContent = cart.length; // Actualizar elemento con el número de ítems en el carrito
}

// Función para mostrar los libros en el carrito
function displayCart() {
    const cartContainer = document.getElementById('cart-container'); // Contenedor del carrito
    const cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Obtener carrito de sessionStorage
    const cartList = document.getElementById('cart-list'); // Lista de libros en el carrito
    cartList.innerHTML = ''; // Limpiar lista actual
    cart.forEach(bookId => {
        const book = librosData.find(libro => libro.id === bookId); // Encontrar libro por ID en datos de libros
        if (book) {
            // Estructura HTML de cada libro en el carrito
            const bookElement = document.createElement('div');
            bookElement.className = 'cart-book';
            bookElement.innerHTML = `
                <img src="${book.imagen}" alt="${book.titulo}">
                <div class="cart-info">
                    <h3>${book.titulo}</h3>
                    <p>${book.autor}</p>
                    <p>${book.precio}</p>
                    <button onclick="removeFromCart(${book.id})">Eliminar</button>
                </div>
            `;
            cartList.appendChild(bookElement); // Añadir libro a la lista del carrito
        }
    });
    cartContainer.style.display = cart.length > 0 ? 'block' : 'none'; // Mostrar u ocultar contenedor del carrito
}

// Función para enviar el carrito a WhatsApp
function sendCartToWhatsApp() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Obtener carrito de sessionStorage
    const selectedBooks = cart.map(bookId => {
        const book = librosData.find(libro => libro.id === bookId); // Encontrar libro por ID en datos de libros
        return `${book.titulo} de ${book.autor} (Precio: ${book.precio})`; // Formatear detalles del libro
    }).join(', ');
    const whatsappNumber = '59894090711'; // Número de WhatsApp para enviar mensaje
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola. Estoy interesado en los siguientes libros: ${selectedBooks}`; // URL de WhatsApp con mensaje preformateado
    window.open(whatsappUrl, '_blank'); // Abrir URL en nueva pestaña
}

// Mostrar/ocultar el contenedor del carrito cuando se hace clic en el ícono del carrito
document.getElementById('cart-icon-container').addEventListener('click', () => {
    const cartContainer = document.getElementById('cart-container'); // Contenedor del carrito
    cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none'; // Alternar visibilidad del contenedor
});