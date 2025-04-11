import React from 'react';

export default function PwaReloadPopup(props) {
  return (
    <div className="pwa-reload-popup">
      <div className="pwa-reload-popup__content">
        <p>New content is available.</p>
        <button
          type="button"
          className="pwa-reload-popup__button"
          onClick={() => props.onReload()}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
