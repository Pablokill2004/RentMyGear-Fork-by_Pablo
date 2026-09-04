# The Challenge: "Smart Insurance"

Context: Users are damaging premium gear. We need an optional "Damage Protection" add-on.

The Task:

Implement a Dynamic Insurance feature that calculates a fee based on the category:

Photography/Video: 20% of daily rate (High Risk).

All other categories: 10% of daily rate.

The Constraint:

You must use AI-Driven TDD. You cannot write the implementation until the AI ​​has generated a failing test suite

# Definition of done

- 100% Base Coverage: Ensure existing demo app tests pass with 100% coverage.

- Feature TDD: Implement "Smart Insurance" maintaining 100% coverage.

- Documentation: Update docs/DIAGRAMS.md, docs/ONBOARDING.md, and README.md.

- Verification: Submit proof of 100% coverage from npm run test:coverage

# Quality & Verification
## proyecto

Implementa Smart Insurance en Rent-My-Gear usando AI-Driven TDD estricto. Photography equipment: 20% fee, otros: 10%. Debes lograr 100% test coverage con Vitest y React Testing Library. Incluye documentación con diagramas Mermaid. Sube tu código a GitHub y envía el link para calificación automática.

## Requisitos del calificador(Autograder)

### Dependencias requeridas
Tu proyecto debe incluir las siguientes devDependencies para que los tests automáticos funcionen:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
### Estructura esperada del repo
El grader busca tu componente raíz (default export, o un export llamado App / Home / Page) en cualquiera de estas ubicaciones:
```bash
src/App.tsx              (Vite con src/)
App.tsx                  (Vite sin src/)
src/app/page.tsx         (Next.js App Router con src/)
app/page.tsx             (Next.js App Router sin src/, default de create-next-app)
src/pages/index.tsx      (Next.js Pages Router con src/)
pages/index.tsx          (Next.js Pages Router sin src/)
Si tu proyecto no sigue ninguna de estas convenciones, el primer test fallará con el detalle de las rutas que intentó importar.
```

