import React from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { useDiagnostico } from '../../context/DiagnosticoContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const PlanejamentoDashboard: React.FC = () => {
  const { diagnostico, planejamento, indicadores, avancarEtapa } = useDiagnostico();
  
  if (!planejamento) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Dados para gráfico de alocação recomendada
  const alocacaoData = planejamento.investimentos.alocacaoRecomendada.map(item => ({
    name: item.categoria,
    value: item.percentual
  }));

  // Dados para gráfico de projeção de acumulação
  const projecaoData = planejamento.investimentos.projecaoAcumulacao;

  // Dados para gráfico de plano de quitação de dívidas
  const dividasData = planejamento.organizacaoFinanceira.planoQuitacaoDividas.ordemQuitacao.map((divida, index) => ({
    name: divida.descricao,
    valor: divida.valorTotal,
    juros: divida.taxaJuros,
    ordem: index + 1
  }));

  // Calcular totais para resumo
  const totalReceitas = diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0);
  const totalDespesas = diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const saldoMensal = totalReceitas - totalDespesas;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Planejamento Financeiro</h1>
      
      {diagnostico.dadosPessoais.nome && (
        <p className="text-xl text-center mb-8">
          Planejamento de {diagnostico.dadosPessoais.nome}, {diagnostico.dadosPessoais.idade} anos
        </p>
      )}
      
      {/* Resumo do Planejamento */}
      <div className="card mb-8">
        <h2 className="section-title">Resumo do Planejamento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Perfil de Investidor</h3>
            <p className="text-blue-800 font-medium text-xl capitalize">{planejamento.investimentos.perfilRecomendado}</p>
            <p className="text-sm text-blue-600 mt-2">
              Baseado na sua idade, objetivos e situação financeira atual.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Reserva de Emergência</h3>
            <p className="text-green-800 font-medium text-xl">
              R$ {planejamento.reservaEmergencia.valorIdeal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-600 mt-2">
              {planejamento.reservaEmergencia.planoConstituicao.tempoEstimadoMeses} meses para constituição
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Aposentadoria</h3>
            <p className="text-purple-800 font-medium text-xl">
              {planejamento.aposentadoria.idadeEstimada} anos
            </p>
            <p className="text-sm text-purple-600 mt-2">
              Renda mensal estimada: R$ {planejamento.aposentadoria.valorNecessarioMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      
      {/* Organização Financeira */}
      <div className="card mb-8">
        <h2 className="section-title">Organização Financeira</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="subsection-title">Recomendações</h3>
            <ul className="space-y-2">
              {planejamento.organizacaoFinanceira.recomendacoes.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 mr-2">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            
            <h3 className="subsection-title mt-6">Estratégias para Redução de Despesas</h3>
            <ul className="space-y-2">
              {planejamento.organizacaoFinanceira.estrategiasReducaoDespesas.map((est, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary-100 text-secondary-800 mr-2">
                    {index + 1}
                  </span>
                  <span>{est}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="subsection-title">Plano de Quitação de Dívidas</h3>
            <p className="mb-4">
              Estratégia recomendada: <span className="font-medium capitalize">
                {planejamento.organizacaoFinanceira.planoQuitacaoDividas.estrategia === 'avalanche' 
                  ? 'Avalanche (maiores juros primeiro)' 
                  : 'Bola de Neve (menores valores primeiro)'}
              </span>
            </p>
            
            {dividasData.length > 0 ? (
              <>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dividasData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          name === 'juros' ? 'Taxa de Juros' : 'Valor'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="valor" name="Valor (R$)" fill="#8884d8" />
                      <Bar dataKey="juros" name="Taxa de Juros (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <p className="text-sm text-gray-600">
                  Tempo estimado para quitação: <span className="font-medium">
                    {planejamento.organizacaoFinanceira.planoQuitacaoDividas.tempoEstimadoMeses} meses
                  </span>
                </p>
              </>
            ) : (
              <p className="text-center py-8 text-gray-500">Nenhuma dívida cadastrada</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Investimentos */}
      <div className="card mb-8">
        <h2 className="section-title">Estratégia de Investimentos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="subsection-title">Alocação Recomendada</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alocacaoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {alocacaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="subsection-title">Projeção de Acumulação</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projecaoData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" label={{ value: 'Anos', position: 'insideBottomRight', offset: 0 }} />
                  <YAxis 
                    tickFormatter={(value) => value >= 1000000 
                      ? `${(value / 1000000).toFixed(1)}M` 
                      : `${(value / 1000).toFixed(0)}K`
                    } 
                  />
                  <Tooltip 
                    formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    labelFormatter={(value) => `${value} anos`}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Exemplos de Investimentos Recomendados:</h4>
              {planejamento.investimentos.alocacaoRecomendada.map((categoria, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium">{categoria.categoria} ({categoria.percentual}%)</p>
                  <p className="text-sm text-gray-600">{categoria.exemplos.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Proteção Patrimonial */}
      <div className="card mb-8">
        <h2 className="section-title">Proteção Patrimonial</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Seguro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cobertura Recomendada
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planejamento.protecaoPatrimonial.segurosRecomendados.map((seguro, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{seguro.tipo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {seguro.coberturaRecomendada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {seguro.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${seguro.prioridade === 'alta' ? 'bg-red-100 text-red-800' : 
                        seguro.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {seguro.prioridade === 'alta' ? 'Alta' : 
                        seguro.prioridade === 'media' ? 'Média' : 'Baixa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Aposentadoria */}
      <div className="card mb-8">
        <h2 className="section-title">Planejamento para Aposentadoria</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Idade Estimada</p>
                  <p className="text-xl font-semibold">{planejamento.aposentadoria.idadeEstimada} anos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renda Mensal Necessária</p>
                  <p className="text-xl font-semibold">
                    R$ {planejamento.aposentadoria.valorNecessarioMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total Necessário</p>
                  <p className="text-xl font-semibold">
                    R$ {planejamento.aposentadoria.valorTotalNecessario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tempo de Acumulação</p>
                  <p className="text-xl font-semibold">
                    {planejamento.aposentadoria.planoAcumulacao.tempoAcumulacaoAnos} anos
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="subsection-title">Plano de Acumulação</h3>
            <p className="mb-4">
              Para atingir sua meta de aposentadoria, você precisará investir mensalmente:
            </p>
            <p className="text-2xl font-bold text-primary-600 mb-4">
              R$ {planejamento.aposentadoria.planoAcumulacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            
            <div className="mt-6">
              <div className="flex items-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min((saldoMensal / planejamento.aposentadoria.planoAcumulacao.valorMensal) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {Math.min(Math.round((saldoMensal / planejamento.aposentadoria.planoAcumulacao.valorMensal) * 100), 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {saldoMensal >= planejamento.aposentadoria.planoAcumulacao.valorMensal 
                  ? 'Seu saldo mensal atual é suficiente para atingir sua meta de aposentadoria.' 
                  : `Seu saldo mensal atual cobre ${Math.round((saldoMensal / planejamento.aposentadoria.planoAcumulacao.valorMensal) * 100)}% do valor necessário.`}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="subsection-title">Estratégias Recomendadas</h3>
            <ul className="space-y-2">
              {planejamento.aposentadoria.estrategias.map((estrategia, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 mr-2">
                    {index + 1}
                  </span>
                  <span>{estrategia}</span>
                </li>
              ))}
            </ul>
            
            <h3 className="subsection-title mt-6">Planejamento Sucessório</h3>
            <p className="mb-4">Orientações para garantir a transferência adequada de seu patrimônio:</p>
            <ul className="space-y-2">
              {planejamento.planejamentoSucessorio.orientacoes.map((orientacao, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary-100 text-secondary-800 mr-2">
                    {index + 1}
                  </span>
                  <span>{orientacao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Plano de Ação */}
      <div className="card mb-8">
        <h2 className="section-title">Plano de Ação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="subsection-title">Ações Imediatas (30 dias)</h3>
            <ul className="space-y-3">
              {planejamento.planoAcao.acoesImediatas.map((acao, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-800 mr-2">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{acao.descricao}</p>
                    <p className="text-sm text-gray-500">Prazo: {acao.prazo} dias</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <h3 className="subsection-title mt-6">Ações de Curto Prazo (1-3 meses)</h3>
            <ul className="space-y-3">
              {planejamento.planoAcao.acoesCurtoPrazo.map((acao, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-800 mr-2">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{acao.descricao}</p>
                    <p className="text-sm text-gray-500">Prazo: {acao.prazo} dias</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="subsection-title">Ações de Médio Prazo (3-12 meses)</h3>
            <ul className="space-y-3">
              {planejamento.planoAcao.acoesMedioPrazo.map((acao, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-800 mr-2">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{acao.descricao}</p>
                    <p className="text-sm text-gray-500">Prazo: {acao.prazo} dias</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <h3 className="subsection-title mt-6">Ações de Longo Prazo (mais de 12 meses)</h3>
            <ul className="space-y-3">
              {planejamento.planoAcao.acoesLongoPrazo.map((acao, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 mr-2">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{acao.descricao}</p>
                    <p className="text-sm text-gray-500">Prazo: {acao.prazo} dias</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => avancarEtapa()}
          className="btn-primary text-lg py-3 px-8"
        >
          Baixar Materiais
        </button>
      </div>
    </div>
  );
};

export default PlanejamentoDashboard;
