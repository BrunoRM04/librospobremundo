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

// CARRUSEL
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.book-carousel-section');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.next-button');
        const prevButton = carousel.querySelector('.prev-button');
        const slideWidth = slides[0].getBoundingClientRect().width;

        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

        const moveToSlide = (track, currentSlide, targetSlide) => {
            if (!targetSlide) return; // Exit if there's no target slide
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        nextButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling;
            if (nextSlide) {
                moveToSlide(track, currentSlide, nextSlide);
            }
        });

        prevButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling;
            if (prevSlide) {
                moveToSlide(track, currentSlide, prevSlide);
            }
        });

        let startX;
        let currentX;
        let isDragging = false;

        track.addEventListener('touchstart', e => {
            startX = e.touches[0].pageX;
            isDragging = true;
            track.style.transition = 'none';
        });

        track.addEventListener('touchmove', e => {
            if (!isDragging) return;
            currentX = e.touches[0].pageX;
            const deltaX = currentX - startX;
            track.style.transform = `translateX(calc(-${track.querySelector('.current-slide').style.left} + ${deltaX}px))`;
        });

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

// BUSCADOR
let librosData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('libros.json')
        .then(response => response.json())
        .then(data => {
            librosData = data;
            console.log('Datos cargados:', librosData);
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
});

function buscarLibros() {
    const input = document.getElementById('search-input').value.toLowerCase().trim();
    console.log('Valor de entrada:', input);
    const resultsContainer = document.getElementById('search-results');

    resultsContainer.innerHTML = '';

    if (input === '') {
        console.log('Entrada vacía, no se realiza la búsqueda');
        return;
    }

    const resultados = librosData.filter(libro =>
        libro.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        libro.autor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input) ||
        (libro.isbn && libro.isbn.includes(input)) ||
        (libro.editorial && libro.editorial.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(input))
    );

    console.log('Resultados encontrados:', resultados);

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

function verMas(id) {
    window.location.href = `public/html/libro-detalle.html?id=${id}`;
}

// Inicializa el menú desplegable y el buscador
document.addEventListener('DOMContentLoaded', () => {
    toggleMenu();
    buscarLibros();
});