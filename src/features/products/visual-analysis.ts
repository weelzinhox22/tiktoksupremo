import { z } from "zod";

export const referenceVisualAnalysisSchema = z.object({
  reference_type: z.enum(["product", "avatar"]),
  summary: z.string(),
  visible_facts: z.array(z.string()),
  item_type: z.string(),
  colors: z.array(z.string()),
  materials_and_textures: z.array(z.string()),
  shape_and_proportions: z.string(),
  garment_details: z.array(z.string()),
  packaging_and_label: z.array(z.string()),
  character_identity: z.array(z.string()),
  environment_and_lighting: z.array(z.string()),
  preservation_rules: z.array(z.string()),
  possible_demonstrations: z.array(z.string()),
  uncertainties: z.array(z.string()),
});

export type ReferenceVisualAnalysis = z.infer<typeof referenceVisualAnalysisSchema>;

export const referenceVisualAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "reference_type",
    "summary",
    "visible_facts",
    "item_type",
    "colors",
    "materials_and_textures",
    "shape_and_proportions",
    "garment_details",
    "packaging_and_label",
    "character_identity",
    "environment_and_lighting",
    "preservation_rules",
    "possible_demonstrations",
    "uncertainties",
  ],
  properties: {
    reference_type: { type: "string", enum: ["product", "avatar"] },
    summary: { type: "string" },
    visible_facts: { type: "array", items: { type: "string" } },
    item_type: { type: "string" },
    colors: { type: "array", items: { type: "string" } },
    materials_and_textures: { type: "array", items: { type: "string" } },
    shape_and_proportions: { type: "string" },
    garment_details: { type: "array", items: { type: "string" } },
    packaging_and_label: { type: "array", items: { type: "string" } },
    character_identity: { type: "array", items: { type: "string" } },
    environment_and_lighting: { type: "array", items: { type: "string" } },
    preservation_rules: { type: "array", items: { type: "string" } },
    possible_demonstrations: { type: "array", items: { type: "string" } },
    uncertainties: { type: "array", items: { type: "string" } },
  },
} as const;

export function buildReferenceVisualAnalysisPrompt(
  referenceType: "product" | "avatar",
  context: Record<string, unknown>,
) {
  const target = referenceType === "product" ? "produto, roupa ou objeto" : "avatar/personagem";
  return `Analise cuidadosamente todas as imagens fornecidas como referências do mesmo ${target}.

Separe fatos realmente visíveis de incertezas. Não deduza composição, benefícios, medidas, identidade pessoal, origem, idade exata ou características que não possam ser confirmadas visualmente.

Para produto ou roupa, identifique tipo, cores, materiais aparentes, textura, formato, proporções, estampa, costuras, modelagem, embalagem, rótulo, acessórios, detalhes distintivos, contexto visual, ângulos úteis e movimentos seguros para demonstrá-lo. Para avatar, descreva somente traços visuais úteis para continuidade: aparência adulta, rosto, cabelo, tom de pele, proporções gerais, roupa, acessórios, expressão, cenário e iluminação. Não identifique a pessoa.

Crie preservation_rules explícitas para impedir mudanças na geração de vídeo. Em possible_demonstrations, sugira apenas movimentos naturais compatíveis com o que é visível. reference_type deve ser "${referenceType}".

CONTEXTO DECLARADO PELO USUÁRIO:
${JSON.stringify(context)}`;
}
