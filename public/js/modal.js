/**
 * Creates a success modal element with the provided message.
 * @author Heesun Lee
 * @param {string} message - The message to display in the success modal.
 */
const createSuccessModal = (message) => {
  // Create a wrapper div element for the success modal
  let box = document.createElement("div");
  box.setAttribute('id', "success-modal-wrapper");

  // Set the HTML content of the wrapper div
  box.innerHTML = `
    <div
      id="success-modal"
      class="modal fade"
      role="dialog"
      aria-labelledby="success-modal"
      aria-hidden="false"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="img">
            <img src="/image/complete.png" />
          </div>
          <p class="msg">${message || 'Complete'}</p>
        </div>
      </div>
    </div>
    `;

  // Append the wrapper div to the document body
  document.body.appendChild(box);
}

/**
 * Displays a success modal with the provided options.
 * @param {Object} options - The options for configuring the success modal.
 * @param {string} options.message - The message to display in the success modal.
 * @param {boolean} options.autoClose - Determines if the modal should automatically close after a delay.
 * @param {function} options.onShow - The function to execute when the modal is shown.
 * @param {function} options.onClose - The function to execute when the modal is closed.
 */
export const showSuccessModal = ({
                                   message = "Complete",
                                   autoClose = true,
                                   onShow = () => {},
                                   onClose = () => {},
                                 } = {}) => {
  // Create the success modal element
  createSuccessModal(message);

  // Toggle the visibility of the success modal
  $('#success-modal').modal('toggle');

  // Execute the onShow event
  $('#success-modal').on('shown.bs.modal', function (e) {
    // Custom onShow function
    onShow?.();
  });

  if (autoClose) {
    // Automatically close the success modal after a delay
    setTimeout(() => {
      $('#success-modal').modal('toggle');
    }, 1200);
  }

  // Execute the onClose event
  $('#success-modal').on('hide.bs.modal', function (e) {
    // Remove the success modal DOM element
    $('#success-modal-wrapper').remove();

    // Custom onClose function
    onClose?.();
  });
}
