import { showSuccessModal } from "/js/modal.js";

const init = () => {
  loadInputValidation();

  const params = new URLSearchParams(window.location.search);

  if (params.has("successMessage")) {
    showSuccessModal({
      message: params.get('successMessage')
    });

  }
};
window.addEventListener("load", init);

const loadInputValidation = () => {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
}



// document.addEventListener('DOMContentLoaded', () => {
//   const bookmarkButtons = document.querySelectorAll('.Course-Bookmark');

//   bookmarkButtons.forEach((bookmarkButton) => {
//     bookmarkButton.addEventListener('click', () => {
//       const courseId = bookmarkButton.dataset.courseId;
      
//       bookmarkButton.classList.toggle('bookmarked');
//       console.log('courseId:', courseId);
//       toggleBookmark(courseId);
//     });
//   });
// });

// document.addEventListener('DOMContentLoaded', () => {
//   const bookmarkButtons = document.querySelectorAll('.Course-Bookmark');

//   bookmarkButtons.forEach((bookmarkButton) => {
//     bookmarkButton.addEventListener('click', async () => {
//       const courseId = bookmarkButton.dataset.courseId;
//       const response = await fetch('/addBookmark', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ courseId: courseId })
//       });
//       if (response.ok) {
//         const bookmarkButton = document.querySelector(`.Course-Bookmark[data-course-id="${courseId}"]`);
//         bookmarkButton.classList.toggle('bookmarked');
//       } else {
//         console.error('Failed to add bookmark');
//       }
//     });
//   });
// });

async function toggleBookmark(courseId) {
  const userId = '<%= typeof uid !== "undefined" ? uid : "" %>'; // get the user ID from the session
  const response = await fetch('/addBookmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userId, courseId: courseId })
  });
  if (response.ok) {
    const bookmarkButton = document.querySelector(`.Course-Bookmark[data-course-id="${courseId}"]`);
    bookmarkButton.classList.toggle('bookmarked');
  } else {
    console.error('Failed to add bookmark');
  }
}