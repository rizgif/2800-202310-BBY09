async function toggleBookmark(courseId) {
  
    const bookmarkButton = document.querySelector(`.Course-Bookmark[data-course-id="${courseId}"]`);
    const scrollPosition = window.pageYOffset; // Store the current scroll position

    if (bookmarkButton.classList.contains('bookmarked')) {
      // Remove bookmark
      const response = await fetch('/removeBookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseId })
      });
      if (response.ok) {
        bookmarkButton.classList.toggle('bookmarked');
        // localStorage.setItem('scrollPosition', scrollPosition); // Store the scroll position in local storage
        location.reload(); // Reload the page after remove
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
  
  // window.addEventListener('load', () => {
  //   const scrollPosition = localStorage.getItem('scrollPosition');
  //   if (scrollPosition) {
  //     window.scrollTo(0, parseInt(scrollPosition));
  //     localStorage.removeItem('scrollPosition'); // Clear the stored scroll position
  //   }
  // });