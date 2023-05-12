const init = () => {
  loadInputValidation();
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

document.addEventListener('DOMContentLoaded', () => {
  const bookmarkButtons = document.querySelectorAll('.Course-Bookmark');

  bookmarkButtons.forEach((bookmarkButton) => {
    bookmarkButton.addEventListener('click', () => {
      const courseId = bookmarkButton.dataset.courseId;
      toggleBookmark(courseId);
      bookmarkButton.classList.toggle('bookmarked');
    // bookmarkButton.classList.toggle('bookmarked');
    });
  });
});

function toggleBookmark(courseId) {
  // Use your MongoDB driver to connect to your database and update the document
  // with the matching course ID. For example:
  // const db = await MongoClient.connect(uri);
  // const collection = db.collection('courses');
  // const result = await collection.updateOne(
  //   { _id: courseId },
  //   { $set: { bookmarked: true } }
  // );
}