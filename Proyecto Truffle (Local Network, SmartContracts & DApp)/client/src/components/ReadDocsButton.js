import React, { useState } from 'react';
import '../styles/RestaurantAdmin.css';

const ProjectDocsButton = () => {
  const [showDocsLinkPopup, setShowDocsLinkPopup] = useState(false);

  const handleClick = async () => {   
      setShowDocsLinkPopup(true); // Mostrar el pop-up de acceso no autorizado
  };
  return (
    <div>
      <div>
        <button onClick={handleClick} className={"rest-button-2"}>
          {"Project Resources"}
        </button>
      </div>      
      {showDocsLinkPopup && (
        <div className='popup'>
          <div className='popup-content'>
            <h2>Project Links</h2>
            <p>
              <a href="https://drive.google.com/drive/folders/19Ji5if7wJIb12_lfBV44kQqVbQsK1Z7L?usp=sharing" target="_blank" rel="noopener noreferrer">
                Project memory
              </a>
            </p>
            <p>
              <a href="https://drive.google.com/drive/folders/14jGwmS6ODH1pAPCNbY5E7FokR0SsKpjk?usp=sharing" target="_blank" rel="noopener noreferrer">
                Video presentation
              </a>
            </p>
            <p>
              <a href="https://github.com/ddrcdev/TF-DDRC-01102023" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
            </p>
            <button onClick={() => setShowDocsLinkPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocsButton;
