import React from 'react'

const Footer = () => {
    return (
        <footer className="footer">
            <p className="fs-11 text-muted fw-medium text-uppercase mb-0 copyright">
                <span>Copyright ©</span>
                {new Date().getFullYear()}
            </p>
            <div className="d-flex align-items-center gap-4">
                <a href="#" className="fs-11 fw-semibold text-uppercase">Aide</a>
                <a href="#" className="fs-11 fw-semibold text-uppercase">Conditions d'utilisation</a>
                <a href="#" className="fs-11 fw-semibold text-uppercase">Confidentialités</a>
            </div>
        </footer>
    )
}

export default Footer