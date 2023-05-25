/**
 * Toggles the bookmark status of a course.
 * @author Yerim Moon
 * @param {Event} e - The event triggered by the bookmark button.
 * @param {string} courseId - The ID of the course.
 */
const toggleBookmark = async (e, courseId) => {
  // Prevent event propagation and default behavior
  e.stopPropagation();
  e.preventDefault();

  // Find the bookmark button element based on the course ID
  const bookmarkButton = document.querySelector(
    `.Course-Bookmark[data-course-id="${courseId}"]`
  );

  // Store the current scroll position
  const scrollPosition = window.pageYOffset;

  if (bookmarkButton.classList.contains("bookmarked")) {
    // Remove bookmark
    const response = await fetch("/removeBookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: courseId }),
    });

    if (response.ok) {
      // Toggle the "bookmarked" class to update the button appearance
      bookmarkButton.classList.toggle("bookmarked");

      // Reload the page to reflect the bookmark removal
      location.reload();
    } else {
      console.error("Failed to remove bookmark");
    }
  } else {
    // Add bookmark
    const response = await fetch("/addBookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: courseId }),
    });

    if (response.ok) {
      // Toggle the "bookmarked" class to update the button appearance
      bookmarkButton.classList.toggle("bookmarked");
    } else {
      console.error("Failed to add bookmark");
    }
  }
};
