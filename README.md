# Aeternum — N02

Aplicação web do N02 com runtime visual em Vite/React e integração Gemini protegida por endpoint server-side.

## Desenvolvimento

Para executar somente a interface local:

```sh
npm install
npm run dev
```

Para executar a interface junto dos endpoints `api/` usados pelo runtime Gemini/Mesh, utilize um ambiente compatível com as funções serverless do projeto (por exemplo `npx vercel dev`).

Configure `GEMINI_API_KEY` somente no ambiente server-side. A chave **não** deve ser colocada em variáveis `VITE_*`, pois valores `VITE_*` são destinados ao bundle do navegador.

## Build

```sh
npm run build
```

O build executa `tsc --noEmit` antes do `vite build`, cobrindo também os handlers TypeScript do backend no escopo do projeto.
