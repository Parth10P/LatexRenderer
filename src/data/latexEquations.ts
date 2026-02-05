export const LATEX_EQUATIONS = [
  // Simple equations
  'x^2 + y^2 = z^2',
  'E = mc^2',
  'a^2 + b^2 = c^2',
  'f(x) = x^2',
  '\\pi \\approx 3.14159',

  // Medium complexity
  '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
  '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
  '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
  '\\int x^2 dx = \\frac{x^3}{3} + C',
  '\\sqrt{x^2 + y^2}',

  // Trigonometry
  '\\sin^2(x) + \\cos^2(x) = 1',
  '\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}',
  'e^{i\\pi} + 1 = 0',
  '\\sin(2x) = 2\\sin(x)\\cos(x)',
  '\\cos(a+b) = \\cos a \\cos b - \\sin a \\sin b',

  // Calculus
  '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
  '\\frac{d}{dx}[\\sin(x)] = \\cos(x)',
  '\\frac{\\partial f}{\\partial x}',
  '\\nabla \\cdot \\vec{F} = 0',
  '\\oint_C \\vec{F} \\cdot d\\vec{r}',

  // Linear Algebra
  '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  '\\det(A) = ad - bc',
  'A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)',
  '\\vec{a} \\times \\vec{b}',
  '\\|\\vec{v}\\| = \\sqrt{v_1^2 + v_2^2 + v_3^2}',

  // Complex equations
  '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
  '\\prod_{i=1}^{n} x_i',
  '\\bigcup_{i=1}^{n} A_i',
  '\\forall x \\in \\mathbb{R}',
  '\\exists y : y > x',

  // Physics
  'F = G\\frac{m_1 m_2}{r^2}',
  'PV = nRT',
  '\\Delta E = \\hbar \\omega',
  'S = k_B \\ln W',
  '\\vec{F} = m\\vec{a}',

  // Statistics
  '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i',
  '\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\mu)^2}',
  'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
  '\\mathbb{E}[X] = \\sum_{i} x_i p_i',
  'Var(X) = \\mathbb{E}[X^2] - (\\mathbb{E}[X])^2',

  // More equations to reach 50+
  '\\alpha + \\beta = \\gamma',
  '\\theta = \\arctan\\left(\\frac{y}{x}\\right)',
  '\\log_a(xy) = \\log_a x + \\log_a y',
  'n! = n \\times (n-1)!',
  '\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}',
  '\\Gamma(n) = (n-1)!',
  '\\phi = \\frac{1 + \\sqrt{5}}{2}',
  'i^2 = -1',
  '|z| = \\sqrt{a^2 + b^2}',
  '\\arg(z) = \\arctan\\left(\\frac{b}{a}\\right)',

  '\\left(a_1 + a_2 + a_3 + a_4 + a_5 + a_6 + \\cdots + a_n \\right)^2',
];
