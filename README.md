# ✨ Estadística Stiven Universe

**Calculadora de Estadística Inferencial** - Una plataforma web moderna, profesional y fácil de usar para resolver ejercicios de estadística inferencial.

![Versión](https://img.shields.io/badge/version-1.0.0-pink)
![Licencia](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Características

Esta calculadora completa incluye **5 secciones principales** con todas las herramientas necesarias para el análisis estadístico inferencial:

### I. 📊 Distribuciones de Probabilidad
- **Distribución Binomial**: Calcula probabilidades para eventos discretos con dos resultados posibles
- **Distribución Hipergeométrica**: Para muestreo sin reemplazo en poblaciones finitas
- **Distribución de Poisson**: Modela eventos raros en intervalos de tiempo o espacio
- **Distribución Normal**: La distribución continua más importante, con estandarización Z

### II. 📏 Tamaño de Muestra (Muestreo)
- **Cuantitativa (σ conocida)**: Para poblaciones grandes con varianza conocida
- **Cuantitativa (σ desconocida)**: Para poblaciones pequeñas usando t-Student
- **Cualitativa (Proporción)**: Cálculo de muestra para proporciones
- **Corrección para Población Conocida**: Ajuste cuando se conoce el tamaño poblacional

### III. 📈 Estadísticos Z y t
- **Media - Una Población** (Z y t)
- **Media - Dos Poblaciones** (Z y t)
- **Proporción - Una Población** (Z)
- **Proporción - Dos Poblaciones** (Z)
- **Varianza - Una Población** (χ²)
- **Varianza - Dos Poblaciones** (F)

### IV. 🎯 Intervalos de Confianza
- **Media** (σ conocida y desconocida)
- **Diferencia de Medias** (σ conocidas y desconocidas)
- **Proporción**
- **Diferencia de Proporciones**
- **Varianza**

### V. 🔬 Pruebas de Hipótesis
Incluye estructura completa de pruebas de hipótesis con:
- Establecimiento de hipótesis (H₀ y Hₐ)
- Definición de zonas de aceptación y rechazo
- Cálculo de estadísticos de prueba
- Toma de decisión e interpretación

**Pruebas disponibles:**
- Media (σ conocida y desconocida)
- Proporción
- Varianza
- Dos Varianzas (Prueba F)
- Pruebas bilaterales y unilaterales (cola izquierda/derecha)

## 🎨 Diseño

- **Tema Inspirado en Steven Universe**: Colores vibrantes rosa y paleta armoniosa
- **Totalmente Responsive**: Funciona perfectamente en móviles, tablets y escritorio
- **Interfaz Moderna**: Cards con sombras, animaciones suaves y efectos hover
- **Visualizaciones Gráficas**: Gráficos interactivos con Chart.js para cada distribución
- **Renderizado Matemático**: Fórmulas LaTeX renderizadas con MathJax

### Tamaño de las gráficas (fijo y consistente)

Desde la versión 1.0.1, las gráficas se muestran con un tamaño fijo y consistente en todas las pantallas para evitar que se vean desproporcionadas en monitores grandes.

- Ancho por defecto: 640px (máximo 100% del contenedor)
- Alto por defecto: 360px

Puedes ajustar estos valores editando las variables CSS en `styles.css`:

```
:root {
	--chart-width: 640px;
	--chart-height: 360px;
}
```

En móviles, la altura se compacta ligeramente para mejorar la legibilidad sin perder consistencia visual.

## 🚀 Uso

### Abrir la Aplicación

Simplemente abre `index.html` en tu navegador web favorito. No requiere instalación ni servidor.

```bash
# Opción 1: Abrir directamente
open index.html  # macOS
start index.html  # Windows
xdg-open index.html  # Linux

# Opción 2: Servidor local con Python
python -m http.server 8000
# Luego navega a http://localhost:8000

# Opción 3: Servidor local con Node.js
npx http-server
```

### Navegación

1. **Selecciona una sección** usando los botones de navegación en la parte superior
2. **Ingresa los valores** en los campos correspondientes
3. **Haz clic en "Calcular"** para obtener los resultados
4. **Visualiza** los resultados con interpretaciones detalladas y gráficos

### Ejemplos de Uso

#### Ejemplo 1: Distribución Binomial
```
n = 10 (número de ensayos)
x = 3 (número de éxitos)
p = 0.5 (probabilidad de éxito)

Resultado: P(X=3) = 0.1172 (11.72%)
```

#### Ejemplo 2: Intervalo de Confianza para la Media
```
X̄ = 105 (media muestral)
σ = 15 (desviación estándar)
n = 36 (tamaño de muestra)
Confianza = 95%

Resultado: IC = [100.1, 109.9]
```

#### Ejemplo 3: Prueba de Hipótesis para la Media
```
H₀: μ = 100
Hₐ: μ ≠ 100 (bilateral)
x̄ = 105
σ = 15
n = 36
α = 0.05

Resultado: Z = 2.0, Rechazar H₀
```

## 📚 Conceptos Clave

### Distribuciones de Probabilidad
Las distribuciones modelan cómo se distribuyen los valores de una variable aleatoria:
- **Discretas**: Binomial, Hipergeométrica, Poisson
- **Continuas**: Normal

### Intervalos de Confianza vs. Pruebas de Hipótesis

**Analogía del Tesoro Escondido:**
- **Prueba de Hipótesis**: Como un detector de metales simple que te dice SI o NO está en un punto específico
- **Intervalo de Confianza**: Como un mapa de búsqueda que te da un RANGO donde probablemente se encuentra

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con Flexbox y Grid
- **JavaScript (ES6+)**: Lógica de cálculos
- **Chart.js 4.4**: Visualizaciones interactivas
- **MathJax 3**: Renderizado de fórmulas matemáticas

## 📊 Fórmulas Incluidas

La aplicación implementa correctamente todas las fórmulas estándar:

- ✅ P(X=x) = C(n,x) × p^x × q^(n-x) (Binomial)
- ✅ P(X=x) = [C(N₁,x) × C(N₂,n-x)] / C(N,n) (Hipergeométrica)
- ✅ P(X=x) = (e^(-λ) × λ^x) / x! (Poisson)
- ✅ Z = (X - μ) / σ (Normal)
- ✅ n = (z² × σ²) / e² (Tamaño de muestra)
- ✅ IC: X̄ ± Z × (σ/√n) (Intervalo de confianza)
- ✅ Todas las fórmulas de estadísticos Z, t, χ², F

## 🎯 Características Destacadas

1. **Validación de Datos**: Verifica que los valores ingresados sean válidos
2. **Interpretaciones Claras**: Cada resultado incluye una interpretación en lenguaje simple
3. **Gráficos Dinámicos**: Visualiza las distribuciones y zonas de decisión
4. **Tablas Estadísticas**: Valores tabulados para Z, t, χ² y F
5. **Diseño Responsive**: Adaptado para todos los dispositivos
6. **Sin Dependencias del Servidor**: Funciona completamente offline

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+
- ✅ Navegadores móviles (iOS y Android)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un error o tienes una sugerencia:

1. Reporta el issue
2. Propón mejoras
3. Envía pull requests

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo libremente para fines educativos y comerciales.

## 💖 Créditos

Creado con ❤️ para facilitar el aprendizaje de la estadística inferencial.

Tema inspirado en **Steven Universe**, la serie animada que nos enseña sobre empatía, amistad y crecimiento personal.

---

## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/JuanGaitanD/calculadora-estadistica-inferencial.git

# Entrar al directorio
cd calculadora-estadistica-inferencial

# Abrir en el navegador
open index.html
```

## 📞 Soporte

Si necesitas ayuda o tienes preguntas:
- 📧 Email: [tu-email]
- 🐛 Issues: [GitHub Issues](https://github.com/JuanGaitanD/calculadora-estadistica-inferencial/issues)

---

**✨ ¡Que la estadística esté contigo!** 💎🌟
