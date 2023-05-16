
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
  
    const bookmarkButton = document.querySelector(`.Course-Bookmark[data-course-id="${courseId}"]`);
    if (bookmarkButton.classList.contains('bookmarked')) {
      // Remove bookmark
      const response = await fetch('/removeBookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseId })
      });
      if (response.ok) {
        bookmarkButton.classList.toggle('bookmarked');
      } else {
        console.error('Failed to remove bookmark');
      }
    } else {
      // Add bookmark
      const response = await fetch('/addBookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseId })
      });
      if (response.ok) {
        bookmarkButton.classList.toggle('bookmarked');
      } else {
        console.error('Failed to add bookmark');
      }
    }
  }