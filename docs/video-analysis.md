# Arquitetura de análise de vídeo

O MVP evita FFmpeg no runtime Cloudflare:

1. o navegador lê metadados e amostra seis frames em intervalos uniformes;
2. vídeo e frames seguem para buckets privados distintos;
3. o backend baixa o arquivo autenticado e transcreve o áudio;
4. transcrição, frames por URLs assinadas, produto e copy entram na consolidação estruturada;
5. o JSON validado por Zod é salvo no vídeo, projeto e geração.

O provedor é selecionado por `AI_PROVIDER`. No modo `gemini`, o Gemini 3.6 Flash faz a análise
multimodal dos frames e gera o roteiro com saída estruturada. A transcrição continua desacoplada e
usa Groq Whisper por URL assinada, evitando carregar vídeos grandes na memória do Worker. OpenAI e
Groq permanecem disponíveis como alternativas, sem alterar o restante do fluxo.

O upload aceita até 100 MB. Para produção com processamento mais pesado, implemente um serviço de mídia assíncrono (por exemplo, container com FFmpeg e fila), que leia o Storage por URL assinada curta e devolva transcrição, timecodes e frame paths. A interface `AIProvider` e os estados `pending`, `processing`, `completed` e `failed` já isolam essa troca. Ausência de frames ou falha de transcrição é exibida como erro/limitação real, nunca como análise simulada.
