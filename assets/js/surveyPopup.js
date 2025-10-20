/**
 * Survey Popup Module
 * Displays a feedback survey popup after users download PDF or HTML files
 */

const setupSurveyPopup = () => {
  const popup = document.getElementById('survey-popup');
  const closeButton = document.getElementById('survey-popup-close');
  const overlay = document.getElementById('survey-popup-overlay');

  if (!popup || !closeButton || !overlay) {
    return;
  }

  // Function to show the popup
  const showPopup = () => {
    popup.classList.add('survey-popup--visible');
    overlay.classList.add('survey-popup-overlay--visible');
    // Set focus to close button for accessibility
    closeButton.focus();
  };

  // Function to hide the popup
  const hidePopup = () => {
    popup.classList.remove('survey-popup--visible');
    overlay.classList.remove('survey-popup-overlay--visible');
  };

  // Close button click handler
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    hidePopup();
  });

  // Close on overlay click
  overlay.addEventListener('click', () => {
    hidePopup();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('survey-popup--visible')) {
      hidePopup();
    }
  });

  // Attach click handlers to download links
  const downloadLinks = document.querySelectorAll('[data-download-trigger]');

  downloadLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow the download to proceed
      // Show popup after a short delay to ensure download starts
      setTimeout(() => {
        showPopup();
      }, 500);
    });
  });
};

export default setupSurveyPopup;
