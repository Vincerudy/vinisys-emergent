import React from 'react';

const LecturePage = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="page-title">
              Lecture
            </h5>
            <p className="page-subtitle">
              Centre de lecture et documentation
            </p>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="card">
          <div className="card-body">
            <h4>Module Lecture</h4>
            <p>Cette page sera développée pour la consultation de documents et lectures.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturePage;