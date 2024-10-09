import{j as n}from"./index-DzR-Ak7Y.js";const r=[{depth:1,value:"Taylor Series",id:"646be"},{depth:1,value:"Bernstein Polynomial",id:"28925"},{depth:1,value:"Numerical analysis introduction",id:"b86a0"}],a={title:"Numerical Analysis, Part 1: Overview and Definitions",date:"2024-08-20",summary:"",wip:!0};function t(i){const e={h1:"h1",p:"p",...i.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.p,{children:"TODO introduction"}),`
`,n.jsx(e.h1,{id:"646be",children:"Taylor Series"}),`
`,n.jsx(e.p,{children:`taylor polynomial, taylor's theorem
Taylor series
convergence of taylor series, holomoprhic functions
error, remainder
mclauren
higher dimensions`}),`
`,n.jsx(e.h1,{id:"28925",children:"Bernstein Polynomial"}),`
`,n.jsx(e.p,{children:`binomial distribution probability mass function (PMF), then what happens if we don't restrict x to 0, 1
Bernstein basis polynomials of degree n, bernstein polynomial definition
prove that they form a basis of the vector space pi_n which is the polynomials of degree n, this can be done by expnading the expression then expressing in terms of monomial basis and showing that the matrix is diagonal so invertible so linearly indepdent so basis because it has rank n,
addition: inverse binomial transformation from statistics to show transformation from monomial to bernstein basis
some properties
stone-weierstrass approximation show probabalistic and analytic proof that as n tends to infinity we have uniform convergence to the function approximated as a bernstein polynomial
generalization to higher dimensions`}),`
`,n.jsx(e.h1,{id:"b86a0",children:"Numerical analysis introduction"}),`
`,n.jsx(e.p,{children:`analytical vs numerical
accuracy, precision
statistical error, systematic error
rounding error, truncation error
floating point representation
absolute error, relative error
numerical stability, accumulation of error due to floating point representation with example`})]})}function s(i={}){const{wrapper:e}=i.components||{};return e?n.jsx(e,{...i,children:n.jsx(t,{...i})}):t(i)}export{s as default,a as frontmatter,r as tableOfContents};
