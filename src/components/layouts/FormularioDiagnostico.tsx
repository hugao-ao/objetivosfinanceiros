import React from 'react';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import DadosPessoaisForm from '../forms/DadosPessoaisForm';
import FontesRendaForm from '../forms/FontesRendaForm';
import DespesasForm from '../forms/DespesasForm';
import DividasForm from '../forms/DividasForm';
import PatrimonioForm from '../forms/PatrimonioForm';
import InvestimentosForm from '../forms/InvestimentosForm';
import ProtecaoForm from '../forms/ProtecaoForm';
import AposentadoriaForm from '../forms/AposentadoriaForm';
import ObjetivosForm from '../forms/ObjetivosForm';
import DiagnosticoDashboard from '../charts/DiagnosticoDashboard';
import PlanejamentoDashboard from '../charts/PlanejamentoDashboard';
import DownloadMateriais from '../forms/DownloadMateriais';

const FormularioDiagnostico: React.FC = () => {
  const { etapaAtual } = useDiagnostico();

  // Renderizar o componente correspondente à etapa atual
  const renderEtapa = () => {
    switch (etapaAtual) {
      case 0:
        return <DadosPessoaisForm />;
      case 1:
        return <FontesRendaForm />;
      case 2:
        return <DespesasForm />;
      case 3:
        return <DividasForm />;
      case 4:
        return <PatrimonioForm />;
      case 5:
        return <InvestimentosForm />;
      case 6:
        return <ProtecaoForm />;
      case 7:
        return <AposentadoriaForm />;
      case 8:
        return <ObjetivosForm />;
      case 9:
        return <DiagnosticoDashboard />;
      case 10:
        return <PlanejamentoDashboard />;
      case 11:
        return <DownloadMateriais />;
      default:
        return <DadosPessoaisForm />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-2">Sistema de Diagnóstico e Planejamento Financeiro</h1>
        <p className="text-gray-600">
          Baseado na metodologia da PLANEJAR (Associação Brasileira de Planejamento Financeiro)
        </p>
      </header>

      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary-600 h-2.5 rounded-full" 
            style={{ width: `${(etapaAtual / 11) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Diagnóstico</span>
          <span>Análise</span>
          <span>Planejamento</span>
          <span>Materiais</span>
        </div>
      </div>

      {renderEtapa()}
    </div>
  );
};

export default FormularioDiagnostico;
