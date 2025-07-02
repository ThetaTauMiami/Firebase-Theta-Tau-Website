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

            if (!isOpen) { // Open FAQ

                detail.setAttribute('open', ''); // Show details

                // Slide-down animation (* 1.5 gives extra space for window resizing on the bottom)
                content.style.maxHeight = (content.scrollHeight * 1.5) + 'px';

                console.log('Opened FAQ item #' + i);

            } else { // Close FAQ

                // Slide-up animation
                content.style.maxHeight = '0';

                // Remove the open attribute after transition ends
                content.addEventListener('transitionend', function handler() {
                    detail.removeAttribute('open'); // Hide details
                    console.log('Closed FAQ item #' + i);
                    content.removeEventListener('transitionend', handler);
                });
            }
        });
    }
}

// Console log for debugging
console.log('FAQ script loaded');