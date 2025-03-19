import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from './components/ThemeContext'; // Asegúrate de que la ruta sea correcta
import { BrowserRouter as Router } from 'react-router-dom'; // Importa el Router
import './index.css'
ReactDOM.render(
    <Router>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </Router>,
    document.getElementById('root')
);
