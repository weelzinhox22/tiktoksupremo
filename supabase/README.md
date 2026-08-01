# Supabase do Tik Supremo

Esta pasta contém toda a estrutura remota necessária ao MVP. O único passo manual, enquanto o MCP do Supabase não estiver disponível, é vincular o projeto e aplicar a migration:

```sh
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Depois, copie a URL e a chave **anon/publishable** para `.env`. Nunca use a `service_role` no frontend. No painel do Supabase, configure `Site URL` e os redirects de recuperação para os domínios reais do app, incluindo `/login`.

Os três buckets são privados. O navegador acessa os arquivos autenticado e a interface cria URLs assinadas temporárias para visualização. Os caminhos seguem `user_id/project_id/arquivo`.
