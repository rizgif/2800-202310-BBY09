/**
 * Event listener for the window scroll event.
 * Adds or removes the "show" class to the scroll-up button based on the scroll position.
 * @author Yerim Moon
 */
window.addEventListener('scroll', function() {
    // Find the scroll-up button element with the ID "searchList-scrollUp"
    var button = document.getElementById('searchList-scrollUp');

    if (button) {
        // Check the scroll position
        if (window.pageYOffset > 200) {
            // Add the "show" class to the button
            button.classList.add('show');
        } else {
            // Remove the "show" class from the button
            button.classList.remove('show');
        }
    }
});

/**
 * Scrolls the window to the top with a smooth behavior.
 * @author Yerim Moon
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
