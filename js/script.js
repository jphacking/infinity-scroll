"use strict"; // Enable strict mode for better error handling

// Ensure that the DOM is fully loaded before executing our code
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const imageContainer = document.getElementById("image-container");
  const loader = document.getElementById("loader");

  // Variables to store fetched photos and manage API call state
  let photosArray = [];
  let isLoading = false; // Flag to avoid multiple simultaneous API calls

  // Unsplash API configuration
  const count = 10;
  const query = "beach";
  // Ensure the API_KEY is defined in config.js
  if (typeof API_KEY === "undefined") {
    console.error("API_KEY is not defined. Please define it in config.js.");
  }
  const apiUrl = `https://api.unsplash.com/photos/random/?client_id=${API_KEY}&count=${count}&query=${query}`;

  /**
   * setAttributes - Sets multiple attributes on a DOM element.
   * @param {HTMLElement} element - The DOM element.
   * @param {Object} attributes - Key/value pairs of attributes.
   */
  const setAttributes = (element, attributes) => {
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
  };

  /**
   * displayPhotos - Creates DOM elements for each photo and appends them to the container.
   */
  const displayPhotos = () => {
    photosArray.forEach((photo) => {
      // Create anchor element linking to the photo's Unsplash page
      const item = document.createElement("a");
      setAttributes(item, {
        href: photo.links.html,
        target: "_blank",
      });

      // Create image element for the photo
      const img = document.createElement("img");
      setAttributes(img, {
        src: photo.urls.regular,
        alt: photo.alt_description || "Unsplash Photo",
        title: photo.alt_description || "Unsplash Photo",
      });

      // Append the image to the anchor, then the anchor to the image container
      item.appendChild(img);
      imageContainer.appendChild(item);
    });
  };

  /**
   * getPhotos - Asynchronously fetches photos from the Unsplash API.
   * Provides error handling and manages UI loading states.
   */
  const getPhotos = async () => {
    isLoading = true; // Set loading flag to true
    loader.hidden = false; // Display the loader
    try {
      const response = await fetch(apiUrl);
      // Check if response is ok; if not, throw an error
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      photosArray = await response.json();
      displayPhotos();
    } catch (error) {
      console.error("Error fetching photos:", error);
      // Create and display a user-friendly error message on the page
      const errorMessage = document.createElement("p");
      errorMessage.textContent =
        "Failed to load images. Please try again later.";
      errorMessage.style.textAlign = "center";
      imageContainer.appendChild(errorMessage);
    } finally {
      loader.hidden = true; // Hide the loader
      isLoading = false; // Reset the loading flag
    }
  };

  /**
   * debounce - Limits how often a function can run.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - Time in milliseconds to wait before invoking the function.
   * @returns {Function} - A debounced version of the provided function.
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  /**
   * handleScroll - Checks if the user is near the bottom of the page.
   * If so, it triggers fetching more photos.
   */
  const handleScroll = debounce(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 1000 &&
      !isLoading
    ) {
      console.log("Loading more photos...");
      getPhotos();
    }
  }, 200);

  // Listen for scroll events and invoke the debounced scroll handler
  window.addEventListener("scroll", handleScroll);

  // Initial load of photos when the page is ready
  getPhotos();
});
