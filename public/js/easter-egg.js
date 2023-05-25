/**
 * Event listener for the window load event.
 * Executes the provided callback function when the page has finished loading.
 * @author Heesun Lee
 */
window.addEventListener("load", () => {

  // Find the close button element with the ID "easter-egg__close__button" and add a click event listener
  $("#easter-egg__close__button").click(() => {
    // Hide the element with the ID "confetti-wrapper"
    $("#confetti-wrapper").hide();
  });

});
