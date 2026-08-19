import type { MovementPreset } from "@/lib/supabase/types";

// Import all 16 MP4 video assets from "src/assets/prompts/videos para o site"
import ctaSimpaticaVideo from "@/assets/prompts/videos para o site/CTA SIMPATICA.mp4";
import frenteDetalheRealistaCta10sVideo from "@/assets/prompts/videos para o site/FRENTE + DETALHE REALISTA + CTA — 10 SEG.mp4";
import frenteLadoCabeloVideo from "@/assets/prompts/videos para o site/FRENTE+ LADO+ CABELO.mp4";
import frenteFocoNaRoupaVideo from "@/assets/prompts/videos para o site/FRENTE+FOCO NA ROUPA.mp4";
import ganchoAlcaVideo from "@/assets/prompts/videos para o site/GANCHO ALÇA.mp4";
import ganchoJogarRoupaNaCameraVideo from "@/assets/prompts/videos para o site/GANCHO JOGAR ROUPA NA CAMERA.mp4";
import ganchoTaparCameraComAMaoVideo from "@/assets/prompts/videos para o site/GANCHO TAPAR CAMERA COM A MAO.mp4";
import ganchoEmbalagemTikTokShopVideo from "@/assets/prompts/videos para o site/Gancho embalagem TikTok Shop.mp4";
import ganchoEsticarRoupaVideo from "@/assets/prompts/videos para o site/Gancho esticar a roupa.mp4";
import ganchoJogarRoupaOpcao2Video from "@/assets/prompts/videos para o site/Gancho jogar roupa — opção 2.mp4";
import ganchoPacoteTransparenteVideo from "@/assets/prompts/videos para o site/Gancho pacote transparente.mp4";
import ganchoTaparCameraPegarProdutoVideo from "@/assets/prompts/videos para o site/Gancho tapar câmera e pegar produto.mp4";
import ladoCtaFrenteCabeloVideo from "@/assets/prompts/videos para o site/LADO + CTA + FRENTE + CABELO.mp4";
import mostrarAsPecasVideo from "@/assets/prompts/videos para o site/Mostrar as peças.mp4";
import mostrarOTecidoDePertoVideo from "@/assets/prompts/videos para o site/Mostrar o tecido de perto.mp4";
import passarAMaoNaRoupaVideo from "@/assets/prompts/videos para o site/Passar a mão na roupa.mp4";

export {
  ctaSimpaticaVideo,
  frenteDetalheRealistaCta10sVideo,
  frenteLadoCabeloVideo,
  frenteFocoNaRoupaVideo,
  ganchoAlcaVideo,
  ganchoJogarRoupaNaCameraVideo,
  ganchoTaparCameraComAMaoVideo,
  ganchoEmbalagemTikTokShopVideo,
  ganchoEsticarRoupaVideo,
  ganchoJogarRoupaOpcao2Video,
  ganchoPacoteTransparenteVideo,
  ganchoTaparCameraPegarProdutoVideo,
  ladoCtaFrenteCabeloVideo,
  mostrarAsPecasVideo,
  mostrarOTecidoDePertoVideo,
  passarAMaoNaRoupaVideo,
};

// 1. Gancho esticar roupa
export const GANCHO_ESTICAR_ROUPA_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000101",
  user_id: null,
  name: "Gancho Esticar Roupa",
  category: "fashion",
  formats: ["POV", "FLAT LAY", "MODA", "GANCHO"],
  description: "Vídeo overhead realista com câmera fixa top-down onde mãos femininas seguram e esticam delicadamente a peça superior para demonstrar a elasticidade e qualidade do tecido.",
  prompt_instruction: `Create a realistic overhead product video using the provided image as the main reference. Keep the camera completely fixed from a top-down view. Preserve the same carpet background, lighting, framing, hands, skin tone, white nails, bracelets, and the exact arrangement of the clothing pieces. 
The video should focus only on the top/front piece — the first visible piece on top. 
The hands gently pick up only this piece and hold it from both sides, showing the fabric clearly. Then the hands softly stretch the fabric outward in a natural way, not too hard, just enough to show the material and elasticity. Hold for a brief moment, then relax slightly, and stretch the same piece again. Repeat this same action smoothly during the video: stretch, hold, relax a little, and stretch again. 
Only this single clothing piece should move. The other pieces underneath or behind it must remain in the same position the whole time and should not be touched, removed, or rearranged. 
The motion must be slow, controlled, and natural, as if someone is demonstrating the quality of the fabric. Keep the same hands visible throughout the video. No sudden movements. 
No camera movement, no zoom, no cuts, no transitions, no changing clothes, no extra products, no switching pieces, no distorted hands, no deformed fabric, and no movement in the other garments. 
If needed, end with the piece still being held neatly in front of the other items, maintaining a clean product showcase look.`,
  movement_json: {
    tipo: "prompt_overhead_esticar_roupa",
    camera: "top-down 90 graus totalmente fixa",
    duracao_segundos: 8,
    instrucao: "Create a realistic overhead product video using the provided image as the main reference. Keep the camera completely fixed from a top-down view. Preserve the same carpet background, lighting, framing, hands, skin tone, white nails, bracelets, and the exact arrangement of the clothing pieces. The video should focus only on the top/front piece — the first visible piece on top. The hands gently pick up only this piece and hold it from both sides, showing the fabric clearly. Then the hands softly stretch the fabric outward in a natural way, not too hard, just enough to show the material and elasticity. Hold for a brief moment, then relax slightly, and stretch the same piece again. Repeat this same action smoothly during the video: stretch, hold, relax a little, and stretch again. Only this single clothing piece should move. The other pieces underneath or behind it must remain in the same position the whole time and should not be touched, removed, or rearranged. The motion must be slow, controlled, and natural, as if someone is demonstrating the quality of the fabric. Keep the same hands visible throughout the video. No sudden movements. No camera movement, no zoom, no cuts, no transitions, no changing clothes, no extra products, no switching pieces, no distorted hands, no deformed fabric, and no movement in the other garments. If needed, end with the piece still being held neatly in front of the other items, maintaining a clean product showcase look."
  },
  tags: ["esticar roupa", "elasticidade", "flat lay", "top-down", "overhead", "tecido", "gancho", "pov"],
  videoUrl: ganchoEsticarRoupaVideo,
  duration: "8s",
  created_at: "2026-08-19T18:30:00.000Z",
  updated_at: "2026-08-19T18:30:00.000Z",
};

// 2. Gancho tapar câmera e pegar produto
export const GANCHO_TAPAR_CAMERA_PEGAR_PRODUTO_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000102",
  user_id: null,
  name: "Gancho Tapar Câmera e Pegar Produto",
  category: "product_demo",
  formats: ["POV", "TRANSIÇÃO", "SHOWCASE", "GANCHO"],
  description: "Showcase overhead de produto onde as mãos apresentam os detalhes das peças e, ao final, uma mão avança em linha reta cobrindo 100% da lente da câmera para criar uma transição perfeita.",
  prompt_instruction: `Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position, directly overhead. Preserve exactly the same bed or fabric surface, lighting, framing, hands, nails, and all clothing pieces as they appear in the image. 
The clothes must remain lying on the bed throughout the entire video. The hands should not lift the clothing excessively. Instead, they should gently touch and handle the pieces while keeping them mostly resting on the bed. 
The hands must interact with only one piece at a time and, throughout the entire video, may present only one or, at most, two products from the arrangement. 
For the first product, the hands gently hold the garment and slightly open it to reveal its details. If the piece has straps, gently lift them to show them. If it has a neckline, gently open the area to show the neckline. If necessary, slightly spread the fabric to reveal the shape, stitching, cut, texture, or design. The movement should feel like a seller carefully presenting the product details while keeping the garment mostly in the same position on the bed. 
The hands may also gently pull a small area of the fabric, smooth it with the fingers, slightly open the front area, and show the important details in a natural and elegant way. The piece must never be completely removed from the bed or lifted too high. 
After presenting the first piece, place it back exactly as it was. Then, if a second product is presented, repeat the same action: gently touch the piece, slightly open or spread it, show details such as straps, neckline, cut, or fabric texture, and keep the piece mostly resting on the bed. 
The movement should be smooth, slow, elegant, and natural, like a detailed product presentation video. All other garments must remain completely still and untouched. 
FINAL CAMERA-COVER TRANSITION: 
Only begin this action after the product presentation has been completely finished. 
Only one hand begins a continuous movement toward the camera lens, as if reaching out to touch the viewer. 
* Gently rotate until the palm is facing the camera — a natural rotation of the arm/forearm, without forcibly bending or twisting the wrist. 
* The movement travels in a straight line along the lens axis, approaching the camera frontally, simulating a POV perspective of the camera being "touched." 
* Maintain a constant, controlled speed: neither abrupt nor hesitant — a fluid movement from beginning to end. 
*Lens coverage:* 
* The palm progressively approaches until it fills 100% of the frame, with no gaps visible around the edges. 
* The final contact should create the sensation of completely physically blocking the camera lens, with a slight natural blur from proximity during the final frames before full coverage. 
*Final state (mandatory):* 
* The camera remains completely covered by the left palm until the cut. 
* There must be absolutely no movement away from the lens, no opening of the fingers, and no partial reveal of the scene after the lens is covered. 
* The final frame must show only the palm, filling 100% of the frame, with no part of the previous scene visible. 
*Suggested duration:* approximately 1 to 1.5 seconds, so the movement is clearly visible without feeling slow or dragged out. 
IMPORTANT: – Perform the entire normal product presentation first – Cover the camera only at the very end – Do not interrupt the product presentation prematurely – No sudden hand movements – No aggressive movements – Do not twist the wrist – Do not deform the fingers – Do not create extra fingers – Do not generate deformed hands – The palm must completely fill the camera view in the final frame 
Do not move the camera, do not apply zoom, do not use cuts, do not add transitions before the final camera-cover action, do not use fast movements, do not remove the clothes from the bed, do not shake the camera, do not deform the hands, do not deform the fabric, and do not handle multiple pieces at the same time. 
FINAL RESULT: 
A realistic continuous POV product showcase in which the hands naturally demonstrate the clothing exactly as described and, only at the very end, one hand smoothly approaches the lens and completely covers the camera with the palm, ending the video with the view fully covered to create a clean transition into the next scene.`,
  movement_json: {
    tipo: "prompt_tapar_camera_e_pegar_produto",
    camera: "top-down overhead com transicao final de cobertura de lente",
    duracao_segundos: 10,
    instrucao: "Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position, directly overhead. Preserve exactly the same bed or fabric surface, lighting, framing, hands, nails, and all clothing pieces as they appear in the image. The clothes must remain lying on the bed throughout the entire video. The hands should not lift the clothing excessively. Instead, they should gently touch and handle the pieces while keeping them mostly resting on the bed. The hands must interact with only one piece at a time and, throughout the entire video, may present only one or, at most, two products from the arrangement. For the first product, the hands gently hold the garment and slightly open it to reveal its details. If the piece has straps, gently lift them to show them. If it has a neckline, gently open the area to show the neckline. If necessary, slightly spread the fabric to reveal the shape, stitching, cut, texture, or design. The movement should feel like a seller carefully presenting the product details while keeping the garment mostly in the same position on the bed. The hands may also gently pull a small area of the fabric, smooth it with the fingers, slightly open the front area, and show the important details in a natural and elegant way. The piece must never be completely removed from the bed or lifted too high. After presenting the first piece, place it back exactly as it was. Then, if a second product is presented, repeat the same action: gently touch the piece, slightly open or spread it, show details such as straps, neckline, cut, or fabric texture, and keep the piece mostly resting on the bed. The movement should be smooth, slow, elegant, and natural, like a detailed product presentation video. All other garments must remain completely still and untouched. FINAL CAMERA-COVER TRANSITION: Only begin this action after the product presentation has been completely finished. Only one hand begins a continuous movement toward the camera lens, as if reaching out to touch the viewer. Gently rotate until the palm is facing the camera. The palm progressively approaches until it fills 100% of the frame. The camera remains completely covered by the left palm until the cut."
  },
  tags: ["tapar camera", "pegar produto", "transicao", "pov", "overhead", "showcase", "gancho"],
  videoUrl: ganchoTaparCameraPegarProdutoVideo,
  duration: "10s",
  created_at: "2026-08-19T18:29:00.000Z",
  updated_at: "2026-08-19T18:29:00.000Z",
};

// 3. Gancho jogar roupa — opção 2
export const GANCHO_JOGAR_ROUPA_OPCAO_2_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000103",
  user_id: null,
  name: "Gancho Jogar Roupa — Opção 2",
  category: "product_demo",
  formats: ["POV", "FLAT LAY", "ORGANIZAÇÃO", "GANCHO"],
  description: "As mãos pegam delicadamente cada peça de roupa e a retiram para fora do campo de visão da câmera, recolocando-as em seguida exatamente na posição original.",
  prompt_instruction: `ESPECÍFICO (descreva a roupa) 
Crie um vídeo realista de produto com a câmera totalmente fixa em uma visão superior (top-down). Mantenha a câmera perfeitamente imóvel durante toda a cena. Preserve exatamente o mesmo fundo, iluminação, enquadramento e sombras naturais. 
As mãos pegam delicadamente o SHORTS PRETO e a retiram completamente para fora do campo de visão da câmera, depois as mãos pegam delicadamente a BLUSA PRETA e também a retiram completamente para fora do campo de visão. 
Em seguida as mãos pegam delicadamente o SHORTS MARROM e também a retiram completamente para fora do campo de visão e por último as mãos pegam delicadamente a BLUSA BRANCA e também a retiram completamente para fora do campo de visão. 
Após um breve momento, as mãos colocam as peças de roupa de volta exatamente em sua posição original, recriando exatamente a mesma disposição inicial das peças. 
Todos os movimentos devem ser lentos, suaves e extremamente naturais, como se uma pessoa estivesse organizando as roupas. Não altere o ângulo da câmera, o enquadramento, a iluminação ou o fundo. Não faça movimentos de câmera, zoom, cortes ou transições. 

PADRÃO 
Crie um vídeo realista de produto com a câmera totalmente fixa em uma visão superior (top-down). Mantenha a câmera perfeitamente imóvel durante toda a cena. Preserve exatamente o mesmo fundo, iluminação, enquadramento e sombras naturais. 
As mãos pegam delicadamente cada peça de roupa e a retiram completamente para fora do campo de visão da câmera. 
Após um breve momento, as mãos colocam as peças de roupas exatamente em sua posição original. Em seguida, recriando exatamente a mesma disposição inicial das peças. 
Todos os movimentos devem ser lentos, suaves e extremamente naturais, como se uma pessoa estivesse organizando as roupas. Não altere o ângulo da câmera, o enquadramento, a iluminação ou o fundo.  
Não faça movimentos de câmera, zoom, cortes ou transições.`,
  movement_json: {
    tipo: "prompt_jogar_roupa_remover_recolocar",
    camera: "top-down fixa",
    duracao_segundos: 8,
    instrucao: "Crie um vídeo realista de produto com a câmera totalmente fixa em uma visão superior (top-down). Mantenha a câmera perfeitamente imóvel durante toda a cena. Preserve exatamente o mesmo fundo, iluminação, enquadramento e sombras naturais. As mãos pegam delicadamente cada peça de roupa e a retiram completamente para fora do campo de visão da câmera. Após um breve momento, as mãos colocam as peças de roupas exatamente em sua posição original. Em seguida, recriando exatamente a mesma disposição inicial das peças. Todos os movimentos devem ser lentos, suaves e extremamente naturais, como se uma pessoa estivesse organizando as roupas. Não altere o ângulo da câmera, o enquadramento, a iluminação ou o fundo. Não faça movimentos de câmera, zoom, cortes ou transições."
  },
  tags: ["jogar roupa", "organizar roupas", "remover pecas", "flat lay", "top down", "gancho", "pov"],
  videoUrl: ganchoJogarRoupaOpcao2Video,
  duration: "8s",
  created_at: "2026-08-19T18:28:00.000Z",
  updated_at: "2026-08-19T18:28:00.000Z",
};

// 4. Gancho pacote transparente
export const GANCHO_PACOTE_TRANSPARENTE_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000104",
  user_id: null,
  name: "Gancho Pacote Transparente",
  category: "ugc",
  formats: ["POV", "UNBOXING", "TIKTOK SHOP", "5S"],
  description: "Unboxing viral e satisfatório de 5s rasgando o pacote plástico transparente ao meio com efeito sonoro nítido e revelando a peça dobrada direto para a câmera.",
  prompt_instruction: `Static camera. No camera movement. No zoom. No panning. No shaking. 
The clothing item remains neatly folded inside the transparent package. 
The woman’s hands firmly grip both sides of the package opening. 
With a quick and realistic motion, she tears the plastic package open from the center. 
The plastic stretches naturally and creates realistic tearing behavior. 
At the exact moment the package is torn open, include a clear, crisp, and realistic plastic ripping sound. 
The tearing sound must be perfectly synchronized with the movement of the hands and the plastic. 
The sound should resemble a real transparent clothing package being firmly ripped open. 
Include natural plastic stretching, crinkling, and tearing sounds during the opening motion. 
The tearing sound should feel strong, satisfying, and impactful, creating an engaging viral unboxing effect. 
Immediately after tearing, both hands pull the torn plastic away from the garment. 
The packaging is completely removed from the clothing. 
The empty plastic is pulled out of the frame and does not remain covering the garment. 
Include subtle and realistic plastic crinkling sounds as the empty packaging is removed from the frame. 
The folded clothing remains centered on the surface. 
Without pause, both hands grab the garment from both sides. 
The garment is lifted smoothly as a single physical object. 
No duplicate clothing. 
No second garment. 
No remaining copy on the surface. 
The same garment is lifted upward toward the camera. 
The front side of the garment faces the camera. 
The hands slightly adjust the garment to showcase the front design, print, texture, and details. 
The garment is presented close to the camera for a brief moment. 
Include subtle, natural fabric movement sounds while the garment is lifted and adjusted. 
Keep the audio clean, realistic, and synchronized with every action. 
No music. 
No voice. 
No talking. 
No artificial sound effects. 
No unnecessary background noise. 
Fast but realistic product reveal. 
Natural fabric movement. 
Natural gravity. 
Smooth hand coordination. 
Realistic interaction between hands, packaging, and clothing. 
No object morphing. 
No clipping. 
No hand deformation. 
No finger distortion. 
No extra fingers. 
No camera movement. 
Ultra-realistic TikTok Shop product reveal. 
Total duration approximately 5 seconds. 
The entire sequence should feel quick, satisfying, and natural, like a viral fashion unboxing reveal.`,
  movement_json: {
    tipo: "prompt_unboxing_pacote_transparente",
    duracao_segundos: 5,
    camera: "estatica sem movimento",
    instrucao: "Static camera. No camera movement. No zoom. No panning. No shaking. The clothing item remains neatly folded inside the transparent package. The woman's hands firmly grip both sides of the package opening. With a quick and realistic motion, she tears the plastic package open from the center. The plastic stretches naturally and creates realistic tearing behavior. At the exact moment the package is torn open, include a clear, crisp, and realistic plastic ripping sound. Total duration approximately 5 seconds. Ultra-realistic TikTok Shop product reveal."
  },
  tags: ["pacote transparente", "unboxing", "rasgando pacote", "tiktok shop", "viral", "5s", "pov"],
  videoUrl: ganchoPacoteTransparenteVideo,
  duration: "5s",
  created_at: "2026-08-19T18:27:00.000Z",
  updated_at: "2026-08-19T18:27:00.000Z",
};

// 5. Gancho embalagem TikTok Shop
export const GANCHO_EMBALAGEM_TIKTOK_SHOP_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000105",
  user_id: null,
  name: "Gancho Embalagem TikTok Shop",
  category: "ugc",
  formats: ["POV", "UNBOXING", "TIKTOK SHOP", "PACOTE"],
  description: "Unboxing hiper-realista com o pacote preto oficial de envio do TikTok Shop, rasgando o topo com som sincronizado e retirando os produtos sequencialmente.",
  prompt_instruction: `Ultra-realistic TikTok Shop fashion unboxing video. 
Static overhead camera. 
No camera movement. 
No zoom. 
No panning. 
No shaking. 
No cuts. 
No transitions. 
Use the same overall sequence and behavior as the reference: 
A black shipping bag/package is already centered on the surface. 
The woman’s hands appear naturally and hold the package from both sides near the top opening. 
The package must remain the same package throughout the scene. 
Do not change the package design, color, label, or shape. 
Keep the same product continuity. 
Do not morph objects. 
Do not deform the hands. 
Do not deform the package. 
No extra fingers. 
No duplicate garments. 
UNBOXING SEQUENCE: 
The woman firmly grips the top of the package with both hands. 
With a quick, realistic, and satisfying motion, she tears open the TOP part of the package, just like a real shipping bag being opened from the top seam. 
The plastic must stretch naturally and rip realistically. 
At the exact moment the package is torn open, include a clear, crisp, synchronized plastic ripping sound. 
Audio requirements: 
– realistic plastic stretching sound – realistic crinkling sound – realistic tearing sound – tearing sound perfectly synchronized with the hands and package – subtle package handling sounds – subtle fabric movement sounds – no music – no voice – no talking – no artificial fake sound effects – clean audio only 
After tearing the top open, both hands pull the opening apart and reveal the clothing inside. 
IMPORTANT: 
The package must remain visible in the scene. 
Do not remove the package from the scene. 
Do not throw the package away. 
Do not move it out of frame. 
Keep the opened package on the surface while the products are removed. 
PRODUCT REMOVAL LOGIC: 
If there is only ONE clothing piece inside: – remove only that one piece – pull it out naturally with both hands – place it neatly on the surface beside or in front of the package – keep the package visible in the scene 
If there are TWO clothing pieces inside: – remove ONLY ONE piece at a time – never pull both pieces out together 
– never remove everything at once – first, remove the first clothing piece naturally – place the first piece neatly on the surface – keep the package still visible in the scene – then reach back into the same package – remove the second clothing piece naturally – place the second piece neatly beside the first one 
The removal must feel realistic and sequential: 
first piece out → placed on the surface → second piece out → placed on the surface. 
Do not skip steps. 
Do not instantly spawn the clothing outside the package. 
Do not make both pieces come out together. 
Do not mix the garments. 
Do not duplicate the garments. 
CLOTHING PRESENTATION: 
Each clothing piece must be handled as a single physical object with realistic fabric behavior and gravity. 
When each piece is removed: – lift it naturally from the package – briefly reveal it clearly – then place it neatly on the surface – gently adjust or smooth it if needed 
After placing the garment, the hands may lightly smooth the fabric to make the piece look clean and presentable. 
If there are two pieces: – place them one after the other in an organized way – keep both visible on the surface at the end – keep the opened package still visible in the scene 
MOVEMENT STYLE: 
Fast but realistic. 
Smooth hand coordination. 
Natural unboxing rhythm. 
Visually satisfying and viral-style product reveal. 
Elegant and controlled movement. 
No robotic motion. 
No clipping. 
No object morphing. 
No unrealistic physics. 
FINAL RESULT: 
A hyper-realistic overhead unboxing video where the woman tears open the TOP of the black shipping package with a satisfying synchronized ripping sound, keeps the opened package visible in the scene, then removes the clothing naturally following the exact sequence: if there are two pieces, she removes one piece first, places it on the surface, then removes the second piece and places it beside the first — never taking both out at once. The final scene shows the garments neatly arranged on the surface with the package still visible.`,
  movement_json: {
    tipo: "prompt_unboxing_embalagem_tiktok_shop",
    camera: "static overhead",
    duracao_segundos: 8,
    instrucao: "Ultra-realistic TikTok Shop fashion unboxing video. Static overhead camera. No camera movement. No zoom. A black shipping bag/package is centered on the surface. The woman tears open the TOP of the black shipping package with a satisfying synchronized ripping sound, keeps the opened package visible in the scene, then removes the clothing naturally following the exact sequence: if there are two pieces, she removes one piece first, places it on the surface, then removes the second piece and places it beside the first. The final scene shows the garments neatly arranged on the surface with the package still visible."
  },
  tags: ["embalagem tiktok shop", "unboxing", "pacote preto", "viral", "tiktok shop", "pov"],
  videoUrl: ganchoEmbalagemTikTokShopVideo,
  duration: "8s",
  created_at: "2026-08-19T18:26:00.000Z",
  updated_at: "2026-08-19T18:26:00.000Z",
};

// 6. Passar a mão na roupa
export const PASSAR_A_MAO_NA_ROUPA_SITE_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000106",
  user_id: null,
  name: "Passar a Mão na Roupa",
  category: "fashion",
  formats: ["POV", "FLAT LAY", "MODA", "TEXTURA"],
  description: "Showcase overhead onde as mãos tocam suavemente as peças na cama/superfície, abrindo detalhes como alças e decotes sem retirá-las da posição original.",
  prompt_instruction: `Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position. Preserve the same bed or fabric surface, lighting, framing, hands, nails, and all clothing pieces exactly as they appear. 
The clothes must remain lying on the bed during the whole video. The hands should not lift the clothing too much. Instead, the hands gently touch and handle the pieces while they stay mostly resting on the bed. 
The hands should interact with only one piece at a time, and during the whole video they may show one or at most two products from the arrangement. 
For the first product, the hands gently hold the garment and open it slightly to reveal the details. If the piece has straps, lightly lift and show the straps. If it has a neckline, gently open and show the neckline. If needed, slightly spread the fabric to show the shape, stitching, cut, texture, or design. The motion should feel like a seller carefully presenting the product details while keeping the piece mostly in place on the bed. 
The hands can also softly pull a small area of the fabric, smooth it with the fingers, lightly open the front area, and show the important details in a natural and elegant way. The piece should never be fully removed from the bed or lifted too high. 
After showing the first piece, place it back exactly as it was. Then, if a second product is shown, repeat the same action: gently touch it, slightly open or spread it, show details like straps, neckline, cut, or fabric texture, and keep the piece mostly resting on the bed. 
The motion should be smooth, slow, elegant, and natural, like a product-detail presentation video. The other garments must remain still and untouched. 
No camera movement, no zoom, no cuts, no transitions, no fast motion, no removing the clothing from the bed, no shaking, no distorted hands, no deformed fabric, and no handling multiple pieces at the same time.`,
  movement_json: {
    tipo: "prompt_passar_a_mao_na_roupa",
    camera: "top-down overhead fixa",
    duracao_segundos: 8,
    instrucao: "Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position. Preserve the same bed or fabric surface, lighting, framing, hands, nails, and all clothing pieces exactly as they appear. The clothes must remain lying on the bed during the whole video. The hands should not lift the clothing too much. Instead, the hands gently touch and handle the pieces while they stay mostly resting on the bed. The hands should interact with only one piece at a time, and gently touch, slightly open, and show details like straps, neckline, cut, or fabric texture."
  },
  tags: ["passar a mao", "textura", "flat lay", "alcas", "decote", "overhead", "moda", "pov"],
  videoUrl: passarAMaoNaRoupaVideo,
  duration: "8s",
  created_at: "2026-08-19T18:25:00.000Z",
  updated_at: "2026-08-19T18:25:00.000Z",
};

// 7. Mostrar as peças
export const MOSTRAR_AS_PECAS_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000107",
  user_id: null,
  name: "Mostrar as Peças",
  category: "fashion",
  formats: ["POV", "FLAT LAY", "SHOWCASE", "MODA"],
  description: "Mãos femininas pegam delicadamente uma peça por vez do tapete/cama, aproximam da câmera demonstrando o tecido e elasticidade, e a devolvem exatamente à posição original.",
  prompt_instruction: `Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position at all times. Preserve the same carpet background, lighting, framing, clothing arrangement, feminine hands, white nails, and bracelets. 
The hands should interact with only one clothing piece at a time. Choose two pieces only from the arrangement. First, the hands gently pick up one piece from its place on the bed/carpet, lift it closer to the camera to show the details clearly, softly stretch or pull the fabric a little to demonstrate the material, hold it for a brief moment, and then place it back neatly in the exact same original position. 
After that, the hands move to a second clothing piece and repeat the same action: pick up only that one piece, bring it closer to the camera, show the details, gently stretch the fabric a little, hold briefly, and then place it back in the same exact place. 
The movements should look elegant, smooth, controlled, and natural. The camera must remain still the whole time. The other clothing pieces that are not being handled must remain in place and should not move. 
No camera movement, no zoom, no cuts, no transitions, no changing arrangement, no picking up two pieces at the same time, no extra products, no distorted hands, and no deformed fabric.`,
  movement_json: {
    tipo: "prompt_mostrar_as_pecas_sequencial",
    camera: "top-down overhead fixa",
    duracao_segundos: 10,
    instrucao: "Create a realistic overhead product showcase video using the provided image as the main reference. Keep the camera completely fixed in a top-down position at all times. Preserve the same carpet background, lighting, framing, clothing arrangement, feminine hands, white nails, and bracelets. The hands should interact with only one clothing piece at a time. Choose two pieces only from the arrangement. Pick up one piece, lift closer to camera, softly stretch fabric to show material, place back in original position, then repeat for the second piece."
  },
  tags: ["mostrar pecas", "flat lay", "overhead", "showcase", "elasticidade", "moda", "pov"],
  videoUrl: mostrarAsPecasVideo,
  duration: "10s",
  created_at: "2026-08-19T18:24:00.000Z",
  updated_at: "2026-08-19T18:24:00.000Z",
};

// 8. Mostrar o tecido de perto
export const MOSTRAR_O_TECIDO_DE_PERTO_PRESET: MovementPreset & { videoUrl?: string; duration?: string; mediaType?: "image" | "video" } = {
  id: "10000000-0000-4000-8000-000000000108",
  user_id: null,
  name: "Mostrar o Tecido de Perto",
  category: "fashion",
  formats: ["POV", "CLOSE-UP", "TEXTURA", "8S"],
  description: "Vídeo overhead realista de 8 segundos onde mãos femininas pegam uma blusa, aproximam da câmera e deslizam os dedos sobre o tecido para evidenciar textura e qualidade.",
  prompt_instruction: `Create a realistic 8-second overhead product video using the provided image as the main reference. Keep the camera completely fixed in a top-down position. Preserve the same carpet background, lighting, framing, feminine hands, white nails, bracelets, and the clothing arrangement. 
The hands should pick up only one blouse from the arrangement in a natural way. After picking it up, gently stretch the blouse a little to show the fabric, then bring it closer to the camera without moving the camera itself. While holding the blouse near the camera, use the fingers to softly rub and slide over the fabric, showing the texture and quality of the material. The movement should look smooth, elegant, and natural, like a product showcase. 
After showing the fabric up close, keep the blouse well positioned in the hands, with the material clearly visible. The action should focus only on this single blouse. 
No camera movement, no zoom, no cuts, no transitions, no extra products, no switching pieces, no distorted hands, and no deformed fabric.`,
  movement_json: {
    tipo: "prompt_mostrar_tecido_de_perto_8s",
    camera: "top-down fixa",
    duracao_segundos: 8,
    instrucao: "Create a realistic 8-second overhead product video using the provided image as the main reference. Keep the camera completely fixed in a top-down position. Preserve the same carpet background, lighting, framing, feminine hands, white nails, bracelets, and the clothing arrangement. The hands should pick up only one blouse from the arrangement in a natural way, gently stretch the blouse, bring it closer to the camera, and use fingers to softly rub and slide over the fabric showing texture and quality."
  },
  tags: ["tecido de perto", "textura", "qualidade", "close up", "8s", "overhead", "moda", "pov"],
  videoUrl: mostrarOTecidoDePertoVideo,
  duration: "8s",
  created_at: "2026-08-19T18:23:00.000Z",
  updated_at: "2026-08-19T18:23:00.000Z",
};

// 9. GANCHO JOGAR ROUPA NA CAMERA
export const GANCHO_JOGAR_ROUPA_NA_CAMERA_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000109",
  user_id: null,
  name: "Gancho Jogar Roupa na Câmera",
  category: "fashion",
  formats: ["UGC", "GANCHO", "MODELO", "TRANSIÇÃO"],
  description: "A modelo segura a peça em frente ao corpo, caminha diretamente em direção à câmera e a aproxima suavemente até cobrir a lente com o tecido para corte ou transição.",
  prompt_instruction: `Create a vertical ultra-realistic video animation using the provided image as the exact starting frame. The model is already holding the product with both hands in front of her body. She starts completely still, looking at the camera. 
She makes only very small and gentle showcase movements with the product. The product must stay stable, centered, stretched naturally, and always clearly visible. 
Do not shake the product too much. 
Then she walks slowly straight forward toward the camera, without ever moving backward. The camera remains completely fixed. 
Near the end, she makes a brief pause, gives a soft pout expression only, and slightly turns her face. She does not blow a kiss. 
After that, she continues holding the product and brings it closer to the camera very gently, with minimal movement, until it naturally covers the lens. 
EXTREMELY CRITICAL PRODUCT LOCK: 
The product must remain exactly the same item already visible in her hands in the starting image. Do not replace it, redesign it, reinterpret it, enhance it, or generate another version of it. 
Do not change: 
* fabric 
* texture 
* shape 
* neckline 
* straps 
* folds 
* trim 
* seams 
* proportions 
* visible front side 
* any visible detail 
Do not create new details when the product gets closer to the camera. 
Do not invent hidden parts. 
If some part of the product is not fully visible in the starting frame, keep it undefined and do not generate new design information. 
The product must only appear larger because of proximity, never different. 
CAMERA LOCK: 
No camera movement. 
No zoom. 
No digital zoom. 
No pan. 
No tilt. 
No reframe. 
No handheld shake. 
MOTION RULE: 
The model moves forward, but the product should stay as stable as possible in her hands. 
No strong swinging. 
No twisting. 
No flipping. 
No turning the product. 
Ultra photorealistic, realistic human motion, realistic hands, realistic fabric behavior, no product morphing, no new details, no fake-looking changes.`,
  movement_json: {
    tipo: "prompt_jogar_roupa_na_camera_lock",
    camera: "camera estatica sem zoom digital",
    duracao_segundos: 6,
    instrucao: "Create a vertical ultra-realistic video animation using the provided image as the exact starting frame. The model is already holding the product with both hands in front of her body. She walks slowly straight forward toward the camera, gives a soft pout expression, and brings the product closer to the camera until it naturally covers the lens. Preserve product 100% identical."
  },
  tags: ["jogar roupa na camera", "transicao", "caminhada", "modelo", "bloqueio de lente", "gancho"],
  videoUrl: ganchoJogarRoupaNaCameraVideo,
  duration: "6s",
  created_at: "2026-08-19T18:22:00.000Z",
  updated_at: "2026-08-19T18:22:00.000Z",
};

// 10. GANCHO TAPAR CAMERA COM A MAO
export const GANCHO_TAPAR_CAMERA_COM_A_MAO_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000110",
  user_id: null,
  name: "Gancho Tapar Câmera com a Mão",
  category: "ugc",
  formats: ["MIRROR SELFIE", "UGC", "TRANSIÇÃO", "5S"],
  description: "Mirror selfie de 5s onde a modelo dá 1 passo à frente, usa a mão esquerda para cobrir suavemente a lente criando uma transição limpa, e depois descobre a câmera retornando à pose.",
  prompt_instruction: `{ 
"animation_style": "mirror_selfie_hand_cover_transition", 
"camera": { 
"mirror_selfie_style": true, 
"phone_in_hand": true, 
"phone_hand": "right_hand", 
"cover_hand": "left_hand", 
"handheld_micro_movement": true, 
"no_zoom": true, 
"no_reframe": true, 
"no_camera_swap": true 
}, 
"motion_timing": { 
"duration": "5_seconds", 
"tempo": "natural_medium_fast", 
"continuous_motion": true, 
"no_cuts": true 
}, 
"sequence": [ 
{ 
"action": "start_pose", 
"pose": "front_facing_mirror_selfie", 
"details": "standing at a comfortable distance from the mirror, holding the phone naturally in the right hand, relaxed feminine posture, soft natural stance, left arm relaxed" 
}, 
{ 
"action": "step_forward", 
"steps": "1_small_natural_step", 
"speed": "smooth_natural", 
"details": "takes one natural feminine step forward toward the mirror with subtle hip sway, relaxed shoulders, and realistic timing" 
}, 
{ 
"action": "soft_expression", 
"details": "maintains a calm feminine expression with a subtle soft smile and relaxed eyes" 
}, 
{ 
"action": "left_hand_raise", 
"details": "the left hand, which is not holding the phone, naturally lifts toward the camera lens while the right hand continues holding the phone in the same position" 
}, 
{ 
"action": "cover_camera", 
"details": "the left hand moves directly toward the lens and softly covers the entire camera view for a smooth mirror selfie transition effect" 
}, 
{ 
"action": "cover_hold", 
"duration": "very_brief", 
"details": "holds the lens fully covered for a brief moment" 
}, 
{ 
"action": "uncover_camera", 
"details": "the left hand gently moves away from the lens in a smooth and natural motion while the right hand still holds the phone steadily" 
}, 
{ 
"action": "step_backward", 
"steps": "1_small_natural_step_back", 
"speed": "smooth_natural", 
"details": "after uncovering the lens, she naturally steps backward again to a comfortable mirror selfie distance" 
}, 
{ 
"action": "final_pose", 
"pose": "relaxed_mirror_selfie_pose", 
"details": "returns to a relaxed feminine final pose, still holding the phone in the right hand, with soft posture, subtle body sway, and a natural soft smile" 
} 
], 
"body": { 
"posture": "relaxed_confident", 
"hips": "soft_natural_curve", 
"shoulders": "relaxed", 
"movement": "continuous_micro_motion", 
"no_stiff_pose": true 
}, 
"face": { 
"expression": "soft_feminine", 
"smile": "subtle_natural", 
"eyes": "relaxed" 
}, 
"hand_rules": { 
"right_hand_must_always_hold_phone": true, 
"left_hand_must_always_do_the_cover_transition": true, 
"no_hand_swap": true, 
"no_hand_substitution": true, 
"no_extra_hands": true, 
"no_missing_fingers": true, 
"no_deformed_fingers": true, 
"no_distorted_hands": true, 
"no_bugged_hand_motion": true, 
"no_phone_switching_hands": true 
}, 
"rules": { 
"no_360": true, 
"no_spin": true, 
"no_fast_turn": true, 
"no_robotic_motion": true, 
"no_exaggeration": true, 
"no_random_pose_change": true 
}, 
"realism": { 
"preserve_identity": true, 
"natural_hair_physics": true, 
"natural_body_flow": true, 
"natural_fabric_physics": true, 
"natural_hand_motion": true 
}, 
"final": "a realistic feminine mirror selfie video where the subject holds the phone in the right hand, steps slightly forward, uses the left hand to softly cover the camera lens, briefly holds the cover, uncovers the lens, then steps back into a relaxed natural mirror selfie pose without changing hands or creating any hand distortion" 
}`,
  movement_json: {
    animation_style: "mirror_selfie_hand_cover_transition",
    camera: {
      mirror_selfie_style: true,
      phone_in_hand: true,
      phone_hand: "right_hand",
      cover_hand: "left_hand",
      handheld_micro_movement: true,
      no_zoom: true,
      no_reframe: true,
      no_camera_swap: true
    },
    motion_timing: {
      duration: "5_seconds",
      tempo: "natural_medium_fast",
      continuous_motion: true,
      no_cuts: true
    },
    sequence: [
      {
        action: "start_pose",
        pose: "front_facing_mirror_selfie",
        details: "standing at a comfortable distance from the mirror, holding the phone naturally in the right hand, relaxed feminine posture, soft natural stance, left arm relaxed"
      },
      {
        action: "step_forward",
        steps: "1_small_natural_step",
        speed: "smooth_natural",
        details: "takes one natural feminine step forward toward the mirror with subtle hip sway, relaxed shoulders, and realistic timing"
      },
      {
        action: "soft_expression",
        details: "maintains a calm feminine expression with a subtle soft smile and relaxed eyes"
      },
      {
        action: "left_hand_raise",
        details: "the left hand, which is not holding the phone, naturally lifts toward the camera lens while the right hand continues holding the phone in the same position"
      },
      {
        action: "cover_camera",
        details: "the left hand moves directly toward the lens and softly covers the entire camera view for a smooth mirror selfie transition effect"
      },
      {
        action: "cover_hold",
        duration: "very_brief",
        details: "holds the lens fully covered for a brief moment"
      },
      {
        action: "uncover_camera",
        details: "the left hand gently moves away from the lens in a smooth and natural motion while the right hand still holds the phone steadily"
      },
      {
        action: "step_backward",
        steps: "1_small_natural_step_back",
        speed: "smooth_natural",
        details: "after uncovering the lens, she naturally steps backward again to a comfortable mirror selfie distance"
      },
      {
        action: "final_pose",
        pose: "relaxed_mirror_selfie_pose",
        details: "returns to a relaxed feminine final pose, still holding the phone in the right hand, with soft posture, subtle body sway, and a natural soft smile"
      }
    ],
    body: {
      posture: "relaxed_confident",
      hips: "soft_natural_curve",
      shoulders: "relaxed",
      movement: "continuous_micro_motion",
      no_stiff_pose: true
    },
    face: {
      expression: "soft_feminine",
      smile: "subtle_natural",
      eyes: "relaxed"
    },
    hand_rules: {
      right_hand_must_always_hold_phone: true,
      left_hand_must_always_do_the_cover_transition: true,
      no_hand_swap: true,
      no_hand_substitution: true,
      no_extra_hands: true,
      no_missing_fingers: true,
      no_deformed_fingers: true,
      no_distorted_hands: true,
      no_bugged_hand_motion: true,
      no_phone_switching_hands: true
    },
    rules: {
      no_360: true,
      no_spin: true,
      no_fast_turn: true,
      no_robotic_motion: true,
      no_exaggeration: true,
      no_random_pose_change: true
    },
    realism: {
      preserve_identity: true,
      natural_hair_physics: true,
      natural_body_flow: true,
      natural_fabric_physics: true,
      natural_hand_motion: true
    },
    final: "a realistic feminine mirror selfie video where the subject holds the phone in the right hand, steps slightly forward, uses the left hand to softly cover the camera lens, briefly holds the cover, uncovers the lens, then steps back into a relaxed natural mirror selfie pose without changing hands or creating any hand distortion"
  },
  tags: ["tapar camera", "mao na camera", "mirror selfie", "transicao", "5s", "ugc"],
  videoUrl: ganchoTaparCameraComAMaoVideo,
  duration: "5s",
  created_at: "2026-08-19T18:21:00.000Z",
  updated_at: "2026-08-19T18:21:00.000Z",
};

// 11. GANCHO ALÇA
export const GANCHO_ALCA_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000111",
  user_id: null,
  name: "Gancho Alça",
  category: "fashion",
  formats: ["POV", "UGC", "FASHION", "TRY ON"],
  description: "A modelo dá dois passos à frente, puxa suavemente uma alça do look e em seguida a outra alça com um sorriso natural, recuando para pose final com mão na cintura.",
  prompt_instruction: `Animate the subject as a REAL person presenting the outfit in a natural POV-style fashion video. 
START OF ANIMATION: 
The subject starts standing naturally at a comfortable distance from the camera. 
She calmly takes two small natural steps forward toward the camera with relaxed posture and subtle body sway. 
While approaching closer, she softly looks toward the phone camera and forms a warm natural smile. 
Then she gently lifts one shoulder strap of the outfit outward slightly using her free hand, creating a soft realistic fabric stretch. 
She briefly releases it naturally. 
Right after, she gently pulls the other shoulder strap outward the same way with a soft playful feminine smile. 
Both strap pulls must feel delicate, subtle and realistic. 
No exaggerated stretching. 
No aggressive movement. 
Natural fabric behavior only. 
After the second strap adjustment: 
the subject softly smiles again while still looking toward the phone camera. 
Then the subject naturally steps back again to a comfortable distance from the camera while maintaining relaxed body flow. 
As she returns backward: 
one hand gradually moves to the waist naturally. 
At the final position: 
the subject slightly shifts her hip, 
raises one leg softly forward with a feminine relaxed pose, 
keeps one hand on the waist, 
and gives a warm natural smile. 
GENERAL MOTION: 
Natural fluid movement. 
Continuous body micro-adjustments. 
Relaxed shoulders. 
Gentle hip sway. 
Real human timing. 
No stiff motion. 
FACIAL EXPRESSION: 
Soft neutral expression most of the time. 
Brief natural smiles appear occasionally. 
No frozen smile. 
No exaggerated facial tension. 
BODY LANGUAGE: 
Natural posture. 
Subtle feminine energy. 
No dancing. 
No exaggerated influencer posing. 
CAMERA: 
POV casual phone recording. 
Very subtle handheld micro-movement. 
No zoom. 
No camera shake. 
Chest-height perspective. 
REALISM: 
Preserve original identity. 
Natural skin texture. 
Natural hair movement. 
Natural fabric physics. 
No beauty filters. 
No smoothing. 
No stylization. 
RESTRICTIONS: 
No talking. 
No text. 
No UI. 
No effects. 
No exaggerated movement. 
No robotic motion. 
FINAL RESULT: 
A hyper-realistic casual fashion selfie video with natural forward movement, soft strap-adjustment gestures, warm smiling, realistic feminine body flow and natural relaxed posing.`,
  movement_json: {
    tipo: "prompt_gancho_alca_pov",
    camera: "POV casual phone recording",
    duracao_segundos: 8,
    instrucao: "Animate the subject as a REAL person presenting the outfit in a natural POV-style fashion video. She calmly takes two small steps forward, gently lifts one shoulder strap, releases it, pulls the other shoulder strap outward with a playful feminine smile, then steps back to comfortable distance with one hand on waist and soft smile."
  },
  tags: ["alca", "puxar alca", "pov", "selfie", "try on", "moda feminina", "gancho"],
  videoUrl: ganchoAlcaVideo,
  duration: "8s",
  created_at: "2026-08-19T18:20:00.000Z",
  updated_at: "2026-08-19T18:20:00.000Z",
};

// 12. FRENTE+ LADO+ CABELO
export const FRENTE_LADO_CABELO_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000112",
  user_id: null,
  name: "Frente + Lado + Cabelo",
  category: "fashion",
  formats: ["MIRROR SELFIE", "UGC", "MODA", "CABELO"],
  description: "A modelo caminha em direção ao espelho, coloca o cabelo atrás da orelha de forma delicada, interage com o tecido da roupa, faz uma leve pose de lado e recua.",
  prompt_instruction: `Animate the subject as a REAL person in a natural mirror selfie fashion video. 
The subject starts standing naturally in front of the mirror at a comfortable distance. 
She slowly walks toward the mirror with relaxed feminine posture, smooth body sway and realistic timing. 
As she approaches: 
the phone naturally lifts slightly upward and closer to the mirror, creating a realistic close-up framing focused more on the outfit and upper body. 
Once closer to the mirror: 
the subject softly grabs the front section of the hair resting over the chest area and naturally guides it backward behind the ear using the fingers. 
The motion must feel soft and feminine: 
fingers lightly passing near the ear, 
hair smoothly sliding backward, 
natural hair flow and realistic movement. 
While adjusting the hair: 
the subject gives a subtle soft smile and relaxed eye contact with the phone screen. 
After fixing the hair: 
the subject briefly interacts with the outfit naturally. 
Possible motions: - lightly touching the top fabric, 
- softly sliding fingers across the clothing, - subtle collar or neckline adjustment, - gentle fabric touch and release. 
Then: 
the subject softly turns slightly sideways for a brief elegant pose while maintaining relaxed posture. 
After the showcase: 
she slowly steps backward again with smooth natural body flow. 
At the final position: 
one hand softly moves to the waist, 
the body settles naturally, 
and the subject finishes with a calm feminine pose. 
GENERAL MOTION: 
Natural fluid movement. 
Relaxed shoulders. 
Soft feminine posture. 
Realistic timing. 
No stiff motion. 
No robotic movement. 
CAMERA: 
Mirror selfie style. 
Subtle handheld movement. 
Natural close-up framing. 
No zoom. 
No reframe. 
REALISM: 
Preserve original identity. 
Natural skin texture. 
Natural hair physics. 
Natural fabric behavior. 
No beauty filters. 
No smoothing. 
No stylization. 
RESTRICTIONS: 
No talking. 
No text. 
No UI. 
No exaggerated movement. 
No robotic timing.`,
  movement_json: {
    tipo: "prompt_frente_lado_cabelo",
    camera: "mirror selfie style com framing natural",
    duracao_segundos: 8,
    instrucao: "Animate the subject as a REAL person in a natural mirror selfie fashion video. Walks toward mirror, guides hair backward behind the ear, interacts with top fabric, softly turns slightly sideways for brief pose, and steps back."
  },
  tags: ["frente lado cabelo", "cabelo", "mirror selfie", "moda", "pose lateral", "ugc"],
  videoUrl: frenteLadoCabeloVideo,
  duration: "8s",
  created_at: "2026-08-19T18:19:00.000Z",
  updated_at: "2026-08-19T18:19:00.000Z",
};

// 13. FRENTE+FOCO NA ROUPA
export const FRENTE_FOCO_NA_ROUPA_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000113",
  user_id: null,
  name: "Frente + Foco na Roupa",
  category: "fashion",
  formats: ["MIRROR SELFIE", "CLOSE-UP", "MODA", "10S"],
  description: "Mirror selfie de 10s onde a modelo caminha diretamente para frente aproximando o celular do tecido por 3 a 4 segundos enquanto desliza a mão pelo produto.",
  prompt_instruction: `Animate the subject as a REAL person presenting the outfit in a natural mirror selfie fashion video. 
The total video duration should be 10 seconds. 
The subject starts standing naturally in front of the mirror at a comfortable distance. 
IMPORTANT: 
She must NOT take any step backward first. 
She must begin from her initial position and move directly forward toward the mirror. 
No backward motion before approaching. 
No hesitation. 
No reset movement. 
She slowly and naturally walks directly forward toward the mirror with relaxed feminine posture, smooth body flow, soft hip sway, and realistic timing. 
As she moves forward: 
the phone remains in one hand and is naturally brought closer to the mirror, creating a stronger close-up focus on the outfit. 
The phone should get noticeably closer to the product area, as if creating a natural in-camera zoom by physically moving closer. 
The framing should shift attention away from the face and much more toward the outfit details and fabric. 
When she reaches the closer position, she pauses near the mirror and stays there for about 3 to 4 seconds to focus on the product. 
IMPORTANT CLOSE-UP PRODUCT FOCUS: 
During this close-up moment, the phone must remain close enough to clearly emphasize the outfit. 
The product should be the main focus. 
The outfit must appear closer and more prominent in frame. 
While close to the mirror: 
the free hand softly slides over the fabric in a natural and elegant way. 
She may gently pass the hand over the outfit from top to bottom, or softly glide the fingers over the material to highlight the texture and quality. 
She may also turn slightly to the side while still staying close, just enough to better show the fit and fabric, while continuing to softly slide the hand over the outfit. 
Allowed motions during the close-up: - softly sliding one hand over the fabric - lightly rubbing or gliding the fingers over the material - gently moving the hand from top to bottom - subtle touch and release - slight side turn to better show the outfit - delicate fabric emphasis 
Do not use aggressive pulling. 
Do not move too fast. 
Do not make repetitive robotic motions. 
After the close-up showcase: 
the subject naturally steps backward with relaxed feminine posture and soft body flow, returning to a comfortable mirror selfie distance. 
At the final position: 
one hand softly moves to the waist or rests naturally by the side, 
the body settles into a calm elegant feminine pose, 
and the subject finishes with a soft natural expression. 
GENERAL MOTION: 
Natural fluid movement. 
Relaxed shoulders. 
Soft feminine posture. 
Real human timing. 
No stiff motion. 
No robotic movement. 
No exaggerated posing. 
CAMERA: 
Mirror selfie style. 
Phone held naturally in one hand. 
Subtle handheld movement only. 
No digital zoom. 
The closer product focus must happen by physically moving the phone and body closer to the mirror. 
No reframe. 
No camera glitches. 
REALISM: 
Preserve original identity. 
Natural skin texture. 
Natural hair movement. 
Realistic fabric behavior. 
No beauty filters. 
No smoothing. 
No stylization. 
RESTRICTIONS: 
No talking. 
No text. 
No UI. 
No exaggerated movement. 
No robotic timing. 
No abrupt movements. 
No backward step before moving forward. 
FINAL RESULT: 
A realistic 10-second mirror selfie fashion video where the subject starts from her original position, moves directly forward toward the mirror without stepping backward first, brings the phone noticeably closer to create a strong product focus, stays close for 3 to 4 seconds while softly sliding one hand over the outfit fabric and slightly turning to the side, then naturally steps back and ends in a calm elegant feminine pose.`,
  movement_json: {
    tipo: "prompt_frente_foco_na_roupa_10s",
    duracao_segundos: 10,
    camera: "mirror selfie com aproximacao fisica",
    instrucao: "Animate the subject as a REAL person presenting the outfit in a natural mirror selfie fashion video. Total duration 10 seconds. She moves directly forward toward the mirror, brings the phone noticeably closer to create a strong product focus, stays close for 3 to 4 seconds while softly sliding one hand over the outfit fabric and slightly turning to the side, then naturally steps back."
  },
  tags: ["foco na roupa", "close up", "tecido", "mirror selfie", "10s", "moda"],
  videoUrl: frenteFocoNaRoupaVideo,
  duration: "10s",
  created_at: "2026-08-19T18:18:00.000Z",
  updated_at: "2026-08-19T18:18:00.000Z",
};

// 14. CTA SIMPATICA
export const CTA_SIMPATICA_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000114",
  user_id: null,
  name: "CTA Simpática",
  category: "cta",
  formats: ["CTA", "MIRROR SELFIE", "TIKTOK SHOP", "4S"],
  description: "Mirror selfie dinâmico de 4s com sorriso fofo, caminhada suave e gesto apontando para baixo (botão de compra do TikTok Shop) com leve inclinação de cabeça.",
  prompt_instruction: `{ 
"animation_style": "mirror_selfie_cta_motion", 
"camera": { 
"mirror_selfie_style": true, 
"phone_in_hand": true, 
"phone_hand": "right_hand", 
"handheld_micro_movement": true, 
"no_zoom": true, 
"no_reframe": true 
}, 
"motion_xtiming": { 
"duration": "4_seconds", 
"tempo": "natural_medium_fast", 
"continuous_motion": true 
}, 
"sequence": [ 
{ 
"action": "start_pose", 
"pose": "front_facing", 
"details": "standing slightly far from mirror, relaxed posture, soft feminine expression, eyes looking directly into the phone screen camera" 
}, 
{ 
"action": "walk_forward", 
"steps": "2_small_steps", 
"speed": "smooth_natural", 
"details": "walks naturally toward the mirror with subtle hip sway and relaxed shoulders, gaze remains fixed on the phone screen camera the entire time" 
}, 
{ 
"action": "soft_face_expression", 
"details": "forms a cute soft smile while still looking directly into the phone camera, relaxed eyes and natural cheek lift" 
}, 
{ 
"action": "point_down_gesture", 
"details": "raises free hand naturally and points downward toward bottom center of screen, relaxed wrist, friendly feminine motion, briefly holds gesture while maintaining eye contact with phone camera" 
}, 
{ 
"action": "head_tilt", 
"details": "slightly tilts head softly to the side while smiling naturally and still looking directly into the phone camera" 
} 
], 
"body": { 
"posture": "relaxed_feminine", 
"hips": "subtle_natural_sway", 
"shoulders": "soft_relaxed", 
"movement": "continuous_micro_motion", 
"no_stiff_pose": true 
}, 
"rules": { 
"no_fast_movements": true, 
"no_robotic_motion": true, 
"no_exaggeration": true, 
"no_dance": true, 
"no_looking_at_mirror": true 
}, 
"realism": { 
"preserve_identity": true, 
"natural_hair_physics": true, 
"natural_body_flow": true, 
"natural_fabric_physics": true 
}, 
"final": "cute natural mirror selfie CTA with direct eye contact into the phone camera, soft smile, downward pointing gesture and gentle head tilt" 
}`,
  movement_json: {
    animation_style: "mirror_selfie_cta_motion",
    camera: {
      mirror_selfie_style: true,
      phone_in_hand: true,
      phone_hand: "right_hand",
      handheld_micro_movement: true,
      no_zoom: true,
      no_reframe: true
    },
    motion_timing: {
      duration: "4_seconds",
      tempo: "natural_medium_fast",
      continuous_motion: true
    },
    sequence: [
      {
        action: "start_pose",
        pose: "front_facing",
        details: "standing slightly far from mirror, relaxed posture, soft feminine expression, eyes looking directly into the phone screen camera"
      },
      {
        action: "walk_forward",
        steps: "2_small_steps",
        speed: "smooth_natural",
        details: "walks naturally toward the mirror with subtle hip sway and relaxed shoulders, gaze remains fixed on the phone screen camera the entire time"
      },
      {
        action: "soft_face_expression",
        details: "forms a cute soft smile while still looking directly into the phone camera, relaxed eyes and natural cheek lift"
      },
      {
        action: "point_down_gesture",
        details: "raises free hand naturally and points downward toward bottom center of screen, relaxed wrist, friendly feminine motion, briefly holds gesture while maintaining eye contact with phone camera"
      },
      {
        action: "head_tilt",
        details: "slightly tilts head softly to the side while smiling naturally and still looking directly into the phone camera"
      }
    ],
    body: {
      posture: "relaxed_feminine",
      hips: "subtle_natural_sway",
      shoulders: "soft_relaxed",
      movement: "continuous_micro_motion",
      no_stiff_pose: true
    },
    rules: {
      no_fast_movements: true,
      no_robotic_motion: true,
      no_exaggeration: true,
      no_dance: true,
      no_looking_at_mirror: true
    },
    realism: {
      preserve_identity: true,
      natural_hair_physics: true,
      natural_body_flow: true,
      natural_fabric_physics: true
    },
    final: "cute natural mirror selfie CTA with direct eye contact into the phone camera, soft smile, downward pointing gesture and gentle head tilt"
  },
  tags: ["cta", "apontar para baixo", "mirror selfie", "sorriso", "4s", "tiktok shop"],
  videoUrl: ctaSimpaticaVideo,
  duration: "4s",
  created_at: "2026-08-19T18:17:00.000Z",
  updated_at: "2026-08-19T18:17:00.000Z",
};

// 15. FRENTE + DETALHE REALISTA + CTA — 10 SEG
export const FRENTE_DETALHE_REALISTA_CTA_10SEG_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000115",
  user_id: null,
  name: "Frente + Detalhe Realista + CTA — 10 Seg",
  category: "cta",
  formats: ["CTA", "MIRROR SELFIE", "SHOWCASE", "10S"],
  description: "Apresentação completa de 10s: aproximação no espelho focada no tecido, giro sutil de lado, interação delicada com zíper/tecido e finalização apontando para baixo com sorriso simpático.",
  prompt_instruction: `Animate a REAL person presenting the outfit in a natural mirror selfie fashion video. 
She starts at a comfortable distance from the mirror. 
From the beginning, the phone is slightly lifted and angled more toward the outfit details, not fully centered on the face. 
She slowly walks toward the mirror with relaxed feminine posture, smooth body sway and realistic timing. Pacing must feel slower and intentional. 
As she gets closer, the phone moves closer to the mirror, creating a close-up frame focused on outfit texture and upper-body details. 
Near the mirror, she softly turns slightly sideways to show the outfit silhouette naturally. 
She stays close briefly instead of walking back immediately. 
While close, the free hand slowly slides across the fabric and interacts with the outfit. 
If the outfit has zipper, buttons, collar, lapel, open fabric or adjustable details, the hand softly opens, adjusts or closes that area. 
Possible motions: 
lightly open/close fabric, touch zipper area, slide fingers across texture, subtle pull and release, showcase collar or sleeve. 
At one moment, the phone moves very close to the mirror and slightly above the outfit angle, creating a product close-up focused on texture and material. 
Interaction must be delicate and realistic. 
No exaggerated pulling. 
No rushed motion. 
No repetitive movement. 
FACIAL EXPRESSION: 
Soft feminine expression during the whole video. 
Subtle natural smiles while approaching, showcasing and stepping back. 
Relaxed eyes. 
No serious or emotionless face. 
After showcasing, she slowly moves slightly backward with relaxed body flow and soft hip sway. 
At the final moment: 
the subject softly points downward with one finger while slightly tilting the head sideways in a friendly feminine way, maintaining a warm natural smile and relaxed posture. 
GENERAL: 
Natural fluid movement. 
Relaxed shoulders. 
Soft feminine posture. 
No stiff or robotic motion. 
CAMERA: 
Mirror selfie style. 
Subtle handheld movement. 
Natural close-up framing. 
No zoom. 
No reframe. 
REALISM: 
Preserve identity, skin texture, hair movement and fabric behavior. 
No beauty filter. 
No smoothing. 
No stylization. 
RESTRICTIONS: 
No talking. 
No text. 
No UI. 
No exaggerated movement. 
No robotic timing.`,
  movement_json: {
    tipo: "prompt_frente_detalhe_realista_cta_10s",
    duracao_segundos: 10,
    camera: "mirror selfie com enquadramento de close-up",
    instrucao: "Animate a REAL person presenting the outfit in a natural mirror selfie fashion video. Walks toward mirror, focuses on outfit details, turns slightly sideways, slides hand over fabric, steps slightly backward, and softly points downward with one finger while tilting head with a warm smile."
  },
  tags: ["frente detalhe cta", "cta", "mirror selfie", "textura", "ziper", "10s", "moda"],
  videoUrl: frenteDetalheRealistaCta10sVideo,
  duration: "10s",
  created_at: "2026-08-19T18:16:00.000Z",
  updated_at: "2026-08-19T18:16:00.000Z",
};

// 16. LADO + CTA + FRENTE + CABELO
export const LADO_CTA_FRENTE_CABELO_PRESET: MovementPreset & { videoUrl?: string; duration?: string } = {
  id: "10000000-0000-4000-8000-000000000116",
  user_id: null,
  name: "Lado + CTA + Frente + Cabelo",
  category: "cta",
  formats: ["SLOW MOTION", "MIRROR SELFIE", "CTA", "10S"],
  description: "Sequência fluida de 10s em mirror selfie: giro lateral de 45 graus, retorno frontal, gesto de CTA apontando para baixo, aproximação e ajuste delicado do cabelo atrás da orelha.",
  prompt_instruction: `{ 
"animation_style": "ultra_realistic_mirror_selfie_slow_motion_sequence", 
"camera": { 
"mirror_selfie_style": true, 
"phone_in_hand": true, 
"phone_hand": "right_hand", 
"handheld_micro_movement": true, 
"no_zoom": true, 
"no_reframe": true, 
"fixed_mirror_framing": true 
}, 
"motion_timing": { 
"duration": "10_seconds", 
"tempo": "slow_natural", 
"continuous_motion": true, 
"no_cuts": true 
}, 
"sequence": [ 
{ 
"action": "start_pose", 
"pose": "front_facing_mirror_selfie", 
"duration": "brief", 
"details": "ultra-realistic model standing naturally in front of the mirror, holding the phone in the right hand, relaxed feminine posture, calm expression, soft body stance, natural breathing and subtle micro-movements" 
}, 
{ 
"action": "slow_side_turn", 
"angle": "30_to_45_degrees", 
"speed": "smooth_natural", 
"details": "she slowly turns slightly to the side with relaxed shoulders, soft hip movement, and a natural feminine pose, without fully rotating the body" 
}, 
{ 
"action": "return_front", 
"speed": "smooth_natural", 
"details": "she gently turns back to a front-facing position toward the mirror, maintaining a soft, elegant expression" 
}, 
{ 
"action": "point_down", 
"hand": "left_hand", 
"speed": "natural", 
"details": "while continuing to hold the phone in the right hand, she naturally points downward with the left hand in a soft, subtle, feminine way, without exaggeration" 
}, 
{ 
"action": "step_closer_to_mirror", 
"steps": "1_small_natural_step", 
"speed": "slow_smooth", 
"details": "she takes a small step closer to the mirror, keeping a relaxed posture and natural body flow" 
}, 
{ 
"action": "hair_touch", 
"hand": "left_hand", 
"speed": "slow_elegant", 
"details": "the left hand softly moves up and gently passes through the hair, tucking the hair behind the ear in a natural and delicate way" 
}, 
{ 
"action": "final_pose", 
"duration": "brief", 
"details": "she holds a soft final mirror selfie pose close to the mirror, with relaxed shoulders, a subtle soft smile, calm eyes, and natural feminine presence" 
} 
], 
"body": { 
"posture": "relaxed_confident", 
"hips": "soft_natural_curve", 
"shoulders": "relaxed", 
"movement": "continuous_micro_motion", 
"no_stiff_pose": true, 
"no_robotic_body_language": true 
}, 
"face": { 
"expression": "soft_feminine", 
"smile": "subtle_natural", 
"eyes": "relaxed", 
"no_frozen_expression": true 
}, 
"hand_rules": { 
"right_hand_must_hold_phone_entire_time": true, 
"left_hand_used_for_gesture_and_hair_touch": true, 
"no_hand_swap": true, 
"no_extra_fingers": true, 
"no_missing_fingers": true, 
"no_deformed_hands": true, 
"no_bugged_hand_motion": true 
}, 
"rules": { 
"no_360": true, 
"no_spin": true, 
"no_fast_turn": true, 
"no_exaggeration": true, 
"no_dancing": true, 
"no_random_pose_change": true, 
"no_camera_glitch": true 
}, 
"realism": { 
"preserve_identity": true, 
"natural_hair_physics": true, 
"natural_body_flow": true, 
"natural_fabric_physics": true, 
"ultra_realistic_skin_texture": true 
}, 
"final": "an ultra-realistic 10-second mirror selfie video where the model starts front-facing, slowly turns slightly to the side, returns to front-facing, points downward with the left hand, steps closer to the mirror, gently tucks her hair behind her ear, and ends in a soft natural feminine pose" 
}`,
  movement_json: {
    animation_style: "ultra_realistic_mirror_selfie_slow_motion_sequence",
    camera: {
      mirror_selfie_style: true,
      phone_in_hand: true,
      phone_hand: "right_hand",
      handheld_micro_movement: true,
      no_zoom: true,
      no_reframe: true,
      fixed_mirror_framing: true
    },
    motion_timing: {
      duration: "10_seconds",
      tempo: "slow_natural",
      continuous_motion: true,
      no_cuts: true
    },
    sequence: [
      {
        action: "start_pose",
        pose: "front_facing_mirror_selfie",
        duration: "brief",
        details: "ultra-realistic model standing naturally in front of the mirror, holding the phone in the right hand, relaxed feminine posture, calm expression, soft body stance, natural breathing and subtle micro-movements"
      },
      {
        action: "slow_side_turn",
        angle: "30_to_45_degrees",
        speed: "smooth_natural",
        details: "she slowly turns slightly to the side with relaxed shoulders, soft hip movement, and a natural feminine pose, without fully rotating the body"
      },
      {
        action: "return_front",
        speed: "smooth_natural",
        details: "she gently turns back to a front-facing position toward the mirror, maintaining a soft, elegant expression"
      },
      {
        action: "point_down",
        hand: "left_hand",
        speed: "natural",
        details: "while continuing to hold the phone in the right hand, she naturally points downward with the left hand in a soft, subtle, feminine way, without exaggeration"
      },
      {
        action: "step_closer_to_mirror",
        steps: "1_small_natural_step",
        speed: "slow_smooth",
        details: "she takes a small step closer to the mirror, keeping a relaxed posture and natural body flow"
      },
      {
        action: "hair_touch",
        hand: "left_hand",
        speed: "slow_elegant",
        details: "the left hand softly moves up and gently passes through the hair, tucking the hair behind the ear in a natural and delicate way"
      },
      {
        action: "final_pose",
        duration: "brief",
        details: "she holds a soft final mirror selfie pose close to the mirror, with relaxed shoulders, a subtle soft smile, calm eyes, and natural feminine presence"
      }
    ],
    body: {
      posture: "relaxed_confident",
      hips: "soft_natural_curve",
      shoulders: "relaxed",
      movement: "continuous_micro_motion",
      no_stiff_pose: true,
      no_robotic_body_language: true
    },
    face: {
      expression: "soft_feminine",
      smile: "subtle_natural",
      eyes: "relaxed",
      no_frozen_expression: true
    },
    hand_rules: {
      right_hand_must_hold_phone_entire_time: true,
      left_hand_used_for_gesture_and_hair_touch: true,
      no_hand_swap: true,
      no_extra_fingers: true,
      no_missing_fingers: true,
      no_deformed_hands: true,
      no_bugged_hand_motion: true
    },
    rules: {
      no_360: true,
      no_spin: true,
      no_fast_turn: true,
      no_exaggeration: true,
      no_dancing: true,
      no_random_pose_change: true,
      no_camera_glitch: true
    },
    realism: {
      preserve_identity: true,
      natural_hair_physics: true,
      natural_body_flow: true,
      natural_fabric_physics: true,
      ultra_realistic_skin_texture: true
    },
    final: "an ultra-realistic 10-second mirror selfie video where the model starts front-facing, slowly turns slightly to the side, returns to front-facing, points downward with the left hand, steps closer to the mirror, gently tucks her hair behind her ear, and ends in a soft natural feminine pose"
  },
  tags: ["lado cta frente cabelo", "cta", "cabelo", "slow motion", "mirror selfie", "10s"],
  videoUrl: ladoCtaFrenteCabeloVideo,
  duration: "10s",
  created_at: "2026-08-19T18:15:00.000Z",
  updated_at: "2026-08-19T18:15:00.000Z",
};

export const SITE_VIDEO_PRESETS: (MovementPreset & { videoUrl?: string; duration?: string })[] = [
  GANCHO_ESTICAR_ROUPA_PRESET,
  GANCHO_TAPAR_CAMERA_PEGAR_PRODUTO_PRESET,
  GANCHO_JOGAR_ROUPA_OPCAO_2_PRESET,
  GANCHO_PACOTE_TRANSPARENTE_PRESET,
  GANCHO_EMBALAGEM_TIKTOK_SHOP_PRESET,
  PASSAR_A_MAO_NA_ROUPA_SITE_PRESET,
  MOSTRAR_AS_PECAS_PRESET,
  MOSTRAR_O_TECIDO_DE_PERTO_PRESET,
  GANCHO_JOGAR_ROUPA_NA_CAMERA_PRESET,
  GANCHO_TAPAR_CAMERA_COM_A_MAO_PRESET,
  GANCHO_ALCA_PRESET,
  FRENTE_LADO_CABELO_PRESET,
  FRENTE_FOCO_NA_ROUPA_PRESET,
  CTA_SIMPATICA_PRESET,
  FRENTE_DETALHE_REALISTA_CTA_10SEG_PRESET,
  LADO_CTA_FRENTE_CABELO_PRESET,
];
