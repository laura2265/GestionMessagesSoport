import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from './components/ThemeContext'; 
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css'
ReactDOM.render(
    <Router>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </Router>,
    document.getElementById('root')
);
