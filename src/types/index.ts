// Tipos para o formulário de diagnóstico financeiro

export interface DadosPessoais {
  nome: string;
  idade: number;
  estadoCivil: string;
  dependentes: number;
  profissao: string;
  regiao: string;
}

export interface FonteRenda {
  id: string;
  descricao: string;
  valor: number;
}

export interface Despesa {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  fixa: boolean;
}

export interface Divida {
  id: string;
  tipo: string;
  descricao: string;
  valorTotal: number;
  taxaJuros: number;
  prazoMeses: number;
  valorParcela: number;
}

export interface BemPatrimonial {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  possuiFinanciamento: boolean;
}

export interface Investimento {
  id: string;
  tipo: string;
  instituicao: string;
  valor: number;
  rentabilidade: number;
}

export interface Seguro {
  id: string;
  tipo: string;
  cobertura: number;
  premio: number;
  periodicidade: string;
}

export interface Previdencia {
  id: string;
  tipo: string;
  contribuicaoMensal: number;
  saldoAcumulado: number;
}

export interface Objetivo {
  id: string;
  descricao: string;
  valor: number;
  prazoMeses: number;
  prioridade: 'alta' | 'media' | 'baixa';
  categoria: 'curto' | 'medio' | 'longo';
}

export interface DiagnosticoFinanceiro {
  dadosPessoais: DadosPessoais;
  fontesRenda: FonteRenda[];
  despesas: Despesa[];
  dividas: Divida[];
  bensPatrimoniais: BemPatrimonial[];
  investimentos: Investimento[];
  seguros: Seguro[];
  previdencias: Previdencia[];
  objetivos: Objetivo[];
  dadosAdicionais?: {
    idadeAposentadoria?: number;
    rendaDesejada?: number;
    [key: string]: any;
  };
}

export interface IndicadoresFinanceiros {
  indiceEndividamento: number;
  indiceLiquidez: number;
  taxaPoupanca: number;
  coberturaSeguros: number;
  classificacaoEndividamento: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  classificacaoLiquidez: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  classificacaoPoupanca: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  classificacaoSeguros: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
}

export interface PlanejamentoFinanceiro {
  organizacaoFinanceira: {
    recomendacoes: string[];
    estrategiasReducaoDespesas: string[];
    planoQuitacaoDividas: {
      estrategia: 'bola_de_neve' | 'avalanche';
      ordemQuitacao: Divida[];
      tempoEstimadoMeses: number;
    };
  };
  reservaEmergencia: {
    valorIdeal: number;
    planoConstituicao: {
      valorMensal: number;
      tempoEstimadoMeses: number;
    };
    produtosRecomendados: string[];
  };
  protecaoPatrimonial: {
    segurosRecomendados: {
      tipo: string;
      coberturaRecomendada: number;
      valorEstimado: number;
      prioridade: 'alta' | 'media' | 'baixa';
    }[];
  };
  investimentos: {
    perfilRecomendado: 'conservador' | 'moderado' | 'arrojado';
    alocacaoRecomendada: {
      categoria: string;
      percentual: number;
      exemplos: string[];
    }[];
    projecaoAcumulacao: {
      tempo: number;
      valor: number;
    }[];
  };
  aposentadoria: {
    idadeEstimada: number;
    valorNecessarioMensal: number;
    valorTotalNecessario: number;
    planoAcumulacao: {
      valorMensal: number;
      tempoAcumulacaoAnos: number;
    };
    estrategias: string[];
  };
  planejamentoSucessorio: {
    orientacoes: string[];
    documentosNecessarios: string[];
    estrategias: string[];
  };
  planoAcao: {
    acoesImediatas: {
      descricao: string;
      prazo: number;
    }[];
    acoesCurtoPrazo: {
      descricao: string;
      prazo: number;
    }[];
    acoesMedioPrazo: {
      descricao: string;
      prazo: number;
    }[];
    acoesLongoPrazo: {
      descricao: string;
      prazo: number;
    }[];
  };
}
