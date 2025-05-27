import React from 'react';
import { DiagnosticoProvider } from './context/DiagnosticoContext';
import FormularioDiagnostico from './components/layouts/FormularioDiagnostico';
import './App.css';

function App() {
  return (
    <DiagnosticoProvider>
      <div className="min-h-screen bg-gray-50">
        <FormularioDiagnostico />
      </div>
    </DiagnosticoProvider>
  );
}

export default App;
