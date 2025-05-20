/**
 * Implementação da busca automática de taxas de juros e inflação
 * 
 * Este código implementa a funcionalidade de busca automática das taxas de juros (SELIC)
 * e inflação (IPCA) com base no prazo informado pelo usuário.
 * 
 * Autor: Manus
 * Data: 20/05/2025
 */

// Função para buscar a taxa SELIC média para um período específico
async function buscarTaxaSelicMedia(mesesRetroativos) {
  try {
    // Calcula as datas inicial e final com base no número de meses retroativos
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setMonth(dataInicial.getMonth() - mesesRetroativos);
    
    // Formata as datas no padrão dd/MM/aaaa exigido pela API
    const dataInicialFormatada = `${String(dataInicial.getDate()).padStart(2, '0')}/${String(dataInicial.getMonth() + 1).padStart(2, '0')}/${dataInicial.getFullYear()}`;
    const dataFinalFormatada = `${String(dataFinal.getDate()).padStart(2, '0')}/${String(dataFinal.getMonth() + 1).padStart(2, '0')}/${dataFinal.getFullYear()}`;
    
    // Monta a URL da API do Banco Central para a SELIC (código 11)
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados da SELIC: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Calcula a média das taxas no período
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o período especificado');
    }
    
    // Soma todas as taxas e divide pelo número de registros para obter a média
    const somaValores = dados.reduce((soma, item) => soma + parseFloat(item.valor), 0);
    const mediaAnual = somaValores / dados.length;
    
    // Retorna a média anualizada (considerando que os dados da SELIC são mensais)
    return mediaAnual;
  } catch (erro) {
    console.error('Erro ao buscar taxa SELIC:', erro);
    return null;
  }
}

// Função para buscar a taxa IPCA média para um período específico
async function buscarTaxaIPCAMedia(mesesRetroativos) {
  try {
    // Calcula as datas inicial e final com base no número de meses retroativos
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setMonth(dataInicial.getMonth() - mesesRetroativos);
    
    // Formata as datas no padrão dd/MM/aaaa exigido pela API
    const dataInicialFormatada = `${String(dataInicial.getDate()).padStart(2, '0')}/${String(dataInicial.getMonth() + 1).padStart(2, '0')}/${dataInicial.getFullYear()}`;
    const dataFinalFormatada = `${String(dataFinal.getDate()).padStart(2, '0')}/${String(dataFinal.getMonth() + 1).padStart(2, '0')}/${dataFinal.getFullYear()}`;
    
    // Monta a URL da API do Banco Central para o IPCA (código 433)
    // Nota: O código 433 é para o IPCA mensal, enquanto o 10844 é para IPCA de serviços
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;
    
    // Faz a requisição à API
    const response = await fetch(url);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do IPCA: ${response.status}`);
    }
    
    // Converte a resposta para JSON
    const dados = await response.json();
    
    // Calcula a média das taxas no período
    if (dados.length === 0) {
      throw new Error('Nenhum dado encontrado para o período especificado');
    }
    
    // Soma todas as taxas e divide pelo número de registros para obter a média
    const somaValores = dados.reduce((soma, item) => soma + parseFloat(item.valor), 0);
    const mediaAnual = somaValores / dados.length;
    
    // Retorna a média anualizada (considerando que os dados do IPCA são mensais)
    return mediaAnual;
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
  document.getElementById('taxasStatus').textContent = 'Buscando taxas médias históricas...';
  document.getElementById('taxasStatus').style.display = 'block';
  
  try {
    // Busca as taxas médias para o período informado
    const taxaSelicMedia = await buscarTaxaSelicMedia(prazoMeses);
    const taxaIPCAMedia = await buscarTaxaIPCAMedia(prazoMeses);
    
    // Verifica se as taxas foram encontradas
    if (taxaSelicMedia === null || taxaIPCAMedia === null) {
      throw new Error('Não foi possível obter as taxas para o período informado.');
    }
    
    // Formata as taxas para exibição
    const taxaSelicFormatada = taxaSelicMedia.toFixed(2).replace('.', ',') + ' %';
    const taxaIPCAFormatada = taxaIPCAMedia.toFixed(2).replace('.', ',') + ' %';
    
    // Atualiza os campos do formulário
    document.getElementById('rate').value = taxaSelicFormatada;
    document.getElementById('inflation').value = taxaIPCAFormatada;
    
    // Atualiza os selects para indicar que as taxas foram preenchidas automaticamente
    document.getElementById('knowsTax').value = 'yes';
    document.getElementById('knowsInflation').value = 'yes';
    
    // Habilita os campos para edição caso o usuário queira ajustar
    document.getElementById('tax').disabled = false;
    document.getElementById('inflation').disabled = false;
    
    // Exibe mensagem de sucesso
    document.getElementById('taxasStatus').textContent = 
      `Taxas médias dos últimos ${prazoMeses} meses: SELIC ${taxaSelicFormatada} e IPCA ${taxaIPCAFormatada}`;
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
  buscarTaxasBtn.textContent = 'Buscar taxas médias históricas';
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
