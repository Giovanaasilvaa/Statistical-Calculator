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

// Gráfico de barras simples e limpo (como o modelo)
function gerarGraficoFrequencia(valores, frequencias) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    const dadosOrdenados = valores.map((v, i) => ({ valor: v, freq: frequencias[i] }))
        .sort((a, b) => a.valor - b.valor);

    const valoresOrdenados = dadosOrdenados.map(d => d.valor);
    const frequenciasOrdenadas = dadosOrdenados.map(d => d.freq);
    const maxFreq = Math.max(...frequenciasOrdenadas);

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
                backgroundColor: "rgba(66, 133, 244, 0.7)", // azul vivo
                borderColor: "rgba(66, 133, 244, 1)",
                borderWidth: 1.5,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false // sem título fixo
                },
                legend: {
                    display: false // sem legenda, mais limpo
                },
                tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    titleFont: { size: 13, weight: "bold" },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} ocorrências`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Valores (xᵢ)",
                        font: { size: 12, weight: "bold" },
                        color: "#000"
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Frequência Absoluta (fᵢ)",
                        font: { size: 12, weight: "bold" },
                        color: "#000"
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                        drawBorder: true
                    },
                    ticks: {
                        stepSize: 2,
                        precision: 0,
                        font: { size: 11 }
                    },
                    suggestedMax: maxFreq + 3
                }
            },
            animation: {
                duration: 800,
                easing: "easeOutQuart"
            }
        }
    });
}


// HISTOGRAMA 
// HISTOGRAMA
function gerarHistograma(classes) {
    const ctx = document.getElementById("grafico").getContext("2d");
    limparGrafico();

    classes.sort((a, b) => a.inf - b.inf);

    const classesCompletas = adicionarClassesVazias(classes);
    const totalFreq = classesCompletas.reduce((sum, classe) => sum + classe.freq, 0);

    // garantir números (não strings)
    const frequenciasRelativas = classesCompletas.map(classe =>
        Number(((classe.freq / totalFreq) * 100).toFixed(1))
    );

    const maxFreq = Math.max(...classesCompletas.map(c => c.freq));

    // cores únicas (azul para todas as colunas)
    const barBgColors = classesCompletas.map(() => 'rgba(67, 97, 238, 0.9)');
    const barBorderColors = classesCompletas.map(() => 'rgba(67, 97, 238, 0.9)');
    const linePointColors = classesCompletas.map(() => 'rgba(240, 101, 149, 1)');
    const linePointRadius = classesCompletas.map(() => 6);

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classesCompletas.map(c => `[${c.inf.toFixed(2)} - ${c.sup.toFixed(2)})`),
            datasets: [
                {
                    label: 'Frequência Absoluta (fᵢ)',
                    data: classesCompletas.map(c => c.freq),
                    backgroundColor: barBgColors,
                    borderColor: barBorderColors,
                    borderWidth: 0,
                    barThickness: 'flex',
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    label: '',
                    data: frequenciasRelativas,
                    type: 'line',
                    borderColor: 'rgba(240, 101, 149, 1)',
                    backgroundColor: 'rgba(240, 101, 149, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: linePointColors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: linePointRadius,
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false }, // sem título
                legend: { display: false }, // sem legenda
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    usePointStyle: true,
                    callbacks: {
                        title: function (tooltipItems) {
                            const classe = classesCompletas[tooltipItems[0].dataIndex];
                            return `Classe: [${classe.inf.toFixed(2)} - ${classe.sup.toFixed(2)})`;
                        },
                        label: function (context) {
                            const label = context.dataset.type === 'line'
                                ? 'Frequência Relativa'
                                : 'Frequência Absoluta';
                            const value = context.parsed.y;
                            return context.dataset.type === 'line'
                                ? `${label}: ${value}%`
                                : `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Intervalos de Classe',
                        font: { size: 12, weight: '600' }
                    },
                    grid: { display: false }, // sem linhas no fundo
                    ticks: { font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência Absoluta (fᵢ)',
                        font: { size: 12, weight: '600' },
                        color: '#4361ee'
                    },
                    ticks: { precision: 0, font: { size: 11 } },
                    grid: { display: false }, // sem linhas no fundo
                    suggestedMax: maxFreq * 1.15
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: false
                    },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        font: { size: 11 },
                        callback: value => value + '%'
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
                padding: { left: 10, right: 10, top: 10, bottom: 10 }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    gerarTabelaClassesABNT(classesCompletas, totalFreq);
}


// Adiciona classes vazias antes e depois
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

// Gera tabela de classes no padrão ABNT
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
        if (dado.freq === 0) tr.classList.add('classe-vazia');

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
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keypress', function (e) {
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
