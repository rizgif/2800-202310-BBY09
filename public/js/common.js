import { showSuccessModal } from "/js/modal.js";

/**
 * Initializes the page.
 * @author Heesun Lee
 */
function init() {
  loadInputValidation();

  // Get the URL parameters
  const params = new URLSearchParams(window.location.search);

  // Check if a success message parameter exists
  if (params.has("successMessage")) {
    // Show success modal with the message
    showSuccessModal({
      message: params.get("successMessage"),
    });
  }
}

// Add event listener for page load
window.addEventListener("load", init);

/**
 * Loads input validation for forms.
 */
const loadInputValidation = function () {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over the forms and prevent submission if invalid
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Add "was-validated" class to show validation styles
      form.classList.add("was-validated");
    }, false);
  });
};
