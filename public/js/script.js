

 document.addEventListener('DOMContentLoaded', () => {

           
            // Armazena dados sobre protocolos, gerenciamento de estado, bibliotecas de gráficos e otimizações
            const dataStore = {
                protocols: {
                    sse: {
                        title: 'Server-Sent Events (SSE)',
                        description: 'Permite que um servidor envie atualizações em tempo real para clientes através de uma única conexão HTTP. A comunicação é <strong>unidirecional</strong> (apenas do servidor para o cliente).',
                        pros: ['Simples de implementar', 'Reconexão automática', 'Usa HTTP padrão (amigável a firewalls)'],
                        cons: ['Comunicação apenas unidirecional', 'Limites de conexões simultâneas por navegador'],
                        useCase: 'Ideal para feeds de notícias, dashboards de monitoramento, tickers de ações e notificações - cenários onde o cliente principalmente recebe dados.'
                    },
                    websockets: {
                        title: 'WebSockets',
                        description: 'Oferece comunicação <strong>full-duplex (bidirecional)</strong> e persistente entre cliente e servidor sobre uma única conexão TCP.',
                        pros: ['Comunicação bidirecional em tempo real', 'Baixa sobrecarga após o handshake inicial', 'Altamente interativo'],
                        cons: ['Mais complexo de configurar', 'Requer tratamento manual de reconexão'],
                        useCase: 'Perfeito para aplicações de chat, jogos multiplayer, ferramentas de edição colaborativa e qualquer cenário que exija interação contínua nos dois sentidos.'
                    }
                },
                stateManagement: [
                    { name: 'Context API', concept: 'Embutido no React, evita "prop drilling".', performance: 'Pode causar re-renderizações generalizadas se não otimizado.', useCase: 'Ideal para estado global simples e atualizações infrequentes.' },
                    { name: 'Redux Toolkit', concept: 'Fluxo de dados previsível e unidirecional.', performance: 'Bom com memorização (seletores), robusto para apps complexos.', useCase: 'Aplicações de grande escala com fluxos de dados complexos.' },
                    { name: 'Zustand', concept: 'Leve, baseado em hooks, com boilerplate mínimo.', performance: 'Altamente otimizado com re-renderizações seletivas.', useCase: 'Aplicações de médio a grande porte que precisam de eficiência sem a complexidade do Redux.' },
                    { name: 'Jotai', concept: 'Modelo de estado atômico com unidades pequenas e independentes.', performance: 'Excelente, com atualizações granulares (nível de átomo).', useCase: 'UIs críticas de desempenho e gráficos complexos em tempo real.' }
                ],
                chartLibraries: {
                    apexcharts: { name: 'React ApexCharts', description: '<strong>Ideal para:</strong> Dashboards interativos e aplicações de monitoramento. Oferece recursos robustos como zoom, panorâmica e rolagem, e é otimizado para lidar com grandes volumes de dados de forma confiável em tempo real.', style: { borderColor: '#008FFB', backgroundColor: 'rgba(0, 143, 251, 0.2)' } },
                    recharts: { name: 'Recharts', description: '<strong>Ideal para:</strong> Dashboards com foco na facilidade de desenvolvimento e estética limpa. Sua API declarativa baseada em componentes React torna a criação de gráficos bonita e simples para conjuntos de dados de tamanho moderado.', style: { borderColor: '#8884d8', backgroundColor: 'rgba(136, 132, 216, 0.2)' } },
                    scichart: { name: 'SciChart', description: '<strong>Ideal para:</strong> Aplicações empresariais e científicas de altíssimo desempenho. Construído para renderizar milhões ou até bilhões de pontos de dados em tempo real, é a escolha para domínios críticos como finanças e telemetria.', style: { borderColor: '#FF6600', backgroundColor: 'rgba(255, 102, 0, 0.2)' } }
                },
                 optimizations: [
                    { name: 'React.memo', description: 'Memoriza componentes funcionais para evitar re-renderizações se as suas propriedades (props) não mudaram. Essencial para componentes "puros" que são renderizados com frequência.', useCase: 'Componentes de UI estáticos ou que mudam lentamente dentro de um dashboard dinâmico.' },
                    { name: 'useMemo', description: 'Armazena em cache o resultado de cálculos caros. A função só é re-executada se uma de suas dependências mudar.', useCase: 'Filtrar ou transformar grandes conjuntos de dados para um gráfico antes de renderizá-lo.' },
                    { name: 'useCallback', description: 'Memoriza definições de funções, para que a mesma instância da função seja passada para componentes filhos, evitando que eles re-renderizem desnecessariamente.', useCase: 'Passar manipuladores de eventos para componentes filhos que são memorizados com `React.memo`.' },
                    { name: 'Virtualização', description: 'Renderiza apenas os itens visíveis em uma lista ou tabela longa. À medida que o usuário rola, novos itens são renderizados e os antigos são removidos.', useCase: 'Feeds de dados em tempo real com milhares de entradas, tabelas de logs ou qualquer lista longa.' },
                ]
            };

            // Armazena instâncias de gráficos para fácil acesso e atualização
            const chartInstances = {};
            
            // Cria uma lista de itens a partir de dados fornecidos e os insere em um elemento alvo
            const createListFromData = (items, targetElementId, itemClasses) => {
                const list = document.getElementById(targetElementId);
                list.innerHTML = '';
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.className = itemClasses;
                    li.textContent = item;
                    list.appendChild(li);
                });
            };
            
            // Exibe informações detalhadas sobre um protocolo selecionado
            const displayProtocolInfo = (protocolKey) => {
                const protocol = dataStore.protocols[protocolKey];
                const container = document.getElementById('protocol-info');
                container.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-md border border-stone-200 animate-fade-in">
                        <h3 class="font-bold text-lg mb-2 text-teal-700">${protocol.title}</h3>
                        <p class="text-stone-600 mb-4">${protocol.description}</p>
                        <h4 class="font-semibold mb-2">Prós:</h4>
                        <ul id="pros-list-${protocolKey}" class="list-disc list-inside space-y-1 text-stone-600 mb-4"></ul>
                        <h4 class="font-semibold mb-2">Contras:</h4>
                        <ul id="cons-list-${protocolKey}" class="list-disc list-inside space-y-1 text-stone-600 mb-4"></ul>
                    </div>
                    <div class="bg-teal-50 p-6 rounded-lg shadow-inner">
                        <h4 class="font-semibold mb-2 text-teal-800">Caso de Uso Ideal</h4>
                        <p class="text-teal-900">${protocol.useCase}</p>
                    </div>
                `;
                createListFromData(protocol.pros, `pros-list-${protocolKey}`, 'ml-4');
                createListFromData(protocol.cons, `cons-list-${protocolKey}`, 'ml-4');

                document.querySelectorAll('.protocol-btn').forEach(btn => {
                    btn.classList.remove('bg-teal-600', 'text-white', 'border-teal-600');
                    btn.classList.add('bg-white', 'text-stone-700', 'border-stone-300');
                    if(btn.dataset.protocol === protocolKey) {
                        btn.classList.add('bg-teal-600', 'text-white', 'border-teal-600');
                        btn.classList.remove('bg-white', 'text-stone-700', 'border-stone-300');
                    }
                });
            };

            // cartões de gerenciamento de estado com dados do dataStore
            const populateStateCards = () => {
                const container = document.getElementById('state-management-cards');
                container.innerHTML = dataStore.stateManagement.map(lib => `
                    <div class="tech-card bg-white p-6 rounded-xl shadow-lg border border-stone-200">
                        <h3 class="font-bold text-xl mb-2 text-teal-700">${lib.name}</h3>
                        <p class="text-stone-600 mb-3"><strong class="font-semibold">Conceito:</strong> ${lib.concept}</p>
                        <p class="text-stone-600 mb-3"><strong class="font-semibold">Performance:</strong> ${lib.performance}</p>
                        <p class="text-stone-600"><strong class="font-semibold">Uso Ideal:</strong> ${lib.useCase}</p>
                    </div>
                `).join('');
            };

            // lista de otimizações com dados do dataStore
            const populateOptimizationList = () => {
                const list = document.getElementById('optimization-list');
                list.innerHTML = dataStore.optimizations.map((opt, index) => `
                    <li>
                        <button data-index="${index}" class="optimization-item w-full text-left p-3 rounded-md hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
                            ${opt.name}
                        </button>
                    </li>
                `).join('');

                document.querySelectorAll('.optimization-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.currentTarget.dataset.index;
                        displayOptimizationDetails(index);
                        document.querySelectorAll('.optimization-item').forEach(b => b.classList.remove('bg-teal-100', 'text-teal-800', 'font-semibold'));
                        e.currentTarget.classList.add('bg-teal-100', 'text-teal-800', 'font-semibold');
                    });
                });
            };

            // Exibe detalhes de uma otimização selecionada
            const displayOptimizationDetails = (index) => {
                const opt = dataStore.optimizations[index];
                const container = document.getElementById('optimization-details');
                container.innerHTML = `
                    <h4 class="font-bold text-lg mb-2 text-teal-700">${opt.name}</h4>
                    <p class="text-stone-600 mb-4">${opt.description}</p>
                    <div class="bg-teal-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-teal-800 mb-1">Quando Usar:</h5>
                        <p class="text-teal-900">${opt.useCase}</p>
                    </div>
                `;
            };

            // Inicializa os gráficos usando Chart.js
            const initCharts = () => {
                const lineCtx = document.getElementById('realtime-chart').getContext('2d');
                chartInstances.line = new Chart(lineCtx, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: 30 }, (_, i) => i + 1),
                        datasets: [{
                            label: 'Tráfego (MB/s)',
                            data: Array.from({ length: 30 }, () => Math.random() * 80 + 10),
                            borderColor: '#0d9488',
                            backgroundColor: 'rgba(13, 148, 136, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, max: 100 } },
                        animation: { duration: 250 }
                    }
                });

                const doughnutCtx = document.getElementById('doughnut-chart').getContext('2d');
                chartInstances.doughnut = new Chart(doughnutCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['API Gateway', 'Serviços Web', 'Banco de Dados', 'CDN'],
                        datasets: [{
                            label: 'Distribuição',
                            data: [45, 25, 15, 15],
                            backgroundColor: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4'],
                            borderColor: '#ffffff',
                            borderWidth: 2
                        }]
                    },
                     options: { responsive: true, maintainAspectRatio: false }
                });

                updateChartLibraryStyle('apexcharts');
            };

            // Função de throttle para limitar a frequência de atualizações do gráfico
            const throttle = (func, limit) => {
                let inThrottle;
                return function() {
                    const args = arguments;
                    const context = this;
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                }
            };

           // Atualiza os dados do gráfico de linha em intervalos regulares, com suporte a throttling      
            const updateLineChartData = () => {
                const chart = chartInstances.line;
                chart.data.datasets[0].data.shift();
                chart.data.datasets[0].data.push(Math.random() * 80 + 10);
                chart.update('none');
            };

            // Throttle para limitar a frequência de atualizações do gráfico
            const throttledUpdate = throttle(updateLineChartData, 1000);

            // Inicia o intervalo de atualização do gráfico, respeitando o estado de throttling
            const startChartUpdates = () => {
                if(appState.chartUpdateInterval) clearInterval(appState.chartUpdateInterval);
                appState.chartUpdateInterval = setInterval(() => {
                    if(appState.isThrottlingEnabled) {
                        throttledUpdate();
                    } else {
                        updateLineChartData();
                    }
                }, 500); 
            };

            // Atualiza o estilo do gráfico com base na biblioteca selecionada
            const setupEventListeners = () => {
                document.querySelectorAll('.protocol-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => displayProtocolInfo(e.currentTarget.dataset.protocol));
                });
                
                const chartLibrarySelect = document.getElementById('chart-library');
                chartLibrarySelect.addEventListener('change', (e) => {
                    updateChartLibraryStyle(e.target.value);
                });

                const throttleToggle = document.getElementById('throttle-toggle');
                throttleToggle.addEventListener('click', () => {
                    appState.isThrottlingEnabled = !appState.isThrottlingEnabled;
                    throttleToggle.textContent = `Throttling: ${appState.isThrottlingEnabled ? 'Ativado' : 'Desativado'}`;
                    throttleToggle.classList.toggle('bg-green-200');
                    throttleToggle.classList.toggle('text-green-800');
                    throttleToggle.classList.toggle('bg-gray-200');
                });

                const navLinks = document.querySelectorAll('.nav-link');
                const sections = document.querySelectorAll('section');
                
                window.addEventListener('scroll', () => {
                    let current = '';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        if (pageYOffset >= sectionTop - 80) {
                            current = section.getAttribute('id');
                        }
                    });

                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').includes(current)) {
                            link.classList.add('active');
                        }
                    });
                });
            };

            // Atualiza o estilo do gráfico com base na biblioteca selecionada
            function updateChartLibraryStyle(libraryKey) {
                const library = dataStore.chartLibraries[libraryKey];
                const infoBox = document.getElementById('chart-library-info');
                infoBox.innerHTML = `<h4 class="font-semibold mb-2">${library.name}</h4><p>${library.description}</p>`;

                const chart = chartInstances.line;
                if (chart) {
                    chart.data.datasets[0].borderColor = library.style.borderColor;
                    chart.data.datasets[0].backgroundColor = library.style.backgroundColor;
                    chart.update();
                }
            }

            // Inicializa a aplicação
            displayProtocolInfo('sse');
            populateStateCards();
            populateOptimizationList();
            displayOptimizationDetails(0);
            initCharts();
            startChartUpdates();
            setupEventListeners();
        });