/**
 * Implementação da busca automática de taxas de juros (CDI) e inflação (IPCA)
 * com opção de escolha entre série histórica ou taxas atuais
 * 
 * Este código implementa a funcionalidade de busca automática das taxas de CDI
 * e IPCA com duas opções:
 * 1. Série histórica: calcula com base no prazo informado
 * 2. Taxas atuais: usa o CDI atual (SELIC atual - 0,1%) e inflação dos últimos 12 meses
 * 
 * Autor: Manus
 * Data: 20/05/2025
 */

// Função para buscar a taxa SELIC atual
async function buscarTaxaSelicAtual() {
  try {
    // Busca os últimos valores da SELIC diária
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/20?formato=json';
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados da SELIC atual: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Verifica se há dados
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para a SELIC atual');
    }
    
    // Obtém o valor mais recente da SELIC
    const taxaSelicAtual = parseFloat(dados[dados.length - 1].valor);
    
    // Retorna a taxa SELIC atual
    return taxaSelicAtual;
  } catch (erro) {
    console.error('Erro ao buscar taxa SELIC atual:', erro);
    return null;
  }
}

// Função para calcular o CDI atual (SELIC atual - 0,1%)
async function calcularCDIAtual() {
  try {
    // Busca a taxa SELIC atual
    const taxaSelicAtual = await buscarTaxaSelicAtual();
    
    if (taxaSelicAtual === null) {
      throw new Error('Não foi possível obter a taxa SELIC atual');
    }
    
    // Calcula o CDI (SELIC - 0,1%)
    const taxaCDIAtual = taxaSelicAtual - 0.1;
    
    // Garante que o CDI não seja negativo
    return Math.max(taxaCDIAtual, 0);
  } catch (erro) {
    console.error('Erro ao calcular CDI atual:', erro);
    return null;
  }
}

// Função para buscar a inflação (IPCA) acumulada dos últimos 12 meses
async function buscarIPCAUltimos12Meses() {
  try {
    // Calcula as datas para os últimos 12 meses
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setMonth(dataInicial.getMonth() - 12);
    
    // Formata as datas no padrão dd/MM/aaaa exigido pela API
    const dataInicialFormatada = `${String(dataInicial.getDate()).padStart(2, '0')}/${String(dataInicial.getMonth() + 1).padStart(2, '0')}/${dataInicial.getFullYear()}`;
    const dataFinalFormatada = `${String(dataFinal.getDate()).padStart(2, '0')}/${String(dataFinal.getMonth() + 1).padStart(2, '0')}/${dataFinal.getFullYear()}`;
    
    // Monta a URL da API do Banco Central para o IPCA (código 433)
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do IPCA: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Verifica se há dados no período
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o IPCA nos últimos 12 meses');
    }
    
    // Calcula a inflação acumulada nos últimos 12 meses (produto dos fatores mensais)
    let inflacaoAcumulada = 1;
    for (const item of dados) {
      // O IPCA é fornecido em percentual ao mês, precisamos converter para fator
      const taxaMensal = parseFloat(item.valor) / 100;
      inflacaoAcumulada *= (1 + taxaMensal);
    }
    
    // Converte para percentual anual
    const taxaAnual = (inflacaoAcumulada - 1) * 100;
    
    // Retorna a taxa anual
    return taxaAnual;
  } catch (erro) {
    console.error('Erro ao buscar IPCA dos últimos 12 meses:', erro);
    return null;
  }
}

// Função para buscar a taxa CDI acumulada para um período específico e converter para taxa anual
async function buscarTaxaCDIAnual(mesesRetroativos) {
  try {
    // Calcula as datas inicial e final com base no número de meses retroativos
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setMonth(dataInicial.getMonth() - mesesRetroativos);
    
    // Formata as datas no padrão dd/MM/aaaa exigido pela API
    const dataInicialFormatada = `${String(dataInicial.getDate()).padStart(2, '0')}/${String(dataInicial.getMonth() + 1).padStart(2, '0')}/${dataInicial.getFullYear()}`;
    const dataFinalFormatada = `${String(dataFinal.getDate()).padStart(2, '0')}/${String(dataFinal.getMonth() + 1).padStart(2, '0')}/${dataFinal.getFullYear()}`;
    
    // Monta a URL da API do Banco Central para o CDI (código 12 para CDI diário)
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do CDI: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Verifica se há dados no período
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o período especificado');
    }
    
    // Calcula o rendimento acumulado no período (produto dos fatores diários)
    let rendimentoAcumulado = 1;
    for (const item of dados) {
      // A taxa CDI é fornecida em percentual ao dia, precisamos converter para fator
      const taxaDiaria = parseFloat(item.valor) / 100;
      rendimentoAcumulado *= (1 + taxaDiaria);
    }
    
    // Calcula a taxa anual equivalente
    // Fórmula: ((1 + rendimento acumulado)^(252/número de dias úteis)) - 1
    // Considerando aproximadamente 252 dias úteis por ano
    const taxaAnual = Math.pow(rendimentoAcumulado, 252 / dados.length) - 1;
    
    // Retorna a taxa anual em percentual
    return taxaAnual * 100;
  } catch (erro) {
    console.error('Erro ao buscar taxa CDI:', erro);
    return null;
  }
}

// Função para buscar a taxa IPCA acumulada para um período específico e converter para taxa anual
async function buscarTaxaIPCAAnual(mesesRetroativos) {
  try {
    // Calcula as datas inicial e final com base no número de meses retroativos
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setMonth(dataInicial.getMonth() - mesesRetroativos);
    
    // Formata as datas no padrão dd/MM/aaaa exigido pela API
    const dataInicialFormatada = `${String(dataInicial.getDate()).padStart(2, '0')}/${String(dataInicial.getMonth() + 1).padStart(2, '0')}/${dataInicial.getFullYear()}`;
    const dataFinalFormatada = `${String(dataFinal.getDate()).padStart(2, '0')}/${String(dataFinal.getMonth() + 1).padStart(2, '0')}/${dataFinal.getFullYear()}`;
    
    // Monta a URL da API do Banco Central para o IPCA (código 433)
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do IPCA: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Verifica se há dados no período
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o período especificado');
    }
    
    // Calcula a inflação acumulada no período (produto dos fatores mensais)
    let inflacaoAcumulada = 1;
    for (const item of dados) {
      // O IPCA é fornecido em percentual ao mês, precisamos converter para fator
      const taxaMensal = parseFloat(item.valor) / 100;
      inflacaoAcumulada *= (1 + taxaMensal);
    }
    
    // Calcula a taxa anual equivalente
    // Fórmula: ((1 + inflação acumulada)^(12/número de meses)) - 1
    const taxaAnual = Math.pow(inflacaoAcumulada, 12 / dados.length) - 1;
    
    // Retorna a taxa anual em percentual
    return taxaAnual * 100;
  } catch (erro) {
    console.error('Erro ao buscar taxa IPCA:', erro);
    return null;
  }
}

// Função para atualizar os campos de taxa de juros e inflação com base na opção selecionada
async function atualizarTaxas() {
  // Obtém a opção selecionada (série histórica ou taxas atuais)
  const opcaoSelecionada = document.getElementById('opcaoTaxas').value;
  
  // Exibe mensagem de carregamento
  document.getElementById('taxasStatus').textContent = 'Buscando taxas...';
  document.getElementById('taxasStatus').style.display = 'block';
  
  try {
    let taxaCDI, taxaIPCA;
    
    if (opcaoSelecionada === 'historica') {
      // Obtém o valor do prazo em meses
      const prazoMeses = parseInt(document.getElementById('period').value);
      
      // Verifica se o prazo é válido
      if (isNaN(prazoMeses) || prazoMeses <= 0) {
        throw new Error('Por favor, informe um prazo válido em meses.');
      }
      
      // Busca as taxas anualizadas com base na série histórica
      taxaCDI = await buscarTaxaCDIAnual(prazoMeses);
      taxaIPCA = await buscarTaxaIPCAAnual(prazoMeses);
      
      // Mensagem de sucesso
      document.getElementById('taxasStatus').textContent = 
        `Taxas anualizadas com base nos últimos ${prazoMeses} meses: CDI ${taxaCDI.toFixed(2).replace('.', ',')}% e IPCA ${taxaIPCA.toFixed(2).replace('.', ',')}%`;
    } else {
      // Busca as taxas atuais
      taxaCDI = await calcularCDIAtual();
      taxaIPCA = await buscarIPCAUltimos12Meses();
      
      // Mensagem de sucesso
      document.getElementById('taxasStatus').textContent = 
        `Taxas atuais: CDI ${taxaCDI.toFixed(2).replace('.', ',')}% (SELIC atual - 0,1%) e IPCA ${taxaIPCA.toFixed(2).replace('.', ',')}% (últimos 12 meses)`;
    }
    
    // Verifica se as taxas foram encontradas
    if (taxaCDI === null || taxaIPCA === null) {
      throw new Error('Não foi possível obter as taxas.');
    }
    
    // Formata as taxas para exibição
    const taxaCDIFormatada = taxaCDI.toFixed(2).replace('.', ',') + ' %';
    const taxaIPCAFormatada = taxaIPCA.toFixed(2).replace('.', ',') + ' %';
    
    // Atualiza os campos do formulário
    document.getElementById('rate').value = taxaCDIFormatada;
    document.getElementById('inflation').value = taxaIPCAFormatada;
    
    // Atualiza os selects para indicar que as taxas foram preenchidas automaticamente
    document.getElementById('knowsTax').value = 'yes';
    document.getElementById('knowsInflation').value = 'yes';
    
    // Habilita os campos para edição caso o usuário queira ajustar
    document.getElementById('tax').disabled = false;
    document.getElementById('inflation').disabled = false;
    
    // Atualiza a cor da mensagem de status
    document.getElementById('taxasStatus').style.color = 'green';
  } catch (erro) {
    console.error('Erro ao atualizar taxas:', erro);
    document.getElementById('taxasStatus').textContent = 
      `Erro: ${erro.message} Por favor, informe as taxas manualmente.`;
    document.getElementById('taxasStatus').style.color = 'red';
  }
}

// Função para adicionar os elementos HTML necessários e configurar os eventos
function configurarBuscaAutomaticaTaxas() {
  // Adiciona o seletor de opção (série histórica ou taxas atuais)
  const opcaoDiv = document.createElement('div');
  opcaoDiv.style.marginTop = '15px';
  opcaoDiv.style.marginBottom = '15px';
  
  const opcaoLabel = document.createElement('label');
  opcaoLabel.textContent = 'Escolha a fonte das taxas:';
  opcaoLabel.style.display = 'block';
  opcaoLabel.style.marginBottom = '5px';
  opcaoLabel.style.fontWeight = 'bold';
  
  const opcaoSelect = document.createElement('select');
  opcaoSelect.id = 'opcaoTaxas';
  opcaoSelect.style.width = '100%';
  opcaoSelect.style.padding = '10px';
  opcaoSelect.style.borderRadius = '5px';
  opcaoSelect.style.border = '1px solid var(--verde-esmeralda)';
  
  const opcaoHistorica = document.createElement('option');
  opcaoHistorica.value = 'historica';
  opcaoHistorica.textContent = 'Série histórica (baseada no prazo)';
  
  const opcaoAtual = document.createElement('option');
  opcaoAtual.value = 'atual';
  opcaoAtual.textContent = 'Taxas atuais (CDI atual e IPCA dos últimos 12 meses)';
  
  opcaoSelect.appendChild(opcaoHistorica);
  opcaoSelect.appendChild(opcaoAtual);
  
  opcaoDiv.appendChild(opcaoLabel);
  opcaoDiv.appendChild(opcaoSelect);
  
  // Adiciona um elemento para exibir o status da busca de taxas
  const statusElement = document.createElement('div');
  statusElement.id = 'taxasStatus';
  statusElement.style.display = 'none';
  statusElement.style.margin = '10px 0';
  statusElement.style.padding = '8px';
  statusElement.style.borderRadius = '5px';
  statusElement.style.backgroundColor = '#f8f9fa';
  
  // Adiciona um botão para buscar as taxas
  const buscarTaxasBtn = document.createElement('button');
  buscarTaxasBtn.type = 'button';
  buscarTaxasBtn.textContent = 'Buscar taxas';
  buscarTaxasBtn.style.marginTop = '10px';
  buscarTaxasBtn.style.padding = '8px';
  buscarTaxasBtn.style.backgroundColor = 'var(--verde-esmeralda)';
  buscarTaxasBtn.style.color = 'white';
  buscarTaxasBtn.style.border = 'none';
  buscarTaxasBtn.style.borderRadius = '5px';
  buscarTaxasBtn.style.cursor = 'pointer';
  buscarTaxasBtn.onclick = atualizarTaxas;
  
  // Insere os elementos após o campo de prazo
  const periodElement = document.getElementById('period');
  periodElement.parentNode.insertBefore(opcaoDiv, periodElement.nextSibling);
  periodElement.parentNode.insertBefore(statusElement, opcaoDiv.nextSibling);
  periodElement.parentNode.insertBefore(buscarTaxasBtn, statusElement.nextSibling);
  
  // Adiciona evento para atualizar as taxas quando o prazo for alterado (apenas se série histórica estiver selecionada)
  periodElement.addEventListener('change', function() {
    if (document.getElementById('opcaoTaxas').value === 'historica') {
      atualizarTaxas();
    }
  });
  
  // Adiciona evento para atualizar as taxas quando a opção for alterada
  opcaoSelect.addEventListener('change', atualizarTaxas);
}

// Executa a configuração quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', configurarBuscaAutomaticaTaxas);
