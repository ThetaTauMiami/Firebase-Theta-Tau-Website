let currentIndex = 0;

function showSlide(index) {
    const carousel = document.querySelector(".carousel");
    const slides = document.querySelectorAll(".carousel img");
    const totalSlides = slides.length;

    if (index >= totalSlides) {
        currentIndex = 0;
    } else if (index < 0) {
        currentIndex = totalSlides - 1;
    } else {
        currentIndex = index;
    }

    // Ensure only valid slides are displayed
    if (slides[currentIndex]) {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
}

function nextSlide() {
    currentIndex++;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex--;
    showSlide(currentIndex);
}

// Auto slide every 3 seconds
// setInterval(nextSlide, 3000);