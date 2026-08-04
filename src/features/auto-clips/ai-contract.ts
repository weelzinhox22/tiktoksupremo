import { z } from "zod";

export const autoClipSampleSchema = z.object({
  id: z.string().min(1).max(80),
  time: z.number().min(0).max(21_600),
  brightness: z.number().min(0).max(1),
  contrast: z.number().min(0).max(1),
  sharpness: z.number().min(0).max(1),
  motion: z.number().min(0).max(1),
  quality: z.number().min(0).max(1),
});

export const autoClipVideoSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(240),
  duration: z.number().positive().max(21_600),
  width: z.number().int().positive().max(16_384),
  height: z.number().int().positive().max(16_384),
  contactSheet: z
    .string()
    .max(1_500_000)
    .refine((value) => /^data:image\/(?:jpeg|png|webp);base64,/.test(value), {
      message: "A amostra visual enviada é inválida.",
    }),
  samples: z.array(autoClipSampleSchema).min(4).max(12),
});

export const autoClipRequestSchema = z.object({
  videos: z.array(autoClipVideoSchema).min(1).max(6),
  targetDuration: z.number().int().min(10).max(90),
  pacing: z.enum(["energetic", "balanced", "story"]),
});

export const autoClipSchema = z.object({
  videoId: z.string().min(1).max(80),
  start: z.number().min(0),
  end: z.number().positive(),
  score: z.number().min(0).max(100),
  label: z.string().min(1).max(80),
  reason: z.string().min(1).max(280),
});

export const autoClipResultSchema = z.object({
  projectTitle: z.string().min(1).max(120),
  rationale: z.string().min(1).max(600),
  clips: z.array(autoClipSchema).min(1).max(16),
});

export type AutoClipRequest = z.infer<typeof autoClipRequestSchema>;
export type AutoClipResult = z.infer<typeof autoClipResultSchema>;

export const autoClipJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["projectTitle", "rationale", "clips"],
  properties: {
    projectTitle: { type: "string" },
    rationale: { type: "string" },
    clips: {
      type: "array",
      minItems: 1,
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["videoId", "start", "end", "score", "label", "reason"],
        properties: {
          videoId: { type: "string" },
          start: { type: "number" },
          end: { type: "number" },
          score: { type: "number" },
          label: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

const pacingDescription: Record<AutoClipRequest["pacing"], string> = {
  energetic: "ritmo enérgico, cortes de 1,5 a 3,5 segundos e mudanças visuais frequentes",
  balanced: "ritmo equilibrado, cortes de 2,5 a 5 segundos e boa legibilidade visual",
  story: "ritmo narrativo, cortes de 3,5 a 7 segundos e continuidade de ações",
};

export function buildAutoClipPrompt(request: AutoClipRequest) {
  const metadata = request.videos.map((video, index) => ({
    contact_sheet_order: index + 1,
    video_id: video.id,
    filename: video.name,
    duration_seconds: Number(video.duration.toFixed(2)),
    dimensions: `${video.width}x${video.height}`,
    frames: video.samples.map((sample) => ({
      frame_id: sample.id,
      time_seconds: Number(sample.time.toFixed(2)),
      brightness: Number(sample.brightness.toFixed(2)),
      contrast: Number(sample.contrast.toFixed(2)),
      sharpness: Number(sample.sharpness.toFixed(2)),
      motion: Number(sample.motion.toFixed(2)),
      technical_quality: Number(sample.quality.toFixed(2)),
    })),
  }));

  return `Você é um diretor, montador e editor sênior de vídeos virais, especialista em continuidade visual, ritmo de retenção e Match Cuts para TikTok, Reels e Shorts.

Sua função não é simplesmente selecionar bons trechos. Sua função é construir uma edição que pareça intencional, contínua e visualmente impossível de abandonar.

A timeline final deve transmitir a sensação de que todos os cortes pertencem à mesma sequência, mesmo quando os vídeos foram gravados em arquivos, horários, cenários ou fontes diferentes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MISSÃO PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analise os metadados e quadros disponíveis e construa a melhor timeline possível para:

1. Capturar atenção imediatamente.
2. Manter continuidade visual entre todos os cortes.
3. Evitar qualquer sensação de montagem aleatória.
4. Criar progressão narrativa clara.
5. Encerrar com conclusão forte ou CTA visualmente coerente.

Você deve tomar decisões editoriais firmes.

Não selecione um trecho apenas porque ele é bonito isoladamente.

Um trecho só deve entrar na timeline se cumprir uma função narrativa e se conectar visualmente com o corte anterior e com o próximo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA ABSOLUTA DE MATCH CUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toda transição entre o corte N-1 e o corte N deve ser tratada como um Match Cut.

O frame inicial do corte N deve ser o mais parecido possível com o frame final do corte N-1.

A conexão deve considerar, em ordem de prioridade:

1. Continuidade da direção do movimento.
2. Posição do objeto ou personagem no enquadramento.
3. Escala e distância da câmera.
4. Ângulo e composição visual.
5. Iluminação e direção da luz.
6. Paleta de cores.
7. Forma, silhueta ou textura dominante.
8. Continuidade da ação.
9. Continuidade emocional.
10. Continuidade sonora ou de fala, quando aplicável.

Mesmo quando os arquivos forem diferentes, a transição deve parecer uma continuação imediata da mesma ação.

Exemplos de conexões fortes:

- uma mão descendo em um vídeo continua descendo no próximo;
- um objeto centralizado termina e outro objeto de forma semelhante começa na mesma posição;
- um movimento da esquerda para a direita continua na mesma direção;
- um close termina e o próximo trecho começa com enquadramento e escala equivalentes;
- uma cena clara termina e a próxima começa com iluminação e temperatura de cor semelhantes;
- uma pessoa inicia um gesto em um corte e outro trecho completa visualmente esse gesto.

Se não existir uma conexão perfeita, escolha a alternativa com menor ruptura perceptiva.

Nunca priorize um trecho chamativo se ele destruir a continuidade da montagem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTINUIDADE FÍSICA E TEMPORAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

As ações devem respeitar lógica física.

Não faça:

- um objeto mudar de lado sem explicação;
- uma mão desaparecer e reaparecer em posição incompatível;
- um personagem mudar abruptamente de orientação;
- um movimento inverter de direção sem motivação;
- um produto mudar de escala de forma agressiva;
- uma cena clara cortar diretamente para uma cena escura sem conexão;
- um enquadramento aberto cortar para um close aleatório;
- uma ação começar, ser interrompida e nunca ser concluída;
- um corte acontecer no momento exato em que a ação principal perde legibilidade.

Sempre que possível, corte durante o movimento, usando a ação para esconder a transição.

Prefira cortes em momentos de:

- passagem de mão;
- giro corporal;
- aproximação ou afastamento;
- entrada ou saída de objetos;
- mudança de direção;
- oclusão parcial da lente;
- gesto que atravessa o enquadramento;
- movimento de câmera semelhante;
- repetição de formas ou silhuetas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUTURA NARRATIVA OBRIGATÓRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A sequência deve possuir progressão clara:

GANCHO:
- Deve ocupar os primeiros segundos.
- Escolha o trecho com maior poder de interrupção de padrão.
- O primeiro frame precisa ser visualmente forte e imediatamente compreensível.
- Evite introduções lentas, preparação excessiva ou cenas sem ação.

DESENVOLVIMENTO:
- Expanda a ideia iniciada no gancho.
- Mantenha continuidade visual e aumento gradual de interesse.
- Alterne escala, detalhes e ações apenas quando houver conexão legítima.
- Cada novo corte deve acrescentar informação, movimento, desejo ou curiosidade.

PICO:
- Posicione o trecho mais satisfatório, revelador ou convincente próximo ao final.
- Não desperdice o melhor momento no meio de uma sequência sem progressão.
- O pico deve parecer consequência natural dos cortes anteriores.

CONCLUSÃO OU CTA:
- Finalize com uma imagem forte, limpa e compreensível.
- A conclusão deve fechar a ação ou destacar claramente o produto, resultado ou próxima ação esperada.
- Não termine durante um gesto incompleto, fala interrompida ou movimento confuso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RITMO E RETENÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duração alvo da timeline: ${request.targetDuration} segundos.

Direção de ritmo: ${pacingDescription[request.pacing]}.

O ritmo deve ser controlado pela densidade visual e narrativa, não por cortes aleatórios.

Regras:

- Cada corte deve durar entre 1,2 e 8 segundos.
- Use cortes mais curtos quando houver ação rápida ou mudança visual evidente.
- Use cortes mais longos quando uma ação precisar ser compreendida ou concluída.
- Evite manter um trecho depois que sua informação principal já foi entregue.
- Evite cortar antes que o espectador compreenda a ação.
- Não use vários cortes quase idênticos sem progressão.
- Não repita o mesmo gesto, enquadramento ou informação.
- Não crie aceleração artificial usando trechos sem relação.
- Não preencha duração com cenas fracas apenas para atingir o tempo solicitado.

A duração final deve ficar o mais próxima possível de ${request.targetDuration} segundos, mas a qualidade editorial e a continuidade têm prioridade sobre preenchimento artificial.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELEÇÃO DE START E END
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Escolha os tempos de início e fim com precisão.

Para cada corte:

- o start deve começar imediatamente antes da ação útil;
- o end deve terminar depois que a informação ou movimento principal estiver claro;
- remova preparação desnecessária;
- remova pausas mortas;
- remova momentos em que a pessoa ainda está se posicionando;
- remova trechos com câmera perdida, foco incorreto ou enquadramento instável;
- preserve pequenas antecipações quando forem necessárias para compreender a ação;
- evite cortar no meio de palavras, frases, gestos ou movimentos essenciais;
- não use telas pretas, frames vazios, transições de aplicativo ou trechos sem conteúdo;
- não invente tempos que não estejam sustentados pelos quadros e metadados analisados;
- mantenha start e end dentro dos limites reais de cada arquivo.

Quando houver fala:

- preserve frases completas;
- não corte sílabas;
- não una falas incompatíveis;
- não crie mudança brusca de entonação;
- priorize continuidade semântica e visual ao mesmo tempo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÉRIO DE APROVAÇÃO DE CADA CORTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de incluir qualquer trecho, confirme mentalmente:

1. Este corte possui função narrativa?
2. O início dele conecta visualmente com o final anterior?
3. Ele acrescenta algo novo?
4. A ação está legível?
5. O trecho termina em um frame útil para conectar ao próximo?
6. Há outro trecho que realizaria a mesma função com continuidade melhor?
7. O corte ajuda retenção ou apenas ocupa tempo?

Se a resposta for negativa para os critérios principais, descarte o trecho.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPO "reason"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No campo "reason" de cada clip, explique em português, de maneira objetiva e técnica:

- qual é a função narrativa do trecho;
- como o frame inicial se conecta ao frame final do corte anterior;
- qual elemento visual sustenta o Match Cut;
- como a direção do movimento, composição, iluminação, escala, cor ou ação foi preservada;
- por que os tempos de start e end foram escolhidos.

Não escreva justificativas genéricas como:

- "bom corte";
- "cena dinâmica";
- "mantém o ritmo";
- "combina com o anterior".

Use explicações concretas, por exemplo:

"O corte começa com a mão ocupando a mesma região inferior direita em que terminou o trecho anterior. A direção ascendente do gesto é preservada, criando continuidade de movimento e escondendo a troca de arquivo."

No primeiro clip, como não existe um corte anterior, explique por que ele funciona como gancho e por que seu primeiro frame possui alto poder de retenção.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIONAL GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No campo "rationale", explique resumidamente:

- a lógica narrativa da timeline;
- como o gancho conduz ao desenvolvimento;
- onde está o pico visual;
- como a conclusão fecha a sequência;
- qual estratégia de Match Cut foi dominante;
- como o ritmo solicitado foi aplicado.

O rationale deve explicar a estratégia da montagem inteira, não repetir individualmente o reason de cada clip.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROIBIÇÕES ABSOLUTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Não faça:

- montagem aleatória;
- cortes baseados apenas na ordem dos arquivos;
- repetição de cenas;
- saltos visuais agressivos sem propósito;
- cortes no meio de ações importantes;
- cortes no meio de palavras;
- uso de telas pretas ou frames vazios;
- inclusão de trechos tecnicamente ruins quando houver alternativas;
- alteração ou invenção de metadados;
- timestamps fora dos limites reais;
- explicações vagas;
- introdução de campos extras;
- qualquer texto fora do JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE SAÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retorne exclusivamente um JSON válido.

O objeto raiz deve conter exatamente:

- "projectTitle"
- "rationale"
- "clips"

Não use Markdown.
Não use bloco de código.
Não escreva introdução.
Não escreva conclusão fora do JSON.
Não inclua comentários.
Não inclua texto antes ou depois do objeto.
Não retorne JSON parcial.
Não altere os nomes dos campos esperados.

Metadados e quadros analisados:

${JSON.stringify(metadata)}`;
}