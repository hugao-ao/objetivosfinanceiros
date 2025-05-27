import React from 'react';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DownloadMateriais: React.FC = () => {
  const { diagnostico, indicadores, planejamento } = useDiagnostico();

  // Função para gerar o relatório completo em PDF
  const gerarRelatorioPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Função auxiliar para adicionar texto centralizado
    const addCenteredText = (text: string, y: number, size: number = 16) => {
      doc.setFontSize(size);
      const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };
    
    // Função auxiliar para adicionar texto com quebra de linha
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 7);
    };
    
    // Capa
    doc.setFillColor(0, 102, 153);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    addCenteredText('Planejamento Financeiro', 25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    addCenteredText(`Gerado em ${dataAtual}`, 50);
    
    if (diagnostico.dadosPessoais.nome) {
      addCenteredText(`Cliente: ${diagnostico.dadosPessoais.nome}`, 60);
    }
    
    // Sumário
    doc.setFontSize(18);
    doc.text('Sumário', 14, 80);
    doc.setFontSize(12);
    doc.text('1. Diagnóstico Financeiro', 14, 90);
    doc.text('2. Indicadores Financeiros', 14, 100);
    doc.text('3. Planejamento Financeiro', 14, 110);
    doc.text('4. Plano de Ação', 14, 120);
    
    // Diagnóstico Financeiro
    doc.addPage();
    doc.setFontSize(20);
    doc.text('1. Diagnóstico Financeiro', 14, 20);
    
    // Dados Pessoais
    doc.setFontSize(16);
    doc.text('Dados Pessoais', 14, 30);
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Idade: ${diagnostico.dadosPessoais.idade} anos`, 14, y); y += 7;
    doc.text(`Estado Civil: ${diagnostico.dadosPessoais.estadoCivil}`, 14, y); y += 7;
    doc.text(`Dependentes: ${diagnostico.dadosPessoais.dependentes}`, 14, y); y += 7;
    doc.text(`Profissão: ${diagnostico.dadosPessoais.profissao}`, 14, y); y += 7;
    doc.text(`Região: ${diagnostico.dadosPessoais.regiao}`, 14, y); y += 15;
    
    // Resumo Financeiro
    doc.setFontSize(16);
    doc.text('Resumo Financeiro', 14, y); y += 10;
    doc.setFontSize(12);
    
    const totalReceitas = diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0);
    const totalDespesas = diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
    const saldoMensal = totalReceitas - totalDespesas;
    
    doc.text(`Receitas Mensais: R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
    doc.text(`Despesas Mensais: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
    doc.text(`Saldo Mensal: R$ ${saldoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 15;
    
    // Fontes de Renda
    if (diagnostico.fontesRenda.length > 0) {
      doc.setFontSize(16);
      doc.text('Fontes de Renda', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Descrição', 'Valor Mensal (R$)']],
        body: diagnostico.fontesRenda.map(fonte => [
          fonte.descricao,
          fonte.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
    }
    
    // Despesas
    if (diagnostico.despesas.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Despesas', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Categoria', 'Descrição', 'Valor Mensal (R$)', 'Tipo']],
        body: diagnostico.despesas.map(despesa => [
          despesa.categoria,
          despesa.descricao,
          despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          despesa.fixa ? 'Fixa' : 'Variável'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
    }
    
    // Dívidas
    if (diagnostico.dividas.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Dívidas', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Tipo', 'Descrição', 'Valor Total (R$)', 'Taxa de Juros (%)', 'Prazo (meses)']],
        body: diagnostico.dividas.map(divida => [
          divida.tipo,
          divida.descricao,
          divida.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          divida.taxaJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          divida.prazoMeses
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
    }
    
    // Patrimônio
    if (diagnostico.bensPatrimoniais.length > 0) {
      doc.addPage();
      y = 20;
      
      doc.setFontSize(16);
      doc.text('Patrimônio', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Tipo', 'Descrição', 'Valor (R$)', 'Financiado']],
        body: diagnostico.bensPatrimoniais.map(bem => [
          bem.tipo,
          bem.descricao,
          bem.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          bem.possuiFinanciamento ? 'Sim' : 'Não'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
    }
    
    // Investimentos
    if (diagnostico.investimentos.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Investimentos', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Tipo', 'Instituição', 'Valor (R$)', 'Rentabilidade (% a.a.)']],
        body: diagnostico.investimentos.map(inv => [
          inv.tipo,
          inv.instituicao,
          inv.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          inv.rentabilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
    }
    
    // Indicadores Financeiros
    doc.addPage();
    doc.setFontSize(20);
    doc.text('2. Indicadores Financeiros', 14, 20);
    
    if (indicadores) {
      y = 40;
      
      // Tabela de indicadores
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Indicador', 'Valor', 'Classificação']],
        body: [
          ['Índice de Endividamento', 
           indicadores.indiceEndividamento.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 }),
           indicadores.classificacaoEndividamento],
          ['Índice de Liquidez', 
           indicadores.indiceLiquidez.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'x',
           indicadores.classificacaoLiquidez],
          ['Taxa de Poupança', 
           indicadores.taxaPoupanca.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 }),
           indicadores.classificacaoPoupanca],
          ['Cobertura de Seguros', 
           indicadores.coberturaSeguros.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'x',
           indicadores.classificacaoSeguros]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
      
      // Explicação dos indicadores
      doc.setFontSize(16);
      doc.text('Explicação dos Indicadores', 14, y); y += 10;
      doc.setFontSize(12);
      
      y = addWrappedText('Índice de Endividamento: Relação entre o total de dívidas e a renda anual. Quanto menor, melhor.', 14, y, pageWidth - 28); y += 7;
      y = addWrappedText('Índice de Liquidez: Capacidade de cobrir despesas com recursos disponíveis. Recomenda-se ter pelo menos 6x as despesas mensais em reserva.', 14, y, pageWidth - 28); y += 7;
      y = addWrappedText('Taxa de Poupança: Percentual da renda que está sendo poupado mensalmente. Recomenda-se poupar pelo menos 20% da renda.', 14, y, pageWidth - 28); y += 7;
      y = addWrappedText('Cobertura de Seguros: Relação entre o valor segurado e o patrimônio total. Indica o nível de proteção patrimonial.', 14, y, pageWidth - 28); y += 15;
    }
    
    // Planejamento Financeiro
    if (planejamento) {
      doc.addPage();
      doc.setFontSize(20);
      doc.text('3. Planejamento Financeiro', 14, 20);
      y = 40;
      
      // Perfil de Investidor
      doc.setFontSize(16);
      doc.text('Perfil de Investidor', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Perfil Recomendado: ${planejamento.investimentos.perfilRecomendado}`, 14, y); y += 15;
      
      // Reserva de Emergência
      doc.setFontSize(16);
      doc.text('Reserva de Emergência', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Valor Ideal: R$ ${planejamento.reservaEmergencia.valorIdeal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
      doc.text(`Valor Mensal para Constituição: R$ ${planejamento.reservaEmergencia.planoConstituicao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
      doc.text(`Tempo Estimado: ${planejamento.reservaEmergencia.planoConstituicao.tempoEstimadoMeses} meses`, 14, y); y += 15;
      
      // Alocação de Investimentos
      doc.setFontSize(16);
      doc.text('Alocação de Investimentos Recomendada', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Categoria', 'Percentual', 'Exemplos']],
        body: planejamento.investimentos.alocacaoRecomendada.map(alocacao => [
          alocacao.categoria,
          alocacao.percentual + '%',
          alocacao.exemplos.join(', ')
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
      
      // Aposentadoria
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Planejamento para Aposentadoria', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Idade Estimada: ${planejamento.aposentadoria.idadeEstimada} anos`, 14, y); y += 7;
      doc.text(`Renda Mensal Necessária: R$ ${planejamento.aposentadoria.valorNecessarioMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
      doc.text(`Valor Total Necessário: R$ ${planejamento.aposentadoria.valorTotalNecessario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
      doc.text(`Valor Mensal para Acumulação: R$ ${planejamento.aposentadoria.planoAcumulacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, y); y += 7;
      doc.text(`Tempo de Acumulação: ${planejamento.aposentadoria.planoAcumulacao.tempoAcumulacaoAnos} anos`, 14, y); y += 15;
      
      // Plano de Ação
      doc.addPage();
      doc.setFontSize(20);
      doc.text('4. Plano de Ação', 14, 20);
      y = 40;
      
      // Ações Imediatas
      doc.setFontSize(16);
      doc.text('Ações Imediatas (30 dias)', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Ação', 'Prazo (dias)']],
        body: planejamento.planoAcao.acoesImediatas.map(acao => [
          acao.descricao,
          acao.prazo
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
      
      // Ações de Curto Prazo
      doc.setFontSize(16);
      doc.text('Ações de Curto Prazo (1-3 meses)', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Ação', 'Prazo (dias)']],
        body: planejamento.planoAcao.acoesCurtoPrazo.map(acao => [
          acao.descricao,
          acao.prazo
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
      
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      // Ações de Médio Prazo
      doc.setFontSize(16);
      doc.text('Ações de Médio Prazo (3-12 meses)', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Ação', 'Prazo (dias)']],
        body: planejamento.planoAcao.acoesMedioPrazo.map(acao => [
          acao.descricao,
          acao.prazo
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
      
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 15;
      
      // Ações de Longo Prazo
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Ações de Longo Prazo (mais de 12 meses)', 14, y); y += 10;
      
      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Ação', 'Prazo (dias)']],
        body: planejamento.planoAcao.acoesLongoPrazo.map(acao => [
          acao.descricao,
          acao.prazo
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 153] }
      });
    }
    
    // Rodapé
    // Usando o método correto para obter o número de páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 10);
      doc.text('Sistema de Diagnóstico e Planejamento Financeiro', 14, doc.internal.pageSize.getHeight() - 10);
    }
    
    // Salvar o PDF
    const nome = diagnostico.dadosPessoais.nome ? 
      `Planejamento_Financeiro_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.pdf` : 
      'Planejamento_Financeiro.pdf';
    
    doc.save(nome);
  };

  // Função para gerar planilha de orçamento mensal
  const gerarPlanilhaOrcamento = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a planilha de receitas
    const receitasData = [
      ['Orçamento Mensal - Receitas', '', ''],
      ['', '', ''],
      ['Descrição', 'Valor Previsto (R$)', 'Valor Realizado (R$)']
    ];
    
    // Adicionar receitas existentes
    diagnostico.fontesRenda.forEach(fonte => {
      receitasData.push([fonte.descricao, fonte.valor.toString(), '']);
    });
    
    // Adicionar linhas em branco para novas receitas
    for (let i = 0; i < 5; i++) {
      receitasData.push(['', '', '']);
    }
    
    // Adicionar total
    receitasData.push([
      'TOTAL',
      diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0).toString(),
      ''
    ]);
    
    // Criar planilha de receitas
    const wsReceitas = XLSX.utils.aoa_to_sheet(receitasData);
    XLSX.utils.book_append_sheet(wb, wsReceitas, 'Receitas');
    
    // Dados para a planilha de despesas
    const despesasData = [
      ['Orçamento Mensal - Despesas', '', ''],
      ['', '', ''],
      ['Categoria', 'Descrição', 'Valor Previsto (R$)', 'Valor Realizado (R$)']
    ];
    
    // Adicionar despesas existentes
    diagnostico.despesas.forEach(despesa => {
      despesasData.push([despesa.categoria, despesa.descricao, despesa.valor.toString(), '']);
    });
    
    // Adicionar linhas em branco para novas despesas
    for (let i = 0; i < 10; i++) {
      despesasData.push(['', '', '', '']);
    }
    
    // Adicionar total
    despesasData.push([
      'TOTAL',
      '',
      diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0).toString(),
      ''
    ]);
    
    // Criar planilha de despesas
    const wsDespesas = XLSX.utils.aoa_to_sheet(despesasData);
    XLSX.utils.book_append_sheet(wb, wsDespesas, 'Despesas');
    
    // Dados para a planilha de resumo
    const resumoData = [
      ['Resumo Mensal', '', ''],
      ['', '', ''],
      ['Descrição', 'Valor Previsto (R$)', 'Valor Realizado (R$)'],
      ['Total de Receitas', diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0).toString(), ''],
      ['Total de Despesas', diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0).toString(), ''],
      ['Saldo', (diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0) - diagnostico.despesas.reduce((sum, despesa) => sum + despesa.valor, 0)).toString(), '']
    ];
    
    // Criar planilha de resumo
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
    
    // Exportar para Excel
    const nome = diagnostico.dadosPessoais.nome ? 
      `Orcamento_Mensal_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.xlsx` : 
      'Orcamento_Mensal.xlsx';
    
    XLSX.writeFile(wb, nome);
  };

  // Função para gerar planilha de controle de dívidas
  const gerarPlanilhaControleDividas = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a planilha de controle de dívidas
    const dividasData = [
      ['Controle de Dívidas', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Descrição', 'Valor Total (R$)', 'Taxa de Juros (%)', 'Parcela Mensal (R$)', 'Prazo Restante (meses)', 'Prioridade de Quitação', 'Status']
    ];
    
    // Adicionar dívidas existentes
    if (planejamento) {
      planejamento.organizacaoFinanceira.planoQuitacaoDividas.ordemQuitacao.forEach((divida, index) => {
        dividasData.push([
          divida.descricao,
          divida.valorTotal.toString(),
          divida.taxaJuros.toString(),
          divida.valorParcela.toString(),
          divida.prazoMeses.toString(),
          (index + 1).toString(),
          'Em andamento'
        ]);
      });
    } else {
      diagnostico.dividas.forEach(divida => {
        dividasData.push([
          divida.descricao,
          divida.valorTotal.toString(),
          divida.taxaJuros.toString(),
          divida.valorParcela.toString(),
          divida.prazoMeses.toString(),
          '',
          'Em andamento'
        ]);
      });
    }
    
    // Adicionar linhas em branco para novas dívidas
    for (let i = 0; i < 5; i++) {
      dividasData.push(['', '', '', '', '', '', '']);
    }
    
    // Criar planilha de controle de dívidas
    const wsDividas = XLSX.utils.aoa_to_sheet(dividasData);
    XLSX.utils.book_append_sheet(wb, wsDividas, 'Controle de Dívidas');
    
    // Exportar para Excel
    const nome = diagnostico.dadosPessoais.nome ? 
      `Controle_Dividas_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.xlsx` : 
      'Controle_Dividas.xlsx';
    
    XLSX.writeFile(wb, nome);
  };

  // Função para gerar planilha de acompanhamento de investimentos
  const gerarPlanilhaInvestimentos = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a planilha de acompanhamento de investimentos
    const investimentosData = [
      ['Acompanhamento de Investimentos', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Tipo', 'Instituição', 'Valor Inicial (R$)', 'Rentabilidade Esperada (% a.a.)', 'Valor Atual (R$)', 'Rentabilidade Real (% a.a.)']
    ];
    
    // Adicionar investimentos existentes
    diagnostico.investimentos.forEach(inv => {
      investimentosData.push([
        inv.tipo,
        inv.instituicao,
        inv.valor.toString(),
        inv.rentabilidade.toString(),
        '',
        ''
      ]);
    });
    
    // Adicionar linhas em branco para novos investimentos
    for (let i = 0; i < 10; i++) {
      investimentosData.push(['', '', '', '', '', '']);
    }
    
    // Criar planilha de acompanhamento de investimentos
    const wsInvestimentos = XLSX.utils.aoa_to_sheet(investimentosData);
    XLSX.utils.book_append_sheet(wb, wsInvestimentos, 'Investimentos');
    
    // Dados para a planilha de alocação recomendada
    if (planejamento) {
      const alocacaoData = [
        ['Alocação Recomendada', '', ''],
        ['', '', ''],
        ['Categoria', 'Percentual (%)', 'Exemplos']
      ];
      
      // Adicionar alocação recomendada
      planejamento.investimentos.alocacaoRecomendada.forEach(alocacao => {
        alocacaoData.push([
          alocacao.categoria,
          alocacao.percentual.toString(),
          alocacao.exemplos.join(', ')
        ]);
      });
      
      // Criar planilha de alocação recomendada
      const wsAlocacao = XLSX.utils.aoa_to_sheet(alocacaoData);
      XLSX.utils.book_append_sheet(wb, wsAlocacao, 'Alocação Recomendada');
    }
    
    // Exportar para Excel
    const nome = diagnostico.dadosPessoais.nome ? 
      `Acompanhamento_Investimentos_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.xlsx` : 
      'Acompanhamento_Investimentos.xlsx';
    
    XLSX.writeFile(wb, nome);
  };

  // Função para gerar planilha de monitoramento de metas
  const gerarPlanilhaMonitoramentoMetas = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a planilha de monitoramento de metas
    const metasData = [
      ['Monitoramento de Metas', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Descrição', 'Valor Necessário (R$)', 'Prazo (meses)', 'Valor Acumulado (R$)', 'Progresso (%)', 'Status']
    ];
    
    // Adicionar objetivos existentes
    diagnostico.objetivos.forEach(objetivo => {
      metasData.push([
        objetivo.descricao,
        objetivo.valor.toString(),
        objetivo.prazoMeses.toString(),
        '0',
        '0%',
        'Em andamento'
      ]);
    });
    
    // Adicionar linhas em branco para novas metas
    for (let i = 0; i < 5; i++) {
      metasData.push(['', '', '', '', '', '']);
    }
    
    // Criar planilha de monitoramento de metas
    const wsMetas = XLSX.utils.aoa_to_sheet(metasData);
    XLSX.utils.book_append_sheet(wb, wsMetas, 'Monitoramento de Metas');
    
    // Exportar para Excel
    const nome = diagnostico.dadosPessoais.nome ? 
      `Monitoramento_Metas_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.xlsx` : 
      'Monitoramento_Metas.xlsx';
    
    XLSX.writeFile(wb, nome);
  };

  // Função para gerar calendário financeiro
  const gerarCalendarioFinanceiro = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Obter mês e ano atual
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Nomes dos meses
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Criar planilhas para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const mes = (mesAtual + i) % 12;
      const ano = anoAtual + Math.floor((mesAtual + i) / 12);
      const nomeMes = `${nomesMeses[mes]} ${ano}`;
      
      // Dados para a planilha do mês
      const mesData = [
        [`Calendário Financeiro - ${nomeMes}`, '', '', ''],
        ['', '', '', ''],
        ['Data', 'Descrição', 'Valor (R$)', 'Status']
      ];
      
      // Adicionar receitas fixas
      diagnostico.fontesRenda.forEach(fonte => {
        mesData.push([
          '05', // Data padrão para recebimento
          `Receita: ${fonte.descricao}`,
          fonte.valor.toString(),
          'Pendente'
        ]);
      });
      
      // Adicionar despesas fixas
      diagnostico.despesas.filter(d => d.fixa).forEach(despesa => {
        mesData.push([
          '10', // Data padrão para pagamento
          `Despesa: ${despesa.descricao}`,
          despesa.valor.toString(),
          'Pendente'
        ]);
      });
      
      // Adicionar parcelas de dívidas
      diagnostico.dividas.forEach(divida => {
        if (i < divida.prazoMeses) {
          mesData.push([
            '15', // Data padrão para pagamento
            `Parcela: ${divida.descricao}`,
            divida.valorParcela.toString(),
            'Pendente'
          ]);
        }
      });
      
      // Adicionar linhas em branco para novos eventos
      for (let j = 0; j < 10; j++) {
        mesData.push(['', '', '', '']);
      }
      
      // Criar planilha do mês
      const wsMes = XLSX.utils.aoa_to_sheet(mesData);
      XLSX.utils.book_append_sheet(wb, wsMes, nomeMes);
    }
    
    // Exportar para Excel
    const nome = diagnostico.dadosPessoais.nome ? 
      `Calendario_Financeiro_${diagnostico.dadosPessoais.nome.replace(/\s+/g, '_')}.xlsx` : 
      'Calendario_Financeiro.xlsx';
    
    XLSX.writeFile(wb, nome);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Materiais de Apoio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="section-title">Relatório Completo</h2>
          <p className="text-gray-600 mb-6">
            Baixe o relatório completo contendo diagnóstico, planejamento e plano de ação em formato PDF.
          </p>
          
          <button 
            onClick={gerarRelatorioPDF}
            className="btn-primary w-full"
          >
            Baixar Relatório Completo (PDF)
          </button>
        </div>
        
        <div className="card">
          <h2 className="section-title">Planilhas de Apoio</h2>
          <p className="text-gray-600 mb-6">
            Baixe planilhas pré-formatadas para acompanhamento do seu planejamento financeiro.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={gerarPlanilhaOrcamento}
              className="btn-outline w-full"
            >
              Orçamento Mensal (Excel)
            </button>
            
            <button 
              onClick={gerarPlanilhaControleDividas}
              className="btn-outline w-full"
            >
              Controle de Dívidas (Excel)
            </button>
            
            <button 
              onClick={gerarPlanilhaInvestimentos}
              className="btn-outline w-full"
            >
              Acompanhamento de Investimentos (Excel)
            </button>
            
            <button 
              onClick={gerarPlanilhaMonitoramentoMetas}
              className="btn-outline w-full"
            >
              Monitoramento de Metas (Excel)
            </button>
          </div>
        </div>
      </div>
      
      <div className="card mt-8">
        <h2 className="section-title">Materiais de Monitoramento</h2>
        <p className="text-gray-600 mb-6">
          Baixe ferramentas para acompanhamento contínuo do seu planejamento financeiro.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={gerarCalendarioFinanceiro}
            className="btn-outline"
          >
            Calendário Financeiro (Excel)
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Iniciar Novo Diagnóstico
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8 text-gray-500">
        <p>Todos os dados são processados localmente e não são armazenados em servidores.</p>
        <p>Ao atualizar ou fechar esta página, todos os dados serão perdidos.</p>
      </div>
    </div>
  );
};

export default DownloadMateriais;
