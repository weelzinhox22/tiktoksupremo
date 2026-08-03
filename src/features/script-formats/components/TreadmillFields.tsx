import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TreadmillConfig } from "@/features/script-formats/types";

type TreadmillFieldsProps = {
  config: TreadmillConfig;
  onChange: (updated: Partial<TreadmillConfig>) => void;
};

const CHARACTER_TYPES = [
  { value: "ai_dark_mannequin", label: "Manequim preto sem rosto (IA)" },
  { value: "ai_white_mannequin", label: "Manequim branco minimalista (IA)" },
  { value: "ai_realistic_human", label: "Modelo humano realista (IA)" },
  { value: "real_recorded_model", label: "Modelo real gravado" },
  { value: "saved_character", label: "Personagem já cadastrada" },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "neutral", label: "Neutro / andrógino" },
];

const WALK_SPEEDS = [
  { value: "slow", label: "Lento (elegante)" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Rápido (dinâmico)" },
];

const TREADMILL_VARIANTS = [
  { value: "color_catalog", label: "Catálogo de cores" },
  { value: "three_ways", label: "Três maneiras de usar" },
  { value: "basic_vs_complete", label: "Look básico × look completo" },
  { value: "male_minimalist", label: "Masculino minimalista" },
  { value: "fitness", label: "Fitness" },
  { value: "choose_favorite", label: "Escolha seu favorito" },
  { value: "casual_to_elegant", label: "Do casual ao elegante" },
];

function TFField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function TFSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function TreadmillFields({ config, onChange }: TreadmillFieldsProps) {
  return (
    <div className="mt-5 space-y-5 rounded-2xl border border-border bg-secondary/10 p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/15">
          <span className="text-base">🚶</span>
        </div>
        <div>
          <p className="text-sm font-semibold">Configuração da esteira</p>
          <p className="text-[11px] text-muted-foreground">
            Cada detalhe abaixo será incluído no prompt VEO para garantir consistência.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TFField label="Subtipo">
          <TFSelect
            value={config.selectedVariant}
            options={TREADMILL_VARIANTS}
            onChange={(v) => onChange({ selectedVariant: v })}
          />
        </TFField>

        <TFField label="Tipo de personagem">
          <TFSelect
            value={config.characterType}
            options={CHARACTER_TYPES}
            onChange={(v) =>
              onChange({
                characterType: v as TreadmillConfig["characterType"],
              })
            }
          />
        </TFField>

        <TFField label="Gênero / apresentação">
          <TFSelect
            value={config.gender}
            options={GENDER_OPTIONS}
            onChange={(v) => onChange({ gender: v as TreadmillConfig["gender"] })}
          />
        </TFField>

        <TFField label="Velocidade da caminhada">
          <TFSelect
            value={config.walkSpeed}
            options={WALK_SPEEDS}
            onChange={(v) => onChange({ walkSpeed: v as TreadmillConfig["walkSpeed"] })}
          />
        </TFField>

        <TFField label="Tipo físico / silhueta">
          <Input
            value={config.bodyType}
            placeholder="Ex.: corpo atlético, curvilíneo, esbelto"
            onChange={(e) => onChange({ bodyType: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Quantidade de looks">
          <Input
            type="number"
            min={1}
            max={6}
            value={config.lookCount}
            onChange={(e) => onChange({ lookCount: Number(e.target.value) })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Cenário">
          <Input
            value={config.scenario}
            placeholder="Ex.: estúdio branco, loja minimalista, exterior urbano"
            onChange={(e) => onChange({ scenario: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Cor da esteira">
          <Input
            value={config.treadmillColor}
            placeholder="Ex.: preta, branca, cinza"
            onChange={(e) => onChange({ treadmillColor: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Estilo musical">
          <Input
            value={config.musicStyle}
            placeholder="Ex.: trap suave, pop eletrônico, beats minimalistas"
            onChange={(e) => onChange({ musicStyle: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Tipo de CTA">
          <Input
            value={config.ctaType}
            placeholder="Ex.: 'Qual você escolheria?', 'Link na bio'"
            onChange={(e) => onChange({ ctaType: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Texto na tela">
          <Input
            value={config.onScreenText}
            placeholder="Ex.: nome do produto, preço, votação"
            onChange={(e) => onChange({ onScreenText: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>

        <TFField label="Momento das trocas">
          <Input
            value={config.transitionTiming}
            placeholder="Ex.: a cada 8 segundos, na batida"
            onChange={(e) => onChange({ transitionTiming: e.target.value })}
            className="h-9 text-sm"
          />
        </TFField>
      </div>

      {/* Switches */}
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.loopEnabled}
            onChange={(e) => onChange({ loopEnabled: e.target.checked })}
            className="size-4"
          />
          Loop natural
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.extraClose}
            onChange={(e) => onChange({ extraClose: e.target.checked })}
            className="size-4"
          />
          Close adicional do produto
        </label>
      </div>

      {/* VEO blocking rules notice */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <p className="mb-2 text-[11px] font-semibold text-amber-300">
          Regras de bloqueio incluídas automaticamente no prompt VEO:
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-amber-400/80">
          {[
            "Sem mudança de personagem",
            "Sem mudança de rosto",
            "Sem mudança de corpo",
            "Sem mudança de cenário",
            "Sem mudança da esteira",
            "Sem mudança de enquadramento",
            "Sem alteração de estampa",
            "Sem alteração de cores",
            "Sem dedos/braços extras",
            "Sem tecidos derretendo",
            "Sem câmera tremendo",
            "Sem zoom não solicitado",
            "Sem logotipos inventados",
          ].map((rule) => (
            <li key={rule} className="flex items-center gap-1">
              <span className="text-amber-500">✓</span> {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
