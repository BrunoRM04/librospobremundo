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

let librosData = [];

// Función para cargar los libros en el catálogo
document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json')
        .then(response => response.json())
        .then(data => {
            librosData = data;
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
                        <div class="catalogo-buttons">
                            <button class="catalogo-vermas-button" onclick="verMas(${libro.id})">Ver más</button>
                            <button class="catalogo-cart-button" onclick="addToCart(${libro.id})"><i class="fas fa-shopping-cart"></i> Añadir</button>
                        </div>
                    </div>
                    ${bookStatus}
                `;
                catalogoGrid.appendChild(bookCard);
            });
            // Actualizar el carrito al cargar la página
            updateCartCount();
            displayCart();
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
});

// Función para ver más detalles del libro
function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`;
}

// Función para añadir un libro al carrito
function addToCart(bookId) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (!cart.includes(bookId)) {
        cart.push(bookId);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCart();
    }
}

// Función para eliminar un libro del carrito
function removeFromCart(bookId) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== bookId);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.length;
}

// Función para mostrar los libros en el carrito
function displayCart() {
    const cartContainer = document.getElementById('cart-container');
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';
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
                    <p>${book.precio}</p>
                    <button onclick="removeFromCart(${book.id})">Eliminar</button>
                </div>
            `;
            cartList.appendChild(bookElement);
        }
    });
    cartContainer.style.display = cart.length > 0 ? 'block' : 'none';
}

// Función para enviar el carrito a WhatsApp
function sendCartToWhatsApp() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const selectedBooks = cart.map(bookId => {
        const book = librosData.find(libro => libro.id === bookId);
        return `${book.titulo} de ${book.autor} (Precio: ${book.precio})`;
    }).join(', ');
    const whatsappNumber = '59894090711';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Estoy interesado en los siguientes libros: ${selectedBooks}`;
    window.open(whatsappUrl, '_blank');
}

// Mostrar/ocultar el contenedor del carrito cuando se hace clic en el ícono del carrito
document.getElementById('cart-icon-container').addEventListener('click', () => {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
});