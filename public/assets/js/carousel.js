let currentIndex = 0;

function showSlide(index) {
    const carousel = document.querySelector(".carousel");
    const totalSlides = document.querySelectorAll(".carousel img").length;

    if (index >= totalSlides) currentIndex = 0;
    if (index < 0) currentIndex = totalSlides - 1;

    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
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
setInterval(nextSlide, 3000);