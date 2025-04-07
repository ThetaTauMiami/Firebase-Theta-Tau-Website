// Global variables
let currentSlide = 0;
let slideInterval;

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initCarousel();
});

function initCarousel() {
    const slides = document.querySelectorAll('.carousel img');
    const totalSlides = slides.length;

    if (!slides.length) {
        console.error('Carousel elements not found');
        return;
    }

    console.log(`Found carousel with ${totalSlides} slides`);
    
    // Apply the first slide as active
    slides[currentSlide].classList.add('active');

    // Start the automatic slideshow
    startSlideshow();

    // Set up button click handlers
    window.prevSlide = function() {
        changeSlide(currentSlide - 1);
        resetTimer();
    };

    window.nextSlide = function() {
        changeSlide(currentSlide + 1);
        resetTimer();
    };

    function changeSlide(index) {
        slides[currentSlide].classList.remove('active'); // Remove active class
        currentSlide = (index + totalSlides) % totalSlides; // Ensure circular looping
        slides[currentSlide].classList.add('active'); // Add active class
    }

    function startSlideshow() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            window.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    function resetTimer() {
        clearInterval(slideInterval);
        startSlideshow();
    }
}

// Console log for debugging
console.log('Carousel script loaded');
