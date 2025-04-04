// Global variables
let currentSlide = 0;
let slideInterval;

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initCarousel();
});

function initCarousel() {
    // Get DOM elements
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel img');
    const totalSlides = slides.length;
    
    // If carousel elements don't exist, exit function
    if (!carousel || slides.length === 0) {
        console.error('Carousel elements not found');
        return;
    }
    
    console.log(`Found carousel with ${totalSlides} slides`);
    
    // Make first slide visible
    showSlide(0);
    
    // Set up button click handlers - keep the inline onclick attributes
    window.prevSlide = function() {
        currentSlide--;
        if (currentSlide < 0) {
            currentSlide = totalSlides - 1;
        }
        showSlide(currentSlide);
        resetTimer();
    };
    
    window.nextSlide = function() {
        currentSlide++;
        if (currentSlide >= totalSlides) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
        resetTimer();
    };
    
    // Start the automatic slideshow
    startSlideshow();
    
    function showSlide(index) {
        const slides = document.querySelectorAll('.carousel img');
    
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active'); // Show the current slide
            } else {
                slide.classList.remove('active'); // Hide the rest
            }
        });
    
        currentSlide = index;
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