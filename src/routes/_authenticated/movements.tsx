import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardCopy,
  Code2,
  Camera,
  ArrowRight,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listMovementLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MovementPreset } from "@/lib/supabase/types";

export const Route = createFileRoute("/_authenticated/movements")({
  component: MovementsPage,
  head: () => ({ meta: [{ title: "Poses e movimentos — Tik Supremo" }] }),
});

const categoryLabels: Record<MovementPreset["category"], string> = {
  fashion: "Moda",
  product_demo: "Demonstração",
  ugc: "UGC",
  pov: "POV",
  cta: "CTA",
};

function movementActions(movement: MovementPreset) {
  const json = movement.movement_json as Record<string, unknown>;
  const sequence = json["action_sequence"];
  if (Array.isArray(sequence)) {
    return sequence.slice(0, 3).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action = typeof item["action"] === "string" ? item["action"] : "";
      const time = typeof item["time"] === "string" ? item["time"] : "";
      return action ? [{ action, time }] : [];
    });
  }
  const movimentos = json["movimentos"];
  if (Array.isArray(movimentos)) {
    return movimentos.slice(0, 4).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action =
        (typeof item["acao_das_maos"] === "string" ? item["acao_das_maos"] : "") ||
        (typeof item["acao_da_mao"] === "string" ? item["acao_da_mao"] : "") ||
        (typeof item["acao"] === "string" ? item["acao"] : "");
      const inicio = typeof item["inicio"] === "number" ? item["inicio"] : 0;
      const fim = typeof item["fim"] === "number" ? item["fim"] : 0;
      const time = `${inicio}s-${fim}s`;
      return action ? [{ action, time }] : [];
    });
  }
  const legacy = json["sequence"];
  return Array.isArray(legacy)
    ? legacy.slice(0, 3).map((action, index) => ({ action: String(action), time: `${index + 1}` }))
    : [];
}

function movementCamera(movement: MovementPreset) {
  const json = movement.movement_json as Record<string, unknown>;
  const enquadramento = json["enquadramento"];
  if (enquadramento && typeof enquadramento === "object" && !Array.isArray(enquadramento)) {
    const detail = enquadramento as Record<string, unknown>;
    const parts = [detail["angulo"], detail["cenario"], detail["estilo"]]
      .filter((v): v is string => typeof v === "string");
    if (parts.length) return parts.join(" · ");
  }
  const camera = json["camera"];
  if (typeof camera === "string") return camera;
  if (!camera || Array.isArray(camera) || typeof camera !== "object") return "Câmera natural";
  const detail = camera as Record<string, unknown>;
  return [detail["framing"], detail["movement"], detail["focus"]]
    .filter((value): value is string => typeof value === "string")
    .join(" · ");
}

const defaultMovementJson = JSON.stringify(
  {
    version: "2.0",
    format: "UGC",
    duration_seconds: 8,
    aspect_ratio: "9:16",
    creative_goal: "",
    start_pose: {
      body_position: "",
      gaze: "camera",
      expression: "natural",
      product_position: "",
    },
    timing: {
      frame_0_2s: "visual setup and immediate hook",
      frame_2_6s: "main movement with natural timing",
      frame_6_8s: "controlled ending ready for continuity",
    },
    action_sequence: [
      { time: "0-2s", action: "" },
      { time: "2-6s", action: "" },
      { time: "6-8s", action: "" },
    ],
    biomechanics: {
      anatomy: "natural adult human anatomy",
      breathing: "subtle natural breathing",
      weight_transfer: "physically plausible",
      hands: "anatomically correct fingers and natural grip",
      micro_expressions: "spontaneous and restrained",
    },
    product_interaction: {
      hand: "right",
      container_closed: true,
      label_visible: true,
      allow_rotation: false,
      allow_camera_approach: false,
    },
    camera: {
      type: "handheld_smartphone",
      framing: "medium_shot",
      movement: "static_with_natural_micro_movement",
      lens: "24mm smartphone equivalent",
      focus: "face_and_product",
      focus_shift: "none",
      zoom: "none",
      shake: "subtle human micro vibration only",
    },
    identity_lock: {
      face: "preserve exactly",
      hair: "preserve style color and length",
      body: "preserve proportions and skin tone",
      clothing: "preserve color print texture and accessories",
    },
    product_lock: {
      shape: "preserve exactly",
      packaging: "preserve color label text and proportions",
      duplication: false,
    },
    environment: {
      setting: "preserve reference environment",
      lighting: "preserve direction intensity and color temperature",
      background_changes: false,
    },
    dialogue: {
      enabled: true,
      language: "pt-BR",
      lip_sync: "natural",
      delivery: "conversational",
    },
    continuity: {
      start_from_previous_frame: true,
      same_character: true,
      same_product: true,
      same_environment: true,
      same_camera_axis: true,
    },
    ending: {
      pose: "",
      gaze: "camera",
      continuity_ready: true,
    },
    quality: {
      render: "photorealistic 4K HDR",
      motion: "smooth natural real-time motion",
      fabric_physics: "realistic folds drape and inertia",
      hair_physics: "realistic gravity and secondary motion",
    },
    negative_prompt: [
      "robotic movement",
      "abrupt acceleration",
      "deformed hands",
      "extra fingers",
      "identity change",
      "face morphing",
      "product deformation",
      "label mutation",
      "floating objects",
      "jump cuts",
      "digital transitions",
      "text",
      "subtitles",
      "watermark",
      "AI artifacts",
    ],
  },
  null,
  2,
);

const FLAT_LAY_CLOTHING_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000030",
  user_id: null,
  name: "Demonstração Flat Lay de Vestuário Universal (Visão Superior 90°)",
  category: "fashion",
  formats: ["UGC", "FLAT LAY", "MODA"],
  description: "Estrutura universal para qualquer tipo de roupa (vestidos, conjuntos, camisetas, saias, calças) em câmera superior 90°, destacando tecido, barra, cós e acabamentos.",
  prompt_instruction: "Movimento universal de demonstração delicada de vestuário sobre tecido/cenário em ângulo superior de 90°. Funciona com qualquer peça ou conjunto (vestidos, conjuntos, blusas, calças), mostrando barra, cós, costura e detalhes de textura.",
  movement_json: {
    duracao_total_segundos: 16.03,
    formato: "9:16",
    enquadramento: {
      angulo: "camera superior em aproximadamente 90 graus (flat lay)",
      cenario: "peça de vestuário disposta plana sobre fundo neutro ou tecido claro",
      estilo: "demonstração delicada e profissional de qualquer produto de moda, com movimentos lentos e contato suave com o tecido",
    },
    precisao_dos_tempos: "aproximadamente 0.15 segundo",
    movimentos: [
      {
        inicio: 0.0,
        fim: 0.35,
        acao_da_mao: "A mão aparece pelo canto inferior, aproximando-se da barra ou extremidade da peça de roupa.",
        posicao_inicial: "fora do enquadramento",
        posicao_final: "barra inferior ou extremidade da peça",
        dedos: "polegar e indicador preparados para segurar",
        velocidade: "lenta",
      },
      {
        inicio: 0.35,
        fim: 1.7,
        acao_da_mao: "Segura a extremidade da roupa entre o polegar e os dedos. Faz uma leve puxada para fora e para cima, alinhando e esticando suavemente o tecido.",
        direcao: "para fora e levemente para cima",
        contato: "pinça leve",
        efeito_na_roupa: "o tecido é desdobrado e rugas superficiais são suavizadas",
        velocidade: "lenta e controlada",
      },
      {
        inicio: 1.7,
        fim: 2.2,
        acao_da_mao: "Solta a barra e desloca a mão diagonalmente para cima, passando sobre a frente da peça em direção ao cós/gola/cintura.",
        direcao: "diagonal ascendente",
        contato: "toque suave ou mão flutuando próximo ao tecido",
        velocidade: "moderada",
      },
      {
        inicio: 2.2,
        fim: 3.1,
        acao_da_mao: "Encosta as pontas dos dedos na costura superior (cós/gola) e desliza horizontalmente, acompanhando a linha de acabamento da peça.",
        direcao: "esquerda para a direita",
        dedos: "indicador e médio liderando o movimento",
        contato: "leve",
        efeito_na_roupa: "destaca visualmente a costura e o acabamento",
        velocidade: "lenta",
      },
      {
        inicio: 3.1,
        fim: 4.3,
        acao_da_mao: "Pinça a borda do tecido entre o polegar e o indicador. Levanta levemente alguns milímetros e faz pequenos ajustes laterais, demonstrando espessura e flexibilidade da peça.",
        direcao: "pequenos deslocamentos laterais",
        dedos: "polegar e indicador",
        contato: "pinça firme, mas delicada",
        efeito_na_roupa: "o tecido levanta levemente mostrando a textura",
        velocidade: "muito lenta",
      },
      {
        inicio: 4.3,
        fim: 5.35,
        acao_da_mao: "Solta o tecido, abre os dedos e passa a mão deslizando sobre a frente da peça, suavizando a superfície e aproximando-se dos detalhes centrais ou amarrações.",
        direcao: "descendente e fluida",
        dedos: "abertos e relaxados",
        contato: "palma e pontas dos dedos deslizando",
        efeito_na_roupa: "alisa o tecido",
        velocidade: "lenta e fluida",
      },
      {
        inicio: 5.35,
        fim: 6.05,
        acao_da_mao: "Aproxima o polegar e o indicador dos detalhes da roupa (botões, laços, cordões ou estampas) e ajusta com precisão.",
        direcao: "em direção ao detalhe do produto",
        dedos: "polegar e indicador",
        contato: "pinça leve",
        velocidade: "lenta",
      },
      {
        inicio: 6.05,
        fim: 7.95,
        acao_da_mao: "Pinça o detalhe da peça de roupa, realiza micro movimentos para demonstrar relevo, caimento ou acabamento, mantendo a peça visível.",
        direcao: "micro movimentos laterais",
        dedos: "polegar e indicador",
        contato: "pinça delicada",
        efeito_na_roupa: "o detalhe se move e retorna suavemente",
        velocidade: "muito lenta",
      },
      {
        inicio: 8.0,
        fim: 9.2,
        acao_da_mao: "Após transição de plano, a mão apoia no centro da peça e realiza um movimento de alisamento contínuo.",
        posicao_inicial: "centro da peça",
        direcao: "ascendente",
        dedos: "juntos e estendidos",
        contato: "mão plana",
        efeito_na_roupa: "alisa a região central",
        velocidade: "lenta",
      },
      {
        inicio: 9.2,
        fim: 10.45,
        acao_da_mao: "Realiza uma passagem longa e diagonal pela roupa, cruzando da base até a parte superior do produto.",
        direcao: "diagonal ascendente",
        dedos: "juntos conduzindo o movimento",
        contato: "deslizamento contínuo",
        velocidade: "lenta e uniforme",
      },
      {
        inicio: 10.45,
        fim: 11.55,
        acao_da_mao: "Ao alcançar os detalhes superiores, desliza verticalmente acompanhando a costura ou estampa.",
        direcao: "vertical descendente",
        contato: "pressão suave",
        efeito_na_roupa: "destaca o tecido e caimento",
        velocidade: "lenta",
      },
      {
        inicio: 11.55,
        fim: 12.35,
        acao_da_mao: "Desliza novamente para cima acompanhando a textura do produto.",
        direcao: "vertical ascendente",
        velocidade: "lenta",
      },
      {
        inicio: 12.35,
        fim: 13.3,
        acao_da_mao: "Desloca-se diagonalmente cobrindo toda a extensão da peça de roupa.",
        direcao: "diagonal descendente",
        contato: "mão plana",
        velocidade: "lenta e contínua",
      },
      {
        inicio: 13.3,
        fim: 14.15,
        acao_da_mao: "Apoia na lateral da roupa e faz pequenos ajustes de alisamento.",
        direcao: "movimento curto",
        contato: "pressão suave",
        velocidade: "muito lenta",
      },
      {
        inicio: 14.15,
        fim: 15.15,
        acao_da_mao: "Desliza lentamente para cima acompanhando a costura lateral da peça.",
        direcao: "ascendente",
        velocidade: "lenta",
      },
      {
        inicio: 15.15,
        fim: 15.9,
        acao_da_mao: "Faz uma última passagem ampla sobre toda a extensão da peça de roupa, finalizando o movimento no centro.",
        direcao: "lateral para o centro",
        dedos: "juntos e estendidos",
        contato: "mão plana",
        efeito_na_roupa: "alisa o tecido e encerra a apresentação",
        velocidade: "lenta e fluida",
      },
    ],
    movimentos_da_camera: [
      {
        inicio: 0.0,
        fim: 1.8,
        movimento: "enquadramento superior aberto mostrando a peça inteira",
      },
      {
        inicio: 1.8,
        fim: 5.35,
        movimento: "zoom gradual e reposicionamento suave para os detalhes de acabamento",
      },
      {
        inicio: 5.35,
        fim: 7.95,
        movimento: "aproximação em close para mostrar a textura do tecido e costuras",
      },
      {
        inicio: 8.0,
        fim: 8.1,
        movimento: "corte para enquadramento aberto",
      },
      {
        inicio: 9.2,
        fim: 12.0,
        movimento: "zoom gradual acompanhando a mão nos detalhes",
      },
      {
        inicio: 12.0,
        fim: 15.9,
        movimento: "deslocamento suave da câmera cobrindo o comprimento da peça",
      },
      {
        inicio: 15.9,
        fim: 16.03,
        movimento: "encerramento suave",
      },
    ],
    caracteristicas_gerais_dos_gestos: {
      ritmo: "lento, delicado e contínuo",
      pressao: "suave, sem amassar a roupa",
      postura_dos_dedos: "dedos juntos durante deslizes e pinça durante detalhes",
      objetivo_visual: "destacar textura, costuras, acabamento e caimento de qualquer peça de roupa",
      adaptabilidade: "compatível com qualquer vestuário (vestidos, conjuntos, camisetas, calças, casacos, moda praia)",
    },
  },
  tags: ["flat lay", "vestuário", "qualquer roupa", "visão superior", "detalhes", "tecido", "moda universal", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MULTICOLOR_CROCHET_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000031",
  user_id: null,
  name: "Demonstração Multicores em Camadas (Qualquer Produto / Câmera Superior)",
  category: "product_demo",
  formats: ["UGC", "FLAT LAY", "MULTICORES"],
  description: "Apresentação sequencial universal de produtos em 3 opções de cores dispostas em camadas (vestuário, acessórios ou produtos físicos), com aproximação de textura e remoção uma a uma.",
  prompt_instruction: "Estrutura universal para mostrar variações de cores (3 cores) de qualquer produto em camadas com câmera superior. Exibe elasticidade, textura, alinhamento do produto e retirada gradual de cada cor.",
  movement_json: {
    duracao_total_segundos: 12.57,
    formato: "vertical, aproximadamente 9:16",
    precisao_dos_tempos: "aproximadamente 0.10 segundo",
    enquadramento: {
      angulo: "camera posicionada acima da superfície, perpendicular ao produto",
      cenario: "superfície limpa/cenário neutro exibindo três variações de cores do mesmo produto (Cor 1, Cor 2 e Cor 3)",
      estilo: "demonstração rápida de produto com organização em camadas, aproximação para textura e retirada sequencial de cada variação de cor",
    },
    movimentos: [
      {
        inicio: 0.0,
        fim: 1.63,
        acao_das_maos: "As duas mãos seguram o produto da Cor 1 pelas extremidades superiores, mantendo-o suspenso e exibindo o produto acima das demais opções de cores.",
        mao_esquerda: {
          posicao: "extremidade esquerda da peça",
          pegada: "polegar na frente e dedos por trás",
        },
        mao_direita: {
          posicao: "extremidade direita da peça",
          pegada: "polegar na frente e dedos por trás",
        },
        movimento: "As mãos afastam-se suavemente exibindo a largura e caimento da peça. O produto recebe uma leve oscilação para registrar o tecido/material.",
        direcao: "leve abertura horizontal com micro movimentos verticais",
        efeito_na_roupa: "a peça fica esticada de forma suave e toda a frente permanece visível",
        velocidade: "lenta e controlada",
      },
      {
        inicio: 1.63,
        fim: 1.7,
        acao: "Corte seco para a superfície preparada, iniciando a sequência de organização das peças.",
      },
      {
        inicio: 1.7,
        fim: 2.17,
        acao_das_maos: "A peça da Cor 3 entra pelo canto inferior, conduzida pelas duas mãos.",
        movimento: "As mãos deslocam a peça diagonalmente até o centro do cenário.",
        direcao: "diagonal até o centro",
        pegada: "mãos nas laterais da peça",
        velocidade: "moderada",
      },
      {
        inicio: 2.17,
        fim: 2.63,
        acao_das_maos: "As duas mãos posicionam a Cor 3 sobre a superfície.",
        movimento: "Mãos ajustam as laterais para deixar a peça simétrica e centralizada.",
        direcao: "centro para as bordas",
        efeito_na_roupa: "a peça é aberta e alinhada",
      },
      {
        inicio: 2.63,
        fim: 3.07,
        acao_das_maos: "As mãos passam abertas sobre a frente da peça da Cor 3.",
        movimento: "Alisa a superfície do produto do topo em direção à base.",
        dedos: "abertos e suavemente curvados",
        contato: "palmas e dedos tocando suavemente",
        efeito_na_roupa: "remove dobras e realça o acabamento",
        velocidade: "lenta",
      },
      {
        inicio: 3.07,
        fim: 3.53,
        acao_das_maos: "A peça da Cor 2 entra rapidamente pelo canto inferior, segurada pelas duas laterais.",
        movimento: "Posicionada em camada sobreposta à metade da peça da Cor 3.",
        direcao: "diagonal para o centro",
        velocidade: "moderada",
      },
      {
        inicio: 3.53,
        fim: 4.13,
        acao_das_maos: "As mãos ajustam e alinham a peça da Cor 2 sobre a Cor 3.",
        efeito_na_roupa: "peça alinhada e perfeitamente visível em camada",
        velocidade: "lenta",
      },
      {
        inicio: 4.13,
        fim: 4.43,
        acao_das_maos: "As mãos soltam a peça da Cor 2 e recuam suavemente.",
        efeito_na_roupa: "peças organizadas em camadas escalonadas",
      },
      {
        inicio: 4.43,
        fim: 4.9,
        acao_das_maos: "A peça da Cor 1 entra pelo canto inferior, conduzida para a frente da composição.",
        movimento: "Posicionada como peça principal na frente das outras duas cores.",
        velocidade: "moderada",
      },
      {
        inicio: 4.9,
        fim: 5.27,
        acao_das_maos: "Mãos fazem pequenos micro ajustes na peça da Cor 1.",
        efeito_na_roupa: "as 3 variações de cor ficam perfeitamente visíveis e sobrepostas em degraus",
      },
      {
        inicio: 5.27,
        fim: 5.33,
        acao: "Corte seco para enquadramento aproximado na peça principal (Cor 1).",
      },
      {
        inicio: 5.33,
        fim: 6.13,
        acao_das_maos: "Mãos levantam a peça da Cor 1 em direção à câmera para foco no tecido e detalhes.",
        movimento: "Aproxima da lente ocupando grande parte do enquadramento.",
        velocidade: "lenta",
      },
      {
        inicio: 6.13,
        fim: 6.63,
        acao_das_maos: "Mão direita afrouxa a pegada permitindo inclinação suave da peça sob a iluminação.",
        efeito_na_roupa: "destaca trama, relevo e qualidade do produto",
      },
      {
        inicio: 6.63,
        fim: 7.17,
        acao_da_mao_direita: "A mão direita passa as pontas dos dedos suavemente pela frente do produto.",
        movimento: "Desliza horizontal e verticalmente sobre a textura da peça.",
        velocidade: "muito lenta",
      },
      {
        inicio: 7.17,
        fim: 7.63,
        acao_da_mao_direita: "A mão continua a passagem demonstrando maciez e acabamento do produto.",
        velocidade: "lenta",
      },
      {
        inicio: 7.63,
        fim: 8.23,
        acao_da_mao_direita: "Pontas dos dedos deslizam até a borda/barra destacando a costura lateral.",
        velocidade: "lenta",
      },
      {
        inicio: 8.23,
        fim: 8.3,
        acao: "Corte seco retornando ao enquadramento aberto com as 3 variações de cores.",
      },
      {
        inicio: 8.3,
        fim: 8.57,
        acao_das_maos: "Mãos seguram a peça da Cor 1 e a levantam acima da Cor 2.",
        velocidade: "moderada",
      },
      {
        inicio: 8.57,
        fim: 9.03,
        acao_das_maos: "Retirada rápida da peça da Cor 1 para fora do enquadramento.",
        direcao: "centro para fora",
        efeito_na_roupa: "revela a Cor 2 que estava por baixo",
      },
      {
        inicio: 9.03,
        fim: 9.53,
        acao_das_maos: "Mãos alcançam as laterais da peça da Cor 2.",
        velocidade: "moderada",
      },
      {
        inicio: 9.53,
        fim: 10.03,
        acao_das_maos: "Mãos levantam a peça da Cor 2.",
        velocidade: "moderada",
      },
      {
        inicio: 10.03,
        fim: 10.87,
        acao_das_maos: "Retirada rápida da peça da Cor 2 para fora do enquadramento.",
        efeito_na_roupa: "revela a peça da Cor 3 na base",
      },
      {
        inicio: 10.87,
        fim: 11.2,
        acao_das_maos: "Mão direita desloca-se até a peça da Cor 3.",
        velocidade: "moderada",
      },
      {
        inicio: 11.2,
        fim: 11.57,
        acao_da_mao_direita: "Mão direita pinça a lateral da peça da Cor 3.",
        velocidade: "moderada",
      },
      {
        inicio: 11.57,
        fim: 12.43,
        acao_das_maos: "A peça da Cor 3 é arrastada e retirada do enquadramento.",
        efeito_na_roupa: "finaliza a demonstração de todas as opções de cores",
      },
      {
        inicio: 12.43,
        fim: 12.57,
        acao: "O cenário permanece limpo e o vídeo encerra.",
      },
    ],
    movimentos_da_camera: [
      {
        inicio: 0.0,
        fim: 1.63,
        movimento: "câmera superior fixa mostrando as cores do produto",
      },
      {
        inicio: 1.63,
        fim: 5.27,
        movimento: "enquadramento superior fixo registrando a montagem em camadas",
      },
      {
        inicio: 5.27,
        fim: 8.23,
        movimento: "close-up focado na textura e detalhes da peça principal",
      },
      {
        inicio: 8.23,
        fim: 12.57,
        movimento: "retorno ao enquadramento aberto acompanhando a saída sequencial de cada cor",
      },
    ],
    caracteristicas_gerais_dos_gestos: {
      ritmo: "movimentos suaves na textura e ágeis nas trocas de cores",
      objetivo_visual: "demonstrar opções de cores, tecido, caimento e acabamento para qualquer linha de produto",
      universalidade: "compatível com qualquer vestuário (camisetas, shorts, vestidos, conjuntos, biquínis, lingerie, calças) ou produto multicores",
    },
  },
  tags: ["multicores", "qualquer produto", "flat lay", "camadas", "variantes", "moda universal", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DUAL_SET_ELASTICITY_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000032",
  user_id: null,
  name: "Demonstração Lado a Lado & Elasticidade Universal (Dois Conjuntos / Câmera Superior)",
  category: "product_demo",
  formats: ["UGC", "FLAT LAY", "MODA"],
  description: "Demonstração universal de duas opções de vestuário dispostas lado a lado, com teste de elasticidade do cós/gola, close em alças/detalhes e dobra/retirada sequencial.",
  prompt_instruction: "Demonstração universal em câmera superior de dois conjuntos ou peças de roupa lado a lado (Opção A e Opção B). Mostra teste de esticar o elástico/cós, close em alças e detalhes de costura, alisamento do tecido e retirada/dobra das peças.",
  movement_json: {
    duracao_total_segundos: 12.61,
    formato: "vertical, aproximadamente 9:16",
    precisao_dos_tempos: "aproximadamente 0.10 segundo",
    enquadramento: {
      angulo: "câmera posicionada acima da superfície, perpendicular às roupas",
      cenario: "mesa/superfície limpa e iluminada com elementos neutros ao fundo",
      produtos: [
        "peça ou conjunto de vestuário na Opção A (cor clara/principal)",
        "peça ou conjunto de vestuário na Opção B (cor escura/secundária)",
      ],
      estilo: "demonstração visual do caimento, elasticidade do cós/gola, textura e acabamento de qualquer produto de moda",
    },
    movimentos: [
      {
        inicio: 0.0,
        fim: 0.45,
        acao_das_maos: "As duas mãos seguram a peça/short da Opção A pelas extremidades do cós ou gola elástica.",
        mao_esquerda: {
          posicao: "lado esquerdo do cós/gola",
          pegada: "polegar na frente e dedos por trás",
        },
        mao_direita: {
          posicao: "lado direito do cós/gola",
          pegada: "polegar na frente e dedos por trás",
        },
        movimento: "As mãos aproximam ligeiramente a peça da superfície e reduzem a tensão do elástico.",
        direcao: "levemente para baixo e para o centro",
        efeito_na_roupa: "o cós relaxa e cria franzidos naturais",
        velocidade: "lenta",
      },
      {
        inicio: 0.45,
        fim: 0.95,
        acao_das_maos: "As mãos reposicionam os dedos sobre o elástico da Opção A.",
        movimento: "Os polegares deslizam por alguns centímetros sobre a parte frontal enquanto os demais dedos sustentam a peça.",
        direcao: "pequenos movimentos laterais",
        efeito_na_roupa: "o elástico é alinhado antes do teste de esticar",
        velocidade: "lenta e controlada",
      },
      {
        inicio: 0.95,
        fim: 1.8,
        acao_das_maos: "As mãos afastam-se gradualmente, esticando horizontalmente o cós/gola da peça da Opção A.",
        direcao: "mão esquerda para a esquerda e mão direita para a direita",
        amplitude: "moderada",
        efeito_na_roupa: "os franzidos diminuem e a abertura da cintura/gola fica mais ampla",
        finalizacao: "as mãos mantêm o elástico esticado por um breve instante demonstrando flexibilidade",
        velocidade: "lenta",
      },
      {
        inicio: 1.8,
        fim: 1.9,
        acao: "Corte seco para a organização da peça da Opção B.",
      },
      {
        inicio: 1.9,
        fim: 2.25,
        acao_das_maos: "As duas mãos levantam e abrem a parte superior da peça da Opção B.",
        mao_esquerda: {
          posicao: "lateral esquerda",
          movimento: "puxa suavemente para a esquerda",
        },
        mao_direita: {
          posicao: "alça/ombro e lateral direita",
          movimento: "desloca a peça para a direita",
        },
        efeito_na_roupa: "o decote, gola e alças ficam simétricos e abertos",
        velocidade: "lenta",
      },
      {
        inicio: 2.25,
        fim: 2.55,
        acao_das_maos: "As mãos apoiam a peça da Opção B sobre a mesa e realizam pequenos ajustes nas laterais.",
        efeito_na_roupa: "a peça fica centralizada e plana",
      },
      {
        inicio: 2.55,
        fim: 2.85,
        acao_das_maos: "A peça complementar (short/calça/saia) entra pelo centro inferior do enquadramento.",
        movimento: "As mãos transportam a peça para cima segurando o cós com cada mão.",
        velocidade: "moderada",
      },
      {
        inicio: 2.85,
        fim: 3.25,
        acao_das_maos: "As mãos posicionam a peça complementar abaixo da peça superior.",
        direcao: "centro para os lados",
        efeito_na_roupa: "o cós fica alinhado com a barra da blusa",
      },
      {
        inicio: 3.25,
        fim: 3.5,
        acao_das_maos: "As mãos fazem pequenos ajustes nas laterais do conjunto da Opção B.",
        efeito_na_roupa: "o conjunto fica simétrico e centralizado",
      },
      {
        inicio: 3.5,
        fim: 3.8,
        acao_das_maos: "A peça complementar da Opção A entra pela lateral direita.",
        movimento: "As mãos carregam a peça posicionando-a ao lado da Opção B.",
        velocidade: "moderada",
      },
      {
        inicio: 3.8,
        fim: 4.15,
        acao_das_maos: "As mãos apoiam a peça da Opção A e alinham seu cós com a parte superior.",
        efeito_na_roupa: "os dois conjuntos ficam perfeitamente alinhados lado a lado",
      },
      {
        inicio: 4.15,
        fim: 4.45,
        acao_das_maos: "As duas mãos passam abertas sobre as peças da Opção A.",
        movimento: "Deslizamento curto do topo em direção às barras.",
        contato: "palmas e pontas dos dedos",
        efeito_na_roupa: "alisa rugas e destaca a textura do tecido",
        velocidade: "lenta",
      },
      {
        inicio: 4.45,
        fim: 4.55,
        acao: "Corte seco para um close em detalhes de alça, gola ou costura.",
      },
      {
        inicio: 4.55,
        fim: 5.1,
        acao_da_mao_direita: "A mão direita pinça o detalhe/alça entre o polegar e o indicador.",
        movimento: "Levanta o detalhe alguns centímetros acima da mesa.",
        velocidade: "muito lenta",
      },
      {
        inicio: 5.1,
        fim: 5.65,
        acao_da_mao_direita: "O detalhe é apoiado sobre o indicador enquanto o pulso realiza uma rotação discreta.",
        efeito_na_roupa: "mostra o acabamento, costura e elasticidade do detalhe",
      },
      {
        inicio: 5.65,
        fim: 6.4,
        acao_da_mao_direita: "A mão realiza pequenos ciclos de puxar e relaxar a alça/detalhe.",
        efeito_na_roupa: "o detalhe se alonga e retorna suavemente",
        velocidade: "lenta e controlada",
      },
      {
        inicio: 6.4,
        fim: 6.55,
        acao: "Corte seco para demonstração do elástico do conjunto secundário.",
      },
      {
        inicio: 6.55,
        fim: 7.15,
        acao_das_maos: "As mãos seguram o cós do conjunto secundário e afastam-se esticando o elástico na horizontal.",
        velocidade: "lenta",
      },
      {
        inicio: 7.15,
        fim: 7.4,
        acao_das_maos: "O elástico permanece esticado por um breve instante sob a luz.",
        efeito_na_roupa: "o tecido reflete a iluminação natural",
      },
      {
        inicio: 7.4,
        fim: 7.7,
        acao_das_maos: "As mãos aproximam-se reduzindo a tensão do elástico.",
        velocidade: "lenta",
      },
      {
        inicio: 7.7,
        fim: 7.8,
        acao: "Corte seco retornando ao enquadramento aberto dos dois conjuntos.",
      },
      {
        inicio: 7.8,
        fim: 8.3,
        acao_das_maos: "As mãos aproximam-se da peça da Opção A e preparam a pegada.",
        dedos: "polegares na frente e demais dedos por baixo",
      },
      {
        inicio: 8.3,
        fim: 8.85,
        acao_das_maos: "As mãos levantam e esticam o cós/gola horizontalmente uma última vez.",
        velocidade: "lenta",
      },
      {
        inicio: 8.85,
        fim: 9.15,
        acao_das_maos: "Reduz a tensão e apoia a peça de volta sobre a superfície.",
        efeito_na_roupa: "o elástico retorna ao formato franzido natural",
      },
      {
        inicio: 9.15,
        fim: 9.7,
        acao_das_maos: "As duas mãos passam sobre o tecido alisando a superfície em direção às barras.",
        efeito_na_roupa: "alisa o tecido e alinha o caimento",
      },
      {
        inicio: 9.7,
        fim: 10.15,
        acao_das_maos: "As mãos seguram o conjunto da Opção A e iniciam sua retirada do enquadramento.",
        velocidade: "moderada",
      },
      {
        inicio: 10.15,
        fim: 10.3,
        acao: "O conjunto da Opção A sai do enquadramento, permanecendo apenas o conjunto da Opção B.",
      },
      {
        inicio: 10.3,
        fim: 10.65,
        acao_das_maos: "As mãos ajustam e alinham o conjunto da Opção B no centro.",
        velocidade: "moderada",
      },
      {
        inicio: 10.65,
        fim: 11.05,
        acao_das_maos: "As mãos levantam a peça inferior da Opção B e a retiram lateralmente.",
        velocidade: "moderada",
      },
      {
        inicio: 11.05,
        fim: 11.35,
        acao_das_maos: "As mãos posicionam os dedos nas extremidades da peça superior da Opção B.",
      },
      {
        inicio: 11.35,
        fim: 11.8,
        acao_das_maos: "As mãos pinçam a barra e dobram a peça ao meio de forma organizada.",
        velocidade: "moderada",
      },
      {
        inicio: 11.8,
        fim: 12.2,
        acao_das_maos: "As mãos mantêm a peça dobrada e a transportam para fora do enquadramento.",
        velocidade: "moderada",
      },
      {
        inicio: 12.2,
        fim: 12.61,
        acao: "A superfície permanece limpa e o vídeo encerra.",
      },
    ],
    movimentos_da_camera: [
      {
        inicio: 0.0,
        fim: 1.8,
        movimento: "câmera superior fixa mostrando os dois conjuntos e teste do elástico",
      },
      {
        inicio: 1.8,
        fim: 1.9,
        movimento: "corte seco",
      },
      {
        inicio: 1.9,
        fim: 4.45,
        movimento: "enquadramento superior aberto e fixo durante a organização das peças",
      },
      {
        inicio: 4.45,
        fim: 4.55,
        movimento: "corte seco para close de alça e acabamentos de costura",
      },
      {
        inicio: 4.55,
        fim: 6.4,
        movimento: "close fixo destacando os detalhes de elasticidade",
      },
      {
        inicio: 6.4,
        fim: 6.55,
        movimento: "corte seco para aproximação no conjunto secundário",
      },
      {
        inicio: 6.55,
        fim: 7.7,
        movimento: "enquadramento aproximado registrando a elasticidade",
      },
      {
        inicio: 7.7,
        fim: 7.8,
        movimento: "corte seco retornando ao enquadramento aberto",
      },
      {
        inicio: 7.8,
        fim: 12.61,
        movimento: "câmera superior fixa enquanto as roupas são alisadas, dobradas e retiradas",
      },
    ],
    caracteristicas_gerais_dos_gestos: {
      ritmo: "movimentos suaves na demonstração de elasticidade e ágeis na organização e retirada",
      pressao_sobre_o_tecido: "suave, apenas o suficiente para alisar, esticar ou dobrar",
      objetivo_visual: "demonstrar elasticidade, acabamento, caimento e duas variações de modelo/cor",
      universalidade: "compatível com qualquer vestuário (conjuntos de dormir, moda praia, camisetas, fitness, moda feminina/masculina)",
    },
  },
  tags: ["lado a lado", "duas cores", "elasticidade", "vestuário", "qualquer roupa", "flat lay", "câmera superior", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const TREADMILL_MANNEQUIN_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000033",
  user_id: null,
  name: "Esteira com Manequim de IA (Faceless Treadmill Transition)",
  category: "fashion",
  formats: ["UGC", "NO SPEAK", "MANEQUIM IA", "ESTEIRA"],
  description: "Formato viral internacional: Manequim humanoide sem rosto caminhando em esteira minimalista com trocas instantâneas de roupas/looks a cada passo.",
  prompt_instruction: "Manequim humanoide sem rosto (corpo preto fosco) caminhando continuamente sobre uma esteira minimalista em ritmo constante. Câmera totalmente fixa de frente. A cada passo no solo, a roupa muda instantaneamente para uma nova opção/cor sem alterar o manequim, a esteira ou o cenário. Sem fala, otimizado para retenção e loop perfeito.",
  movement_json: {
    duracao_total_segundos: 24,
    formato: "vertical 9:16",
    variacoes_estilo: {
      variacao_a: "Catálogo Visual — Apresentar 3 a 4 opções de cores/versões do mesmo produto",
      variacao_b: "Comparativo — Apresentar 2 ou mais estilos (casual vs social, básico vs completo)",
      variacao_c: "Desafio Interativo — Apresentar os looks numerados incentivando a escolha nos comentários",
    },
    enquadramento: {
      angulo: "câmera totalmente fixa de frente, na altura da cintura",
      cenario: "estúdio contemporâneo neutro, estilo vitrine de loja premium com esteira preta minimalista",
      personagem: "manequim humanoide sem rosto com corpo preto fosco, proporções adultas realistas",
      estilo: "transição instantânea de looks sincronizada com as passadas do manequim",
    },
    regras_de_consistencia: {
      manequim: "manter exatamente o mesmo corpo, altura, postura e caminhada durante todo o vídeo",
      cenario: "manter a mesma esteira, cenário, iluminação e enquadramento sem cortes nem zoom",
      transicao: "troca limpa e instantânea no momento em que o pé toca a esteira, sem fumaça ou flashes",
    },
    cenas_veo: [
      {
        cena: 1,
        tempo: "0-8s",
        foco: "Impacto visual imediato — manequim já caminhando com primeiro look e trocas a cada passo",
        acao_da_camera: "câmera fixa enquadrando o manequim de corpo inteiro na esteira",
        movimento_do_manequim: "passos ritmados e constantes",
        texto_tela_sugerido: "Qual desses você usaria?",
      },
      {
        cena: 2,
        tempo: "8-16s",
        foco: "Demonstração de caimento, tecido, movimento das peças nas passadas",
        acao_da_camera: "mantém enquadramento limpo destacando o movimento do tecido",
        movimento_do_manequim: "caminhada fluida e alinhada",
        texto_tela_sugerido: "Caimento perfeito e cores disponíveis",
      },
      {
        cena: 3,
        tempo: "16-24s",
        foco: "Fechamento com o melhor look, chamada para ação discreta e preparação para loop natural",
        acao_da_camera: "câmera fixa finalizando no mesmo passo do frame 1 para permitir loop perfeito",
        movimento_do_manequim: "passo final combinando com o início do vídeo",
        texto_tela_sugerido: "Clique no carrinho abaixo e escolha a sua cor favorita!",
      },
    ],
    negative_prompt: [
      "face change",
      "face morphing",
      "extra fingers",
      "deformed arms",
      "melting fabric",
      "camera movement",
      "camera zoom",
      "flash transitions",
      "smoke effects",
      "floating objects",
      "background shifts",
      "talking",
      "subtitles baked into video",
    ],
  },
  tags: ["esteira", "manequim ia", "faceless mannequin", "treadmill transition", "lookbook", "troca de roupa", "sem rosto", "moda", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const STRAP_PULL_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000034",
  user_id: null,
  name: "Movimento – Puxando Alça e Tecido da Roupa",
  category: "fashion",
  formats: ["UGC", "FASHION", "ROUPA", "NO SPEAK"],
  description: "Demonstração tátil GRWM: a modelo ajusta suavemente a alça no ombro e puxa levemente o tecido para destacar a elasticidade e caimento da roupa/blusa feminina.",
  prompt_instruction: `SCENE: UGC GRWM style, fixed camera, natural behavior.

ACTION TIMELINE:
She briefly looks at the lens and relaxes her expression.
She gently adjusts the strap on her shoulder using her thumb.
Her index finger lightly pulls the fabric to show elasticity and releases it smoothly.
She smiles subtly, hand drops naturally.

MICRO-DETAILS:
Natural fabric tension, slight delay when releasing, realistic finger contact.

TECHNICAL:
4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.`,
  movement_json: {
    duracao_total_segundos: 12,
    formato: "vertical 9:16",
    scene: "UGC GRWM style, fixed camera, natural behavior.",
    action_timeline: [
      "She briefly looks at the lens and relaxes her expression.",
      "She gently adjusts the strap on her shoulder using her thumb.",
      "Her index finger lightly pulls the fabric to show elasticity and releases it smoothly.",
      "She smiles subtly, hand drops naturally.",
    ],
    micro_details: "Natural fabric tension, slight delay when releasing, realistic finger contact.",
    technical: "4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.",
    regras_de_consistencia: {
      personagem: "manter identidade facial e física constante",
      tecido: "tensão natural ao puxar e soltar suavemente",
    },
  },
  tags: ["puxando alça", "tecido", "elasticidade", "blusa feminina", "moda feminina", "grwm", "ugc", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const TURN_45_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000035",
  user_id: null,
  name: "Movimento – Gira 45 Graus",
  category: "fashion",
  formats: ["UGC", "FASHION", "TRY ON", "NO SPEAK"],
  description: "Movimento de giro suave de 45 graus: a modelo inicia de costas, gira a cabeça e o tronco 45 graus, faz contato visual com um sorriso assimétrico e retorna à posição inicial.",
  prompt_instruction: `SCENE: UGC try-on style, fixed camera, soft side natural light.

ACTION TIMELINE:
She starts with her back to the camera, weight on one leg.
A subtle weight shift occurs as her right hand touches her hip naturally.
She turns her head and upper torso about 45 degrees and looks over her shoulder toward the camera.
Eye contact happens first, followed by a slow asymmetric smile.
She blinks slowly, then her head returns first, followed by the torso.

MICRO-DETAILS:
Subtle breathing in shoulders, slight chin drop, realistic focus shift on the face.

TECHNICAL:
4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.

NEGATIVE:
no jitter, no morphing, no body distortion, stable face identity`,
  movement_json: {
    duracao_total_segundos: 15,
    formato: "vertical 9:16",
    scene: "UGC try-on style, fixed camera, soft side natural light.",
    action_timeline: [
      "She starts with her back to the camera, weight on one leg.",
      "A subtle weight shift occurs as her right hand touches her hip naturally.",
      "She turns her head and upper torso about 45 degrees and looks over her shoulder toward the camera.",
      "Eye contact happens first, followed by a slow asymmetric smile.",
      "She blinks slowly, then her head returns first, followed by the torso.",
    ],
    micro_details: "Subtle breathing in shoulders, slight chin drop, realistic focus shift on the face.",
    technical: "4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.",
    negative_prompt: [
      "no jitter",
      "no morphing",
      "no body distortion",
      "stable face identity",
    ],
  },
  tags: ["gira 45 graus", "try-on", "ombro", "moda feminina", "look", "ugc", "tiktok shop"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};


function MovementsPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [customCategory, setCustomCategory] = useState<MovementPreset["category"]>("ugc");
  const [formats, setFormats] = useState("UGC");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [movementJson, setMovementJson] = useState(defaultMovementJson);
  const [tags, setTags] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["movement-library"], queryFn: listMovementLibrary });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2 || instruction.trim().length < 12)
        throw new Error("Informe um nome e descreva o movimento com mais detalhes.");
      let parsedMovement: Record<string, unknown>;
      try {
        const parsed = JSON.parse(movementJson) as unknown;
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          throw new Error("invalid");
        }
        parsedMovement = parsed as Record<string, unknown>;
      } catch {
        throw new Error("O JSON do movimento está inválido. Revise vírgulas, aspas e chaves.");
      }
      const result = await getSupabaseBrowserClient()
        .from("movement_library")
        .insert({
          user_id: user.id,
          name: name.trim(),
          category: customCategory,
          formats: formats
            .split(",")
            .map((item) => item.trim().toUpperCase())
            .filter(Boolean),
          description: description.trim(),
          prompt_instruction: instruction.trim(),
          movement_json: parsedMovement,
          tags: tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        });
      if (result.error) throw new Error(`Não foi possível salvar: ${result.error.message}`);
    },
    onSuccess: async () => {
      setName("");
      setDescription("");
      setInstruction("");
      setMovementJson(defaultMovementJson);
      setTags("");
      setShowForm(false);
      toast.success("Movimento salvo.");
      await queryClient.invalidateQueries({ queryKey: ["movement-library"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await getSupabaseBrowserClient()
        .from("movement_library")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (result.error) throw new Error("Não foi possível remover o movimento.");
    },
    onSuccess: async () => {
      toast.success("Movimento removido.");
      await queryClient.invalidateQueries({ queryKey: ["movement-library"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const loadFlatLayTemplate = () => {
    setName(FLAT_LAY_CLOTHING_PRESET.name);
    setCustomCategory(FLAT_LAY_CLOTHING_PRESET.category);
    setFormats(FLAT_LAY_CLOTHING_PRESET.formats.join(", "));
    setDescription(FLAT_LAY_CLOTHING_PRESET.description);
    setInstruction(FLAT_LAY_CLOTHING_PRESET.prompt_instruction);
    setMovementJson(JSON.stringify(FLAT_LAY_CLOTHING_PRESET.movement_json, null, 2));
    setTags(FLAT_LAY_CLOTHING_PRESET.tags.join(", "));
    toast.success("Modelo Flat Lay (Visão 90°) carregado no editor.");
  };

  const loadMulticolorCrochetTemplate = () => {
    setName(MULTICOLOR_CROCHET_PRESET.name);
    setCustomCategory(MULTICOLOR_CROCHET_PRESET.category);
    setFormats(MULTICOLOR_CROCHET_PRESET.formats.join(", "));
    setDescription(MULTICOLOR_CROCHET_PRESET.description);
    setInstruction(MULTICOLOR_CROCHET_PRESET.prompt_instruction);
    setMovementJson(JSON.stringify(MULTICOLOR_CROCHET_PRESET.movement_json, null, 2));
    setTags(MULTICOLOR_CROCHET_PRESET.tags.join(", "));
    toast.success("Modelo Multicores (Bed Lay) carregado no editor.");
  };

  const loadDualSetElasticityTemplate = () => {
    setName(DUAL_SET_ELASTICITY_PRESET.name);
    setCustomCategory(DUAL_SET_ELASTICITY_PRESET.category);
    setFormats(DUAL_SET_ELASTICITY_PRESET.formats.join(", "));
    setDescription(DUAL_SET_ELASTICITY_PRESET.description);
    setInstruction(DUAL_SET_ELASTICITY_PRESET.prompt_instruction);
    setMovementJson(JSON.stringify(DUAL_SET_ELASTICITY_PRESET.movement_json, null, 2));
    setTags(DUAL_SET_ELASTICITY_PRESET.tags.join(", "));
    toast.success("Modelo Lado a Lado & Elasticidade carregado no editor.");
  };

  const loadTreadmillMannequinTemplate = () => {
    setName(TREADMILL_MANNEQUIN_PRESET.name);
    setCustomCategory(TREADMILL_MANNEQUIN_PRESET.category);
    setFormats(TREADMILL_MANNEQUIN_PRESET.formats.join(", "));
    setDescription(TREADMILL_MANNEQUIN_PRESET.description);
    setInstruction(TREADMILL_MANNEQUIN_PRESET.prompt_instruction);
    setMovementJson(JSON.stringify(TREADMILL_MANNEQUIN_PRESET.movement_json, null, 2));
    setTags(TREADMILL_MANNEQUIN_PRESET.tags.join(", "));
    toast.success("Modelo Esteira com Manequim IA carregado no editor.");
  };

  const loadDefaultUgcTemplate = () => {
    setName("");
    setCustomCategory("ugc");
    setFormats("UGC");
    setDescription("");
    setInstruction("");
    setMovementJson(defaultMovementJson);
    setTags("");
  };

  const rawList = query.data ?? [];
  const builtIns = [
    FLAT_LAY_CLOTHING_PRESET,
    MULTICOLOR_CROCHET_PRESET,
    DUAL_SET_ELASTICITY_PRESET,
    TREADMILL_MANNEQUIN_PRESET,
    STRAP_PULL_PRESET,
    TURN_45_PRESET,
  ];

  const missingBuiltIns = builtIns.filter(
    (preset) => !rawList.some((item) => item.id === preset.id),
  );
  const combinedList = [...missingBuiltIns, ...rawList];

  const movements = combinedList.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = `${item.name} ${item.description} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const copyMovementJson = async (movement: MovementPreset) => {
    await navigator.clipboard.writeText(JSON.stringify(movement.movement_json, null, 2));
    setCopiedId(movement.id);
    toast.success("JSON do movimento copiado.");
    setTimeout(() => setCopiedId(null), 1_800);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Direção criativa reutilizável
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Poses e movimentos em JSON</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Escolha movimentos prontos para moda, demonstração, UGC, POV e CTA ou salve seus
            próprios padrões. Cada card já entrega uma estrutura JSON pronta para o gerador.
          </p>
        </div>
        <Button variant="hero" onClick={() => setShowForm((value) => !value)}>
          <Plus />
          Novo movimento
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-primary">{combinedList.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">movimentos reutilizáveis</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-cyan">
            {combinedList.filter((item) => item.category === "fashion").length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">direções para mostrar roupas</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-emerald-300">3 passos</p>
          <p className="mt-1 text-xs text-muted-foreground">visualizados antes de copiar o JSON</p>
        </div>
      </section>

      {showForm && (
        <section className="bento-card bento-card-accent space-y-5 p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Criar movimento personalizado</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A instrução será inserida diretamente no JSON do VEO.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadFlatLayTemplate}>
                <Sparkles className="size-3.5 text-amber-400" /> Flat Lay 90°
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={loadMulticolorCrochetTemplate}>
                <Sparkles className="size-3.5 text-cyan-400" /> Multicores (Bed Lay)
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={loadDualSetElasticityTemplate}>
                <Sparkles className="size-3.5 text-emerald-400" /> Lado a Lado & Elasticidade
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={loadTreadmillMannequinTemplate}>
                <Sparkles className="size-3.5 text-purple-400" /> Esteira Manequim IA
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={loadDefaultUgcTemplate}>
                Limpar editor
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={customCategory}
                onChange={(event) =>
                  setCustomCategory(event.target.value as MovementPreset["category"])
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Formatos</Label>
              <Input
                value={formats}
                onChange={(event) => setFormats(event.target.value)}
                placeholder="UGC, POV"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Descrição curta</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Instrução detalhada do movimento</Label>
              <Textarea
                rows={5}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Descreva início, movimento, interação com o produto, câmera e encerramento."
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <div className="flex items-center justify-between gap-2">
                <Label>JSON do movimento</Label>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Code2 className="size-3" /> Obrigatório e validado antes de salvar
                </span>
              </div>
              <Textarea
                rows={18}
                value={movementJson}
                onChange={(event) => setMovementJson(event.target.value)}
                className="font-mono text-xs leading-5"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Tags separadas por vírgula</Label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="hero"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}Salvar
              movimento
            </Button>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar movimento..."
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todas as categorias</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movements.map((movement) => (
            <article key={movement.id} className="bento-card interactive-card space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Camera className="size-5" />
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline">{categoryLabels[movement.category]}</Badge>
                  <Badge className="bg-secondary text-muted-foreground">
                    {movement.user_id ? "Seu" : "Padrão"}
                  </Badge>
                </div>
              </div>
              <div>
                <h2 className="font-semibold">{movement.name}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {movement.description}
                </p>
              </div>
              {movementActions(movement).length > 0 && (
                <div className="rounded-xl border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sequência visual
                  </p>
                  <div className="mt-3 space-y-2">
                    {movementActions(movement).map((step, index) => (
                      <div key={`${step.time}-${index}`} className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/85">
                          {step.action}
                        </span>
                        {index < movementActions(movement).length - 1 && (
                          <ArrowRight className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-border pt-2 text-[10px] text-cyan">
                    <Camera className="mr-1 inline size-3" /> {movementCamera(movement)}
                  </p>
                </div>
              )}
              <details className="space-y-2 rounded-xl border border-border bg-[#09090b] p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan">
                    <Code2 className="size-3" /> Ver JSON completo
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={(event) => {
                      event.preventDefault();
                      void copyMovementJson(movement);
                    }}
                  >
                    {copiedId === movement.id ? <Check /> : <ClipboardCopy />}
                    {copiedId === movement.id ? "Copiado" : "Copiar JSON"}
                  </Button>
                </summary>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-slate-300">
                  {JSON.stringify(movement.movement_json, null, 2)}
                </pre>
              </details>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {movement.formats.map((format) => (
                    <Badge key={format} variant="outline">
                      {format}
                    </Badge>
                  ))}
                </div>
                {movement.user_id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover ${movement.name}`}
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(movement.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
