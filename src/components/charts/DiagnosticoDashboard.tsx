import React from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { useDiagnostico } from '../../context/DiagnosticoContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const DiagnosticoDashboard: React.FC = () => {
  const { diagnostico, indicadores, calcularIndicadores, gerarPlanejamento, avancarEtapa } = useDiagnostico();
  
  // Calcular indicadores se ainda não foram calculados
  React.useEffect(() => {
    if (!indicadores) {
      calcularIndicadores();
    }
  }, [indicadores, calcularIndicadores]);

  // Preparar dados para gráficos
  const dadosReceitas = diagnostico.fontesRenda.map(fonte => ({
    name: fonte.descricao,
    value: fonte.valor
  }));

  const totalReceitas = diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0);
  
  // Agrupar despesas por categoria
  const despesasPorCategoria = diagnostico.despesas.reduce((acc, despesa) => {
    const categoria = acc.find(item => item.name === despesa.categoria);
    if (categoria) {
      categoria.value += despesa.valor;
    } else {
      acc.push({
        name: despesa.categoria,
        value: despesa.valor
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalDespesas = diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  
  // Dados para gráfico de fluxo de caixa
  const fluxoCaixa = [
    { name: 'Receitas', valor: totalReceitas },
    { name: 'Despesas', valor: totalDespesas },
    { name: 'Saldo', valor: totalReceitas - totalDespesas }
  ];

  // Dados para gráfico de patrimônio
  const patrimonioData = [
    {
      name: 'Bens',
      value: diagnostico.bensPatrimoniais.reduce((sum, bem) => sum + bem.valor, 0)
    },
    {
      name: 'Investimentos',
      value: diagnostico.investimentos.reduce((sum, inv) => sum + inv.valor, 0)
    },
    {
      name: 'Dívidas',
      value: diagnostico.dividas.reduce((sum, divida) => sum + divida.valorTotal, 0)
    }
  ];

  const patrimonioLiquido = patrimonioData[0].value + patrimonioData[1].value - patrimonioData[2].value;

  // Função para classificar indicadores com cores
  const getClassColor = (classificacao: string) => {
    switch (classificacao) {
      case 'Excelente': return 'bg-green-500';
      case 'Bom': return 'bg-green-300';
      case 'Regular': return 'bg-yellow-400';
      case 'Atenção': return 'bg-orange-500';
      case 'Crítico': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const handleGerarPlanejamento = () => {
    gerarPlanejamento();
    avancarEtapa();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Diagnóstico Financeiro</h1>
      
      {diagnostico.dadosPessoais.nome && (
        <p className="text-xl text-center mb-8">
          Diagnóstico de {diagnostico.dadosPessoais.nome}, {diagnostico.dadosPessoais.idade} anos
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Resumo Financeiro */}
        <div className="card">
          <h2 className="section-title">Resumo Financeiro</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Receitas Mensais</p>
              <p className="text-xl font-semibold">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Despesas Mensais</p>
              <p className="text-xl font-semibold">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Mensal</p>
              <p className={`text-xl font-semibold ${(totalReceitas - totalDespesas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patrimônio Líquido</p>
              <p className={`text-xl font-semibold ${patrimonioLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {patrimonioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          {/* Gráfico de Fluxo de Caixa */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fluxoCaixa}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="valor" name="Valor (R$)">
                  {fluxoCaixa.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#00C49F' : index === 1 ? '#FF8042' : entry.valor >= 0 ? '#00C49F' : '#FF8042'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Indicadores Financeiros */}
        <div className="card">
          <h2 className="section-title">Indicadores Financeiros</h2>
          
          {indicadores ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Índice de Endividamento</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getClassColor(indicadores.classificacaoEndividamento)}`}>
                    {indicadores.classificacaoEndividamento}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getClassColor(indicadores.classificacaoEndividamento)}`} 
                    style={{ width: `${Math.min(indicadores.indiceEndividamento * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {indicadores.indiceEndividamento.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 })} da renda anual
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Índice de Liquidez</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getClassColor(indicadores.classificacaoLiquidez)}`}>
                    {indicadores.classificacaoLiquidez}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getClassColor(indicadores.classificacaoLiquidez)}`} 
                    style={{ width: `${Math.min(indicadores.indiceLiquidez * 50, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {indicadores.indiceLiquidez.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x as despesas mensais
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Taxa de Poupança</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getClassColor(indicadores.classificacaoPoupanca)}`}>
                    {indicadores.classificacaoPoupanca}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getClassColor(indicadores.classificacaoPoupanca)}`} 
                    style={{ width: `${Math.min(indicadores.taxaPoupanca * 100 * 3, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {indicadores.taxaPoupanca.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 })} da renda mensal
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Cobertura de Seguros</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getClassColor(indicadores.classificacaoSeguros)}`}>
                    {indicadores.classificacaoSeguros}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getClassColor(indicadores.classificacaoSeguros)}`} 
                    style={{ width: `${Math.min(indicadores.coberturaSeguros * 50, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {indicadores.coberturaSeguros.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x o patrimônio
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Composição de Receitas */}
        <div className="card">
          <h2 className="section-title">Composição de Receitas</h2>
          
          {dadosReceitas.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosReceitas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosReceitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Nenhuma receita cadastrada</p>
            </div>
          )}
        </div>
        
        {/* Composição de Despesas */}
        <div className="card">
          <h2 className="section-title">Composição de Despesas</h2>
          
          {despesasPorCategoria.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Nenhuma despesa cadastrada</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Composição Patrimonial */}
        <div className="card">
          <h2 className="section-title">Composição Patrimonial</h2>
          
          {patrimonioData.some(item => item.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patrimonioData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="value" name="Valor (R$)">
                    {patrimonioData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 2 ? '#FF8042' : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Nenhum patrimônio cadastrado</p>
            </div>
          )}
        </div>
        
        {/* Alertas e Recomendações */}
        <div className="card">
          <h2 className="section-title">Alertas e Pontos de Atenção</h2>
          
          <div className="space-y-4">
            {totalReceitas < totalDespesas && (
              <div className="p-3 bg-red-100 border-l-4 border-red-500 rounded-md">
                <h3 className="text-red-700 font-medium">Despesas maiores que receitas</h3>
                <p className="text-sm text-red-600">
                  Suas despesas mensais excedem suas receitas em R$ {Math.abs(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
                  Isso pode levar ao endividamento e comprometer sua saúde financeira.
                </p>
              </div>
            )}
            
            {indicadores && indicadores.indiceEndividamento > 0.5 && (
              <div className="p-3 bg-orange-100 border-l-4 border-orange-500 rounded-md">
                <h3 className="text-orange-700 font-medium">Endividamento elevado</h3>
                <p className="text-sm text-orange-600">
                  Seu índice de endividamento está em {indicadores.indiceEndividamento.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 })} da renda anual,
                  o que é considerado {indicadores.classificacaoEndividamento.toLowerCase()}. Recomenda-se priorizar a quitação de dívidas.
                </p>
              </div>
            )}
            
            {indicadores && indicadores.indiceLiquidez < 0.5 && (
              <div className="p-3 bg-orange-100 border-l-4 border-orange-500 rounded-md">
                <h3 className="text-orange-700 font-medium">Reserva de emergência insuficiente</h3>
                <p className="text-sm text-orange-600">
                  Sua reserva de emergência cobre apenas {indicadores.indiceLiquidez.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} meses de despesas,
                  o ideal é ter pelo menos 6 meses. Priorize a constituição de uma reserva adequada.
                </p>
              </div>
            )}
            
            {indicadores && indicadores.taxaPoupanca < 0.1 && (
              <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
                <h3 className="text-yellow-700 font-medium">Taxa de poupança baixa</h3>
                <p className="text-sm text-yellow-600">
                  Você está poupando apenas {indicadores.taxaPoupanca.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 })} da sua renda mensal,
                  o que pode comprometer seus objetivos de longo prazo. Recomenda-se poupar pelo menos 20%.
                </p>
              </div>
            )}
            
            {indicadores && indicadores.coberturaSeguros < 0.5 && diagnostico.bensPatrimoniais.length > 0 && (
              <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
                <h3 className="text-yellow-700 font-medium">Proteção insuficiente</h3>
                <p className="text-sm text-yellow-600">
                  Sua cobertura de seguros representa apenas {indicadores.coberturaSeguros.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x seu patrimônio,
                  o que pode deixá-lo vulnerável em caso de imprevistos. Considere revisar suas proteções.
                </p>
              </div>
            )}
            
            {(!indicadores || Object.values(indicadores).every(val => !val || val === 0)) && (
              <div className="p-3 bg-blue-100 border-l-4 border-blue-500 rounded-md">
                <h3 className="text-blue-700 font-medium">Dados insuficientes</h3>
                <p className="text-sm text-blue-600">
                  Não há dados suficientes para uma análise completa. Preencha mais informações para obter um diagnóstico mais preciso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button 
          onClick={handleGerarPlanejamento}
          className="btn-primary text-lg py-3 px-8"
        >
          Gerar Planejamento Financeiro
        </button>
      </div>
    </div>
  );
};

export default DiagnosticoDashboard;
