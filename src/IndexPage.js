// src/IndexPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './IndexPage.css';

const IndexPage = () => {
  return (
    <div className="index-page">
      <div className="top-bar">
        <img src="images/sseq-logo2.png" alt="Logo" className="logo" />
        <Link to="/ayuda" className="help-link">Ayuda</Link>
      </div>
      <div className="overlay">
        <div className="content">
          <h1 className="title">Programa de Gestión Quirúrgica</h1>
          <p className="subtitle">Hospital General de Querétaro</p>
          <Link to="/login" className="button">Ir</Link>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
