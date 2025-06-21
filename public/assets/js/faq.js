// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');
    initFAQ();
});

// Main function to initialize FAQ behavior
function initFAQ() {
    // Get all FAQ items
    const faqItems = document.querySelectorAll('details');

    // Log the number of faqItems for debugging
    if (!faqItems.length) {
        console.error('No FAQ items found');
        return;
    }
    console.log('Found ' + faqItems.length + ' FAQ items');

    // Loop through all <details> elements
    for (let i = 0; i < faqItems.length; i++) {
        const detail = faqItems[i];
        const summary = detail.querySelector('summary');
        const content = detail.querySelector('.faq-content');

        // Triggered when a FAQ box is clicked
        summary.addEventListener('click', function (event) {
            event.preventDefault(); // Stop default open/close (animation needs to come first)

            const isOpen = detail.hasAttribute('open'); // Check if FAQ box is open or closed

            if (!isOpen) { // Closed -> Open the FAQ box

                detail.setAttribute('open', ''); // Open the details content

                // requestAnimationFrame ensures that the animation is triggered correctly
                requestAnimationFrame(function () {
                    // Start the slide-down animation
                    content.classList.add('open');
                });

                console.log('Opened FAQ item #' + i);

            } else { // Open -> Close the FAQ box

                // Start the slide-up animation
                content.classList.remove('open');

                // Wait for the animation to finish, then close
                content.addEventListener('transitionend', function removeOpenAttribute() {
                    detail.removeAttribute('open'); // Hide the details content
                    console.log('Closed FAQ item #' + i);
                    content.removeEventListener('transitionend', removeOpenAttribute);
                });

            }
        });
    }
}

// Console log for debugging
console.log('FAQ script loaded');