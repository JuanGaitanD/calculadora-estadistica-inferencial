// ========================================
// NAVEGACIÓN Y UTILIDADES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Navegación entre secciones
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const sectionById = id => Array.from(sections).find(s => s.id === id);
    const navBtnBySection = id => Array.from(navButtons).find(b => b.getAttribute('data-section') === id);
    
    function navigateToSection(targetSection) {
        if (!targetSection) return;
        // Actualizar botones activos
        navButtons.forEach(btn => btn.classList.remove('active'));
        const navBtn = navBtnBySection(targetSection);
        if (navBtn) {
            navBtn.classList.add('active');
            navButtons.forEach(btn => btn.removeAttribute('aria-current'));
            navBtn.setAttribute('aria-current', 'page');
        }
        // Mostrar sección
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            navigateToSection(targetSection);
        });
    });

    // Delegación: botones/enlaces dentro del contenido que tengan data-section
    document.body.addEventListener('click', (e) => {
        const el = e.target.closest('[data-section]');
        if (el && !el.classList.contains('nav-btn')) {
            e.preventDefault();
            const target = el.getAttribute('data-section');
            navigateToSection(target);
        }
    });
    
    // Renderizar MathJax si está disponible
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    // Ajustes globales de Chart.js para mejorar títulos y legiblez
    if (window.Chart) {
        const root = getComputedStyle(document.documentElement);
        const primary = (root.getPropertyValue('--primary-color') || '#2C3E50').trim();
        const textColor = (root.getPropertyValue('--text-color') || '#2C3E50').trim();

        // Tipografía y colores por defecto
        Chart.defaults.color = textColor;
        Chart.defaults.font = Chart.defaults.font || {};
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.font.size = 12;

        // Título más visible y con separación
        Chart.defaults.plugins = Chart.defaults.plugins || {};
        Chart.defaults.plugins.title = Chart.defaults.plugins.title || {};
        // No forzamos display:true; solo estilos cuando se use título
        Chart.defaults.plugins.title.font = { size: 18, weight: '700' };
        Chart.defaults.plugins.title.color = primary;
        Chart.defaults.plugins.title.align = 'center';
        Chart.defaults.plugins.title.padding = { top: 10, bottom: 12 };

        // Leyenda en la parte inferior para no competir con el título
        Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
        Chart.defaults.plugins.legend.position = 'bottom';
        Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.boxWidth = 10;

        // Separación interna del lienzo
        Chart.defaults.layout = Chart.defaults.layout || {};
        Chart.defaults.layout.padding = { top: 8, right: 8, bottom: 8, left: 8 };
    }

    // Marcar cards que tienen gráfica (fallback si :has no está disponible)
    document.querySelectorAll('.calculator-card').forEach(card => {
        if (card.querySelector('canvas')) {
            card.classList.add('has-chart');
        }
    });

    // Envolver cada canvas con una toolbar de acciones (ver grande / descargar)
    document.querySelectorAll('canvas').forEach(canvas => {
        // Crear wrapper si no existe
        if (!canvas.parentElement.classList.contains('chart-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-wrapper';
            canvas.parentElement.insertBefore(wrapper, canvas);
            wrapper.appendChild(canvas);

            // Crear acciones
            const actions = document.createElement('div');
            actions.className = 'chart-actions';

            const btnView = document.createElement('button');
            btnView.className = 'btn-icon';
            btnView.type = 'button';
            btnView.innerHTML = '&#128269;'; // 🔍 lupa
            btnView.setAttribute('title', 'Ver grande');
            btnView.setAttribute('aria-label', 'Ver grande');

            const btnDownload = document.createElement('button');
            btnDownload.className = 'btn-icon';
            btnDownload.type = 'button';
            btnDownload.innerHTML = '&#11015;'; // ⬇ flecha abajo
            btnDownload.setAttribute('title', 'Descargar');
            btnDownload.setAttribute('aria-label', 'Descargar');

            actions.appendChild(btnView);
            actions.appendChild(btnDownload);
            wrapper.appendChild(actions);

            // Handlers
            const getChartImage = () => {
                const chart = canvas.chart;
                try {
                    return chart && typeof chart.toBase64Image === 'function'
                        ? chart.toBase64Image()
                        : canvas.toDataURL('image/png');
                } catch (e) {
                    return canvas.toDataURL('image/png');
                }
            };

            const getChartTitle = () => {
                const chart = canvas.chart;
                if (chart && chart.options && chart.options.plugins && chart.options.plugins.title && chart.options.plugins.title.text) {
                    const t = chart.options.plugins.title.text;
                    return Array.isArray(t) ? t.join(' ') : String(t);
                }
                return 'grafica';
            };

            btnView.addEventListener('click', () => {
                const src = getChartImage();
                const caption = getChartTitle();
                const overlay = document.getElementById('modal-overlay');
                const img = document.getElementById('modal-image');
                const cap = document.getElementById('modal-caption');
                if (overlay && img && cap) {
                    img.src = src;
                    cap.textContent = caption;
                    overlay.classList.remove('hidden');
                }
            });

            btnDownload.addEventListener('click', () => {
                const src = getChartImage();
                const a = document.createElement('a');
                const filename = getChartTitle().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'grafica';
                a.href = src;
                a.download = `${filename}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });

            // Permitir click en el canvas para ampliar
            canvas.style.cursor = 'zoom-in';
            canvas.addEventListener('click', () => btnView.click());
        }
    });

    // Cierre del modal
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('modal-close')) {
                overlay.classList.add('hidden');
            }
        });
    }
});

// Funciones matemáticas auxiliares
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combinaciones(n, k) {
    if (k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function erf(x) {
    // Aproximación de la función de error
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

function normalCDF(x, mean = 0, stdDev = 1) {
    // Función de distribución acumulada normal
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

function normalPDF(x, mean = 0, stdDev = 1) {
    // Función de densidad de probabilidad normal
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

// ========================================
// I. DISTRIBUCIONES DE PROBABILIDAD
// ========================================

// 1. Distribución Binomial
function calcularBinomial() {
    const n = parseInt(document.getElementById('binomial-n').value);
    const x = parseInt(document.getElementById('binomial-x').value);
    const p = parseFloat(document.getElementById('binomial-p').value);
    const q = 1 - p;
    
    if (x > n) {
        mostrarResultado('binomial-result', 'Error: x no puede ser mayor que n', 'error');
        return;
    }
    
    // Calcular P(X = x)
    const coef = combinaciones(n, x);
    const probabilidad = coef * Math.pow(p, x) * Math.pow(q, n - x);
    
    // Calcular media y varianza
    const media = n * p;
    const varianza = n * p * q;
    const desvEst = Math.sqrt(varianza);
    
    let resultado = `
        <h4>Resultados de Distribución Binomial</h4>
        <p><strong>P(X = ${x}) = ${probabilidad.toFixed(6)}</strong></p>
        <p><strong>Porcentaje:</strong> ${(probabilidad * 100).toFixed(4)}%</p>
        <hr>
        <p><strong>Media (μ):</strong> ${media.toFixed(4)}</p>
        <p><strong>Varianza (σ²):</strong> ${varianza.toFixed(4)}</p>
        <p><strong>Desviación Estándar (σ):</strong> ${desvEst.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> La probabilidad de obtener exactamente ${x} éxitos en ${n} ensayos, con una probabilidad de éxito de ${(p * 100).toFixed(2)}%, es ${(probabilidad * 100).toFixed(4)}%.</p>
    `;
    
    mostrarResultado('binomial-result', resultado, 'success');
    graficarBinomial(n, p, x);
}

function graficarBinomial(n, p, x_actual) {
    const canvas = document.getElementById('binomial-chart');
    if (!canvas) return;
    
    // Destruir gráfico anterior si existe
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Generar datos
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    for (let x = 0; x <= n; x++) {
        labels.push(x);
        const prob = combinaciones(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
        data.push(prob);
        backgroundColors.push(x === x_actual ? 'rgba(52, 152, 219, 0.8)' : 'rgba(189, 195, 199, 0.6)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P(X = x)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución Binomial (n=${n}, p=${p})`,
                    font: { size: 16 }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Probabilidad'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Número de éxitos (x)'
                    }
                }
            }
        }
    });
}

// 2. Distribución Hipergeométrica
function calcularHipergeometrica() {
    const n = parseInt(document.getElementById('hiper-n').value);
    const x = parseInt(document.getElementById('hiper-x').value);
    const N1 = parseInt(document.getElementById('hiper-n1').value);
    const N2 = parseInt(document.getElementById('hiper-n2').value);
    const N = N1 + N2;
    
    if (x > N1 || (n - x) > N2 || x > n) {
        mostrarResultado('hiper-result', 'Error: Valores inconsistentes. Verifica que x ≤ N₁, (n-x) ≤ N₂ y x ≤ n', 'error');
        return;
    }
    
    // P(X = x) = C(N1, x) * C(N2, n-x) / C(N, n)
    const numerador = combinaciones(N1, x) * combinaciones(N2, n - x);
    const denominador = combinaciones(N, n);
    const probabilidad = numerador / denominador;
    
    // Media y varianza
    const media = n * (N1 / N);
    const varianza = n * (N1 / N) * (N2 / N) * ((N - n) / (N - 1));
    const desvEst = Math.sqrt(varianza);
    
    let resultado = `
        <h4>Resultados de Distribución Hipergeométrica</h4>
        <p><strong>P(X = ${x}) = ${probabilidad.toFixed(6)}</strong></p>
        <p><strong>Porcentaje:</strong> ${(probabilidad * 100).toFixed(4)}%</p>
        <hr>
        <p><strong>Población Total (N):</strong> ${N}</p>
        <p><strong>Media (μ):</strong> ${media.toFixed(4)}</p>
        <p><strong>Varianza (σ²):</strong> ${varianza.toFixed(4)}</p>
        <p><strong>Desviación Estándar (σ):</strong> ${desvEst.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> En una población de ${N} elementos (${N1} con característica 1 y ${N2} con característica 2), al tomar una muestra de ${n} elementos sin reemplazo, la probabilidad de obtener exactamente ${x} elementos con característica 1 es ${(probabilidad * 100).toFixed(4)}%.</p>
    `;
    
    mostrarResultado('hiper-result', resultado, 'success');
    graficarHipergeometrica(n, N1, N2, x);
}

function graficarHipergeometrica(n, N1, N2, x_actual) {
    const canvas = document.getElementById('hiper-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const N = N1 + N2;
    
    const maxX = Math.min(n, N1);
    const minX = Math.max(0, n - N2);
    
    for (let x = minX; x <= maxX; x++) {
        labels.push(x);
        const num = combinaciones(N1, x) * combinaciones(N2, n - x);
        const den = combinaciones(N, n);
        const prob = num / den;
        data.push(prob);
        backgroundColors.push(x === x_actual ? 'rgba(52, 152, 219, 0.8)' : 'rgba(189, 195, 199, 0.6)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P(X = x)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución Hipergeométrica (N=${N}, N₁=${N1}, n=${n})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Probabilidad' }
                },
                x: {
                    title: { display: true, text: 'Número de éxitos (x)' }
                }
            }
        }
    });
}

// 3. Distribución de Poisson
function calcularPoisson() {
    const lambda = parseFloat(document.getElementById('poisson-lambda').value);
    const x = parseInt(document.getElementById('poisson-x').value);
    
    // P(X = x) = (e^-λ * λ^x) / x!
    const probabilidad = (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);
    
    // Media y varianza en Poisson son iguales a λ
    const media = lambda;
    const varianza = lambda;
    const desvEst = Math.sqrt(varianza);
    
    let resultado = `
        <h4>Resultados de Distribución de Poisson</h4>
        <p><strong>P(X = ${x}) = ${probabilidad.toFixed(6)}</strong></p>
        <p><strong>Porcentaje:</strong> ${(probabilidad * 100).toFixed(4)}%</p>
        <hr>
        <p><strong>Media (μ = λ):</strong> ${media.toFixed(4)}</p>
        <p><strong>Varianza (σ² = λ):</strong> ${varianza.toFixed(4)}</p>
        <p><strong>Desviación Estándar (σ):</strong> ${desvEst.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con una tasa promedio de ${lambda} ocurrencias, la probabilidad de observar exactamente ${x} ocurrencias es ${(probabilidad * 100).toFixed(4)}%.</p>
    `;
    
    mostrarResultado('poisson-result', resultado, 'success');
    graficarPoisson(lambda, x);
}

function graficarPoisson(lambda, x_actual) {
    const canvas = document.getElementById('poisson-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const maxX = Math.min(30, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
    
    for (let x = 0; x <= maxX; x++) {
        labels.push(x);
        const prob = (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);
        data.push(prob);
        backgroundColors.push(x === x_actual ? 'rgba(52, 152, 219, 0.8)' : 'rgba(189, 195, 199, 0.6)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'P(X = x)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución de Poisson (λ=${lambda})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Probabilidad' }
                },
                x: {
                    title: { display: true, text: 'Número de ocurrencias (x)' }
                }
            }
        }
    });
}

// 4. Distribución Normal
function calcularNormal() {
    const mu = parseFloat(document.getElementById('normal-mu').value);
    const sigma = parseFloat(document.getElementById('normal-sigma').value);
    const x = parseFloat(document.getElementById('normal-x').value);
    
    // Calcular Z
    const z = (x - mu) / sigma;
    
    // Calcular probabilidades
    const pMenor = normalCDF(x, mu, sigma);
    const pMayor = 1 - pMenor;
    
    let resultado = `
        <h4>Resultados de Distribución Normal</h4>
        <p><strong>Valor Z estandarizado:</strong> ${z.toFixed(4)}</p>
        <hr>
        <p><strong>P(X < ${x}):</strong> ${pMenor.toFixed(6)} = ${(pMenor * 100).toFixed(4)}%</p>
        <p><strong>P(X > ${x}):</strong> ${pMayor.toFixed(6)} = ${(pMayor * 100).toFixed(4)}%</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Media (μ): ${mu}</p>
        <p>Desviación Estándar (σ): ${sigma}</p>
        <hr>
        <p><strong>Interpretación:</strong> El valor ${x} se encuentra a ${Math.abs(z).toFixed(4)} desviaciones estándar ${z >= 0 ? 'por encima' : 'por debajo'} de la media.</p>
    `;
    
    mostrarResultado('normal-result', resultado, 'success');
    graficarNormal(mu, sigma, x);
}

function graficarNormal(mu, sigma, x_valor) {
    const canvas = document.getElementById('normal-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Generar puntos para la curva
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const inicio = mu - 4 * sigma;
    const fin = mu + 4 * sigma;
    const paso = (fin - inicio) / 100;
    
    for (let x = inicio; x <= fin; x += paso) {
        labels.push(x.toFixed(2));
        const y = normalPDF(x, mu, sigma);
        data.push(y);
        
        if (x <= x_valor) {
            backgroundColors.push('rgba(52, 152, 219, 0.6)');
        } else {
            backgroundColors.push('rgba(189, 195, 199, 0.3)');
        }
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Densidad de probabilidad',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución Normal (μ=${mu}, σ=${sigma})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor de X' },
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
}

// ========================================
// II. TAMAÑO DE MUESTRA
// ========================================

// 1. Cuantitativa - Población Grande
function calcularMuestraCuantGrande() {
    const varianza = parseFloat(document.getElementById('muestra-cuant-var').value);
    const e = parseFloat(document.getElementById('muestra-cuant-e').value);
    const confianza = parseInt(document.getElementById('muestra-cuant-conf').value);
    
    const z = getZValue(confianza);
    const n = (z * z * varianza) / (e * e);
    
    let resultado = `
        <h4>Tamaño de Muestra - Cuantitativa (σ conocida)</h4>
        <p><strong>Tamaño de muestra necesario (n):</strong> ${Math.ceil(n)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Varianza poblacional (σ²): ${varianza}</p>
        <p>Desviación estándar (σ): ${Math.sqrt(varianza).toFixed(4)}</p>
        <p>Margen de error (e): ${e}</p>
        <p>Nivel de confianza: ${confianza}%</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Se necesita una muestra de al menos ${Math.ceil(n)} elementos para estimar la media poblacional con un ${confianza}% de confianza y un margen de error de ±${e}.</p>
    `;
    
    mostrarResultado('muestra-cuant-result', resultado, 'success');
}

// 2. Cuantitativa - Población Pequeña
function calcularMuestraCuantPequena() {
    const varianza = parseFloat(document.getElementById('muestra-t-var').value);
    const e = parseFloat(document.getElementById('muestra-t-e').value);
    const gl = parseInt(document.getElementById('muestra-t-gl').value);
    const confianza = parseInt(document.getElementById('muestra-t-conf').value);
    
    const t = getTValue(gl, confianza);
    const n = (t * t * varianza) / (e * e);
    
    let resultado = `
        <h4>Tamaño de Muestra - Cuantitativa (σ desconocida)</h4>
        <p><strong>Tamaño de muestra necesario (n):</strong> ${Math.ceil(n)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Varianza muestral (s²): ${varianza}</p>
        <p>Desviación estándar (s): ${Math.sqrt(varianza).toFixed(4)}</p>
        <p>Margen de error (e): ${e}</p>
        <p>Grados de libertad: ${gl}</p>
        <p>Nivel de confianza: ${confianza}%</p>
        <p>Valor t: ${t.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Para una población pequeña con varianza desconocida, se requiere una muestra de al menos ${Math.ceil(n)} elementos para un ${confianza}% de confianza con margen de error ±${e}.</p>
    `;
    
    mostrarResultado('muestra-t-result', resultado, 'success');
}

// 3. Cualitativa (Proporción)
function calcularMuestraCualitativa() {
    const p = parseFloat(document.getElementById('muestra-prop-p').value);
    const q = 1 - p;
    const e = parseFloat(document.getElementById('muestra-prop-e').value);
    const confianza = parseInt(document.getElementById('muestra-prop-conf').value);
    
    const z = getZValue(confianza);
    const n = (z * z * p * q) / (e * e);
    
    let resultado = `
        <h4>Tamaño de Muestra - Cualitativa (Proporción)</h4>
        <p><strong>Tamaño de muestra necesario (n):</strong> ${Math.ceil(n)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Proporción de éxito (p): ${p}</p>
        <p>Proporción de fallo (q): ${q}</p>
        <p>Margen de error (e): ${e}</p>
        <p>Nivel de confianza: ${confianza}%</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Se necesita una muestra de al menos ${Math.ceil(n)} elementos para estimar la proporción poblacional con un ${confianza}% de confianza y un margen de error de ±${(e * 100).toFixed(2)}%.</p>
    `;
    
    mostrarResultado('muestra-prop-result', resultado, 'success');
}

// 4. Corrección para Población Conocida
function calcularCorreccionMuestra() {
    const N = parseInt(document.getElementById('corr-N').value);
    const n = parseInt(document.getElementById('corr-n').value);
    const p = parseFloat(document.getElementById('corr-p').value);
    const q = 1 - p;
    const e = parseFloat(document.getElementById('corr-e').value);
    const confianza = parseInt(document.getElementById('corr-conf').value);
    
    const z = getZValue(confianza);
    const nAjustado = (N * z * z * p * q) / ((N - 1) * e * e + z * z * p * q);
    
    let resultado = `
        <h4>Corrección de Muestra para Población Conocida</h4>
        <p><strong>Muestra original (n):</strong> ${n}</p>
        <p><strong>Muestra ajustada (n_ajustado):</strong> ${Math.ceil(nAjustado)}</p>
        <p><strong>Reducción:</strong> ${(n - nAjustado).toFixed(2)} elementos (${((1 - nAjustado/n) * 100).toFixed(2)}%)</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Tamaño de población (N): ${N}</p>
        <p>Proporción (p): ${p}, (q): ${q}</p>
        <p>Margen de error (e): ${e}</p>
        <p>Nivel de confianza: ${confianza}%</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Al conocer que la población tiene ${N} elementos, el tamaño de muestra se reduce a ${Math.ceil(nAjustado)} elementos, manteniendo el mismo nivel de confianza y margen de error.</p>
    `;
    
    mostrarResultado('corr-result', resultado, 'success');
}

// ========================================
// III. ESTADÍSTICOS Z y t
// ========================================

// 1. Media - Una Población (Z)
function calcularZMedia() {
    const xbar = parseFloat(document.getElementById('z-media-xbar').value);
    const mu = parseFloat(document.getElementById('z-media-mu').value);
    const sigma = parseFloat(document.getElementById('z-media-sigma').value);
    const n = parseInt(document.getElementById('z-media-n').value);
    
    const errorEst = sigma / Math.sqrt(n);
    const z = (xbar - mu) / errorEst;
    
    const pValor = z >= 0 ? (1 - normalCDF(z)) : normalCDF(z);
    const pValorBilateral = 2 * Math.min(normalCDF(z), 1 - normalCDF(z));
    
    let resultado = `
        <h4>Estadístico Z - Media (Una Población)</h4>
        <p><strong>Valor Z calculado:</strong> ${z.toFixed(4)}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <hr>
        <p><strong>Valores p:</strong></p>
        <p>P-valor (una cola): ${pValor.toFixed(6)}</p>
        <p>P-valor (dos colas): ${pValorBilateral.toFixed(6)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Media muestral (x̄): ${xbar}</p>
        <p>Media poblacional (μ): ${mu}</p>
        <p>Desviación estándar (σ): ${sigma}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> La media muestral se encuentra a ${Math.abs(z).toFixed(4)} desviaciones estándar ${z >= 0 ? 'por encima' : 'por debajo'} de la media poblacional hipotética.</p>
    `;
    
    mostrarResultado('z-media-result', resultado, 'info');
    graficarZTestMedia(z);
}

function graficarZTestMedia(zCalc) {
    const canvas = document.getElementById('z-media-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    for (let z = -4; z <= 4; z += 0.1) {
        labels.push(z.toFixed(2));
        const y = normalPDF(z, 0, 1);
        data.push(y);
        backgroundColors.push(Math.abs(z) >= Math.abs(zCalc) ? 'rgba(52, 152, 219, 0.6)' : 'rgba(135, 206, 235, 0.4)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución Z',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución Normal Estándar (Z = ${zCalc.toFixed(4)})`,
                    font: { size: 16 }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: zCalc,
                            xMax: zCalc,
                            borderColor: 'red',
                            borderWidth: 2,
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor Z' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 2. Media - Dos Poblaciones (Z)
function calcularZDosMedias() {
    const xbar = parseFloat(document.getElementById('z-2media-xbar').value);
    const ybar = parseFloat(document.getElementById('z-2media-ybar').value);
    const mux = parseFloat(document.getElementById('z-2media-mux').value);
    const muy = parseFloat(document.getElementById('z-2media-muy').value);
    const sigmax = parseFloat(document.getElementById('z-2media-sigmax').value);
    const sigmay = parseFloat(document.getElementById('z-2media-sigmay').value);
    const nx = parseInt(document.getElementById('z-2media-nx').value);
    const ny = parseInt(document.getElementById('z-2media-ny').value);
    
    const errorEst = Math.sqrt((sigmax * sigmax / nx) + (sigmay * sigmay / ny));
    const z = ((xbar - ybar) - (mux - muy)) / errorEst;
    
    const pValor = z >= 0 ? (1 - normalCDF(z)) : normalCDF(z);
    const pValorBilateral = 2 * Math.min(normalCDF(z), 1 - normalCDF(z));
    
    let resultado = `
        <h4>Estadístico Z - Diferencia de Medias (Dos Poblaciones)</h4>
        <p><strong>Valor Z calculado:</strong> ${z.toFixed(4)}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <p><strong>Diferencia de medias muestrales (x̄ - ȳ):</strong> ${(xbar - ybar).toFixed(4)}</p>
        <p><strong>Diferencia de medias poblacionales (μₓ - μᵧ):</strong> ${(mux - muy).toFixed(4)}</p>
        <hr>
        <p><strong>Valores p:</strong></p>
        <p>P-valor (una cola): ${pValor.toFixed(6)}</p>
        <p>P-valor (dos colas): ${pValorBilateral.toFixed(6)}</p>
        <hr>
        <p><strong>Interpretación:</strong> La diferencia observada entre las medias muestrales se encuentra a ${Math.abs(z).toFixed(4)} desviaciones estándar de la diferencia esperada entre las medias poblacionales.</p>
    `;
    
    mostrarResultado('z-2media-result', resultado, 'info');
}

// 3. Proporción - Una Población (Z)
function calcularZProporcion() {
    const pbar = parseFloat(document.getElementById('z-prop-pbar').value);
    const P = parseFloat(document.getElementById('z-prop-P').value);
    const Q = 1 - P;
    const n = parseInt(document.getElementById('z-prop-n').value);
    
    const errorEst = Math.sqrt((P * Q) / n);
    const z = (pbar - P) / errorEst;
    
    const pValor = z >= 0 ? (1 - normalCDF(z)) : normalCDF(z);
    const pValorBilateral = 2 * Math.min(normalCDF(z), 1 - normalCDF(z));
    
    let resultado = `
        <h4>Estadístico Z - Proporción (Una Población)</h4>
        <p><strong>Valor Z calculado:</strong> ${z.toFixed(4)}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <hr>
        <p><strong>Valores p:</strong></p>
        <p>P-valor (una cola): ${pValor.toFixed(6)}</p>
        <p>P-valor (dos colas): ${pValorBilateral.toFixed(6)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Proporción muestral (p̄): ${pbar} (${(pbar * 100).toFixed(2)}%)</p>
        <p>Proporción poblacional (P): ${P} (${(P * 100).toFixed(2)}%)</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> La proporción muestral difiere de la proporción poblacional hipotética en ${Math.abs(z).toFixed(4)} errores estándar.</p>
    `;
    
    mostrarResultado('z-prop-result', resultado, 'info');
}

// 4. Proporción - Dos Poblaciones (Z)
function calcularZDosProporcion() {
    const pbar1 = parseFloat(document.getElementById('z-2prop-pbar1').value);
    const pbar2 = parseFloat(document.getElementById('z-2prop-pbar2').value);
    const P1 = parseFloat(document.getElementById('z-2prop-P1').value);
    const P2 = parseFloat(document.getElementById('z-2prop-P2').value);
    const Q1 = 1 - P1;
    const Q2 = 1 - P2;
    const n1 = parseInt(document.getElementById('z-2prop-n1').value);
    const n2 = parseInt(document.getElementById('z-2prop-n2').value);
    
    const errorEst = Math.sqrt((P1 * Q1 / n1) + (P2 * Q2 / n2));
    const z = ((pbar1 - pbar2) - (P1 - P2)) / errorEst;
    
    const pValor = z >= 0 ? (1 - normalCDF(z)) : normalCDF(z);
    const pValorBilateral = 2 * Math.min(normalCDF(z), 1 - normalCDF(z));
    
    let resultado = `
        <h4>Estadístico Z - Diferencia de Proporciones</h4>
        <p><strong>Valor Z calculado:</strong> ${z.toFixed(4)}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <p><strong>Diferencia muestral (p̄₁ - p̄₂):</strong> ${(pbar1 - pbar2).toFixed(4)} (${((pbar1 - pbar2) * 100).toFixed(2)}%)</p>
        <p><strong>Diferencia poblacional (P₁ - P₂):</strong> ${(P1 - P2).toFixed(4)} (${((P1 - P2) * 100).toFixed(2)}%)</p>
        <hr>
        <p><strong>Valores p:</strong></p>
        <p>P-valor (una cola): ${pValor.toFixed(6)}</p>
        <p>P-valor (dos colas): ${pValorBilateral.toFixed(6)}</p>
        <hr>
        <p><strong>Interpretación:</strong> La diferencia observada entre las proporciones muestrales se encuentra a ${Math.abs(z).toFixed(4)} desviaciones estándar de la diferencia esperada.</p>
    `;
    
    mostrarResultado('z-2prop-result', resultado, 'info');
}

// 5. Media - Una Población (t)
function calcularTMedia() {
    const xbar = parseFloat(document.getElementById('t-media-xbar').value);
    const mu = parseFloat(document.getElementById('t-media-mu').value);
    const s = parseFloat(document.getElementById('t-media-s').value);
    const n = parseInt(document.getElementById('t-media-n').value);
    
    const gl = n - 1;
    const errorEst = s / Math.sqrt(n);
    const t = (xbar - mu) / errorEst;
    
    let resultado = `
        <h4>Estadístico t - Media (Una Población)</h4>
        <p><strong>Valor t calculado:</strong> ${t.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> ${gl}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Media muestral (x̄): ${xbar}</p>
        <p>Media poblacional (μ): ${mu}</p>
        <p>Desviación estándar muestral (S): ${s}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${gl} grados de libertad, la media muestral difiere de la media poblacional hipotética en ${Math.abs(t).toFixed(4)} errores estándar.</p>
    `;
    
    mostrarResultado('t-media-result', resultado, 'info');
    graficarTTest(t, gl);
}

function graficarTTest(tCalc, gl) {
    const canvas = document.getElementById('t-media-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Aproximación de la distribución t usando normal para visualización
    const labels = [];
    const data = [];
    
    for (let t = -4; t <= 4; t += 0.1) {
        labels.push(t.toFixed(2));
        // Usamos normal como aproximación visual
        const y = normalPDF(t, 0, 1);
        data.push(y);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución t',
                data: data,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución t-Student (gl=${gl}, t=${tCalc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor t' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 6. Media - Dos Poblaciones (t)
function calcularTDosMedias() {
    const xbar = parseFloat(document.getElementById('t-2media-xbar').value);
    const ybar = parseFloat(document.getElementById('t-2media-ybar').value);
    const mux = parseFloat(document.getElementById('t-2media-mux').value);
    const muy = parseFloat(document.getElementById('t-2media-muy').value);
    const sx = parseFloat(document.getElementById('t-2media-sx').value);
    const sy = parseFloat(document.getElementById('t-2media-sy').value);
    const nx = parseInt(document.getElementById('t-2media-nx').value);
    const ny = parseInt(document.getElementById('t-2media-ny').value);
    
    // Calcular varianza ponderada (Sp)
    const sp2 = ((nx - 1) * sx * sx + (ny - 1) * sy * sy) / (nx + ny - 2);
    const sp = Math.sqrt(sp2);
    
    const gl = nx + ny - 2;
    const errorEst = sp * Math.sqrt(1/nx + 1/ny);
    const t = ((xbar - ybar) - (mux - muy)) / errorEst;
    
    let resultado = `
        <h4>Estadístico t - Diferencia de Medias (Dos Poblaciones)</h4>
        <p><strong>Valor t calculado:</strong> ${t.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> ${gl}</p>
        <p><strong>Desviación estándar ponderada (Sₚ):</strong> ${sp.toFixed(4)}</p>
        <p><strong>Error estándar:</strong> ${errorEst.toFixed(4)}</p>
        <p><strong>Diferencia de medias muestrales (x̄ - ȳ):</strong> ${(xbar - ybar).toFixed(4)}</p>
        <p><strong>Diferencia hipotética (μₓ - μᵧ):</strong> ${(mux - muy).toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${gl} grados de libertad y varianzas ponderadas, la diferencia observada se encuentra a ${Math.abs(t).toFixed(4)} errores estándar de la diferencia esperada.</p>
    `;
    
    mostrarResultado('t-2media-result', resultado, 'info');
}

// 7. Varianza - Una Población (χ²)
function calcularChiVarianza() {
    const s2 = parseFloat(document.getElementById('chi-var-s2').value);
    const sigma2 = parseFloat(document.getElementById('chi-var-sigma2').value);
    const n = parseInt(document.getElementById('chi-var-n').value);
    
    const gl = n - 1;
    const chi2 = (gl * s2) / sigma2;
    
    let resultado = `
        <h4>Estadístico χ² - Varianza (Una Población)</h4>
        <p><strong>Valor χ² calculado:</strong> ${chi2.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> ${gl}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Varianza muestral (S²): ${s2}</p>
        <p>Varianza poblacional hipotética (σ²): ${sigma2}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> El valor χ² de ${chi2.toFixed(4)} con ${gl} grados de libertad indica ${chi2 > gl ? 'mayor' : 'menor'} variabilidad en la muestra comparada con la varianza poblacional hipotética.</p>
    `;
    
    mostrarResultado('chi-var-result', resultado, 'info');
    graficarChiTest(chi2, gl);
}

function graficarChiTest(chi2Calc, gl) {
    const canvas = document.getElementById('chi-var-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    // Aproximación visual de chi-cuadrado
    const maxX = Math.max(gl * 2, chi2Calc + 10);
    for (let x = 0; x <= maxX; x += maxX / 100) {
        labels.push(x.toFixed(2));
        // Aproximación simplificada
        const y = x > 0 ? Math.pow(x, gl/2 - 1) * Math.exp(-x/2) : 0;
        data.push(y);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución χ²',
                data: data,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución Chi-Cuadrado (gl=${gl}, χ²=${chi2Calc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor χ²' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 8. Varianza - Dos Poblaciones (F)
function calcularFVarianza() {
    const sx2 = parseFloat(document.getElementById('f-var-sx2').value);
    const sy2 = parseFloat(document.getElementById('f-var-sy2').value);
    const nx = parseInt(document.getElementById('f-var-nx').value);
    const ny = parseInt(document.getElementById('f-var-ny').value);
    
    const gl1 = nx - 1;
    const gl2 = ny - 1;
    const F = sx2 / sy2;
    
    let resultado = `
        <h4>Estadístico F - Dos Varianzas</h4>
        <p><strong>Valor F calculado:</strong> ${F.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> gl₁ = ${gl1}, gl₂ = ${gl2}</p>
        <hr>
        <p><strong>Parámetros:</strong></p>
        <p>Varianza muestral 1 (S²ₓ): ${sx2}</p>
        <p>Varianza muestral 2 (S²ᵧ): ${sy2}</p>
        <p>Tamaño muestra 1 (nₓ): ${nx}</p>
        <p>Tamaño muestra 2 (nᵧ): ${ny}</p>
        <hr>
        <p><strong>Interpretación:</strong> El cociente de varianzas es ${F.toFixed(4)}, lo que indica que la varianza de la primera muestra es ${F > 1 ? (F.toFixed(2) + ' veces mayor') : (1/F).toFixed(2) + ' veces menor'} que la segunda.</p>
    `;
    
    mostrarResultado('f-var-result', resultado, 'info');
    graficarFTest(F, gl1, gl2);
}

function graficarFTest(FCalc, gl1, gl2) {
    const canvas = document.getElementById('f-var-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    const maxX = Math.max(5, FCalc + 2);
    for (let x = 0.1; x <= maxX; x += maxX / 100) {
        labels.push(x.toFixed(2));
        // Aproximación simplificada de F
        const y = Math.pow(x, gl1/2 - 1) * Math.exp(-x);
        data.push(y > 0 ? y : 0);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución F',
                data: data,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución F (gl₁=${gl1}, gl₂=${gl2}, F=${FCalc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor F' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// Continúa con Intervalos de Confianza...

// ========================================
// IV. INTERVALOS DE CONFIANZA
// ========================================

// 1. Media (σ conocida)
function calcularICMedia() {
    const xbar = parseFloat(document.getElementById('ic-media-xbar').value);
    const sigma = parseFloat(document.getElementById('ic-media-sigma').value);
    const n = parseInt(document.getElementById('ic-media-n').value);
    const confianza = parseInt(document.getElementById('ic-media-conf').value);
    
    const z = getZValue(confianza);
    const errorEst = sigma / Math.sqrt(n);
    const margenError = z * errorEst;
    
    const limInf = xbar - margenError;
    const limSup = xbar + margenError;
    
    let resultado = `
        <h4>Intervalo de Confianza para la Media (σ conocida)</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <hr>
        <p><strong>Detalles del cálculo:</strong></p>
        <p>Media muestral (X̄): ${xbar}</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)}</p>
        <p>Desviación estándar (σ): ${sigma}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con un ${confianza}% de confianza, la verdadera media poblacional (μ) se encuentra entre ${limInf.toFixed(4)} y ${limSup.toFixed(4)}.</p>
    `;
    
    mostrarResultado('ic-media-result', resultado, 'success');
    graficarICMedia(xbar, limInf, limSup, sigma, n);
}

function graficarICMedia(xbar, limInf, limSup, sigma, n) {
    const canvas = document.getElementById('ic-media-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    const rango = Math.max(sigma, limSup - limInf) * 2;
    const inicio = xbar - rango;
    const fin = xbar + rango;
    const paso = (fin - inicio) / 100;
    
    for (let x = inicio; x <= fin; x += paso) {
        labels.push(x.toFixed(2));
        const y = normalPDF(x, xbar, sigma / Math.sqrt(n));
        data.push(y);
        backgroundColors.push(x >= limInf && x <= limSup ? 'rgba(76, 175, 80, 0.6)' : 'rgba(189, 195, 199, 0.3)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución de la media',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Intervalo de Confianza [${limInf.toFixed(2)}, ${limSup.toFixed(2)}]`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor de la media' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 2. Media (σ desconocida)
function calcularICMediaT() {
    const xbar = parseFloat(document.getElementById('ic-media-t-xbar').value);
    const s = parseFloat(document.getElementById('ic-media-t-s').value);
    const n = parseInt(document.getElementById('ic-media-t-n').value);
    const confianza = parseInt(document.getElementById('ic-media-t-conf').value);
    
    const gl = n - 1;
    const t = getTValue(gl, confianza);
    const errorEst = s / Math.sqrt(n);
    const margenError = t * errorEst;
    
    const limInf = xbar - margenError;
    const limSup = xbar + margenError;
    
    let resultado = `
        <h4>Intervalo de Confianza para la Media (σ desconocida)</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <hr>
        <p><strong>Detalles del cálculo:</strong></p>
        <p>Media muestral (X̄): ${xbar}</p>
        <p>Grados de libertad: ${gl}</p>
        <p>Valor t: ${t.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)}</p>
        <p>Desviación estándar muestral (S): ${s}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con un ${confianza}% de confianza y ${gl} grados de libertad, la verdadera media poblacional (μ) se encuentra entre ${limInf.toFixed(4)} y ${limSup.toFixed(4)}.</p>
    `;
    
    mostrarResultado('ic-media-t-result', resultado, 'success');
    graficarICMediaT(xbar, limInf, limSup, s, n);
}

function graficarICMediaT(xbar, limInf, limSup, s, n) {
    const canvas = document.getElementById('ic-media-t-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    const rango = Math.max(s, limSup - limInf) * 2;
    const inicio = xbar - rango;
    const fin = xbar + rango;
    const paso = (fin - inicio) / 100;
    
    for (let x = inicio; x <= fin; x += paso) {
        labels.push(x.toFixed(2));
        const y = normalPDF(x, xbar, s / Math.sqrt(n));
        data.push(y);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución t de la media',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `IC con t-Student [${limInf.toFixed(2)}, ${limSup.toFixed(2)}]`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor de la media' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 3. Diferencia de Medias (σ conocidas)
function calcularICDifMedias() {
    const xbar = parseFloat(document.getElementById('ic-dif-media-xbar').value);
    const ybar = parseFloat(document.getElementById('ic-dif-media-ybar').value);
    const sigmax = parseFloat(document.getElementById('ic-dif-media-sigmax').value);
    const sigmay = parseFloat(document.getElementById('ic-dif-media-sigmay').value);
    const nx = parseInt(document.getElementById('ic-dif-media-nx').value);
    const ny = parseInt(document.getElementById('ic-dif-media-ny').value);
    const confianza = parseInt(document.getElementById('ic-dif-media-conf').value);
    
    const z = getZValue(confianza);
    const errorEst = Math.sqrt((sigmax * sigmax / nx) + (sigmay * sigmay / ny));
    const margenError = z * errorEst;
    
    const difMedias = xbar - ybar;
    const limInf = difMedias - margenError;
    const limSup = difMedias + margenError;
    
    let resultado = `
        <h4>IC para Diferencia de Medias (σ conocidas)</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <hr>
        <p><strong>Detalles:</strong></p>
        <p>Diferencia de medias (X̄ - Ȳ): ${difMedias.toFixed(4)}</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${confianza}% de confianza, la verdadera diferencia entre las medias poblacionales (μₓ - μᵧ) está entre ${limInf.toFixed(4)} y ${limSup.toFixed(4)}. ${limInf > 0 ? 'La primera media es significativamente mayor.' : limSup < 0 ? 'La segunda media es significativamente mayor.' : 'No hay diferencia significativa.'}</p>
    `;
    
    mostrarResultado('ic-dif-media-result', resultado, 'success');
}

// 4. Diferencia de Medias (σ desconocidas e iguales)
function calcularICDifMediasT() {
    const xbar = parseFloat(document.getElementById('ic-dif-media-t-xbar').value);
    const ybar = parseFloat(document.getElementById('ic-dif-media-t-ybar').value);
    const sx2 = parseFloat(document.getElementById('ic-dif-media-t-sx2').value);
    const sy2 = parseFloat(document.getElementById('ic-dif-media-t-sy2').value);
    const nx = parseInt(document.getElementById('ic-dif-media-t-nx').value);
    const ny = parseInt(document.getElementById('ic-dif-media-t-ny').value);
    const confianza = parseInt(document.getElementById('ic-dif-media-t-conf').value);
    
    // Varianza ponderada
    const sp2 = ((nx - 1) * sx2 + (ny - 1) * sy2) / (nx + ny - 2);
    const sp = Math.sqrt(sp2);
    
    const gl = nx + ny - 2;
    const t = getTValue(gl, confianza);
    const errorEst = sp * Math.sqrt(1/nx + 1/ny);
    const margenError = t * errorEst;
    
    const difMedias = xbar - ybar;
    const limInf = difMedias - margenError;
    const limSup = difMedias + margenError;
    
    let resultado = `
        <h4>IC para Diferencia de Medias (σ desconocidas e iguales)</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <hr>
        <p><strong>Detalles:</strong></p>
        <p>Diferencia de medias (X̄ - Ȳ): ${difMedias.toFixed(4)}</p>
        <p>Grados de libertad: ${gl}</p>
        <p>Valor t: ${t.toFixed(4)}</p>
        <p>Desviación estándar ponderada (Sₚ): ${sp.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${confianza}% de confianza y varianzas asumidas iguales, la diferencia real (μₓ - μᵧ) está entre ${limInf.toFixed(4)} y ${limSup.toFixed(4)}.</p>
    `;
    
    mostrarResultado('ic-dif-media-t-result', resultado, 'success');
}

// 5. Proporción
function calcularICProporcion() {
    const pbar = parseFloat(document.getElementById('ic-prop-pbar').value);
    const n = parseInt(document.getElementById('ic-prop-n').value);
    const confianza = parseInt(document.getElementById('ic-prop-conf').value);
    
    const z = getZValue(confianza);
    const errorEst = Math.sqrt((pbar * (1 - pbar)) / n);
    const margenError = z * errorEst;
    
    const limInf = Math.max(0, pbar - margenError);
    const limSup = Math.min(1, pbar + margenError);
    
    let resultado = `
        <h4>Intervalo de Confianza para la Proporción</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <p class="text-center" style="font-size: 1.1rem;">
            <strong>[${(limInf * 100).toFixed(2)}%, ${(limSup * 100).toFixed(2)}%]</strong>
        </p>
        <hr>
        <p><strong>Detalles:</strong></p>
        <p>Proporción muestral (P̄): ${pbar} (${(pbar * 100).toFixed(2)}%)</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)} (±${(margenError * 100).toFixed(2)}%)</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${confianza}% de confianza, la verdadera proporción poblacional está entre ${(limInf * 100).toFixed(2)}% y ${(limSup * 100).toFixed(2)}%.</p>
    `;
    
    mostrarResultado('ic-prop-result', resultado, 'success');
}

// 6. Diferencia de Proporciones
function calcularICDifProporciones() {
    const p1 = parseFloat(document.getElementById('ic-dif-prop-p1').value);
    const p2 = parseFloat(document.getElementById('ic-dif-prop-p2').value);
    const n1 = parseInt(document.getElementById('ic-dif-prop-n1').value);
    const n2 = parseInt(document.getElementById('ic-dif-prop-n2').value);
    const confianza = parseInt(document.getElementById('ic-dif-prop-conf').value);
    
    const z = getZValue(confianza);
    const errorEst = Math.sqrt((p1 * (1 - p1) / n1) + (p2 * (1 - p2) / n2));
    const margenError = z * errorEst;
    
    const difProp = p1 - p2;
    const limInf = difProp - margenError;
    const limSup = difProp + margenError;
    
    let resultado = `
        <h4>IC para Diferencia de Proporciones</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <p class="text-center" style="font-size: 1.1rem;">
            <strong>[${(limInf * 100).toFixed(2)}%, ${(limSup * 100).toFixed(2)}%]</strong>
        </p>
        <hr>
        <p><strong>Detalles:</strong></p>
        <p>Diferencia de proporciones (P̄₁ - P̄₂): ${difProp.toFixed(4)} (${(difProp * 100).toFixed(2)}%)</p>
        <p>Valor Z: ${z.toFixed(4)}</p>
        <p>Error estándar: ${errorEst.toFixed(4)}</p>
        <p>Margen de error: ±${margenError.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${confianza}% de confianza, la verdadera diferencia entre proporciones (P₁ - P₂) está entre ${(limInf * 100).toFixed(2)}% y ${(limSup * 100).toFixed(2)}%. ${limInf > 0 ? 'La primera proporción es significativamente mayor.' : limSup < 0 ? 'La segunda proporción es significativamente mayor.' : 'No hay diferencia significativa.'}</p>
    `;
    
    mostrarResultado('ic-dif-prop-result', resultado, 'success');
}

// 7. Varianza
function calcularICVarianza() {
    const s2 = parseFloat(document.getElementById('ic-var-s2').value);
    const n = parseInt(document.getElementById('ic-var-n').value);
    const confianza = parseInt(document.getElementById('ic-var-conf').value);
    
    const gl = n - 1;
    const alpha = (100 - confianza) / 100;
    
    const chiInf = getChiValue(gl, 1 - alpha/2);
    const chiSup = getChiValue(gl, alpha/2);
    
    const limInf = (gl * s2) / chiInf;
    const limSup = (gl * s2) / chiSup;
    
    let resultado = `
        <h4>Intervalo de Confianza para la Varianza</h4>
        <p><strong>Intervalo de Confianza al ${confianza}%:</strong></p>
        <p class="text-center" style="font-size: 1.2rem; color: var(--dark-pink);">
            <strong>[${limInf.toFixed(4)}, ${limSup.toFixed(4)}]</strong>
        </p>
        <p><strong>Desviación estándar:</strong></p>
        <p class="text-center" style="font-size: 1.1rem;">
            <strong>[${Math.sqrt(limInf).toFixed(4)}, ${Math.sqrt(limSup).toFixed(4)}]</strong>
        </p>
        <hr>
        <p><strong>Detalles:</strong></p>
        <p>Varianza muestral (S²): ${s2}</p>
        <p>Desviación estándar muestral (S): ${Math.sqrt(s2).toFixed(4)}</p>
        <p>Grados de libertad: ${gl}</p>
        <p>χ²(${gl}; ${alpha/2}): ${chiSup.toFixed(4)}</p>
        <p>χ²(${gl}; ${1-alpha/2}): ${chiInf.toFixed(4)}</p>
        <hr>
        <p><strong>Interpretación:</strong> Con ${confianza}% de confianza, la verdadera varianza poblacional (σ²) se encuentra entre ${limInf.toFixed(4)} y ${limSup.toFixed(4)}.</p>
    `;
    
    mostrarResultado('ic-var-result', resultado, 'success');
}

// ========================================
// V. PRUEBAS DE HIPÓTESIS
// ========================================

// 1. Prueba de Hipótesis - Media (σ conocida)
function calcularPHMedia() {
    const tipo = document.getElementById('ph-media-tipo').value;
    const mu0 = parseFloat(document.getElementById('ph-media-mu0').value);
    const xbar = parseFloat(document.getElementById('ph-media-xbar').value);
    const sigma = parseFloat(document.getElementById('ph-media-sigma').value);
    const n = parseInt(document.getElementById('ph-media-n').value);
    const alpha = parseFloat(document.getElementById('ph-media-alpha').value);
    
    const errorEst = sigma / Math.sqrt(n);
    const z = (xbar - mu0) / errorEst;
    
    let zCritico1, zCritico2;
    let decision = '';
    let hipotesis = '';
    
    if (tipo === 'bilateral') {
        zCritico1 = -getZValue((1 - alpha) * 100);
        zCritico2 = getZValue((1 - alpha) * 100);
        decision = (z < zCritico1 || z > zCritico2) ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ = ${mu0}<br>Hₐ: μ ≠ ${mu0}`;
    } else if (tipo === 'derecha') {
        zCritico2 = getZValue((1 - alpha) * 100);
        decision = z > zCritico2 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ ≤ ${mu0}<br>Hₐ: μ > ${mu0}`;
    } else {
        zCritico1 = -getZValue((1 - alpha) * 100);
        decision = z < zCritico1 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ ≥ ${mu0}<br>Hₐ: μ < ${mu0}`;
    }
    
    const pValor = tipo === 'bilateral' ? 
        2 * Math.min(normalCDF(z), 1 - normalCDF(z)) :
        tipo === 'derecha' ? 1 - normalCDF(z) : normalCDF(z);
    
    let resultado = `
        <h4>Prueba de Hipótesis para la Media (σ conocida)</h4>
        <p><strong>Hipótesis:</strong></p>
        <p>${hipotesis}</p>
        <hr>
        <p><strong>Estadístico calculado (Z):</strong> ${z.toFixed(4)}</p>
        <p><strong>Valor(es) crítico(s):</strong> ${tipo === 'bilateral' ? `±${zCritico2.toFixed(4)}` : tipo === 'derecha' ? zCritico2.toFixed(4) : zCritico1.toFixed(4)}</p>
        <p><strong>P-valor:</strong> ${pValor.toFixed(6)}</p>
        <p><strong>Nivel de significancia (α):</strong> ${alpha}</p>
        <hr>
        <p class="text-center" style="font-size: 1.3rem; color: ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'var(--error-color)' : 'var(--success-color)'};">
            <strong>${decision}</strong>
        </p>
        <hr>
        <p><strong>Interpretación:</strong> ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 
            `Hay evidencia estadística suficiente para rechazar la hipótesis nula. La media poblacional ${tipo === 'bilateral' ? 'es diferente de' : tipo === 'derecha' ? 'es mayor que' : 'es menor que'} ${mu0}.` :
            `No hay evidencia estadística suficiente para rechazar la hipótesis nula. No se puede concluir que la media poblacional ${tipo === 'bilateral' ? 'sea diferente de' : tipo === 'derecha' ? 'sea mayor que' : 'sea menor que'} ${mu0}.`
        }</p>
    `;
    
    mostrarResultado('ph-media-result', resultado, decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'warning' : 'success');
    graficarPHMedia(z, zCritico1, zCritico2, tipo);
}

function graficarPHMedia(zCalc, zCrit1, zCrit2, tipo) {
    const canvas = document.getElementById('ph-media-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    for (let z = -4; z <= 4; z += 0.08) {
        labels.push(z.toFixed(2));
        const y = normalPDF(z, 0, 1);
        data.push(y);
        
        let inRechazo = false;
        if (tipo === 'bilateral') {
            inRechazo = z <= zCrit1 || z >= zCrit2;
        } else if (tipo === 'derecha') {
            inRechazo = z >= zCrit2;
        } else {
            inRechazo = z <= zCrit1;
        }
        
        backgroundColors.push(inRechazo ? 'rgba(244, 67, 54, 0.5)' : 'rgba(76, 175, 80, 0.4)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución Z',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: function(context) {
                    return backgroundColors[context.dataIndex];
                },
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                segment: {
                    backgroundColor: context => backgroundColors[context.p0DataIndex]
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Prueba ${tipo === 'bilateral' ? 'Bilateral' : tipo === 'derecha' ? 'Cola Derecha' : 'Cola Izquierda'} (Z = ${zCalc.toFixed(4)})`,
                    font: { size: 16 }
                },
                legend: {
                    display: true,
                    labels: {
                        generateLabels: function() {
                            return [
                                { text: 'Zona de Aceptación', fillStyle: 'rgba(76, 175, 80, 0.4)' },
                                { text: 'Zona de Rechazo', fillStyle: 'rgba(244, 67, 54, 0.5)' }
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor Z' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// 2. Prueba de Hipótesis - Media (σ desconocida)
function calcularPHMediaT() {
    const tipo = document.getElementById('ph-media-t-tipo').value;
    const mu0 = parseFloat(document.getElementById('ph-media-t-mu0').value);
    const xbar = parseFloat(document.getElementById('ph-media-t-xbar').value);
    const s = parseFloat(document.getElementById('ph-media-t-s').value);
    const n = parseInt(document.getElementById('ph-media-t-n').value);
    const alpha = parseFloat(document.getElementById('ph-media-t-alpha').value);
    
    const gl = n - 1;
    const errorEst = s / Math.sqrt(n);
    const t = (xbar - mu0) / errorEst;
    
    let tCritico1, tCritico2;
    let decision = '';
    let hipotesis = '';
    
    if (tipo === 'bilateral') {
        tCritico2 = getTValue(gl, (1 - alpha) * 100);
        tCritico1 = -tCritico2;
        decision = (t < tCritico1 || t > tCritico2) ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ = ${mu0}<br>Hₐ: μ ≠ ${mu0}`;
    } else if (tipo === 'derecha') {
        tCritico2 = getTValue(gl, (1 - alpha) * 100);
        decision = t > tCritico2 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ ≤ ${mu0}<br>Hₐ: μ > ${mu0}`;
    } else {
        tCritico1 = -getTValue(gl, (1 - alpha) * 100);
        decision = t < tCritico1 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: μ ≥ ${mu0}<br>Hₐ: μ < ${mu0}`;
    }
    
    let resultado = `
        <h4>Prueba de Hipótesis para la Media (σ desconocida)</h4>
        <p><strong>Hipótesis:</strong></p>
        <p>${hipotesis}</p>
        <hr>
        <p><strong>Estadístico calculado (t):</strong> ${t.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> ${gl}</p>
        <p><strong>Valor(es) crítico(s):</strong> ${tipo === 'bilateral' ? `±${tCritico2.toFixed(4)}` : tipo === 'derecha' ? tCritico2.toFixed(4) : tCritico1.toFixed(4)}</p>
        <p><strong>Nivel de significancia (α):</strong> ${alpha}</p>
        <hr>
        <p class="text-center" style="font-size: 1.3rem; color: ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'var(--error-color)' : 'var(--success-color)'};">
            <strong>${decision}</strong>
        </p>
        <hr>
        <p><strong>Interpretación:</strong> ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 
            `Con ${gl} grados de libertad, hay evidencia suficiente para rechazar H₀. La media es ${tipo === 'bilateral' ? 'diferente de' : tipo === 'derecha' ? 'mayor que' : 'menor que'} ${mu0}.` :
            `Con ${gl} grados de libertad, no hay evidencia suficiente para rechazar H₀.`
        }</p>
    `;
    
    mostrarResultado('ph-media-t-result', resultado, decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'warning' : 'success');
    graficarPHMediaT(t, tCritico1, tCritico2, tipo, gl);
}

function graficarPHMediaT(tCalc, tCrit1, tCrit2, tipo, gl) {
    const canvas = document.getElementById('ph-media-t-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    for (let t = -4; t <= 4; t += 0.08) {
        labels.push(t.toFixed(2));
        const y = normalPDF(t, 0, 1);
        data.push(y);
        
        let inRechazo = false;
        if (tipo === 'bilateral') {
            inRechazo = t <= tCrit1 || t >= tCrit2;
        } else if (tipo === 'derecha') {
            inRechazo = t >= tCrit2;
        } else {
            inRechazo = t <= tCrit1;
        }
        
        backgroundColors.push(inRechazo ? 'rgba(244, 67, 54, 0.5)' : 'rgba(76, 175, 80, 0.4)');
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución t',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Prueba t ${tipo === 'bilateral' ? 'Bilateral' : tipo === 'derecha' ? 'Cola Derecha' : 'Cola Izquierda'} (gl=${gl}, t=${tCalc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Densidad' }
                },
                x: {
                    title: { display: true, text: 'Valor t' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// Continúa con más pruebas de hipótesis...

// 3. Prueba de Hipótesis - Proporción
function calcularPHProporcion() {
    const tipo = document.getElementById('ph-prop-tipo').value;
    const p0 = parseFloat(document.getElementById('ph-prop-p0').value);
    const pbar = parseFloat(document.getElementById('ph-prop-pbar').value);
    const n = parseInt(document.getElementById('ph-prop-n').value);
    const alpha = parseFloat(document.getElementById('ph-prop-alpha').value);
    
    const q0 = 1 - p0;
    const errorEst = Math.sqrt((p0 * q0) / n);
    const z = (pbar - p0) / errorEst;
    
    let zCritico1, zCritico2;
    let decision = '';
    let hipotesis = '';
    
    if (tipo === 'bilateral') {
        zCritico1 = -getZValue((1 - alpha) * 100);
        zCritico2 = getZValue((1 - alpha) * 100);
        decision = (z < zCritico1 || z > zCritico2) ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: P = ${p0}<br>Hₐ: P ≠ ${p0}`;
    } else if (tipo === 'derecha') {
        zCritico2 = getZValue((1 - alpha) * 100);
        decision = z > zCritico2 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: P ≤ ${p0}<br>Hₐ: P > ${p0}`;
    } else {
        zCritico1 = -getZValue((1 - alpha) * 100);
        decision = z < zCritico1 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: P ≥ ${p0}<br>Hₐ: P < ${p0}`;
    }
    
    const pValor = tipo === 'bilateral' ? 
        2 * Math.min(normalCDF(z), 1 - normalCDF(z)) :
        tipo === 'derecha' ? 1 - normalCDF(z) : normalCDF(z);
    
    let resultado = `
        <h4>Prueba de Hipótesis para la Proporción</h4>
        <p><strong>Hipótesis:</strong></p>
        <p>${hipotesis}</p>
        <hr>
        <p><strong>Estadístico calculado (Z):</strong> ${z.toFixed(4)}</p>
        <p><strong>Valor(es) crítico(s):</strong> ${tipo === 'bilateral' ? `±${zCritico2.toFixed(4)}` : tipo === 'derecha' ? zCritico2.toFixed(4) : zCritico1.toFixed(4)}</p>
        <p><strong>P-valor:</strong> ${pValor.toFixed(6)}</p>
        <p><strong>Nivel de significancia (α):</strong> ${alpha}</p>
        <hr>
        <p><strong>Datos:</strong></p>
        <p>Proporción muestral (p̄): ${pbar} (${(pbar * 100).toFixed(2)}%)</p>
        <p>Proporción hipotética (P₀): ${p0} (${(p0 * 100).toFixed(2)}%)</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p class="text-center" style="font-size: 1.3rem; color: ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'var(--error-color)' : 'var(--success-color)'};">
            <strong>${decision}</strong>
        </p>
        <hr>
        <p><strong>Interpretación:</strong> ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 
            `Hay evidencia suficiente para rechazar H₀. La proporción poblacional ${tipo === 'bilateral' ? 'es diferente de' : tipo === 'derecha' ? 'es mayor que' : 'es menor que'} ${(p0 * 100).toFixed(2)}%.` :
            `No hay evidencia suficiente para rechazar H₀. No se puede concluir que la proporción ${tipo === 'bilateral' ? 'sea diferente de' : tipo === 'derecha' ? 'sea mayor que' : 'sea menor que'} ${(p0 * 100).toFixed(2)}%.`
        }</p>
    `;
    
    mostrarResultado('ph-prop-result', resultado, decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'warning' : 'success');
    graficarPHProporcion(z, zCritico1, zCritico2, tipo);
}

function graficarPHProporcion(zCalc, zCrit1, zCrit2, tipo) {
    const canvas = document.getElementById('ph-prop-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    for (let z = -4; z <= 4; z += 0.08) {
        labels.push(z.toFixed(2));
        data.push(normalPDF(z, 0, 1));
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución Z',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Prueba de Proporción (Z = ${zCalc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Densidad' } },
                x: { title: { display: true, text: 'Valor Z' }, ticks: { maxTicksLimit: 10 } }
            }
        }
    });
}

// 4. Prueba de Hipótesis - Varianza
function calcularPHVarianza() {
    const tipo = document.getElementById('ph-var-tipo').value;
    const sigma20 = parseFloat(document.getElementById('ph-var-sigma20').value);
    const s2 = parseFloat(document.getElementById('ph-var-s2').value);
    const n = parseInt(document.getElementById('ph-var-n').value);
    const alpha = parseFloat(document.getElementById('ph-var-alpha').value);
    
    const gl = n - 1;
    const chi2 = (gl * s2) / sigma20;
    
    let chi2Critico1, chi2Critico2;
    let decision = '';
    let hipotesis = '';
    
    if (tipo === 'bilateral') {
        chi2Critico1 = getChiValue(gl, alpha / 2);
        chi2Critico2 = getChiValue(gl, 1 - alpha / 2);
        decision = (chi2 < chi2Critico1 || chi2 > chi2Critico2) ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: σ² = ${sigma20}<br>Hₐ: σ² ≠ ${sigma20}`;
    } else if (tipo === 'derecha') {
        chi2Critico2 = getChiValue(gl, 1 - alpha);
        decision = chi2 > chi2Critico2 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: σ² ≤ ${sigma20}<br>Hₐ: σ² > ${sigma20}`;
    } else {
        chi2Critico1 = getChiValue(gl, alpha);
        decision = chi2 < chi2Critico1 ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: σ² ≥ ${sigma20}<br>Hₐ: σ² < ${sigma20}`;
    }
    
    let resultado = `
        <h4>Prueba de Hipótesis para la Varianza</h4>
        <p><strong>Hipótesis:</strong></p>
        <p>${hipotesis}</p>
        <hr>
        <p><strong>Estadístico calculado (χ²):</strong> ${chi2.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> ${gl}</p>
        <p><strong>Valor(es) crítico(s):</strong> ${tipo === 'bilateral' ? `[${chi2Critico1.toFixed(4)}, ${chi2Critico2.toFixed(4)}]` : tipo === 'derecha' ? chi2Critico2.toFixed(4) : chi2Critico1.toFixed(4)}</p>
        <p><strong>Nivel de significancia (α):</strong> ${alpha}</p>
        <hr>
        <p><strong>Datos:</strong></p>
        <p>Varianza muestral (S²): ${s2}</p>
        <p>Varianza hipotética (σ²₀): ${sigma20}</p>
        <p>Tamaño de muestra (n): ${n}</p>
        <hr>
        <p class="text-center" style="font-size: 1.3rem; color: ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'var(--error-color)' : 'var(--success-color)'};">
            <strong>${decision}</strong>
        </p>
        <hr>
        <p><strong>Interpretación:</strong> ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 
            `Hay evidencia suficiente para rechazar H₀. La varianza poblacional ${tipo === 'bilateral' ? 'es diferente de' : tipo === 'derecha' ? 'es mayor que' : 'es menor que'} ${sigma20}.` :
            `No hay evidencia suficiente para rechazar H₀.`
        }</p>
    `;
    
    mostrarResultado('ph-var-result', resultado, decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'warning' : 'success');
    graficarPHVarianza(chi2, chi2Critico1, chi2Critico2, tipo, gl);
}

function graficarPHVarianza(chi2Calc, chi2Crit1, chi2Crit2, tipo, gl) {
    const canvas = document.getElementById('ph-var-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    const maxX = Math.max(gl * 2, chi2Calc + 10);
    for (let x = 0; x <= maxX; x += maxX / 100) {
        labels.push(x.toFixed(2));
        const y = x > 0 ? Math.pow(x, gl/2 - 1) * Math.exp(-x/2) : 0;
        data.push(y);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución χ²',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Prueba de Varianza (gl=${gl}, χ²=${chi2Calc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Densidad' } },
                x: { title: { display: true, text: 'Valor χ²' }, ticks: { maxTicksLimit: 10 } }
            }
        }
    });
}

// 5. Prueba de Hipótesis - Dos Varianzas (F)
function calcularPHDosVarianzas() {
    const tipo = document.getElementById('ph-f-tipo').value;
    const s21 = parseFloat(document.getElementById('ph-f-s21').value);
    const s22 = parseFloat(document.getElementById('ph-f-s22').value);
    const n1 = parseInt(document.getElementById('ph-f-n1').value);
    const n2 = parseInt(document.getElementById('ph-f-n2').value);
    const alpha = parseFloat(document.getElementById('ph-f-alpha').value);
    
    const gl1 = n1 - 1;
    const gl2 = n2 - 1;
    const F = s21 / s22;
    
    // Valores críticos aproximados
    const FCritico = getFValue(gl1, gl2, alpha);
    
    let decision = '';
    let hipotesis = '';
    
    if (tipo === 'bilateral') {
        decision = (F > FCritico || F < 1/FCritico) ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: σ²₁ = σ²₂<br>Hₐ: σ²₁ ≠ σ²₂`;
    } else {
        decision = F > FCritico ? 'RECHAZAR H₀' : 'NO RECHAZAR H₀';
        hipotesis = `H₀: σ²₁ ≤ σ²₂<br>Hₐ: σ²₁ > σ²₂`;
    }
    
    let resultado = `
        <h4>Prueba de Hipótesis para Dos Varianzas (F)</h4>
        <p><strong>Hipótesis:</strong></p>
        <p>${hipotesis}</p>
        <hr>
        <p><strong>Estadístico calculado (F):</strong> ${F.toFixed(4)}</p>
        <p><strong>Grados de libertad:</strong> gl₁ = ${gl1}, gl₂ = ${gl2}</p>
        <p><strong>Valor crítico aproximado (F):</strong> ${FCritico.toFixed(4)}</p>
        <p><strong>Nivel de significancia (α):</strong> ${alpha}</p>
        <hr>
        <p><strong>Datos:</strong></p>
        <p>Varianza muestral 1 (S²₁): ${s21}</p>
        <p>Varianza muestral 2 (S²₂): ${s22}</p>
        <p>Tamaño muestra 1 (n₁): ${n1}</p>
        <p>Tamaño muestra 2 (n₂): ${n2}</p>
        <hr>
        <p class="text-center" style="font-size: 1.3rem; color: ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'var(--error-color)' : 'var(--success-color)'};">
            <strong>${decision}</strong>
        </p>
        <hr>
        <p><strong>Interpretación:</strong> ${decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 
            `Hay evidencia suficiente para rechazar H₀. Las varianzas poblacionales ${tipo === 'bilateral' ? 'son diferentes' : 'la primera es mayor que la segunda'}.` :
            `No hay evidencia suficiente para rechazar H₀. No se puede concluir que las varianzas sean ${tipo === 'bilateral' ? 'diferentes' : 'que la primera sea mayor'}.`
        }</p>
    `;
    
    mostrarResultado('ph-f-result', resultado, decision.includes('RECHAZAR H₀') && !decision.includes('NO') ? 'warning' : 'success');
    graficarPHF(F, FCritico, tipo, gl1, gl2);
}

function graficarPHF(FCalc, FCrit, tipo, gl1, gl2) {
    const canvas = document.getElementById('ph-f-chart');
    if (!canvas) return;
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const labels = [];
    const data = [];
    
    const maxX = Math.max(5, FCalc + 2, FCrit + 1);
    for (let x = 0.1; x <= maxX; x += maxX / 100) {
        labels.push(x.toFixed(2));
        const y = Math.pow(x, gl1/2 - 1) * Math.exp(-x);
        data.push(y > 0 ? y : 0);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución F',
                data: data,
                borderColor: 'rgba(44, 62, 80, 1)',
                backgroundColor: 'rgba(189, 195, 199, 0.3)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Prueba F (gl₁=${gl1}, gl₂=${gl2}, F=${FCalc.toFixed(4)})`,
                    font: { size: 16 }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Densidad' } },
                x: { title: { display: true, text: 'Valor F' }, ticks: { maxTicksLimit: 10 } }
            }
        }
    });
}

// ========================================
// FUNCIÓN AUXILIAR PARA MOSTRAR RESULTADOS
// ========================================

function mostrarResultado(elementId, contenido, tipo = 'info') {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;
    
    elemento.innerHTML = contenido;
    elemento.className = 'result';
    // Accesibilidad: anunciar cambios de resultados
    elemento.setAttribute('role', 'status');
    elemento.setAttribute('aria-live', 'polite');
    
    if (tipo === 'success') {
        elemento.classList.add('result-success');
    } else if (tipo === 'error') {
        elemento.classList.add('result-error');
    } else if (tipo === 'warning') {
        elemento.classList.add('result-warning');
    } else if (tipo === 'info') {
        elemento.classList.add('result-info');
    }
    
    // Scroll suave al resultado
    elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Renderizar MathJax si está disponible
    if (window.MathJax) {
        MathJax.typesetPromise([elemento]).catch((err) => console.log('MathJax error:', err));
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('✨ Estadística Stiven Universe cargada correctamente');
});

