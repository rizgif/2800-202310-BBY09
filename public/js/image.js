import { onAuthChanged } from "/js/app/firebase.js";

// Get a reference to the Firebase storage
var storageRef = storage.ref();

/**
 * Uploads an image to Firebase storage and returns the response.
 * @author Heesun Lee
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} A promise that resolves to the download URL of the uploaded image.
 */
const uploadImage = (file) => {
  // Generate a unique file name based on the current date and the original file name
  const fileName = String(new Date().toLocaleString('en') + "[" + file.name + "]").replaceAll(" ", "");

  return new Promise((resolve, reject) => {
    // Listen for changes in user authentication status
    onAuthChanged((user) => {
      // Construct the file address in the storage
      const fileAddress = `${user.uid}/images/${fileName}`;

      // Upload the file to the storage
      storage.ref()
        .child(fileAddress)
        .put(file)
        .then((snapshot) => {
          // Get the download URL of the uploaded image
          storageRef
            .child(fileAddress)
            .getDownloadURL()
            .then((url) => {
              // Resolve the promise with the download URL
              resolve(url);
            })
            .catch((error) => {
              // Reject the promise with the error
              reject(error);
            });
        })
        .catch((error) => {
          // Reject the promise with the error
          reject(error);
        });
    });
  });
};

// Export the uploadImage function
export {
  uploadImage,
};
