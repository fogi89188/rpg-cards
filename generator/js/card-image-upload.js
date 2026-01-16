// ============================================================================
// Card Image Upload Handlers
// ============================================================================

/**
 * Toggle visibility of form fields based on dropdown selections
 */
function toggleFieldVisibility() {
  const frontType = document.getElementById('card-front-type');
  const backType = document.getElementById('card-back-type');
  
  // Show/hide front fields based on selection
  if (frontType) {
    const isRPGCard = frontType.value === 'rpg-card';
    const isImage = frontType.value === 'image';
    
    document.querySelectorAll('.front-rpg-card-fields').forEach(el => {
      el.style.display = isRPGCard ? '' : 'none';
    });
    
    document.querySelectorAll('.front-image-fields').forEach(el => {
      el.style.display = isImage ? '' : 'none';
    });
    
    // When image is selected, ensure header is hidden
    if (isImage) {
      const card = ui_selected_card();
      if (card) {
        card.header_show = 'none';
        const headerField = document.getElementById('header-show');
        if (headerField) {
          headerField.value = 'none';
        }
      }
    }
  }
  
  // Show/hide back fields based on selection
  if (backType) {
    const isRPGBack = backType.value === 'rpg-back';
    const isDoubleSided = backType.value === 'double-sided';
    const isImage = backType.value === 'image';
    
    document.querySelectorAll('.back-rpg-back-fields').forEach(el => {
      el.style.display = isRPGBack ? '' : 'none';
    });
    
    document.querySelectorAll('.back-double-sided-fields').forEach(el => {
      el.style.display = isDoubleSided ? '' : 'none';
    });
    
    document.querySelectorAll('.back-image-fields').forEach(el => {
      el.style.display = isImage ? '' : 'none';
    });
    
    // When image is selected, ensure back header is hidden
    if (isImage) {
      const card = ui_selected_card();
      if (card) {
        card.header_show_back = 'none';
        const headerBackField = document.getElementById('header-show-back');
        if (headerBackField) {
          headerBackField.value = 'none';
        }
      }
    }
  }
}

/**
 * Initialize file upload handlers for card images
 */
function initCardImageUploads() {
  // Front image upload handler
  const frontUpload = document.getElementById('card-front-full-image-upload');
  const frontUrlInput = document.getElementById('card-front-full-image');
  
  if (frontUpload && frontUrlInput) {
    frontUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file, frontUrlInput);
      }
    });
  }
  
  // Back image upload handler
  const backUpload = document.getElementById('card-back-full-image-upload');
  const backUrlInput = document.getElementById('card-back-full-image');
  
  if (backUpload && backUrlInput) {
    backUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file, backUrlInput);
      }
    });
  }
  
  // Add change listeners to dropdowns
  const frontType = document.getElementById('card-front-type');
  const backType = document.getElementById('card-back-type');
  
  if (frontType) {
    frontType.addEventListener('change', toggleFieldVisibility);
  }
  
  if (backType) {
    backType.addEventListener('change', toggleFieldVisibility);
  }
  
  // Initial visibility check
  toggleFieldVisibility();
}

/**
 * Handle image file upload and convert to data URL
 * @param {File} file - The uploaded image file
 * @param {HTMLInputElement} targetInput - The text input to populate with the data URL
 */
function handleImageUpload(file, targetInput) {
  if (!file.type.match('image.*')) {
    alert('Please select a valid image file.');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Set the data URL in the text input
    targetInput.value = e.target.result;
    
    // Trigger change event to update the card
    const event = new Event('change', { bubbles: true });
    targetInput.dispatchEvent(event);
  };
  
  reader.onerror = function() {
    alert('Error reading file. Please try again.');
  };
  
  reader.readAsDataURL(file);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardImageUploads);
} else {
  initCardImageUploads();
}
