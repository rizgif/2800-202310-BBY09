// window.onload = async function() {
//   await updateBookmarks();
// }

async function updateBookmarks() {
  // Get all bookmark buttons
  const bookmarkButtons = document.querySelectorAll('.Course-Bookmark');

  // Get user bookmarks from the server
  const response = await fetch('/getUserBookmarks');
  const userBookmarks = await response.json();

  // Update each bookmark button
  bookmarkButtons.forEach((bookmarkButton) => {
    const courseId = bookmarkButton.getAttribute('data-course-id');
    if (userBookmarks && userBookmarks.includes(courseId)) {
      bookmarkButton.classList.add('bookmarked');
    } else {
      bookmarkButton.classList.remove('bookmarked');
    }
  });

  // Check if each course in the search result is bookmarked
  const searchResult = document.querySelectorAll('.search-result');
  searchResult.forEach((course) => {
    const courseId = course.getAttribute('data-course-id');
    const bookmarkButton = course.querySelector('.Course-Bookmark');
    if (userBookmarks && userBookmarks.includes(courseId)) {
      bookmarkButton.classList.add('bookmarked');
    } else {
      bookmarkButton.classList.remove('bookmarked');
    }
  });
}


// async function updateBookmarks() {
//     // Get all bookmark buttons
//     const bookmarkButtons = document.querySelectorAll('.Course-Bookmark');
    
//     // Get user bookmarks from the server
//     const response = await fetch('/getUserBookmarks');
//     const userBookmarks = await response.json();
    
//     // Update each bookmark button
//     bookmarkButtons.forEach((bookmarkButton) => {
//       const courseId = bookmarkButton.getAttribute('data-course-id');
//       if (userBookmarks && userBookmarks.includes(courseId)) {
//         bookmarkButton.classList.add('bookmarked');
//       } else {
//         bookmarkButton.classList.remove('bookmarked');
//       }
//     });
//   }

  async function getUserBookmarks(userId) {
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    return user && user.bookmarks && user.bookmarks.length > 0 ? user.bookmarks.map(b => b.courseId.toString()) : [];
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

  