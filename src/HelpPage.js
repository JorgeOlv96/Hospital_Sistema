// HelpPage.js
import React from 'react';
import './HelpPage.css'; // Estilo CSS para la página de ayuda

const HelpPage = () => {
  // Función para manejar el clic en el botón de regresar
  const handleGoBack = () => {
    window.history.back(); // Regresar a la página anterior en el historial del navegador
  };

  return (
    <div className="help-page">
      <h1 className="titlehelp">¿Necesitas ayuda?</h1>
      <div className="contact-info">
        <p>Puedes contactarnos por correo electrónico o teléfono:</p>
        <ul>
          <li>
            <i className="fas fa-envelope"></i> <a href="mailto:info@example.com">info@example.com</a>
          </li>
          <li>
            <i className="fas fa-phone-alt"></i> <a href="tel:+123456789">+123456789</a>
          </li>
        </ul>
      </div>
      <p className="note">Nuestro equipo de soporte estará encantado de ayudarte.</p>
      <button className="back-button" onClick={handleGoBack}>Regresar</button> {/* Botón de Regresar */}
    </div>
  );
};

export default HelpPage;
