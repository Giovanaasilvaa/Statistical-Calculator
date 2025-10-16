let chart = null;

// MENU DE ESCOLHA
function selecionarModo(modo) {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("tabelaClassesContainer").classList.add("hidden");
    limparGrafico();
    limparMensagensErro();
    
    document.getElementById("entradaSimples").classList.add("hidden");
    document.getElementById("entradaClasses").classList.add("hidden");
    
    if (modo === "simples") {
        document.getElementById("entradaSimples").classList.remove("hidden");
        document.getElementById("tabelaSimples").innerHTML = "";
        for (let i = 0; i < 3; i++) adicionarLinhaSimples();
    } else {
        document.getElementById("entradaClasses").classList.remove("hidden");
        document.getElementById("tabelaClasses").innerHTML = "";
        for (let i = 0; i < 3; i++) adicionarLinhaClasse();
    }
}

function voltarMenu() {
    document.getElementById("entradaSimples").classList.add("hidden");
    document.getElementById("entradaClasses").classList.add("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("tabelaClassesContainer").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    limparGrafico();
    limparMensagensErro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparMensagensErro() {
    const erros = document.querySelectorAll('.erro');
    erros.forEach(erro => erro.remove());
}

function mostrarErro(mensagem, elementoPai) {
    const erro = document.createElement('div');
    erro.className = 'erro';
    erro.textContent = mensagem;
    elementoPai.insertBefore(erro, elementoPai.firstChild);
}

function scrollParaResultados() {
    setTimeout(() => {
        const resultados = document.getElementById("resultados");
        if (resultados) {
            resultados.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 100);
}

// --------- DADOS SIMPLES ---------
function adicionarLinhaSimples() {
    const tbody = document.getElementById("tabelaSimples");
    const tr = document.createElement("tr");
    const id = Date.now() + Math.random();
    
    tr.innerHTML = `
        <td><input type="number" step="any" id="valor-${id}" placeholder="Ex: 10.5"></td>
        <td><input type="number" min="1" step="1" value="1" id="freq-${id}" placeholder="Ex: 5"></td>
        <td><button onclick="removerLinha(this)" class="btn-remove" title="Remover linha">🗑️</button></td>
    `;
    tbody.appendChild(tr);
}

function removerLinha(botao) {
    const tr = botao.closest('tr');
    if (tr && tr.parentElement.children.length > 1) {
        tr.remove();
    } else {
        alert("É necessário ter pelo menos uma linha de dados.");
    }
}

function validarDadosSimples() {
    const linhas = document.querySelectorAll("#tabelaSimples tr");
    let dadosValidos = true;
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        const valor = inputs[0];
        const freq = inputs[1];
        const v = parseFloat(valor.value);
        const f = parseInt(freq.value);
        
        if (isNaN(v) || isNaN(f) || f < 0) {
            dadosValidos = false;
            valor.style.borderColor = "#e74c3c";
            freq.style.borderColor = "#e74c3c";
        } else {
            valor.style.borderColor = "";
            freq.style.borderColor = "";
        }
    });
    
    return dadosValidos;
}

function calcularSimples() {
    limparMensagensErro();
    
    if (!validarDadosSimples()) {
        mostrarErro("Preencha todos os campos corretamente. Valores devem ser números e frequências devem ser inteiros positivos.", 
                   document.getElementById("entradaSimples"));
        return;
    }
    
    const linhas = document.querySelectorAll("#tabelaSimples tr");
    const dados = [];
    const valoresUnicos = [];
    const frequencias = [];
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        const v = parseFloat(inputs[0].value);
        const f = parseInt(inputs[1].value);
        
        valoresUnicos.push(v);
        frequencias.push(f);
        
        for (let i = 0; i < f; i++) dados.push(v);
    });
    
    if (dados.length === 0) {
        mostrarErro("Nenhum dado válido encontrado.", document.getElementById("entradaSimples"));
        return;
    }
    
    calcularEstatisticas(dados, valoresUnicos, frequencias);
    gerarGraficoFrequencia(valoresUnicos, frequencias);
    scrollParaResultados();
}

// --------- DADOS POR CLASSES ---------
function adicionarLinhaClasse() {
    const tbody = document.getElementById("tabelaClasses");
    const tr = document.createElement("tr");
    const id = Date.now() + Math.random();
    
    tr.innerHTML = `
        <td><input type="number" step="any" id="li-${id}" placeholder="Ex: 0"></td>
        <td><input type="number" step="any" id="ls-${id}" placeholder="Ex: 10"></td>
        <td><input type="number" min="1" step="1" value="1" id="freq-${id}" placeholder="Ex: 8"></td>
        <td><button onclick="removerLinha(this)" class="btn-remove" title="Remover linha">🗑️</button></td>
    `;
    tbody.appendChild(tr);
}

function validarDadosClasses() {
    const linhas = document.querySelectorAll("#tabelaClasses tr");
    let dadosValidos = true;
    let limiteAnterior = null;
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        const li = inputs[0];
        const ls = inputs[1];
        const freq = inputs[2];
        const inf = parseFloat(li.value);
        const sup = parseFloat(ls.value);
        const f = parseInt(freq.value);
        
        if (isNaN(inf) || isNaN(sup) || isNaN(f) || inf >= sup || f < 0) {
            dadosValidos = false;
            li.style.borderColor = "#e74c3c";
            ls.style.borderColor = "#e74c3c";
            freq.style.borderColor = "#e74c3c";
        } else {
            li.style.borderColor = "";
            ls.style.borderColor = "";
            freq.style.borderColor = "";
        }
        
        if (limiteAnterior !== null && inf < limiteAnterior) {
            dadosValidos = false;
            li.style.borderColor = "#e74c3c";
            mostrarErro("Os intervalos de classe devem estar em ordem crescente e não podem se sobrepor.", 
                       document.getElementById("entradaClasses"));
        }
        
        limiteAnterior = sup;
    });
    
    return dadosValidos;
}

function calcularClasses() {
    limparMensagensErro();
    
    if (!validarDadosClasses()) {
        mostrarErro("Preencha todos os campos corretamente. Verifique se os intervalos são válidos e as frequências são positivas.", 
                   document.getElementById("entradaClasses"));
        return;
    }
    
    const linhas = document.querySelectorAll("#tabelaClasses tr");
    const classes = [];
    let totalFreq = 0;
    
    linhas.forEach(linha => {
        const inputs = linha.querySelectorAll("input");
        const inf = parseFloat(inputs[0].value);
        const sup = parseFloat(inputs[1].value);
        const f = parseInt(inputs[2].value);
        
        const pontoMedio = (inf + sup) / 2;
        classes.push({ 
            inf, 
            sup, 
            freq: f, 
            pm: pontoMedio
        });
        totalFreq += f;
    });
    
    if (classes.length === 0) {
        mostrarErro("Nenhum dado válido encontrado.", document.getElementById("entradaClasses"));
        return;
    }
    
    calcularEstatisticasClasses(classes, totalFreq);
    scrollParaResultados();
}

function calcularEstatisticasClasses(classes, totalFreq) {
    let somaPonderada = 0;
    let variancia = 0;
    let modaClasse = classes[0];
    
    classes.forEach(classe => {
        somaPonderada += classe.pm * classe.freq;
        if (classe.freq > modaClasse.freq) {
            modaClasse = classe;
        }
    });
    
    const media = somaPonderada / totalFreq;
    
    let freqAcumulada = 0;
    let medianaClasse = null;
    let mediana = 0;
    
    for (let i = 0; i < classes.length; i++) {
        freqAcumulada += classes[i].freq;
        if (freqAcumulada >= totalFreq / 2 && !medianaClasse) {
            medianaClasse = classes[i];
            const freqAnt = freqAcumulada - classes[i].freq;
            const ampClasse = classes[i].sup - classes[i].inf;
            mediana = classes[i].inf + ((totalFreq/2 - freqAnt) / classes[i].freq) * ampClasse;
            break;
        }
    }
    
    classes.forEach(classe => {
        variancia += classe.freq * Math.pow(classe.pm - media, 2);
    });
    variancia /= totalFreq;
    
    const desvioPadrao = Math.sqrt(variancia);
    const coeficienteVariacao = (desvioPadrao / media) * 100;
    
    const indexModa = classes.findIndex(c => c.freq === modaClasse.freq);
    let moda = modaClasse.pm;
    
    if (indexModa > 0 && indexModa < classes.length - 1) {
        const d1 = classes[indexModa].freq - classes[indexModa - 1].freq;
        const d2 = classes[indexModa].freq - classes[indexModa + 1].freq;
        const ampClasseModa = classes[indexModa].sup - classes[indexModa].inf;
        moda = classes[indexModa].inf + (d1 / (d1 + d2)) * ampClasseModa;
    }
    
    mostrarResultados(media, mediana, moda, desvioPadrao, variancia, coeficienteVariacao, totalFreq);
    gerarHistograma(classes);
}

// --------- CÁLCULO ESTATÍSTICO (para dados simples) ---------
function calcularEstatisticas(dados, valoresUnicos, frequencias) {
    const n = dados.length;
    
    const media = dados.reduce((a, b) => a + b, 0) / n;
    
    const sorted = [...dados].sort((a, b) => a - b);
    const meio = Math.floor(n / 2);
    const mediana = n % 2 === 0 ? (sorted[meio - 1] + sorted[meio]) / 2 : sorted[meio];
    
    const frequenciaMap = {};
    dados.forEach(valor => {
        frequenciaMap[valor] = (frequenciaMap[valor] || 0) + 1;
    });
    
    let moda = [];
    let maxFreq = 0;
    
    for (const valor in frequenciaMap) {
        if (frequenciaMap[valor] > maxFreq) {
            moda = [parseFloat(valor)];
            maxFreq = frequenciaMap[valor];
        } else if (frequenciaMap[valor] === maxFreq) {
            moda.push(parseFloat(valor));
        }
    }
    
    const variancia = dados.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / n;
    const desvioPadrao = Math.sqrt(variancia);
    const coeficienteVariacao = (desvioPadrao / media) * 100;
    
    mostrarResultados(media, mediana, moda.join(', '), desvioPadrao, variancia, coeficienteVariacao, n);
}

// --------- RESULTADOS E GRÁFICO ---------
function mostrarResultados(media, mediana, moda, desvio, variancia, coeficiente, total) {
    document.getElementById("media").textContent = media.toFixed(4);
    document.getElementById("mediana").textContent = mediana.toFixed(4);
    document.getElementById("moda").textContent = moda;
    document.getElementById("desvio").textContent = desvio.toFixed(4);
    document.getElementById("variancia").textContent = variancia.toFixed(4);
    document.getElementById("coeficiente").textContent = coeficiente.toFixed(2) + '%';
    document.getElementById("total").textContent = total;
    document.getElementById("resultados").classList.remove("hidden");
}

function limparGrafico() {
    if (chart) {
        chart.destroy();
        chart = null;
    }
}

// Gráfico de barras para dados simples 
function gerarGraficoFrequencia(valores, frequencias) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    const total = frequencias.reduce((a, b) => a + b, 0);
    // garantir números (não strings)
    const frequenciasRelativas = frequencias.map(freq => Number(((freq / total) * 100).toFixed(1)));
    const maxFreq = Math.max(...frequencias);

    const dadosOrdenados = valores.map((v, i) => ({ valor: v, freq: frequencias[i] }))
        .sort((a, b) => a.valor - b.valor);

    const valoresOrdenados = dadosOrdenados.map(d => d.valor);
    const frequenciasOrdenadas = dadosOrdenados.map(d => d.freq);
    const frequenciasRelativasOrdenadas = dadosOrdenados.map(d => Number(((d.freq / total) * 100).toFixed(1)));

    // arrays de cores por barra
    const barBg = frequenciasOrdenadas.map(freq => freq === maxFreq ? 'rgba(231, 76, 60, 0.9)' : 'rgba(67, 97, 238, 0.8)');
    const barBorder = frequenciasOrdenadas.map(freq => freq === maxFreq ? 'rgba(231, 76, 60, 1)' : 'rgba(67, 97, 238, 1)');

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: valoresOrdenados.map(v => {
                const num = parseFloat(v);
                return num % 1 === 0 ? num.toString() : num.toFixed(2);
            }),
            datasets: [{
                label: "Frequência Absoluta (fᵢ)",
                data: frequenciasOrdenadas,
                backgroundColor: barBg,
                borderColor: barBorder,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }, {
                label: "Frequência Relativa (%)",
                data: frequenciasRelativasOrdenadas,
                type: 'line',
                borderColor: 'rgba(240, 101, 149, 1)',
                backgroundColor: 'rgba(240, 101, 149, 0.1)',
                borderWidth: 3,
                // garantir que os pontos tenham cor explícita (array ou string)
                pointBackgroundColor: frequenciasOrdenadas.map(freq => freq === 0 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(240, 101, 149, 1)'),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: frequenciasOrdenadas.map(freq => freq === 0 ? 3 : 6),
                pointHoverRadius: 8,
                tension: 0.2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Frequência - Valores Individuais',
                    font: { 
                        size: 18,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: { bottom: 20 },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#2c3e50',
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: {
                        size: 13,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 12,
                    cornerRadius: 8,
                    usePointStyle: true,
                    boxPadding: 6,
                    callbacks: {
                        title: function(tooltipItems) {
                            const valor = parseFloat(valoresOrdenados[tooltipItems[0].dataIndex]);
                            return `Valor: ${valor % 1 === 0 ? valor : valor.toFixed(2)}`;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataset.type === 'line') {
                                return `${label}: ${value}%`;
                            }
                            return `${label}: ${value}`;
                        },
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const freq = context.parsed.y;
                                const percent = ((freq / total) * 100).toFixed(1);
                                return `Frequência Relativa: ${percent}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência Absoluta (fᵢ)',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#4361ee'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: true
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        precision: 0
                    },
                    suggestedMax: maxFreq * 1.15
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Frequência Relativa (%)',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#f06595'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    max: 100
                },
                x: {
                    title: {
                        display: true,
                        text: 'Valores (xᵢ)',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                bar: {
                    backgroundColor: function(context) {
                        const index = context.dataIndex;
                        if (frequenciasOrdenadas[index] === maxFreq) {
                            return 'rgba(231, 76, 60, 0.9)';
                        }
                        return 'rgba(67, 97, 238, 0.8)';
                    },
                    borderColor: function(context) {
                        const index = context.dataIndex;
                        if (frequenciasOrdenadas[index] === maxFreq) {
                            return 'rgba(231, 76, 60, 1)';
                        }
                        return 'rgba(67, 97, 238, 1)';
                    }
                }
            }
        }
    });
}

// HISTOGRAMA 
function gerarHistograma(classes) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    classes.sort((a, b) => a.inf - b.inf);

    const classesCompletas = adicionarClassesVazias(classes);
    
    const totalFreq = classesCompletas.reduce((sum, classe) => sum + classe.freq, 0);
    // garantir números (não strings)
    const frequenciasRelativas = classesCompletas.map(classe => Number(((classe.freq / totalFreq) * 100).toFixed(1)));
    const maxFreq = Math.max(...classesCompletas.map(c => c.freq));

    const classeModal = classesCompletas.reduce((prev, current) => 
        (prev.freq > current.freq) ? prev : current
    );

    // arrays de cores por barra/ponto
    const barBgColors = classesCompletas.map(c => {
        if (c.freq === classeModal.freq && c.freq > 0) return 'rgba(63, 231, 60, 0.9)';
        if (c.freq === 0) return 'rgba(67, 97, 238, 0.8)';
        return 'rgba(67, 97, 238, 0.8)';
    });
    const barBorderColors = classesCompletas.map(c => {
        if (c.freq === classeModal.freq && c.freq > 0) return 'rgba(63, 231, 60, 0.9)';
        if (c.freq === 0) return 'rgba(240, 200, 200, 0.5)';
        return 'rgba(67, 97, 238, 1)';
    });
    const linePointColors = classesCompletas.map(c => c.freq === 0 ? 'rgba(240, 101, 149, 1)' : 'rgba(240, 101, 149, 1)');
    const linePointRadius = classesCompletas.map(c => c.freq === 0 ? 3 : 6);

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classesCompletas.map((c, index) => {
                return `[${c.inf.toFixed(2)} - ${c.sup.toFixed(2)})`;
            }),
            datasets: [{
                label: 'Frequência Absoluta (fᵢ)',
                data: classesCompletas.map(c => c.freq),
                backgroundColor: barBgColors,
                borderColor: barBorderColors,
                borderWidth: 0,
                barThickness: 'flex',
                categoryPercentage: 1.0,
                barPercentage: 1.0
            }, {
                label: 'Frequência Relativa (%)',
                data: frequenciasRelativas,
                type: 'line',
                borderColor: 'rgba(240, 101, 149, 1)',
                backgroundColor: 'rgba(240, 101, 149, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: linePointColors,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: linePointRadius,
                pointHoverRadius: 8,
                tension: 0.3,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Histograma - Distribuição por Classes',
                    font: { 
                        size: 18,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: { bottom: 20 },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#2c3e50'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    cornerRadius: 8,
                    usePointStyle: true,
                    callbacks: {
                        title: function(tooltipItems) {
                            const classe = classesCompletas[tooltipItems[0].dataIndex];
                            return `Classe: [${classe.inf.toFixed(2)} - ${classe.sup.toFixed(2)})`;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataset.type === 'line') {
                                return `${label}: ${value}%`;
                            }
                            return `${label}: ${value}`;
                        },
                        afterLabel: function(context) {
                            const classe = classesCompletas[context.dataIndex];
                            const info = [];
                            
                            if (context.datasetIndex === 0) {
                                const percent = ((classe.freq / totalFreq) * 100).toFixed(1);
                                info.push(`Frequência relativa: ${percent}%`);
                            }
                            
                            info.push(`Ponto médio: ${((classe.inf + classe.sup) / 2).toFixed(2)}`);
                            info.push(`Amplitude: ${(classe.sup - classe.inf).toFixed(2)}`);
                            
                            if (classe.freq === classeModal.freq && classe.freq > 0) {
                                info.push('⭐ Classe modal');
                            }
                            
                            return info;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Intervalos de Classe',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    offset: false,
                    grid: {
                        offset: false,
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência Absoluta (fᵢ)',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#4361ee'
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    suggestedMax: maxFreq * 1.15
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Frequência Relativa (%)',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#f06595'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    max: 100
                }
            },
            elements: {
                bar: {
                    borderWidth: 0,
                    borderSkipped: false,
                    borderRadius: 0
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    gerarTabelaClassesABNT(classesCompletas, totalFreq);
}

// Função para adicionar classes vazias antes e depois
function adicionarClassesVazias(classes) {
    if (classes.length === 0) return classes;

    const classesCompletas = [...classes];
    const amplitude = classes[0].sup - classes[0].inf;
    
    const primeiraClasse = classes[0];
    if (primeiraClasse.inf > 0 || primeiraClasse.inf < 0) {
        const classeAnterior = {
            inf: primeiraClasse.inf - amplitude,
            sup: primeiraClasse.inf,
            freq: 0,
            pm: (primeiraClasse.inf - amplitude + primeiraClasse.inf) / 2
        };
        classesCompletas.unshift(classeAnterior);
    }
    
    const ultimaClasse = classes[classes.length - 1];
    const classePosterior = {
        inf: ultimaClasse.sup,
        sup: ultimaClasse.sup + amplitude,
        freq: 0,
        pm: (ultimaClasse.sup + ultimaClasse.sup + amplitude) / 2
    };
    classesCompletas.push(classePosterior);
    
    return classesCompletas;
}

// Função para gerar tabela para classes
function gerarTabelaClassesABNT(classes, totalFreq) {
    const container = document.getElementById("tabelaClassesContainer");
    const tbody = document.getElementById("tabela-classes-body");
    const amplitudeElement = document.getElementById("amplitude-classes");
    
    container.classList.remove("hidden");
    
    let freqAcumulada = 0;
    const dadosCompletos = classes.map((classe, index) => {
        freqAcumulada += classe.freq;
        const freqRel = (classe.freq / totalFreq) * 100;
        const freqRelAcum = (freqAcumulada / totalFreq) * 100;
        
        return {
            ...classe,
            i: index + 1,
            intervalo: `[${classe.inf.toFixed(2)} - ${classe.sup.toFixed(2)})`,
            pontoMedio: (classe.inf + classe.sup) / 2,
            freqAcum: freqAcumulada,
            freqRel: freqRel,
            freqRelAcum: freqRelAcum
        };
    });

    tbody.innerHTML = '';

    dadosCompletos.forEach(dado => {
        const tr = document.createElement('tr');
        if (dado.freq === 0) {
            tr.classList.add('classe-vazia');
        }
        
        tr.innerHTML = `
            <td class="text-center bordered">${dado.i}</td>
            <td class="text-center bordered">${dado.intervalo}</td>
            <td class="text-center bordered">${dado.pontoMedio.toFixed(2)}</td>
            <td class="text-center bordered">${dado.freq}</td>
            <td class="text-center bordered">${dado.freqRel.toFixed(2)}</td>
            <td class="text-center bordered">${dado.freqRelAcum.toFixed(2)}</td>
            <td class="text-center bordered">${dado.freqAcum}</td>
            <td class="text-center bordered">${((dado.freqAcum / totalFreq) * 100).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('total-row');
    trTotal.innerHTML = `
        <td class="text-center bordered" colspan="3"><strong>Total</strong></td>
        <td class="text-center bordered"><strong>${totalFreq}</strong></td>
        <td class="text-center bordered"><strong>100.00</strong></td>
        <td class="text-center bordered"><strong>-</strong></td>
        <td class="text-center bordered"><strong>-</strong></td>
        <td class="text-center bordered"><strong>100.00</strong></td>
    `;
    tbody.appendChild(trTotal);

    if (classes.length > 0) {
        amplitudeElement.textContent = (classes[0].sup - classes[0].inf).toFixed(2);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const tr = activeElement.closest('tr');
                if (tr && tr.nextElementSibling === null) {
                    if (tr.closest('#tabelaSimples')) {
                        adicionarLinhaSimples();
                    } else if (tr.closest('#tabelaClasses')) {
                        adicionarLinhaClasse();
                    }
                }
            }
        }
    });
});

// Função para otimizar o gráfico para dispositivos móveis
function otimizarGraficoParaMobile() {
    const isMobile = window.innerWidth <= 768;
    const graficoContainer = document.querySelector('.grafico-container');
    
    if (isMobile && graficoContainer) {
        // Ajusta a altura do container do gráfico
        graficoContainer.style.height = '300px';
        
        // Se o gráfico já foi criado, ajusta suas configurações
        if (chart) {
            // Ajusta o tamanho da fonte dos labels para mobile
            chart.options.plugins.title.font.size = 16;
            chart.options.plugins.legend.labels.font.size = 10;
            
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.font.size = 9;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.font.size = 9;
            }
            if (chart.options.scales.y1) {
                chart.options.scales.y1.ticks.font.size = 9;
            }
            
            // Atualiza o gráfico
            chart.update();
        }
    }
}

// Função para detectar orientação e ajustar o layout
function ajustarLayoutParaOrientacao() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const graficoContainer = document.querySelector('.grafico-container');
    
    if (isLandscape && window.innerWidth <= 768 && graficoContainer) {
        graficoContainer.style.height = '250px';
    }
}

// Executa as otimizações ao carregar e ao redimensionar a janela
window.addEventListener('load', function() {
    otimizarGraficoParaMobile();
    ajustarLayoutParaOrientacao();
});

window.addEventListener('resize', function() {
    otimizarGraficoParaMobile();
    ajustarLayoutParaOrientacao();
});

// Modifique a função gerarGraficoFrequencia para incluir otimizações mobile
function gerarGraficoFrequencia(valores, frequencias) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    const total = frequencias.reduce((a, b) => a + b, 0);
    const frequenciasRelativas = frequencias.map(freq => Number(((freq / total) * 100).toFixed(1)));
    const maxFreq = Math.max(...frequencias);

    const dadosOrdenados = valores.map((v, i) => ({ valor: v, freq: frequencias[i] }))
        .sort((a, b) => a.valor - b.valor);

    const valoresOrdenados = dadosOrdenados.map(d => d.valor);
    const frequenciasOrdenadas = dadosOrdenados.map(d => d.freq);
    const frequenciasRelativasOrdenadas = dadosOrdenados.map(d => Number(((d.freq / total) * 100).toFixed(1)));

    const barBg = frequenciasOrdenadas.map(freq => freq === maxFreq ? 'rgba(231, 76, 60, 0.9)' : 'rgba(67, 97, 238, 0.8)');
    const barBorder = frequenciasOrdenadas.map(freq => freq === maxFreq ? 'rgba(231, 76, 60, 1)' : 'rgba(67, 97, 238, 1)');

    // Configurações específicas para mobile
    const isMobile = window.innerWidth <= 768;
    const fontSizeTitle = isMobile ? 16 : 18;
    const fontSizeLegend = isMobile ? 10 : 12;
    const fontSizeTicks = isMobile ? 9 : 11;

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: valoresOrdenados.map(v => {
                const num = parseFloat(v);
                return num % 1 === 0 ? num.toString() : num.toFixed(2);
            }),
            datasets: [{
                label: "Frequência Absoluta (fᵢ)",
                data: frequenciasOrdenadas,
                backgroundColor: barBg,
                borderColor: barBorder,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: isMobile ? 0.6 : 0.7,
                categoryPercentage: isMobile ? 0.7 : 0.8
            }, {
                label: "Frequência Relativa (%)",
                data: frequenciasRelativasOrdenadas,
                type: 'line',
                borderColor: 'rgba(240, 101, 149, 1)',
                backgroundColor: 'rgba(240, 101, 149, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: frequenciasOrdenadas.map(freq => freq === 0 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(240, 101, 149, 1)'),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: isMobile ? 
                    frequenciasOrdenadas.map(freq => freq === 0 ? 2 : 4) : 
                    frequenciasOrdenadas.map(freq => freq === 0 ? 3 : 6),
                pointHoverRadius: isMobile ? 6 : 8,
                tension: 0.2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Frequência - Valores Individuais',
                    font: { 
                        size: fontSizeTitle,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: { bottom: isMobile ? 15 : 20 },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: isMobile ? 10 : 15,
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#2c3e50',
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: {
                        size: isMobile ? 12 : 13,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: isMobile ? 11 : 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: isMobile ? 10 : 12,
                    cornerRadius: 8,
                    usePointStyle: true,
                    boxPadding: 6,
                    callbacks: {
                        title: function(tooltipItems) {
                            const valor = parseFloat(valoresOrdenados[tooltipItems[0].dataIndex]);
                            return `Valor: ${valor % 1 === 0 ? valor : valor.toFixed(2)}`;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataset.type === 'line') {
                                return `${label}: ${value}%`;
                            }
                            return `${label}: ${value}`;
                        },
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const freq = context.parsed.y;
                                const percent = ((freq / total) * 100).toFixed(1);
                                return `Frequência Relativa: ${percent}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência Absoluta (fᵢ)',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#4361ee'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: true
                    },
                    ticks: {
                        font: {
                            size: fontSizeTicks
                        },
                        precision: 0
                    },
                    suggestedMax: maxFreq * 1.15
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Frequência Relativa (%)',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#f06595'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: fontSizeTicks
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    max: 100
                },
                x: {
                    title: {
                        display: true,
                        text: 'Valores (xᵢ)',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: fontSizeTicks
                        },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// HISTOGRAMA - Versão otimizada para mobile
function gerarHistograma(classes) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    classes.sort((a, b) => a.inf - b.inf);

    const classesCompletas = adicionarClassesVazias(classes);
    
    const totalFreq = classesCompletas.reduce((sum, classe) => sum + classe.freq, 0);
    const frequenciasRelativas = classesCompletas.map(classe => Number(((classe.freq / totalFreq) * 100).toFixed(1)));
    const maxFreq = Math.max(...classesCompletas.map(c => c.freq));

    const classeModal = classesCompletas.reduce((prev, current) => 
        (prev.freq > current.freq) ? prev : current
    );

    // Configurações específicas para mobile
    const isMobile = window.innerWidth <= 768;
    const fontSizeTitle = isMobile ? 16 : 18;
    const fontSizeLegend = isMobile ? 10 : 12;
    const fontSizeTicks = isMobile ? 9 : 11;

    // arrays de cores por barra/ponto
    const barBgColors = classesCompletas.map(c => {
        if (c.freq === classeModal.freq && c.freq > 0) return 'rgba(63, 231, 60, 0.9)';
        if (c.freq === 0) return 'rgba(67, 97, 238, 0.8)';
        return 'rgba(67, 97, 238, 0.8)';
    });
    const barBorderColors = classesCompletas.map(c => {
        if (c.freq === classeModal.freq && c.freq > 0) return 'rgba(63, 231, 60, 0.9)';
        if (c.freq === 0) return 'rgba(240, 200, 200, 0.5)';
        return 'rgba(67, 97, 238, 1)';
    });
    const linePointColors = classesCompletas.map(c => c.freq === 0 ? 'rgba(240, 101, 149, 1)' : 'rgba(240, 101, 149, 1)');
    const linePointRadius = classesCompletas.map(c => c.freq === 0 ? 
        (isMobile ? 2 : 3) : 
        (isMobile ? 4 : 6)
    );

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classesCompletas.map((c, index) => {
                return `[${c.inf.toFixed(2)} - ${c.sup.toFixed(2)})`;
            }),
            datasets: [{
                label: 'Frequência Absoluta (fᵢ)',
                data: classesCompletas.map(c => c.freq),
                backgroundColor: barBgColors,
                borderColor: barBorderColors,
                borderWidth: 0,
                barThickness: 'flex',
                categoryPercentage: isMobile ? 0.9 : 1.0,
                barPercentage: isMobile ? 0.9 : 1.0
            }, {
                label: 'Frequência Relativa (%)',
                data: frequenciasRelativas,
                type: 'line',
                borderColor: 'rgba(240, 101, 149, 1)',
                backgroundColor: 'rgba(240, 101, 149, 0.1)',
                borderWidth: isMobile ? 2 : 3,
                pointBackgroundColor: linePointColors,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: linePointRadius,
                pointHoverRadius: isMobile ? 6 : 8,
                tension: 0.3,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Histograma - Distribuição por Classes',
                    font: { 
                        size: fontSizeTitle,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: { bottom: isMobile ? 15 : 20 },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: isMobile ? 10 : 15,
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#2c3e50'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: {
                        size: isMobile ? 12 : 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: isMobile ? 11 : 12
                    },
                    padding: isMobile ? 10 : 12,
                    cornerRadius: 8,
                    usePointStyle: true,
                    callbacks: {
                        title: function(tooltipItems) {
                            const classe = classesCompletas[tooltipItems[0].dataIndex];
                            return `Classe: [${classe.inf.toFixed(2)} - ${classe.sup.toFixed(2)})`;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataset.type === 'line') {
                                return `${label}: ${value}%`;
                            }
                            return `${label}: ${value}`;
                        },
                        afterLabel: function(context) {
                            const classe = classesCompletas[context.dataIndex];
                            const info = [];
                            
                            if (context.datasetIndex === 0) {
                                const percent = ((classe.freq / totalFreq) * 100).toFixed(1);
                                info.push(`Frequência relativa: ${percent}%`);
                            }
                            
                            info.push(`Ponto médio: ${((classe.inf + classe.sup) / 2).toFixed(2)}`);
                            info.push(`Amplitude: ${(classe.sup - classe.inf).toFixed(2)}`);
                            
                            if (classe.freq === classeModal.freq && classe.freq > 0) {
                                info.push('⭐ Classe modal');
                            }
                            
                            return info;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Intervalos de Classe',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        }
                    },
                    offset: false,
                    grid: {
                        offset: false,
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        font: {
                            size: fontSizeTicks
                        },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência Absoluta (fᵢ)',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#4361ee'
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            size: fontSizeTicks
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    suggestedMax: maxFreq * 1.15
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Frequência Relativa (%)',
                        font: {
                            size: fontSizeLegend,
                            weight: '600'
                        },
                        color: '#f06595'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: fontSizeTicks
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    max: 100
                }
            },
            elements: {
                bar: {
                    borderWidth: 0,
                    borderSkipped: false,
                    borderRadius: 0
                }
            },
            layout: {
                padding: {
                    left: isMobile ? 5 : 10,
                    right: isMobile ? 5 : 10,
                    top: isMobile ? 5 : 10,
                    bottom: isMobile ? 5 : 10
                }
            },
            animation: {
                duration: isMobile ? 800 : 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    gerarTabelaClassesABNT(classesCompletas, totalFreq);
}
