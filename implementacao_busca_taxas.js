/**
 * Implementação da busca automática de taxas de juros (CDI) e inflação (IPCA)
 * integrada aos seletores existentes do formulário
 * 
 * Este código implementa a funcionalidade de busca automática das taxas quando
 * o usuário seleciona "Não" nos campos "Você sabe a taxa de juros?" e
 * "Você sabe a taxa de inflação?"
 * 
 * Autor: Manus
 * Data: 20/05/2025
 */

// Função para buscar a taxa CDI atual
async function buscarCDIAtual() {
  try {
    // Busca os últimos valores do CDI diário (código 12)
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/20?formato=json';
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do CDI atual: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Verifica se há dados
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o CDI atual');
    }
    
    // Obtém o valor mais recente do CDI
    const taxaCDIAtual = parseFloat(dados[dados.length - 1].valor);
    
    // Calcula a taxa anual equivalente (considerando 252 dias úteis por ano)
    // Fórmula: ((1 + taxa diária)^252) - 1
    const taxaAnual = (Math.pow(1 + taxaCDIAtual / 100, 252) - 1) * 100;
    
    // Retorna a taxa anual
    return taxaAnual;
  } catch (erro) {
    console.error('Erro ao buscar taxa CDI atual:', erro);
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

// Função para preencher a taxa de juros com o CDI atual
async function preencherCDIAtual() {
  try {
    // Exibe mensagem de carregamento
    const statusElement = document.getElementById('taxasStatus');
    statusElement.textContent = 'Buscando taxa CDI atual...';
    statusElement.style.display = 'block';
    statusElement.style.color = 'blue';
    
    // Busca o CDI atual
    const taxaCDI = await buscarCDIAtual();
    
    // Verifica se a taxa foi encontrada
    if (taxaCDI === null) {
      throw new Error('Não foi possível obter a taxa CDI atual');
    }
    
    // Formata a taxa para exibição
    const taxaCDIFormatada = taxaCDI.toFixed(2).replace('.', ',') + ' %';
    
    // Atualiza o campo de taxa de juros
    document.getElementById('rate').value = taxaCDIFormatada;
    
    // Atualiza a mensagem de status
    statusElement.textContent = `Taxa CDI atual: ${taxaCDIFormatada}`;
    statusElement.style.color = 'green';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
    
    return true;
  } catch (erro) {
    console.error('Erro ao preencher CDI atual:', erro);
    
    // Exibe mensagem de erro
    const statusElement = document.getElementById('taxasStatus');
    statusElement.textContent = `Erro: ${erro.message}. Por favor, informe a taxa manualmente.`;
    statusElement.style.display = 'block';
    statusElement.style.color = 'red';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
    
    return false;
  }
}

// Função para preencher a taxa de inflação com o IPCA dos últimos 12 meses
async function preencherIPCAUltimos12Meses() {
  try {
    // Exibe mensagem de carregamento
    const statusElement = document.getElementById('taxasStatus');
    statusElement.textContent = 'Buscando IPCA dos últimos 12 meses...';
    statusElement.style.display = 'block';
    statusElement.style.color = 'blue';
    
    // Busca o IPCA dos últimos 12 meses
    const taxaIPCA = await buscarIPCAUltimos12Meses();
    
    // Verifica se a taxa foi encontrada
    if (taxaIPCA === null) {
      throw new Error('Não foi possível obter o IPCA dos últimos 12 meses');
    }
    
    // Formata a taxa para exibição
    const taxaIPCAFormatada = taxaIPCA.toFixed(2).replace('.', ',') + ' %';
    
    // Atualiza o campo de inflação
    document.getElementById('inflation').value = taxaIPCAFormatada;
    
    // Atualiza a mensagem de status
    statusElement.textContent = `IPCA dos últimos 12 meses: ${taxaIPCAFormatada}`;
    statusElement.style.color = 'green';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
    
    return true;
  } catch (erro) {
    console.error('Erro ao preencher IPCA dos últimos 12 meses:', erro);
    
    // Exibe mensagem de erro
    const statusElement = document.getElementById('taxasStatus');
    statusElement.textContent = `Erro: ${erro.message}. Por favor, informe a taxa manualmente.`;
    statusElement.style.display = 'block';
    statusElement.style.color = 'red';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
    
    return false;
  }
}

// Função para estender a função toggleTaxInput existente
function extendToggleTaxInput() {
  // Armazena a função original
  const originalToggleTaxInput = window.toggleTaxInput;
  
  // Sobrescreve a função com a versão estendida
  window.toggleTaxInput = function(id, defaultValue) {
    // Chama a função original primeiro
    originalToggleTaxInput(id, defaultValue);
    
    // Obtém o select correspondente
    const select = document.getElementById(id === 'tax' ? 'knowsTax' : 'knowsInflation');
    
    // Se o usuário selecionou "Não", preenche automaticamente com os valores atuais
    if (select.value === 'no') {
      if (id === 'rate') {
        // Preenche com o CDI atual
        preencherCDIAtual();
      } else if (id === 'inflation') {
        // Preenche com o IPCA dos últimos 12 meses
        preencherIPCAUltimos12Meses();
      }
    }
  };
}

// Função para adicionar um novo seletor para a taxa de juros
function adicionarSeletorTaxaJuros() {
  // Cria o elemento label
  const label = document.createElement('label');
  label.textContent = 'Você sabe a taxa de juros?';
  
  // Cria a div para a linha
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row';
  
  // Cria a div para o select
  const selectDiv = document.createElement('div');
  
  // Cria o select
  const select = document.createElement('select');
  select.id = 'knowsRate';
  select.onchange = function() {
    toggleTaxInput('rate', '10,00 %');
  };
  
  // Cria as opções
  const optionNo = document.createElement('option');
  optionNo.value = 'no';
  optionNo.textContent = 'Não';
  
  const optionYes = document.createElement('option');
  optionYes.value = 'yes';
  optionYes.textContent = 'Sim';
  
  // Monta a estrutura
  select.appendChild(optionNo);
  select.appendChild(optionYes);
  selectDiv.appendChild(select);
  
  // Cria a div para o input (vazia, pois o input já existe)
  const inputDiv = document.createElement('div');
  
  // Adiciona as divs à linha
  rowDiv.appendChild(selectDiv);
  rowDiv.appendChild(inputDiv);
  
  // Obtém os elementos existentes
  const rateInput = document.getElementById('rate');
  const rateTypeSelect = document.getElementById('rateType');
  
  // Obtém a div pai do input de taxa
  const rateParentDiv = rateInput.parentNode;
  
  // Obtém a div pai da div pai (a div da linha)
  const rowParentDiv = rateParentDiv.parentNode;
  
  // Insere o label antes da div da linha
  rowParentDiv.parentNode.insertBefore(label, rowParentDiv);
  
  // Insere a nova div da linha após o label
  label.parentNode.insertBefore(rowDiv, label.nextSibling);
  
  // Move o input de taxa para a nova div
  inputDiv.appendChild(rateInput);
  
  // Adiciona o elemento para exibir o status da busca de taxas, se ainda não existir
  if (!document.getElementById('taxasStatus')) {
    const statusElement = document.createElement('div');
    statusElement.id = 'taxasStatus';
    statusElement.style.display = 'none';
    statusElement.style.margin = '10px 0';
    statusElement.style.padding = '8px';
    statusElement.style.borderRadius = '5px';
    statusElement.style.backgroundColor = '#f8f9fa';
    
    // Insere o elemento após o campo de prazo
    const periodElement = document.getElementById('period');
    periodElement.parentNode.insertBefore(statusElement, periodElement.nextSibling);
  }
  
  // Inicializa o estado do input de taxa
  toggleTaxInput('rate', '10,00 %');
}

// Função para configurar os eventos
function configurarEventos() {
  // Configura o evento para o seletor de taxa de juros
  const knowsRateSelect = document.getElementById('knowsRate');
  if (knowsRateSelect) {
    knowsRateSelect.addEventListener('change', function() {
      if (this.value === 'no') {
        preencherCDIAtual();
      }
    });
  }
  
  // Configura o evento para o seletor de inflação
  const knowsInflationSelect = document.getElementById('knowsInflation');
  if (knowsInflationSelect) {
    knowsInflationSelect.addEventListener('change', function() {
      if (this.value === 'no') {
        preencherIPCAUltimos12Meses();
      }
    });
  }
}

// Função principal para inicializar a funcionalidade
function inicializarBuscaAutomaticaTaxas() {
  // Adiciona o seletor para a taxa de juros
  adicionarSeletorTaxaJuros();
  
  // Configura os eventos
  configurarEventos();
  
  // Preenche automaticamente as taxas se os seletores estiverem como "Não"
  const knowsRateSelect = document.getElementById('knowsRate');
  const knowsInflationSelect = document.getElementById('knowsInflation');
  
  if (knowsRateSelect && knowsRateSelect.value === 'no') {
    preencherCDIAtual();
  }
  
  if (knowsInflationSelect && knowsInflationSelect.value === 'no') {
    preencherIPCAUltimos12Meses();
  }
}

// Executa a inicialização quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', inicializarBuscaAutomaticaTaxas);
