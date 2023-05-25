import {showSuccessModal} from "/js/modal.js";

function init() {
  loadInputValidation();

  const params = new URLSearchParams(window.location.search);

  if (params.has("successMessage")) {
    showSuccessModal({
      message: params.get("successMessage")
    });
  }
}

window.addEventListener("load", init);

const loadInputValidation = function () {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation")

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener("submit", function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated")
      }, false);
    });
};