# Central de provedores de vídeo

## Ativação única em produção

1. Aplique a migration `supabase/migrations/20260815120000_video_provider_configs.sql`.
2. Configure `ADMIN_EMAILS` com os e-mails dos administradores, separados por vírgula.
3. Configure `PROVIDER_CONFIG_ENCRYPTION_KEY` com uma string aleatória longa (mínimo de 24 caracteres). Não altere essa chave depois de salvar credenciais.
4. Faça o deploy e abra `/admin/video-providers`.
5. Cole as chaves, ative os motores, escolha o padrão e clique em **Testar**.

As credenciais são cifradas com AES-256-GCM, salvas apenas no banco e nunca retornam ao navegador. Variáveis de ambiente (`VEO_API_KEY`, `LTX_API_KEY`, `REPLICATE_API_KEY`, `HUGGINGFACE_API_KEY` e `MINIMAX_API_KEY`) continuam funcionando como fallback quando o banco ainda não foi configurado.

## ComfyUI sem custo por geração

O conector aceita workflows exportados por **Save (API Format)**. Cole o objeto JSON no campo `workflow` e substitua os valores que deseja controlar pelos tokens abaixo:

- `{{PROMPT}}`
- `{{NEGATIVE_PROMPT}}`
- `{{WIDTH}}`
- `{{HEIGHT}}`
- `{{FRAMES}}`
- `{{SEED}}`

Em desenvolvimento, `http://127.0.0.1:8188` funciona quando o backend e o ComfyUI estão na mesma máquina. Em produção, use um endpoint HTTPS autenticado e acessível pelo servidor (por exemplo, uma GPU própria, VPS ou túnel seguro). Nunca exponha um ComfyUI sem autenticação na internet.

## Ordem e fallback

O motor marcado como padrão roda primeiro. Se houver indisponibilidade, falta de crédito, formato incompatível ou timeout, o gerador tenta os outros motores ativos e mostra os erros de cada tentativa caso todos falhem.
