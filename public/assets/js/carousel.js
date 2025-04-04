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
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        
        // Show the current slide
        slides[index].style.display = 'block';
        
        // Update current slide index
        currentSlide = index;
    }
    
    function startSlideshow() {
        // Clear any existing interval first
        clearInterval(slideInterval);
        
        // Set new interval - changes slide every 5 seconds
        slideInterval = setInterval(function() {
            window.nextSlide();
        }, 5000);
    }
    
    function resetTimer() {
        clearInterval(slideInterval);
        startSlideshow();
    }
}

// Console log for debugging
console.log('Carousel script loaded');