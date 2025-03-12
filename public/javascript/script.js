// Función para el menú
function toggleMenu() {
    const menu = document.getElementById("nav-menu");
    const body = document.body;
    if (menu) {
        if (menu.classList.contains("open")) {
            menu.classList.remove("open");
            menu.classList.add("close");
            body.classList.remove("menu-open");
        } else {
            menu.classList.remove("close");
            menu.classList.add("open");
            body.classList.add("menu-open");
        }
    }
}

// Slider de banner
function initBannerSlider() {
    const slides = document.querySelector(".slides");
    if (!slides) return;
    let currentIndex = 0;
    const totalSlides = document.querySelectorAll(".slides img").length;
    function showNextSlide() {
        if (!slides) return;
        currentIndex++;
        if (currentIndex === totalSlides) {
            currentIndex = 0;
        }
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    setInterval(showNextSlide, 3000);
}

// Carrusel de secciones de libros
function initCarousel() {
    const carousels = document.querySelectorAll(".book-carousel-section");
    if (!carousels) return;
    carousels.forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        if (!track) return;
        const slides = Array.from(track.children);
        if (slides.length === 0) return;
        const nextButton = carousel.querySelector(".next-button");
        const prevButton = carousel.querySelector(".prev-button");
        const slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = `${slideWidth * index}px`;
            const priceElement = slide.querySelector(".book-price");
            if (priceElement) {
                const originalPrice = parseFloat(priceElement.textContent.replace("UYU ", ""));
                // Si el slide tiene el atributo data-discount, se usa ese valor; si no, se aplica 5%
                const discountAttr = slide.getAttribute("data-discount");
                const discountPercentage = discountAttr ? parseInt(discountAttr) : 5;
                const discountFactor = 1 - discountPercentage / 100;
                const discountedPrice = Math.round(originalPrice * discountFactor);
                priceElement.innerHTML = `
                    <span class="original-price">UYU ${originalPrice}</span>
                    <span class="discounted-price"> UYU ${discountedPrice} (-${discountPercentage}%)</span>
                `;
            }
        });
        if (!track.querySelector(".current-slide")) {
            slides[0].classList.add("current-slide");
        }
        const moveToSlide = (track, currentSlide, targetSlide) => {
            if (!targetSlide) return;
            track.style.transform = `translateX(-${targetSlide.style.left})`;
            currentSlide.classList.remove("current-slide");
            targetSlide.classList.add("current-slide");
        };
        nextButton &&
            nextButton.addEventListener("click", () => {
                const currentSlide = track.querySelector(".current-slide");
                let nextSlide = currentSlide.nextElementSibling;
                if (!nextSlide) nextSlide = slides[0];
                moveToSlide(track, currentSlide, nextSlide);
            });
        prevButton &&
            prevButton.addEventListener("click", () => {
                const currentSlide = track.querySelector(".current-slide");
                let prevSlide = currentSlide.previousElementSibling;
                if (!prevSlide) prevSlide = slides[slides.length - 1];
                moveToSlide(track, currentSlide, prevSlide);
            });
        let startX, currentX;
        let isDragging = false;
        track.addEventListener("touchstart", (e) => {
            startX = e.touches[0].pageX;
            isDragging = true;
            track.style.transition = "none";
        });
        track.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].pageX;
            const deltaX = currentX - startX;
            const currentSlide = track.querySelector(".current-slide");
            track.style.transform = `translateX(calc(-${currentSlide.style.left} + ${deltaX}px))`;
        });
        track.addEventListener("touchend", () => {
            isDragging = false;
            track.style.transition = "transform 0.3s ease";
            const deltaX = currentX - startX;
            const currentSlide = track.querySelector(".current-slide");
            if (deltaX < -50) {
                let nextSlide = currentSlide.nextElementSibling;
                if (!nextSlide) nextSlide = slides[0];
                moveToSlide(track, currentSlide, nextSlide);
            } else if (deltaX > 50) {
                let prevSlide = currentSlide.previousElementSibling;
                if (!prevSlide) prevSlide = slides[slides.length - 1];
                moveToSlide(track, currentSlide, prevSlide);
            } else {
                track.style.transform = `translateX(-${currentSlide.style.left})`;
            }
        });
    });
}

// Función que asigna el clic a las imágenes de las tarjetas de libros (tanto en index como en catálogo)
// sin modificar el HTML. Busca imágenes en elementos con clase .book-card o .catalogo-card.
function attachBookImageClick() {
    // Seleccionamos imágenes en ambos contenedores
    const selectors = [".book-card img", ".catalogo-card img"];
    const bookImages = document.querySelectorAll(selectors.join(", "));
    bookImages.forEach((img) => {
        if (!img.dataset.clickAttached) {
            // Buscamos el contenedor más cercano, ya sea .book-card o .catalogo-card
            const bookCard = img.closest(".book-card") || img.closest(".catalogo-card");
            if (bookCard) {
                // Buscamos el botón "Ver más" o "catalogo-vermas-button"
                const moreButton = bookCard.querySelector(".more-button") || bookCard.querySelector(".catalogo-vermas-button");
                if (moreButton) {
                    const onclickAttr = moreButton.getAttribute("onclick");
                    if (onclickAttr) {
                        // Se espera el formato verMas(123)
                        const match = onclickAttr.match(/verMas\((\d+)\)/);
                        if (match) {
                            const bookId = match[1];
                            img.style.cursor = "pointer";
                            img.addEventListener("click", () => {
                                verMas(bookId);
                            });
                            img.dataset.clickAttached = "true";
                        }
                    }
                }
            }
        }
    });
}

// Variable global para los datos de libros
let librosData = [];

// Carga de datos desde el JSON
function loadLibrosData(callback) {
    fetch("../libros.json")
        .then((response) => response.json())
        .then((data) => {
            librosData = data;
            console.log("Datos cargados:", librosData);
            if (callback) callback();
        })
        .catch((error) => console.error("Error al cargar el archivo JSON:", error));
}

// Genera dinámicamente el filtro de autores (por la primera letra)
function populateAuthorFilter() {
    const select = document.getElementById("author-filter");
    const letters = new Set();
    librosData.forEach((book) => {
        if (book.autor && book.autor.length > 0) {
            letters.add(book.autor[0].toUpperCase());
        }
    });
    const lettersArray = Array.from(letters).sort();
    let options = `<option value="">Todos</option>`;
    lettersArray.forEach((letter) => {
        options += `<option value="${letter}">${letter}</option>`;
    });
    select.innerHTML = options;
}

// Aplica los filtros: precio, autor, título y orden por id (como proxy de fecha)
function applyFilters() {
    let filteredBooks = librosData.slice();

    // Filtro de precio
    const maxPrice = parseFloat(document.getElementById("price-range").value);
    filteredBooks = filteredBooks.filter((book) => {
        const price = parseFloat(book.precio.replace("UYU ", ""));
        return price <= maxPrice;
    });

    // Filtro de autor (por la primera letra)
    const authorLetter = document.getElementById("author-filter").value;
    if (authorLetter) {
        filteredBooks = filteredBooks.filter((book) =>
            book.autor && book.autor[0].toUpperCase() === authorLetter.toUpperCase()
        );
    }

    // Filtro por título
    const titleText = document.getElementById("title-filter").value.trim().toLowerCase();
    if (titleText) {
        filteredBooks = filteredBooks.filter((book) =>
            book.titulo.toLowerCase().includes(titleText)
        );
    }

    // Ordenar por id: "newest" muestra primero los libros con mayor id (más nuevos) y "oldest" los de menor id (más viejos)
    const idSort = document.getElementById("date-sort").value;
    if (idSort === "newest") {
        filteredBooks.sort((a, b) => b.id - a.id);
    } else if (idSort === "oldest") {
        filteredBooks.sort((a, b) => a.id - b.id);
    }

    // Muestra los libros filtrados
    displayBooks(filteredBooks);
}

// Función de búsqueda general (en caso de usar input de búsqueda global)
function buscarLibros() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;
    const input = searchInput.value.toLowerCase().trim();
    const resultsContainer = document.getElementById("search-results");
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";
    if (input === "") {
        console.log("Entrada vacía, no se realiza la búsqueda");
        return;
    }
    const resultados = librosData.filter((libro) =>
        libro.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        libro.autor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        (libro.isbn && String(libro.isbn).includes(input)) ||
        (libro.editorial &&
            libro.editorial.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input))
    );
    if (resultados.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    } else {
        resultados.forEach((libro) => {
            const resultCard = document.createElement("div");
            resultCard.className = "result-card";
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

// Muestra los libros en el catálogo
function displayBooks(booksArray) {
    const catalogoGrid = document.getElementById("catalogo-grid");
    if (!catalogoGrid) return;
    catalogoGrid.innerHTML = "";
    booksArray.forEach((libro) => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("catalogo-card");
        const precioOriginal = parseFloat(libro.precio.replace("UYU ", ""));
        // Si el libro es uno de los especiales, aplicar 15% de descuento; de lo contrario, 5%
        const discountPercentage = (libro.id === 1068 || libro.id === 1069) ? 15 : 5;
        const discountFactor = 1 - discountPercentage / 100;
        const precioDescuento = Math.round(precioOriginal * discountFactor);
        const bookStatus = libro.estado
            ? `<div class="book-status ${libro.estado}">${libro.estado.charAt(0).toUpperCase() + libro.estado.slice(1)}</div>`
            : "";
        bookCard.innerHTML = `
            <div class="catalogo-image-wrapper">
                <img src="${libro.imagen}" alt="${libro.titulo}">
            </div>
            <div class="catalogo-info">
                <h3 class="catalogo-title">${libro.titulo}</h3>
                <p class="catalogo-author">${libro.autor}</p>
                <p class="catalogo-price">
                    <span class="original-price">UYU ${precioOriginal}</span>
                    <span class="discounted-price">UYU ${precioDescuento}</span> (-${discountPercentage}%)
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

// Función auxiliar para mezclar un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Funciones para el carrito
function addToCart(bookId) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    let existingItem = cart.find((item) => item.bookId === bookId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ bookId: bookId, quantity: 1 });
    }
    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function incrementQuantity(bookId) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    let item = cart.find((item) => item.bookId === bookId);
    if (item) {
        item.quantity++;
    }
    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function decrementQuantity(bookId) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    let item = cart.find((item) => item.bookId === bookId);
    if (item && item.quantity > 1) {
        item.quantity--;
    }
    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function removeFromCart(bookId) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.bookId !== bookId);
    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function updateCartCount() {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
        let totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountEl.textContent = totalQuantity;
    }
}

function displayCart() {
    const cartContainer = document.getElementById("cart-container");
    const cartList = document.getElementById("cart-list");
    if (!cartList) return;
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    cartList.innerHTML = "";
    let subtotal = 0;
    let discountedSubtotal = 0;
    cart.forEach((item) => {
        const book = librosData.find((libro) => libro.id === item.bookId);
        if (book) {
            const priceNumber = parseFloat(book.precio.replace("UYU", "").trim());
            const itemTotal = priceNumber * item.quantity;
            subtotal += itemTotal;
            // Si el libro es especial, descuento 15%, sino 5%
            const discountPercentage = (book.id === 1068 || book.id === 1069) ? 15 : 5;
            const discountFactor = 1 - discountPercentage / 100;
            const discountedUnitPrice = Math.round(priceNumber * discountFactor);
            discountedSubtotal += discountedUnitPrice * item.quantity;
            const bookElement = document.createElement("div");
            bookElement.className = "cart-book";
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
    const discountTotal = subtotal - discountedSubtotal;
    let totalElement = document.getElementById("cart-total");
    if (!totalElement) {
        totalElement = document.createElement("div");
        totalElement.id = "cart-total";
        cartList.appendChild(totalElement);
    }
    if (cart.length > 0) {
        totalElement.innerHTML = `
            <hr>
            <p><strong>Subtotal:</strong> UYU ${subtotal.toFixed(2)}</p>
            <p><strong>Descuento total:</strong> -UYU ${discountTotal.toFixed(2)}</p>
            <p><strong>Total a pagar:</strong> UYU ${discountedSubtotal.toFixed(2)}</p>
        `;
    } else {
        totalElement.innerHTML = "<p>El carrito está vacío.</p>";
    }
    if (cartContainer) {
        cartContainer.style.display = cart.length > 0 ? "block" : "none";
    }
}

function sendCartToWhatsApp() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const selectedBooks = cart
        .map((item) => {
            const book = librosData.find((libro) => libro.id === item.bookId);
            return `${book.titulo} de ${book.autor}`;
        })
        .join(", ");
    const whatsappNumber = "59894090711";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Estoy interesado en los siguientes libros: " + selectedBooks
    )}`;
    window.open(whatsappUrl, "_blank");
}

// Muestra/oculta el carrito
function initCartToggle() {
    const cartIconContainer = document.getElementById("cart-icon-container");
    if (cartIconContainer) {
        cartIconContainer.addEventListener("click", () => {
            const cartContainer = document.getElementById("cart-container");
            if (cartContainer) {
                cartContainer.style.display =
                    cartContainer.style.display === "none" || cartContainer.style.display === ""
                        ? "block"
                        : "none";
            }
        });
    }
}

function initPopup() {
    const popup = document.getElementById("popup");
    const closeButton = document.getElementById("close-button");
    if (popup && closeButton && !sessionStorage.getItem("popupDisplayed")) {
        popup.style.display = "flex";
        sessionStorage.setItem("popupDisplayed", "true");
        closeButton.addEventListener("click", () => {
            popup.style.display = "none";
        });
    }
}

function isAbsoluteUrl(url) {
    return /^https?:\/\//i.test(url);
}

function getImagePath(url) {
    return isAbsoluteUrl(url) ? url : `../../${url}`;
}

function getRandomBooks(data, count) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function initCarouselDetail() {
    const track = document.getElementById("carousel-track");
    if (!track) return;
    const slides = Array.from(track.children);
    if (slides.length === 0) return;
    const nextButton = document.getElementById("next-button");
    const prevButton = document.getElementById("prev-button");
    const slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach((slide, index) => {
        slide.style.left = `${slideWidth * index}px`;
    });
    let currentSlideIndex = 0;
    nextButton &&
        nextButton.addEventListener("click", () => {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            track.style.transform = `translateX(-${slideWidth * currentSlideIndex}px)`;
        });
    prevButton &&
        prevButton.addEventListener("click", () => {
            currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            track.style.transform = `translateX(-${slideWidth * currentSlideIndex}px)`;
        });
}

document.addEventListener("DOMContentLoaded", () => {
    initBannerSlider();
    initCarousel();
    initPopup();
    initCartToggle();

    if (document.getElementById("catalogo-grid") || document.getElementById("search-input")) {
        loadLibrosData(() => {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.addEventListener("input", buscarLibros);
            }
            if (document.getElementById("catalogo-grid")) {
                populateAuthorFilter();
                shuffleArray(librosData);
                displayBooks(librosData);
            }
            updateCartCount();
            displayCart();

            const priceRange = document.getElementById("price-range");
            if (priceRange) {
                priceRange.addEventListener("input", function () {
                    const maxPrice = parseFloat(this.value);
                    document.getElementById("price-value").textContent = "$0 - $" + maxPrice;
                    applyFilters();
                });
            }
            const authorFilter = document.getElementById("author-filter");
            if (authorFilter) {
                authorFilter.addEventListener("change", applyFilters);
            }
            const titleFilter = document.getElementById("title-filter");
            if (titleFilter) {
                titleFilter.addEventListener("input", applyFilters);
            }
            const dateSort = document.getElementById("date-sort");
            if (dateSort) {
                dateSort.addEventListener("change", applyFilters);
            }
            // Asigna el clic a las imágenes en las tarjetas de libro (incluye catálogo)
            attachBookImageClick();
        });
    }

    // Configuración para la página de detalles
    if (document.getElementById("details-content")) {
        fetch("/libros.json")
            .then((response) => response.json())
            .then((data) => {
                librosData = data;
                const urlParams = new URLSearchParams(window.location.search);
                const bookId = urlParams.get("id");
                const libro = data.find((libro) => libro.id == bookId);
                if (libro) {
                    const detailsContent = document.getElementById("details-content");
                    const imagePath = getImagePath(libro.imagen);
                    const precioOriginal = parseFloat(libro.precio.replace("UYU ", ""));
                    // Si el libro es especial, descuento 15%; de lo contrario, 5%
                    const discountPercentage = (libro.id === 1068 || libro.id === 1069) ? 15 : 5;
                    const discountFactor = 1 - discountPercentage / 100;
                    const precioDescuento = Math.round(precioOriginal * discountFactor);
                    const estado = libro.estado || "Desconocido";
                    const estadoClase = estado.toLowerCase().includes("nuevo") ? "nuevo" : "usado";
                    detailsContent.innerHTML = `
                        <div class="details-left" style="position: relative;">
                            <img src="${imagePath}" alt="${libro.titulo}">
                            ${estado !== "Desconocido" ? `<div class="book-status ${estadoClase}">${estado}</div>` : ""}
                        </div>
                        <div class="details-right">
                            <h1 class="book-title">${libro.titulo}</h1>
                            <p class="book-author">${libro.autor}</p>
                            <p class="book-editorial"><strong>Editorial:</strong> ${libro.editorial}</p>
                            <p class="book-isbn"><strong>ISBN:</strong> ${libro.isbn}</p>
                            <p class="book-price"><strong>Precio:</strong> <span class="original-price">UYU ${precioOriginal}</span> <span class="discounted-price">UYU ${precioDescuento}</span> (-${discountPercentage}%)</p>
                            <p class="book-pages"><strong>Número de páginas:</strong> ${libro.numPaginas}</p>
                            <p class="book-description">${libro.descripcion}</p>
                            <div class="button-container">
                                <button class="buy-button" data-whatsapp="59894090711">Comprar</button>
                                <button class="cart-button-detalle" onclick="addToCart(${libro.id})">
                                    <i class="fas fa-shopping-cart"></i> Añadir
                                </button>
                            </div>
                            <div class="shipping-info">
                                <h3>Envíos a todo el país por DAC.</h3>
                            </div>
                            <div class="payment-info">
                                <img src="../img/pagos/mercadopago rojo.png" alt="Mercado Pago">
                                <img src="../img/pagos/itau rojo.png" alt="Itau">
                                <img src="../img/pagos/prex rojo.png" alt="Prex">
                                <img src="../img/pagos/oca blue rojo.png" alt="Oca Blue">
                            </div>
                        </div>
                    `;
                    document.querySelector(".buy-button").addEventListener("click", (e) => {
                        const whatsappNumber = e.target.getAttribute("data-whatsapp");
                        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola,%20estoy%20interesado%20en%20comprar%20el%20libro%20${libro.titulo}%20de%20${libro.autor}`;
                        window.open(whatsappUrl, "_blank");
                    });
                    const randomBooks = getRandomBooks(
                        data.filter((item) => item.id != bookId),
                        20
                    );
                    const carouselTrack = document.getElementById("carousel-track");
                    if (carouselTrack) {
                        randomBooks.forEach((libro) => {
                            const bookSlide = document.createElement("div");
                            bookSlide.className = "carousel-slide";
                            bookSlide.innerHTML = `
                                <img src="${getImagePath(libro.imagen)}" alt="${libro.titulo}">
                                <div class="book-info">
                                    <h3 class="book-title">${libro.titulo}</h3>
                                    <p class="book-author">${libro.autor}</p>
                                    <p class="book-price">${libro.precio}</p>
                                    <button class="more-button" onclick="verMas(${libro.id})">Ver más</button>
                                </div>
                            `;
                            carouselTrack.appendChild(bookSlide);
                        });
                        initCarouselDetail();
                        // Asigna también el clic a las imágenes en el carrusel de detalles
                        attachBookImageClick();
                    }
                } else {
                    document.getElementById("details-content").innerHTML = "<p>Libro no encontrado.</p>";
                }
            })
            .catch((error) => console.error("Error al cargar el archivo JSON:", error));
    }

    // Por último, asigna el clic a cualquier imagen que ya esté en el DOM
    attachBookImageClick();
});

// Redirige a la página de detalles
function verMas(id) {
    // Si la URL actual ya contiene "public/html", entonces no se antepone la carpeta.
    if (window.location.pathname.indexOf('/public/html/') !== -1) {
        window.location.href = "libro-detalle.html?id=" + id;
    } else {
        window.location.href = "public/html/libro-detalle.html?id=" + id;
    }
}
