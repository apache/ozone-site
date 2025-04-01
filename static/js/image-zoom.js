/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Image Zoom Functionality for SVG Diagrams
 * 
 * This script adds zoom capabilities to SVG images in the documentation
 * by wrapping each SVG in a container and adding a zoom button.
 */
(function() {
  /** 
   * Initialize zoom functionality for SVG images
   */
  function initImageZoom() {
    // Find all SVG images in markdown content
    document.querySelectorAll('.markdown img[src$=".svg"]').forEach(img => {
      // Skip already initialized images
      if (img.dataset.zoomInitialized === 'true') return;
      img.dataset.zoomInitialized = 'true';
      
      // Create the zoom button
      const zoomBtn = document.createElement('button');
      zoomBtn.className = 'svg-zoom-button';
      zoomBtn.title = 'Click to zoom';
      zoomBtn.setAttribute('aria-label', 'Zoom image');
      zoomBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/><path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/></svg>';
      
      // Create wrapper container
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.maxWidth = '100%';
      
      // Show zoom button on hover
      wrapper.addEventListener('mouseenter', function() {
        zoomBtn.style.opacity = '1';
      });
      
      wrapper.addEventListener('mouseleave', function() {
        zoomBtn.style.opacity = '0';
      });
      
      // Insert wrapper before image
      img.parentNode.insertBefore(wrapper, img);
      
      // Move image inside wrapper and add button
      wrapper.appendChild(img);
      wrapper.appendChild(zoomBtn);
      
      // Setup click handlers for zoom
      function handleZoom() {
        openImageModal(img.src, img.alt || 'Zoomed diagram');
      }
      
      img.addEventListener('click', handleZoom);
      zoomBtn.addEventListener('click', handleZoom);
    });
  }
  
  /**
   * Creates and opens a modal with the zoomed image
   */
  function openImageModal(imgSrc, imgAlt) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image zoom view');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.backdropFilter = 'blur(4px)';
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.style.position = 'relative';
    modalContent.style.backgroundColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1b1b1d' : '#ffffff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '90vw';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'hidden';
    modalContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z"/></svg>';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.backgroundColor = 'var(--ifm-color-primary)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '2';
    closeBtn.setAttribute('aria-label', 'Close');
    
    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.style.overflow = 'auto';
    imgContainer.style.maxHeight = 'calc(90vh - 40px)';
    imgContainer.style.maxWidth = 'calc(90vw - 40px)';
    imgContainer.style.display = 'flex';
    imgContainer.style.alignItems = 'center';
    imgContainer.style.justifyContent = 'center';
    
    // Create zoomed image
    const zoomedImg = document.createElement('img');
    zoomedImg.src = imgSrc;
    zoomedImg.alt = imgAlt;
    zoomedImg.style.display = 'block';
    zoomedImg.style.width = 'auto';
    zoomedImg.style.height = 'auto';
    zoomedImg.style.maxWidth = '100%';
    zoomedImg.style.maxHeight = '100%';
    zoomedImg.style.objectFit = 'contain';
    
    // Assemble modal
    imgContainer.appendChild(zoomedImg);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(imgContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Close modal function
    function closeModal() {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }
    
    // Key press handler
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }
    
    // Add event listeners
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', handleKeyDown);
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    initImageZoom();
    
    // Set up mutation observer for dynamically loaded content
    const observer = new MutationObserver(function(mutations) {
      let shouldInit = false;
      
      // Check if we need to reinitialize
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldInit = true;
        }
      });
      
      if (shouldInit) {
        initImageZoom();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  
  // Reinitialize on page changes
  document.addEventListener('scroll', function() {
    initImageZoom();
  });
  
  // Initialize immediately for StaticRenderer
  setTimeout(initImageZoom, 0);
})();