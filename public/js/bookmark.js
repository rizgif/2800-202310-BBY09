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
  