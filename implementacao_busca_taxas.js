/**
 * Implementação da busca automática de taxas de juros (CDI) e inflação (IPCA)
 * 
 * Este código implementa a funcionalidade de busca automática das taxas de CDI
 * e IPCA com base no prazo informado pelo usuário, calculando o rendimento
 * acumulado no período e convertendo para taxas anuais equivalentes.
 * 
 * Autor: Manus
 * Data: 20/05/2025
 */

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

// Função para atualizar os campos de taxa de juros e inflação com base no prazo
async function atualizarTaxasComBasePrazo() {
  // Obtém o valor do prazo em meses
  const prazoMeses = parseInt(document.getElementById('period').value);
  
  // Verifica se o prazo é válido
  if (isNaN(prazoMeses) || prazoMeses <= 0) {
    alert('Por favor, informe um prazo válido em meses.');
    return;
  }
  
  // Exibe mensagem de carregamento
  document.getElementById('taxasStatus').textContent = 'Buscando taxas históricas acumuladas...';
  document.getElementById('taxasStatus').style.display = 'block';
  
  try {
    // Busca as taxas anualizadas para o período informado
    const taxaCDIAnual = await buscarTaxaCDIAnual(prazoMeses);
    const taxaIPCAAnual = await buscarTaxaIPCAAnual(prazoMeses);
    
    // Verifica se as taxas foram encontradas
    if (taxaCDIAnual === null || taxaIPCAAnual === null) {
      throw new Error('Não foi possível obter as taxas para o período informado.');
    }
    
    // Formata as taxas para exibição
    const taxaCDIFormatada = taxaCDIAnual.toFixed(2).replace('.', ',') + ' %';
    const taxaIPCAFormatada = taxaIPCAAnual.toFixed(2).replace('.', ',') + ' %';
    
    // Atualiza os campos do formulário
    document.getElementById('rate').value = taxaCDIFormatada;
    document.getElementById('inflation').value = taxaIPCAFormatada;
    
    // Atualiza os selects para indicar que as taxas foram preenchidas automaticamente
    document.getElementById('knowsTax').value = 'yes';
    document.getElementById('knowsInflation').value = 'yes';
    
    // Habilita os campos para edição caso o usuário queira ajustar
    document.getElementById('tax').disabled = false;
    document.getElementById('inflation').disabled = false;
    
    // Exibe mensagem de sucesso
    document.getElementById('taxasStatus').textContent = 
      `Taxas anualizadas com base nos últimos ${prazoMeses} meses: CDI ${taxaCDIFormatada} e IPCA ${taxaIPCAFormatada}`;
    document.getElementById('taxasStatus').style.color = 'green';
  } catch (erro) {
    console.error('Erro ao atualizar taxas:', erro);
    document.getElementById('taxasStatus').textContent = 
      'Não foi possível obter as taxas automaticamente. Por favor, informe manualmente.';
    document.getElementById('taxasStatus').style.color = 'red';
  }
}

// Função para adicionar os elementos HTML necessários e configurar os eventos
function configurarBuscaAutomaticaTaxas() {
  // Adiciona um elemento para exibir o status da busca de taxas
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
  
  // Adiciona evento para buscar as taxas quando o prazo for preenchido
  periodElement.addEventListener('change', atualizarTaxasComBasePrazo);
  
  // Adiciona um botão para buscar as taxas manualmente
  const buscarTaxasBtn = document.createElement('button');
  buscarTaxasBtn.type = 'button';
  buscarTaxasBtn.textContent = 'Buscar taxas históricas';
  buscarTaxasBtn.style.marginTop = '10px';
  buscarTaxasBtn.style.padding = '8px';
  buscarTaxasBtn.style.backgroundColor = 'var(--verde-esmeralda)';
  buscarTaxasBtn.style.color = 'white';
  buscarTaxasBtn.style.border = 'none';
  buscarTaxasBtn.style.borderRadius = '5px';
  buscarTaxasBtn.style.cursor = 'pointer';
  buscarTaxasBtn.onclick = atualizarTaxasComBasePrazo;
  
  // Insere o botão após o elemento de status
  statusElement.parentNode.insertBefore(buscarTaxasBtn, statusElement.nextSibling);
}

// Executa a configuração quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', configurarBuscaAutomaticaTaxas);
