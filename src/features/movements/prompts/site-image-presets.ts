import type { MovementPreset } from "@/lib/supabase/types";

// Import all 7 image assets from "src/assets/prompts/videos para o site"
import recriandoCenarioImage from "@/assets/prompts/videos para o site/Recriando cenário.jpg";
import removerRoupasTextosImage from "@/assets/prompts/videos para o site/Remover roupas e textos.jpg";
import colocandoMaoAmbienteImage from "@/assets/prompts/videos para o site/Colocando a mão no ambiente.jpg";
import colocarRoupaAmbienteImage from "@/assets/prompts/videos para o site/Colocar roupa no ambiente.jpg";
import roupaNoPacoteImage from "@/assets/prompts/videos para o site/Roupa no pacote.jpg";
import colocarEmbalagemTikTokImage from "@/assets/prompts/videos para o site/Colocar embalagem do TikTok.jpg";
import suspenseUnboxingStartingFrameImage from "@/assets/prompts/videos para o site/Suspense Unboxing — Starting Frame.jpeg";

export {
  recriandoCenarioImage,
  removerRoupasTextosImage,
  colocandoMaoAmbienteImage,
  colocarRoupaAmbienteImage,
  roupaNoPacoteImage,
  colocarEmbalagemTikTokImage,
  suspenseUnboxingStartingFrameImage,
};

// 1. Recriando cenário
export const RECRIANDO_CENARIO_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000001",
  user_id: null,
  name: "Recriando Cenário (Troca de Roupa na Cama)",
  category: "product_demo",
  formats: ["IMAGEM", "TROCA DE ROUPA", "FLAT LAY", "CENÁRIO"],
  description: "Substitui a peça de roupa da Imagem 1 pela roupa da Imagem 2, preservando 100% o ambiente, cama, iluminação, mãos, unhas e acessórios originais.",
  prompt_instruction: `Use Image 1 as the base scene for the environment. 
Use Image 2 ONLY as a reference for the garment. 
TASK: 
Remove the garment from Image 1 and replace it with the garment from Image 2. 
The garment from Image 2 should appear naturally arranged on the bed, as if it had just been taken out of its packaging. 

IMPORTANT RULES: 
• Preserve the environment from Image 1 exactly 
• Preserve the camera angle exactly 
• Preserve the lighting exactly 
• Preserve the composition exactly 
• Preserve the perspective exactly 

HAND CONSISTENCY (CRITICAL): 
• Keep the exact same hands from Image 1 
• Keep the exact same skin tone 
• Keep the exact same manicure 
• Keep the exact same accessories (rings, bracelets, watches, if present) 
• Keep the exact same hand position 
• Keep the exact same arm position 
• DO NOT generate new hands 
• DO NOT modify the hands in any way 

CLOTHING REPLACEMENT: 
• Remove only the clothing from Image 1 
• Replace it with the clothing from Image 2 
• Replicate the clothing EXACTLY as shown in Image 2 
• Same color • Same fabric • Same shape • Same proportions • No redesigning • No creative interpretation 

POSITIONING: 
• The clothing must occupy approximately the same area where the original clothing was located 
• The garment must appear naturally arranged on the bed 
• Realistic fabric 
• Natural interaction with the bed surface 
• Natural gravity and drape 

SCENE MAINTENANCE (CRITICAL): 
• DO NOT alter the background 
• DO NOT alter the environment 
• DO NOT alter furniture (if present) 
• DO NOT alter environmental details 
• DO NOT alter the lighting 
• DO NOT create a new scene 

FINAL QUALITY: 
• Ultra-photorealistic • Natural shadows • Realistic fabric texture • Real 4K photograph appearance • No AI artifacts 

EXCLUSIONS: 
• No text • No logos • No watermarks • No filters • No stylization`,
  movement_json: {
    tipo: "prompt_imagem_recriando_cenario",
    imagem_base: "Image 1 (ambiente e maos)",
    imagem_referencia: "Image 2 (roupa)",
    tarefa: "Substituir a roupa da Imagem 1 pela roupa da Imagem 2 mantendo maos, unhas, cama e iluminacao 100% identicos",
    qualidade: "Ultra-photorealistic 4K"
  },
  tags: ["recriando cenario", "troca de roupa", "flat lay", "cama", "imagem", "produto"],
  imageUrl: recriandoCenarioImage,
  created_at: "2026-08-19T18:40:00.000Z",
  updated_at: "2026-08-19T18:40:00.000Z",
};

// 2. Remover roupas/texto
export const REMOVER_ROUPAS_TEXTO_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000002",
  user_id: null,
  name: "Remover Roupas e Textos (Cenário Limpo)",
  category: "product_demo",
  formats: ["IMAGEM", "LIMPEZA", "REMOÇÃO", "CENÁRIO"],
  description: "Remove todas as roupas, mãos, textos, botões e elementos de interface da imagem, reconstruindo o tapete felpudo e piso de madeira 100% limpo.",
  prompt_instruction: `Remove all clothing pieces, the model’s hands and arms, all text, captions, interface elements, search bar, play button, progress bar, timestamps and any other overlays from the image. Keep only the original environment: the white fluffy rug, the wicker basket, the green plant and the visible wooden floor. Preserve exactly the same top-down camera angle, framing, composition, lighting, colors, texture and image proportions. Naturally reconstruct the rug and background in the areas where the clothes, hands and text were removed, without visible marks, distortions or shadows from the deleted objects. Do not change, move, resize or add anything to the environment. The final image must look like the same scene photographed completely empty.`,
  movement_json: {
    tipo: "prompt_imagem_remover_roupas_e_textos",
    alvo: "Remover todas as roupas, maos, textos, legendas e elementos de UI",
    preservar: "Tapete felpudo branco, cesto de vime, planta verde, piso de madeira e iluminacao original",
    resultado: "Cenario perfeitamente reconstruido e limpo"
  },
  tags: ["remover roupas", "remover texto", "cenario limpo", "tapete", "imagem", "limpeza"],
  imageUrl: removerRoupasTextosImage,
  created_at: "2026-08-19T18:39:00.000Z",
  updated_at: "2026-08-19T18:39:00.000Z",
};

// 3. Colocando a mão no ambiente
export const COLOCANDO_A_MAO_NO_AMBIENTE_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000003",
  user_id: null,
  name: "Colocando a Mão no Ambiente (Mãos Femininas Top-Down)",
  category: "product_demo",
  formats: ["IMAGEM", "MÃOS", "POV", "FLAT LAY"],
  description: "Adiciona um par de mãos femininas elegantes com unhas vermelhas, pulseiras delicadas e anel posicionadas na parte inferior para apresentar o produto.",
  prompt_instruction: `Use Image 1 as the BASE scene. 
TASK: 
Add a pair of feminine hands into the scene, positioned naturally over the surface, matching the same top-down flat lay style and the same hand placement shown in the original composition. 

IMPORTANT RULES: 
• Preserve the environment from Image 1 exactly 
• Preserve the white fluffy rug exactly 
• Preserve the wicker basket exactly 
• Preserve the green leaf exactly 
• Preserve the visible wooden floor exactly 
• Preserve the camera angle exactly 
• Preserve the lighting exactly 
• Preserve the composition exactly 
• Preserve the perspective exactly 
• Do not modify the background in any way 

HAND DETAILS: 
• Add two feminine hands with fair/light skin tone 
• The hands must look elegant and natural 
• The nails must be painted bright red 
• Add subtle accessories, such as delicate bracelets 
• Add at least one ring 
• Add a small minimalist tattoo on one of the hands or wrist area 
• The tattoo should be subtle and aesthetic 
• The hands should look realistic and proportional 

HAND POSITION (CRITICAL): 
• The hands must appear in the same lower area of the image 
• One hand should be positioned on the lower left side 
• One hand should be positioned on the lower right side 
• Both hands should be slightly angled inward toward the center 
• Fingers should be naturally relaxed and slightly curved 
• The pose should feel like the person is about to arrange or present an item in the center 
• Keep the hand pose natural, balanced, and symmetrical 
• Show part of the forearms, entering from the bottom edges of the frame 

SCENE LOCK: 
• Do NOT add clothing 
• Do NOT add text 
• Do NOT add logos 
• Do NOT add watermarks 
• Do NOT add interface elements 
• Do NOT change the decor 
• Do NOT create a new environment 
• Do NOT stylize the image 

FINAL QUALITY: 
• Ultra photorealistic 
• Natural skin texture 
• Realistic red nails 
• Realistic jewelry details 
• Natural shadows 
• Natural integration with the scene 
• Looks like a real photograph 
• No AI artifacts`,
  movement_json: {
    tipo: "prompt_imagem_colocar_maos",
    detalhes_maos: "Duas maos femininas, pele clara, unhas vermelhas, pulseiras delicadas, anel e tatuagem minimalista",
    posicao: "Entrando pelas bordas inferiores inclinadas suavemente para o centro em pose de apresentacao",
    qualidade: "Ultra photorealistic"
  },
  tags: ["colocar maos", "unhas vermelhas", "pulseiras", "flat lay", "top-down", "imagem"],
  imageUrl: colocandoMaoAmbienteImage,
  created_at: "2026-08-19T18:38:00.000Z",
  updated_at: "2026-08-19T18:38:00.000Z",
};

// 4. Colocar roupa no ambiente
export const COLOCAR_ROUPA_NO_AMBIENTE_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000004",
  user_id: null,
  name: "Colocar Roupa no Ambiente (Inserção Hiper-realista)",
  category: "fashion",
  formats: ["IMAGEM", "INSERÇÃO", "MODA", "FLAT LAY"],
  description: "Insere a peça de roupa da Imagem 2 no ambiente da Imagem 1 com caimento natural, proporções reais e sombras perfeitas, mantendo as mãos e o cenário intactos.",
  prompt_instruction: `Use Image 1 as the base scene for the environment. 
Use Image 2 ONLY as a reference for the clothing. 
TASK: 
Remove the clothing item from Image 1 and include the clothing item from Image 2. 
The clothing from Image 2 must appear naturally arranged within the environment; maintain the size of real clothing. 

IMPORTANT RULES: 
• Preserve the environment from Image 1 exactly 
• Preserve the camera angle exactly 
• Preserve the lighting exactly 
• Preserve the composition exactly 
• Preserve the perspective exactly 

HAND CONSISTENCY (CRITICAL): 
• Keep the exact same hands from Image 1 
• Keep the exact same skin tone 
• Keep the exact same manicure 
• Keep the exact same accessories (rings, bracelets, watches, if present) 
• Keep the exact same hand position 
• Keep the exact same arm position 
• DO NOT generate new hands 
• DO NOT modify the hands in any way 

CLOTHING REPLACEMENT: 
• Remove only the clothing from Image 1 
• Include the clothing from Image 2 
• Replicate the clothing EXACTLY as shown in Image 2 
• Same color • Same fabric • Same shape • Same proportions • same size • No redesigning • No creative interpretation 

POSITIONING: 
• The clothing must occupy approximately the same area where the original clothing was located 
• The clothing item must appear naturally arranged within the environment 
• Realistic fabric 
• Natural interaction with the environment's surface 
• Natural gravity and drape 

SCENE MAINTENANCE (CRITICAL): 
• Do NOT alter the background 
• Do NOT alter the environment 
• Do NOT alter furniture (if present) 
• Do NOT alter environmental details 
• Do NOT alter the lighting 
• Do NOT create a new scene 

FINAL QUALITY: 
• Ultra-photorealistic • Natural shadows • Realistic fabric texture • 4K real-photo look • No AI artifacts 

EXCLUSIONS: 
• No text • No logos • No watermarks • No filters • No stylization`,
  movement_json: {
    tipo: "prompt_imagem_colocar_roupa_ambiente",
    imagem_base: "Image 1 (ambiente e maos)",
    imagem_referencia: "Image 2 (roupa a inserir)",
    preservar: "Maos, unhas, acessorios e cenario",
    qualidade: "4K Real Photo"
  },
  tags: ["colocar roupa", "insercao de peca", "flat lay", "tapete", "imagem", "moda"],
  imageUrl: colocarRoupaAmbienteImage,
  created_at: "2026-08-19T18:37:00.000Z",
  updated_at: "2026-08-19T18:37:00.000Z",
};

// 5. Roupa no pacote
export const ROUPA_NO_PACOTE_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000005",
  user_id: null,
  name: "Roupa no Pacote (Embalagem Transparente E-commerce)",
  category: "product_demo",
  formats: ["IMAGEM", "EMBALAGEM", "PACOTE TRANSPARENTE", "E-COMMERCE"],
  description: "Coloca todas as peças de roupa dobradas profissionalmente dentro da embalagem plástica transparente sobre a cama, mantendo estampa frontal visível e reflexos realistas.",
  prompt_instruction: `Use Image 1 as the BASE scene. 
Use Image 2 ONLY as the clothing reference. 
TASK: 
Replace the clothing item currently inside the transparent package with ALL clothing items shown in Image 2. 

IMPORTANT: 
Preserve the environment from Image 1 exactly. 
Preserve the bed exactly. 
Preserve the blanket exactly. 
Preserve the camera angle exactly. 
Preserve the lighting exactly. 
Preserve the composition exactly. 
Preserve the perspective exactly. 
Preserve the plastic package exactly. 
Preserve all hands exactly as they appear in Image 1. 
Do not create a new scene. 
Do not modify the room. 
Do not modify the packaging position. 

CLOTHING REPLACEMENT: 
Remove only the clothing item currently visible inside the package. 
Place ALL clothing items from Image 2 inside the same package. 
Replicate the clothing exactly as shown in Image 2. 
Same color. 
Same fabric. 
Same design. 
Same print. 
Same proportions. 
No redesign. 
No creative interpretation. 

PACKING / FOLDING: 
If Image 2 contains more than one clothing item, all pieces must be packed together inside the same transparent package, arranged neatly like a real online fashion order. 
Fold the clothing naturally and professionally for e-commerce presentation. 
Arrange the pieces so they fit realistically inside the package. 
If any item contains a front print, graphic, logo, or important design element, fold and position it so the main front design remains clearly visible through the transparent packaging whenever possible. 
Maintain realistic fabric folds. 
Maintain realistic packaging reflections. 
All garments must remain fully inside the package. 

FINAL QUALITY: 
Ultra photorealistic. 
Natural shadows. 
Realistic transparent plastic. 
Realistic fabric texture. 
Looks like a real product photo. 
No AI artifacts. 

EXCLUSIONS: 
No text. 
No logos added. 
No watermark. 
No filters. 
No stylization.`,
  movement_json: {
    tipo: "prompt_imagem_roupa_no_pacote_transparente",
    embalagem: "Pacote plastico transparente com reflexos e dobras naturais",
    posicionamento: "Roupas dobradas profissionalmente com estampa frontal visivel",
    qualidade: "Ultra photorealistic"
  },
  tags: ["roupa no pacote", "pacote transparente", "unboxing", "embalagem", "imagem", "e-commerce"],
  imageUrl: roupaNoPacoteImage,
  created_at: "2026-08-19T18:36:00.000Z",
  updated_at: "2026-08-19T18:36:00.000Z",
};

// 6. Colocar embalagem do tiktok
export const COLOCAR_EMBALAGEM_TIKTOK_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000006",
  user_id: null,
  name: "Colocar Embalagem do TikTok Shop (Segurando Pacote Preto)",
  category: "ugc",
  formats: ["IMAGEM", "TIKTOK SHOP", "PACOTE PRETO", "UNBOXING"],
  description: "Insere o pacote preto oficial do TikTok Shop sendo segurado pelas mãos da modelo no cenário vazio, com a etiqueta de envio frontal legível e proporção compacta.",
  prompt_instruction: `Coloque o primeiro seu ambiente e segundo o pacote 

Create a realistic overhead product image using two references. 
Image A = the empty environment scene with only the model’s hands visible. 
Image B = the package reference. 

Use Image A as the main base for the scene. Preserve the exact same environment, background, surface, framing, lighting, camera angle, hand position style, skin tone, white nails, bracelets, and overall composition. 

Add the package from Image B into the model’s hands, so the model is naturally holding the package in the scene. 

IMPORTANT: 
– The package must appear clearly visible in the hands 
– Show the FRONT side of the package 
– The shipping label must face the camera 
– The label should be readable and fully visible from the front 
– The package must look naturally held, centered, and well positioned 
– The hands must hold the package firmly and realistically from both sides, similar to a natural product presentation 
– The package must keep the same black plastic material, proportions, folds, and front label appearance as the reference 
– Do not change the package design 
– Do not redesign the label 
– Do not replace the package with another one 
– O pacote deve ser pequeno 

The final image should look like the model is presenting the package for a TikTok Shop product reveal, with the package clearly shown in front view. 
Keep the camera completely fixed in a top-down overhead angle. 
No camera movement. 
No extra objects. 
No product outside the package. 
No distorted hands. 
No extra fingers. 
No deformed package. 
No label changes. 
No background changes. 

Final result: 
A clean, realistic overhead product image where the model is naturally holding the package with both hands, clearly showing the front side of the package and its label, using the empty environment as the main base. O pacote deve ser pequeno`,
  movement_json: {
    tipo: "prompt_imagem_colocar_embalagem_tiktok",
    referencia_a: "Ambiente com maos vazias",
    referencia_b: "Pacote de envio preto do TikTok Shop",
    etiqueta: "Frontal, legivel e visivel",
    tamanho: "Pacote compacto/pequeno bem posicionado entre as maos"
  },
  tags: ["embalagem tiktok", "pacote preto", "tiktok shop", "etiqueta", "imagem", "unboxing"],
  imageUrl: colocarEmbalagemTikTokImage,
  created_at: "2026-08-19T18:35:00.000Z",
  updated_at: "2026-08-19T18:35:00.000Z",
};

// 7. Suspense Unboxing — Starting Frame
export const SUSPENSE_UNBOXING_STARTING_FRAME_PRESET: MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" } = {
  id: "20000000-0000-4000-8000-000000000007",
  user_id: null,
  name: "Suspense Unboxing — Starting Frame",
  category: "fashion",
  formats: ["IMAGEM", "STARTING FRAME", "UNBOXING", "SUSPENSE", "FLAT LAY"],
  description: "Gera a imagem inicial (Frame 0) de suspense 9:16 com pacote boutique fechado no tapete fofo, mãos femininas prontas para abrir e apenas um vislumbre sutil do tecido para reter o público.",
  prompt_instruction: `Create an ultra-realistic **vertical 9:16 TikTok Shop fashion unboxing starting image** based on the uploaded reference image.

## REFERENCE PRIORITY

Use the uploaded image as the main visual reference for:

1. the clothing
2. the environment/background
3. the hand styling and accessories
4. the lighting and camera composition

The final image should look like a natural continuation of the reference scene.

---

## CLOTHING — VERY IMPORTANT

Use the clothing visible in the uploaded reference as the product that is physically inside the package.

Preserve the clothing's visible characteristics:

* same garment types
* same number of pieces
* same colors
* same patterns
* same fabric appearance
* same trims
* same design details
* same proportions
* same overall style

Do not redesign, recolor, duplicate, remove, or replace any garment.

Imagine that the garments shown in the reference have simply been **folded naturally and placed inside one package**.

The package must realistically contain all of those garments.

---

## MAIN TRANSFORMATION

In the original reference, the clothing may be visible outside the package.

For this new starting frame, place those referenced garments **inside ONE closed soft boutique-style package** positioned in the central area of the same environment.

This is the main change.

Keep the surrounding scene visually consistent with the uploaded reference.

---

## PACKAGE

Use one soft neutral boutique package made from:

* white tissue wrapping
  or
* soft cream/off-white wrapping material

It should look naturally wrapped around folded clothing.

The package must have:

* realistic fabric volume underneath
* soft bulges from the folded garments
* natural wrinkles
* slightly crinkled wrapping
* believable thickness
* realistic gravity
* realistic folds

The package should be large enough to contain every clothing piece from the reference.

It must look **closed and ready to be opened**.

Do not use a rigid box.

Do not make the wrapping look hard or plastic-like.

No logos, labels, branding, or readable text.

---

## CLOTHING VISIBILITY

Keep the garments almost completely hidden inside the package.

A very small natural glimpse of fabric may appear near one small fold in the wrapping, but only if necessary.

If visible, that fabric must visually correspond to one of the garments from the reference.

Do not show a complete garment outside the package.

Do not reveal the outfit yet.

The viewer should understand that clothing is inside while still feeling curiosity about what will be revealed.

---

## ENVIRONMENT

Preserve the environment shown in the uploaded reference as closely as possible.

Keep the same general:

* carpet or surface
* room aesthetic
* background colors
* furniture
* decorative objects
* object positions
* perspective
* lighting direction
* shadows
* warm feminine atmosphere

Do not create an unrelated new room.

Do not replace the existing environment with a generic studio setup.

Only make small composition adjustments if necessary to fit the package naturally into the center.

---

## HANDS AND FOREARMS

Show feminine hands and forearms with the same **visual styling** seen in the reference.

Match the reference appearance for:

* approximate skin tone
* manicure style
* nail color
* bracelets
* rings
* jewelry style
* hand scale

Keep the hands natural and anatomically realistic.

No face or body is needed.

Only hands and a small portion of the forearms should be visible.

The goal is visual continuity with the original reference, not depicting or identifying a specific person.

---

## HAND POSITION

Both hands should already be touching the closed package.

Place one hand naturally near the upper-left portion of the package and the other near the upper-right portion.

The fingers should lightly grip the wrapping as if the package will be opened immediately in the next video frame.

The action should communicate:

**about to begin the unboxing**

Do not show the package being opened yet.

Do not show clothing being removed yet.

---

## CAMERA

Maintain:

* vertical 9:16 format
* static overhead top-down composition
* smartphone-style realism
* TikTok Shop POV aesthetic
* natural home photography
* realistic lens perspective
* subtle imperfections
* no artificial studio appearance

The package should be the main focal point while enough of the original environment remains visible for continuity.

---

## LIGHTING

Follow the lighting already present in the reference.

Keep:

* natural warm light
* soft realistic shadows
* gentle highlights
* believable smartphone exposure
* natural dynamic range

Avoid excessive HDR, artificial studio lighting, CGI rendering, or overly polished commercial photography.

---

## PHYSICAL REALISM

The wrapping material must behave like soft paper or flexible boutique packaging.

The folded garments inside should naturally affect the package shape.

Show believable:

* fabric volume
* gravity
* pressure
* folds
* wrinkles
* softness

The package must not look empty.

It must not look rigid.

Nothing should float or appear physically impossible.

---

## CONTINUITY FOR THE NEXT VIDEO

This image will be used as the first frame of an AI-generated unboxing video.

Design the pose so the next sequence can naturally continue with:

* hands gripping the same package
* opening the top wrapping
* revealing the referenced clothing
* removing those garments from inside

Maintain consistent:

* camera angle
* package scale
* environment
* lighting
* hand styling
* clothing appearance

---

## AVOID

* different clothing designs
* different garment colors
* additional garments
* missing garments
* duplicate clothing
* unrelated clothing inside the package
* clothing already fully revealed
* clothing worn by a model
* unrelated background
* different room
* extra hands
* extra fingers
* malformed fingers
* distorted hands
* warped clothing
* floating objects
* rigid fabric
* unrealistic package geometry
* text overlays
* captions
* logos
* watermarks
* TikTok interface elements
* artificial CGI appearance

---

## FINAL RESULT

Create a hyper-realistic 9:16 overhead fashion unboxing starting frame using the uploaded reference as the visual foundation.

The referenced clothing should now be **folded and physically contained inside one closed soft boutique package**, while the environment, lighting, hand styling, accessories, and overall composition remain visually consistent with the reference.

The package is still closed, both hands are already touching it, and the frame should look like the exact moment immediately before a realistic fashion unboxing begins.`,
  movement_json: {
    tipo: "prompt_imagem_suspense_unboxing_starting_frame",
    formato: "vertical 9:16",
    camera: "top-down overhead view",
    superficie: "tapete fofo bege/cream",
    objeto: "pacote boutique fechado com vislumbre sutil do tecido",
    maos: "maos femininas segurando o pacote prontas para abrir"
  },
  tags: ["suspense unboxing", "starting frame", "frame 0", "pacote fechado", "curiosidade", "tiktok shop", "imagem"],
  imageUrl: suspenseUnboxingStartingFrameImage,
  created_at: "2026-08-19T22:30:00.000Z",
  updated_at: "2026-08-20T11:40:00.000Z",
};

export const SITE_IMAGE_PRESETS: (MovementPreset & { imageUrl?: string; mediaType?: "image" | "video" })[] = [
  RECRIANDO_CENARIO_PRESET,
  REMOVER_ROUPAS_TEXTO_PRESET,
  COLOCANDO_A_MAO_NO_AMBIENTE_PRESET,
  COLOCAR_ROUPA_NO_AMBIENTE_PRESET,
  ROUPA_NO_PACOTE_PRESET,
  COLOCAR_EMBALAGEM_TIKTOK_PRESET,
  SUSPENSE_UNBOXING_STARTING_FRAME_PRESET,
];
