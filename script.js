// Inicialização de componentes Bootstrap e lógica da aplicação
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Navegação entre Abas do Formulário
    const formTabs = document.querySelectorAll('#formTabs button[data-bs-toggle="tab"]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const form = document.getElementById('calculadoraForm');

    function showTab(targetTabId) {
        formTabs.forEach(tab => {
            const tabPaneId = tab.getAttribute('data-bs-target');
            const tabPane = document.querySelector(tabPaneId);
            if (tab.getAttribute('data-bs-target') === targetTabId) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                if (tabPane) tabPane.classList.add('show', 'active');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
                if (tabPane) tabPane.classList.remove('show', 'active');
            }
        });
    }

    // Botões de Navegação Próximo/Anterior
    document.getElementById('btnProximoFinanciamento')?.addEventListener('click', () => showTab('#financiamento'));
    document.getElementById('btnVoltarImovel')?.addEventListener('click', () => showTab('#imovel'));
    document.getElementById('btnProximoComprador')?.addEventListener('click', () => showTab('#comprador'));
    document.getElementById('btnVoltarFinanciamento')?.addEventListener('click', () => showTab('#financiamento'));
    document.getElementById('btnProximoCustos')?.addEventListener('click', () => showTab('#custos'));
    document.getElementById('btnVoltarComprador')?.addEventListener('click', () => showTab('#comprador'));

    // Lógica para exibir/ocultar opções do FGTS
    const usarFgtsSelect = document.getElementById('usarFgts');
    const fgtsOptionsDiv = document.getElementById('fgtsOptions');
    usarFgtsSelect?.addEventListener('change', function () {
        if (this.value === 'sim') {
            fgtsOptionsDiv.style.display = 'block';
        } else {
            fgtsOptionsDiv.style.display = 'none';
        }
    });

    // Atualizar dinamicamente o 'Valor a ser financiado'
    const valorImovelInput = document.getElementById('valorImovel');
    const valorEntradaInput = document.getElementById('valorEntrada');
    const valorFinanciadoSpan = document.getElementById('valorFinanciado');

    function atualizarValorFinanciado() {
        const valorImovel = parseFloat(valorImovelInput.value) || 0;
        const valorEntrada = parseFloat(valorEntradaInput.value) || 0;
        const financiado = valorImovel - valorEntrada;
        valorFinanciadoSpan.textContent = `R$ ${financiado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    valorImovelInput?.addEventListener('input', atualizarValorFinanciado);
    valorEntradaInput?.addEventListener('input', atualizarValorFinanciado);
    atualizarValorFinanciado(); // Inicializa ao carregar

    // Botão Calcular (Simulação de exibição de resultados)
    const btnCalcular = document.getElementById('btnCalcular');
    const resultadosCard = document.getElementById('resultadosCard');
    const memoriaCalculoCard = document.getElementById('memoriaCalculoCard');
    const graficosCard = document.getElementById('graficosCard');
    const cenariosCard = document.getElementById('cenariosCard');
    const analiseCard = document.getElementById('analiseCard');
    const ferramentasCard = document.getElementById('ferramentasCard');
    const glossarioCard = document.getElementById('glossarioCard');

    btnCalcular?.addEventListener('click', function (event) {
        event.preventDefault(); // Previne o envio do formulário
        // Validação básica (exemplo)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Simula o cálculo e exibe as seções de resultado
        console.log('Simulando cálculo...');
        // Aqui entraria a lógica de cálculo real
        
        // Exibe os cards de resultado
        resultadosCard.style.display = 'block';
        memoriaCalculoCard.style.display = 'block';
        graficosCard.style.display = 'block';
        cenariosCard.style.display = 'block'; // Mostrar gerenciador de cenários
        analiseCard.style.display = 'block'; // Mostrar análise
        ferramentasCard.style.display = 'block'; // Mostrar ferramentas adicionais
        glossarioCard.style.display = 'block'; // Mostrar glossário
        
        // Rola a página para os resultados
        resultadosCard.scrollIntoView({ behavior: 'smooth' });
        
        // Placeholder para preencher resultados (a ser implementado com a lógica real)
        document.getElementById('resultadoValorFinanciado').textContent = valorFinanciadoSpan.textContent;
        document.getElementById('resultadoPrimeiraPrestacao').textContent = 'R$ 1.500,00 (Exemplo)';
        document.getElementById('resultadoTotalJuros').textContent = 'R$ 250.000,00 (Exemplo)';
        document.getElementById('resultadoTotalSeguros').textContent = 'R$ 15.000,00 (Exemplo)';
        document.getElementById('resultadoCET').textContent = '10.50% a.a. (Exemplo)';
        document.getElementById('resultadoComprometimento').textContent = '25.00% (Exemplo)';
        document.getElementById('resultadoValorFinal').textContent = 'R$ 515.000,00 (Exemplo)';
        document.getElementById('resultadoPrazoTotal').textContent = document.getElementById('prazoFinanciamento').value + ' meses';
        
        // Placeholder para tabela e gráficos (requer implementação com Chart.js e lógica de cálculo)
        document.getElementById('tabelaMemoriaCalculoBody').innerHTML = '<tr><td colspan="9" class="text-center">Dados da tabela de memória de cálculo seriam carregados aqui.</td></tr>';
        document.getElementById('paginacaoTabela').innerHTML = ''; // Limpa paginação
        // Inicializar gráficos aqui...
    });

    // Botão Novo Cálculo
    const btnNovoCalculo = document.getElementById('btnNovoCalculo');
    btnNovoCalculo?.addEventListener('click', function() {
        form.reset(); // Limpa o formulário
        atualizarValorFinanciado(); // Reseta o valor financiado
        showTab('#imovel'); // Volta para a primeira aba
        // Oculta os cards de resultado
        resultadosCard.style.display = 'none';
        memoriaCalculoCard.style.display = 'none';
        graficosCard.style.display = 'none';
        cenariosCard.style.display = 'none';
        analiseCard.style.display = 'none';
        ferramentasCard.style.display = 'none';
        glossarioCard.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
    });

    // Lógica do Tema Escuro/Claro
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="bi bi-sun"></i> Tema Claro';
    } else {
        themeToggle.innerHTML = '<i class="bi bi-moon"></i> Tema Escuro';
    }

    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        let theme = 'light';
        if (body.classList.contains('dark-mode')) {
            theme = 'dark';
            themeToggle.innerHTML = '<i class="bi bi-sun"></i> Tema Claro';
        } else {
            themeToggle.innerHTML = '<i class="bi bi-moon"></i> Tema Escuro';
        }
        localStorage.setItem('theme', theme);
    });
    
    // Lógica para Salvar Cenário (Modal e localStorage)
    const btnSalvarCenario = document.getElementById('btnSalvarCenario');
    const btnConfirmarSalvarCenario = document.getElementById('btnConfirmarSalvarCenario');
    const nomeCenarioInput = document.getElementById('nomeCenario');
    const salvarCenarioModal = new bootstrap.Modal(document.getElementById('salvarCenarioModal'));

    btnConfirmarSalvarCenario?.addEventListener('click', () => {
        const nome = nomeCenarioInput.value.trim();
        if (!nome) {
            alert('Por favor, insira um nome para o cenário.');
            return;
        }
        
        // Coleta os dados do formulário (exemplo simplificado)
        const dadosCenario = {
            nome: nome,
            valorImovel: document.getElementById('valorImovel').value,
            valorEntrada: document.getElementById('valorEntrada').value,
            sistemaAmortizacao: document.getElementById('sistemaAmortizacao').value,
            taxaJuros: document.getElementById('taxaJuros').value,
            prazoFinanciamento: document.getElementById('prazoFinanciamento').value,
            // Adicionar outros campos relevantes aqui...
            // Resultados (exemplo)
            valorFinanciado: document.getElementById('resultadoValorFinanciado').textContent,
            primeiraPrestacao: document.getElementById('resultadoPrimeiraPrestacao').textContent,
            valorFinal: document.getElementById('resultadoValorFinal').textContent
        };
        
        salvarCenarioNoLocalStorage(dadosCenario);
        nomeCenarioInput.value = ''; // Limpa o campo
        salvarCenarioModal.hide();
        alert('Cenário salvo com sucesso!');
        atualizarListaCenarios(); // Atualiza a tabela de cenários salvos
    });

    function salvarCenarioNoLocalStorage(cenario) {
        let cenariosSalvos = JSON.parse(localStorage.getItem('cenariosSalvos') || '[]');
        cenario.id = Date.now(); // Adiciona um ID único
        cenariosSalvos.push(cenario);
        localStorage.setItem('cenariosSalvos', JSON.stringify(cenariosSalvos));
    }

    function carregarCenariosDoLocalStorage() {
        return JSON.parse(localStorage.getItem('cenariosSalvos') || '[]');
    }

    function atualizarListaCenarios() {
        const cenarios = carregarCenariosDoLocalStorage();
        const tabelaBody = document.getElementById('tabelaCenariosBody');
        const checkboxesDiv = document.getElementById('checkboxesCenarios');
        const btnComparar = document.getElementById('btnCompararCenarios');
        
        tabelaBody.innerHTML = ''; // Limpa a tabela
        checkboxesDiv.innerHTML = ''; // Limpa checkboxes

        if (cenarios.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum cenário salvo.</td></tr>';
            checkboxesDiv.innerHTML = '<div class="alert alert-info"><p>Salve pelo menos dois cenários para habilitar a comparação.</p></div>';
            btnComparar.disabled = true;
        } else {
            cenarios.forEach((cenario, index) => {
                const row = `
                    <tr>
                        <td>${cenario.nome}</td>
                        <td>${cenario.valorFinanciado || 'N/A'}</td>
                        <td>${cenario.sistemaAmortizacao?.toUpperCase() || 'N/A'}</td>
                        <td>${cenario.prazoFinanciamento || 'N/A'} meses</td>
                        <td>${cenario.taxaJuros || 'N/A'}%</td>
                        <td>${cenario.primeiraPrestacao || 'N/A'}</td>
                        <td>${cenario.valorFinal || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="carregarCenario(${cenario.id})"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="excluirCenario(${cenario.id})"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
                tabelaBody.innerHTML += row;

                // Adiciona checkbox para comparação
                const checkbox = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${cenario.id}" id="compararCenario${cenario.id}">
                        <label class="form-check-label" for="compararCenario${cenario.id}">
                            ${cenario.nome}
                        </label>
                    </div>
                `;
                checkboxesDiv.innerHTML += checkbox;
            });
            
            // Habilita botão de comparar se houver 2+ cenários
            btnComparar.disabled = cenarios.length < 2;
        }
    }

    // Funções globais para botões na tabela de cenários (precisam estar no escopo global ou usar event delegation)
    window.carregarCenario = function(id) {
        const cenarios = carregarCenariosDoLocalStorage();
        const cenario = cenarios.find(c => c.id === id);
        if (cenario) {
            // Preenche o formulário com os dados do cenário (simplificado)
            document.getElementById('valorImovel').value = cenario.valorImovel || '';
            document.getElementById('valorEntrada').value = cenario.valorEntrada || '';
            document.getElementById('sistemaAmortizacao').value = cenario.sistemaAmortizacao || 'sac';
            document.getElementById('taxaJuros').value = cenario.taxaJuros || '';
            document.getElementById('prazoFinanciamento').value = cenario.prazoFinanciamento || '';
            // Adicionar outros campos...
            
            alert(`Cenário '${cenario.nome}' carregado no formulário.`);
            // O ideal seria recalcular e mostrar os resultados, mas por ora só preenchemos
            showTab('#imovel');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    window.excluirCenario = function(id) {
        if (confirm('Tem certeza que deseja excluir este cenário?')) {
            let cenarios = carregarCenariosDoLocalStorage();
            cenarios = cenarios.filter(c => c.id !== id);
            localStorage.setItem('cenariosSalvos', JSON.stringify(cenarios));
            atualizarListaCenarios();
            alert('Cenário excluído.');
        }
    }

    // Inicializa a lista de cenários ao carregar a página
    atualizarListaCenarios();

    // TODO: Implementar lógica para Exportar/Importar Cenários (JSON)
    // TODO: Implementar lógica para Exportar PDF/CSV
    // TODO: Implementar lógica para Gráficos (Chart.js)
    // TODO: Implementar lógica para Análise Comparativa
    // TODO: Implementar lógica para Ferramentas Adicionais (Amortização, Portabilidade, Capacidade)
    // TODO: Implementar cálculos financeiros reais (SAC, Price, SACRE, Seguros, Correção, CET)
});

