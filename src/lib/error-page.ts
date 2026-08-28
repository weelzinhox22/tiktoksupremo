export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Esta página não pôde ser carregada</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #0b0c10; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; border-radius: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #fff; font-weight: 700; }
      p { color: #94a3b8; margin: 0 0 1.5rem; font-size: 0.875rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.2rem; border-radius: 0.5rem; font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.2s ease; }
      .primary { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; }
      .primary:hover { opacity: 0.9; }
      .secondary { background: rgba(255,255,255,0.06); color: #f8fafc; border-color: rgba(255,255,255,0.15); }
      .secondary:hover { background: rgba(255,255,255,0.12); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Esta página não pôde ser carregada</h1>
      <p>Ocorreu um erro ao carregar os dados. Você pode tentar recarregar ou ir direto para o Dashboard.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/dashboard">Ir para o Dashboard</a>
      </div>
    </div>
  </body>
</html>`;
}

