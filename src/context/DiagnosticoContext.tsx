import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DiagnosticoFinanceiro, IndicadoresFinanceiros, PlanejamentoFinanceiro } from '../types';

interface DiagnosticoContextType {
  diagnostico: DiagnosticoFinanceiro;
  indicadores: IndicadoresFinanceiros | null;
  planejamento: PlanejamentoFinanceiro | null;
  etapaAtual: number;
  setDiagnostico: (diagnostico: DiagnosticoFinanceiro) => void;
  setIndicadores: (indicadores: IndicadoresFinanceiros) => void;
  setPlanejamento: (planejamento: PlanejamentoFinanceiro) => void;
  avancarEtapa: () => void;
  voltarEtapa: () => void;
  irParaEtapa: (etapa: number) => void;
  calcularIndicadores: () => void;
  gerarPlanejamento: () => void;
}

const diagnosticoInicial: DiagnosticoFinanceiro = {
  dadosPessoais: {
    nome: '',
    idade: 0,
    estadoCivil: '',
    dependentes: 0,
    profissao: '',
    regiao: '',
  },
  fontesRenda: [],
  despesas: [],
  dividas: [],
  bensPatrimoniais: [],
  investimentos: [],
  seguros: [],
  previdencias: [],
  objetivos: [],
};

const DiagnosticoContext = createContext<DiagnosticoContextType | undefined>(undefined);

export const DiagnosticoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diagnostico, setDiagnostico] = useState<DiagnosticoFinanceiro>(diagnosticoInicial);
  const [indicadores, setIndicadores] = useState<IndicadoresFinanceiros | null>(null);
  const [planejamento, setPlanejamento] = useState<PlanejamentoFinanceiro | null>(null);
  const [etapaAtual, setEtapaAtual] = useState<number>(0);

  const avancarEtapa = () => {
    setEtapaAtual((prev) => prev + 1);
  };

  const voltarEtapa = () => {
    setEtapaAtual((prev) => Math.max(0, prev - 1));
  };

  const irParaEtapa = (etapa: number) => {
    setEtapaAtual(etapa);
  };

  const calcularIndicadores = () => {
    // Implementação dos cálculos de indicadores financeiros
    // Esta é uma versão simplificada para demonstração
    
    const totalReceitas = diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0);
    const totalDespesas = diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
    const totalDividas = diagnostico.dividas.reduce((sum, divida) => sum + divida.valorTotal, 0);
    const totalPatrimonio = diagnostico.bensPatrimoniais.reduce((sum, bem) => sum + bem.valor, 0) +
                           diagnostico.investimentos.reduce((sum, inv) => sum + inv.valor, 0);
    
    const indiceEndividamento = totalReceitas > 0 ? totalDividas / (totalReceitas * 12) : 0;
    const indiceLiquidez = totalDespesas > 0 ? 
      diagnostico.investimentos.reduce((sum, inv) => sum + inv.valor, 0) / (totalDespesas * 6) : 0;
    const taxaPoupanca = totalReceitas > 0 ? (totalReceitas - totalDespesas) / totalReceitas : 0;
    
    // Cálculo simplificado da cobertura de seguros
    const totalSeguros = diagnostico.seguros.reduce((sum, seguro) => sum + seguro.cobertura, 0);
    const coberturaSeguros = totalPatrimonio > 0 ? totalSeguros / totalPatrimonio : 0;
    
    // Classificação dos indicadores
    const classificarIndicador = (valor: number, limites: number[]): 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico' => {
      if (valor <= limites[0]) return 'Excelente';
      if (valor <= limites[1]) return 'Bom';
      if (valor <= limites[2]) return 'Regular';
      if (valor <= limites[3]) return 'Atenção';
      return 'Crítico';
    };
    
    const indicadoresCalculados: IndicadoresFinanceiros = {
      indiceEndividamento,
      indiceLiquidez,
      taxaPoupanca,
      coberturaSeguros,
      classificacaoEndividamento: classificarIndicador(indiceEndividamento, [0.3, 0.5, 0.7, 0.9]),
      classificacaoLiquidez: classificarIndicador(indiceLiquidez, [1.5, 1.0, 0.5, 0.25]),
      classificacaoPoupanca: classificarIndicador(taxaPoupanca, [0.3, 0.2, 0.1, 0.05]),
      classificacaoSeguros: classificarIndicador(coberturaSeguros, [1.5, 1.0, 0.5, 0.25]),
    };
    
    setIndicadores(indicadoresCalculados);
    return indicadoresCalculados;
  };

  const gerarPlanejamento = () => {
    // Implementação da geração de planejamento financeiro
    // Esta é uma versão simplificada para demonstração
    
    const indics = indicadores || calcularIndicadores();
    
    const totalReceitas = diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0);
    const totalDespesas = diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
    const saldoMensal = totalReceitas - totalDespesas;
    
    // Ordenar dívidas por taxa de juros (estratégia avalanche)
    const dividasOrdenadas = [...diagnostico.dividas].sort((a, b) => b.taxaJuros - a.taxaJuros);
    
    // Calcular valor ideal da reserva de emergência (6x despesas mensais)
    const valorIdealReserva = totalDespesas * 6;
    
    // Estimar tempo para constituição da reserva
    const valorMensalReserva = Math.max(saldoMensal * 0.5, 0); // 50% do saldo mensal
    const tempoEstimadoReserva = valorMensalReserva > 0 ? Math.ceil(valorIdealReserva / valorMensalReserva) : 0;
    
    // Perfil de investidor baseado na idade
    const perfilRecomendado: 'conservador' | 'moderado' | 'arrojado' = 
      diagnostico.dadosPessoais.idade > 55 ? 'conservador' : 
      diagnostico.dadosPessoais.idade > 35 ? 'moderado' : 'arrojado';
    
    // Planejamento para aposentadoria
    const idadeAposentadoria = 65;
    const anosParaAposentadoria = Math.max(0, idadeAposentadoria - diagnostico.dadosPessoais.idade);
    const valorNecessarioMensal = totalDespesas * 0.8; // 80% das despesas atuais
    const valorTotalNecessario = valorNecessarioMensal * 12 * 30; // 30 anos de aposentadoria
    
    const planejamentoGerado: PlanejamentoFinanceiro = {
      organizacaoFinanceira: {
        recomendacoes: [
          'Estabeleça um orçamento mensal detalhado',
          'Monitore seus gastos diariamente',
          'Renegocie contratos de serviços recorrentes',
        ],
        estrategiasReducaoDespesas: [
          'Revise assinaturas e serviços não essenciais',
          'Compare preços antes de realizar compras',
          'Planeje refeições para reduzir gastos com alimentação',
        ],
        planoQuitacaoDividas: {
          estrategia: 'avalanche',
          ordemQuitacao: dividasOrdenadas,
          tempoEstimadoMeses: saldoMensal > 0 ? 
            Math.ceil(diagnostico.dividas.reduce((sum, divida) => sum + divida.valorTotal, 0) / saldoMensal) : 0,
        },
      },
      reservaEmergencia: {
        valorIdeal: valorIdealReserva,
        planoConstituicao: {
          valorMensal: valorMensalReserva,
          tempoEstimadoMeses: tempoEstimadoReserva,
        },
        produtosRecomendados: [
          'CDB com liquidez diária',
          'Fundo DI com baixa taxa de administração',
          'Tesouro Selic',
        ],
      },
      protecaoPatrimonial: {
        segurosRecomendados: [
          {
            tipo: 'Seguro de Vida',
            coberturaRecomendada: totalDespesas * 12 * 5, // 5 anos de despesas
            valorEstimado: (totalDespesas * 12 * 5) * 0.002, // Estimativa simplificada
            prioridade: 'alta',
          },
          {
            tipo: 'Seguro Residencial',
            coberturaRecomendada: diagnostico.bensPatrimoniais
              .filter(bem => bem.tipo === 'Imóvel' && bem.descricao.includes('Residência'))
              .reduce((sum, bem) => sum + bem.valor, 0),
            valorEstimado: diagnostico.bensPatrimoniais
              .filter(bem => bem.tipo === 'Imóvel' && bem.descricao.includes('Residência'))
              .reduce((sum, bem) => sum + bem.valor, 0) * 0.001,
            prioridade: 'media',
          },
        ],
      },
      investimentos: {
        perfilRecomendado,
        alocacaoRecomendada: perfilRecomendado === 'conservador' ? [
          { categoria: 'Renda Fixa', percentual: 70, exemplos: ['Tesouro Direto', 'CDBs', 'LCIs/LCAs'] },
          { categoria: 'Renda Variável', percentual: 20, exemplos: ['Fundos Imobiliários', 'Ações de dividendos'] },
          { categoria: 'Alternativos', percentual: 10, exemplos: ['Ouro', 'Dólar'] },
        ] : perfilRecomendado === 'moderado' ? [
          { categoria: 'Renda Fixa', percentual: 50, exemplos: ['Tesouro Direto', 'CDBs', 'Debêntures'] },
          { categoria: 'Renda Variável', percentual: 40, exemplos: ['Ações', 'Fundos Imobiliários', 'ETFs'] },
          { categoria: 'Alternativos', percentual: 10, exemplos: ['Ouro', 'Criptomoedas', 'Investimentos no exterior'] },
        ] : [
          { categoria: 'Renda Fixa', percentual: 30, exemplos: ['Tesouro Direto', 'Debêntures', 'CDBs'] },
          { categoria: 'Renda Variável', percentual: 60, exemplos: ['Ações', 'ETFs', 'Fundos de Investimento'] },
          { categoria: 'Alternativos', percentual: 10, exemplos: ['Criptomoedas', 'Investimentos no exterior'] },
        ],
        projecaoAcumulacao: Array.from({ length: 10 }, (_, i) => ({
          tempo: (i + 1) * 5, // 5, 10, 15... anos
          valor: saldoMensal * 12 * (i + 1) * 5 * (1 + (perfilRecomendado === 'conservador' ? 0.06 : 
                                                      perfilRecomendado === 'moderado' ? 0.08 : 0.1)),
        })),
      },
      aposentadoria: {
        idadeEstimada: idadeAposentadoria,
        valorNecessarioMensal,
        valorTotalNecessario,
        planoAcumulacao: {
          valorMensal: anosParaAposentadoria > 0 ? 
            valorTotalNecessario / (anosParaAposentadoria * 12) / 
            Math.pow(1 + (perfilRecomendado === 'conservador' ? 0.06 : 
                        perfilRecomendado === 'moderado' ? 0.08 : 0.1), anosParaAposentadoria) : 0,
          tempoAcumulacaoAnos: anosParaAposentadoria,
        },
        estrategias: [
          'Maximize contribuições para previdência privada',
          'Diversifique investimentos para aposentadoria',
          'Revise anualmente seu plano de acumulação',
        ],
      },
      planejamentoSucessorio: {
        orientacoes: [
          'Elabore um testamento',
          'Considere um planejamento sucessório em vida',
          'Organize documentação importante',
        ],
        documentosNecessarios: [
          'Testamento',
          'Inventário de bens',
          'Apólices de seguro',
          'Documentos de propriedade',
        ],
        estrategias: [
          'Doação em vida com usufruto',
          'Criação de holding familiar',
          'Seguro de vida com beneficiários definidos',
        ],
      },
      planoAcao: {
        acoesImediatas: [
          { descricao: 'Elaborar orçamento detalhado', prazo: 7 },
          { descricao: 'Iniciar constituição de reserva de emergência', prazo: 30 },
          { descricao: 'Revisar contratos de serviços recorrentes', prazo: 15 },
        ],
        acoesCurtoPrazo: [
          { descricao: 'Iniciar quitação da dívida mais cara', prazo: 90 },
          { descricao: 'Contratar seguros essenciais', prazo: 60 },
          { descricao: 'Organizar documentação financeira', prazo: 45 },
        ],
        acoesMedioPrazo: [
          { descricao: 'Revisar alocação de investimentos', prazo: 180 },
          { descricao: 'Completar reserva de emergência', prazo: 365 },
          { descricao: 'Iniciar investimentos para objetivos de médio prazo', prazo: 120 },
        ],
        acoesLongoPrazo: [
          { descricao: 'Aumentar contribuições para aposentadoria', prazo: 365 },
          { descricao: 'Revisar planejamento sucessório', prazo: 730 },
          { descricao: 'Diversificar investimentos de longo prazo', prazo: 365 },
        ],
      },
    };
    
    setPlanejamento(planejamentoGerado);
    return planejamentoGerado;
  };

  return (
    <DiagnosticoContext.Provider
      value={{
        diagnostico,
        indicadores,
        planejamento,
        etapaAtual,
        setDiagnostico,
        setIndicadores,
        setPlanejamento,
        avancarEtapa,
        voltarEtapa,
        irParaEtapa,
        calcularIndicadores,
        gerarPlanejamento,
      }}
    >
      {children}
    </DiagnosticoContext.Provider>
  );
};

export const useDiagnostico = (): DiagnosticoContextType => {
  const context = useContext(DiagnosticoContext);
  if (context === undefined) {
    throw new Error('useDiagnostico deve ser usado dentro de um DiagnosticoProvider');
  }
  return context;
};
