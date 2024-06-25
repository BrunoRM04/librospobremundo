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


// BANNER INDEX HTML
let currentIndex = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slides img').length;
function showNextSlide() {
    currentIndex++;
    if (currentIndex === totalSlides) {
        currentIndex = 0;
    }
    const newTransformValue = `translateX(-${currentIndex * 100}%)`;
    slides.style.transform = newTransformValue;
}
setInterval(showNextSlide, 3000);
// BANNER INDEX HTML


// CARRUSEL
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.book-carousel-section'); // Seleccionar todos los carruseles

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track'); // Pista del carrusel
        const slides = Array.from(track.children); // Diapositivas del carrusel
        const nextButton = carousel.querySelector('.next-button'); // Botón siguiente
        const prevButton = carousel.querySelector('.prev-button'); // Botón anterior
        const slideWidth = slides[0].getBoundingClientRect().width; // Ancho de cada diapositiva

        // Posicionar diapositivas horizontalmente
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';

            // Actualizar precios con descuento
            const priceElement = slide.querySelector('.book-price');
            const originalPrice = parseFloat(priceElement.textContent.replace('UYU ', ''));
            const discountedPrice = Math.round(originalPrice * 0.95);

            priceElement.innerHTML = `<span class="original-price">UYU ${originalPrice}</span> <span class="discounted-price">UYU ${discountedPrice} (-5%)</span>`;
        });

        // Función para mover a una diapositiva específica
        const moveToSlide = (track, currentSlide, targetSlide) => {
            if (!targetSlide) return; // Salir si no hay diapositiva objetivo
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        // Mover a la siguiente diapositiva al hacer clic en el botón siguiente
        nextButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling;
            if (nextSlide) {
                moveToSlide(track, currentSlide, nextSlide);
            }
        });

        // Mover a la diapositiva anterior al hacer clic en el botón anterior
        prevButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling;
            if (prevSlide) {
                moveToSlide(track, currentSlide, prevSlide);
            }
        });

        // Variables para el deslizamiento táctil
        let startX;
        let currentX;
        let isDragging = false;

        // Iniciar el deslizamiento táctil
        track.addEventListener('touchstart', e => {
            startX = e.touches[0].pageX;
            isDragging = true;
            track.style.transition = 'none';
        });

        // Manejar el movimiento táctil
        track.addEventListener('touchmove', e => {
            if (!isDragging) return;
            currentX = e.touches[0].pageX;
            const deltaX = currentX - startX;
            track.style.transform = `translateX(calc(-${track.querySelector('.current-slide').style.left} + ${deltaX}px))`;
        });

        // Finalizar el deslizamiento táctil
        track.addEventListener('touchend', e => {
            isDragging = false;
            track.style.transition = 'transform 0.3s ease';
            const deltaX = currentX - startX;
            const currentSlide = track.querySelector('.current-slide');
            if (deltaX < -50) {
                const nextSlide = currentSlide.nextElementSibling;
                if (nextSlide) {
                    moveToSlide(track, currentSlide, nextSlide);
                }
            } else if (deltaX > 50) {
                const prevSlide = currentSlide.previousElementSibling;
                if (prevSlide) {
                    moveToSlide(track, currentSlide, prevSlide);
                }
            } else {
                track.style.transform = `translateX(-${currentSlide.style.left})`;
            }
        });
    });
});
// FIN CARRUSEL

// BUSCADOR
let librosData = [];

// Cargar datos de libros al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json')
        .then(response => response.json())
        .then(data => {
            librosData = data;
            console.log('Datos cargados:', librosData);
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
});

// Función para buscar libros
function buscarLibros() {
    const input = document.getElementById('search-input').value.toLowerCase().trim();
    console.log('Valor de entrada:', input);
    const resultsContainer = document.getElementById('search-results');

    resultsContainer.innerHTML = '';

    if (input === '') {
        console.log('Entrada vacía, no se realiza la búsqueda');
        return;
    }

    // Filtrar resultados de búsqueda
    const resultados = librosData.filter(libro =>
        libro.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        libro.autor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        (libro.isbn && libro.isbn.includes(input)) ||
        (libro.editorial && libro.editorial.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input))
    );

    console.log('Resultados encontrados:', resultados);

    // Mostrar resultados de búsqueda
    if (resultados.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron resultados.</p>';
    } else {
        resultados.forEach(libro => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            resultCard.innerHTML = `
                <img src="${libro.imagen}" alt="${libro.titulo}">
                <div class="result-info">
                    <h3 class="result-title">${libro.titulo}</h3>
                    <p class="result-author">${libro.autor}</p>
                    <p class="result-price">${libro.precio}</p>
                    <button class="result-button" onclick="verMas(${libro.id})">Ver más</button>
                </div>
            `;
            
            resultsContainer.appendChild(resultCard);
        });
    }
}

// Función para ver más detalles del libro
function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`;
}

// Inicializar el buscador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    buscarLibros();
});
// FIN BUSCADOR

// VENTANA EMERGENTE
document.addEventListener('DOMContentLoaded', (event) => {
    const popup = document.getElementById('popup'); // Ventana emergente
    const closeButton = document.getElementById('close-button'); // Botón de cierre
    if (!sessionStorage.getItem('popupDisplayed')) {
        popup.style.display = 'flex'; // Mostrar ventana emergente si no ha sido mostrada antes
        sessionStorage.setItem('popupDisplayed', 'true'); // Marcar como mostrada
    }
    closeButton.addEventListener('click', () => {
        popup.style.display = 'none'; // Ocultar ventana emergente al hacer clic en el botón de cierre
    });
});
// FIN VENTANA EMERGENTE

// ACTUALIZAR EL CARRITO AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayCart();
});

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
        return `${book.titulo} de ${book.autor}`;
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