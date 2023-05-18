window.addEventListener('scroll', function() {
    var button = document.getElementById('searchList-scrollUp');
    if (button) {
        if (window.pageYOffset > 200) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
  