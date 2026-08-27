import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BellRing,
  Bot,
  Camera,
  CheckCircle2,
  Download,
  Layers3,
  MonitorPlay,
  Music2,
  PackageCheck,
  Radio,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const downloads = [
  {
    icon: Camera,
    name: "LiveStudio CAM",
    version: "1.32.0",
    platform: "Windows · 96,8 MB",
    file: "LiveStudioCAM-1.32.0.exe",
    href: "/downloads/LiveStudioCAM-1.32.0.exe",
    description:
      "Aplicativo que faz a ponte local de vídeo para a operação da LIVE e trabalha em conjunto com a saída produzida pela extensão.",
    action: "Baixar aplicativo para Windows",
  },
  {
    icon: Layers3,
    name: "Extensão LiveWelPro",
    version: "1.49.0",
    platform: "Chrome · pacote ZIP",
    file: "LiveWelPro-1.49.0.zip",
    href: "/downloads/LiveWelPro-1.49.0.zip",
    description:
      "Central de operação com Estúdio, áudio, produtos, automações, Telegram, métricas e recursos de proteção para a LIVE.",
    action: "Baixar extensão completa",
  },
];

const capabilities = [
  {
    icon: MonitorPlay,
    title: "Estúdio de vídeo",
    text: "Importe vários vídeos, organize a sequência e transmita com fade suave, enquadramento, overlays, camadas de imagem ou vídeo e efeitos visuais.",
  },
  {
    icon: Music2,
    title: "Áudio contínuo",
    text: "Biblioteca de áudios com fila, loop, trechos aleatórios, volume, velocidade, ajuste de voz, monitor local e ambiente sutil de microfone.",
  },
  {
    icon: ShoppingBag,
    title: "Operação da LIVE",
    text: "Importe produtos da sacola, acompanhe item fixado, pedidos, GMV e tempo ao vivo, além de controlar timers e ciclos da transmissão.",
  },
  {
    icon: Bot,
    title: "Telegram",
    text: "Receba alertas de vendas e segurança e controle ações pelo celular, incluindo produto, pin, vídeo, áudio, timer, comentários e diagnóstico.",
  },
  {
    icon: ShieldCheck,
    title: "Proteção operacional",
    text: "Monitore sinais de violação, acompanhe encerramentos, use comentários com intervalos seguros e configure bloqueio preventivo de perfis concorrentes.",
  },
  {
    icon: RefreshCcw,
    title: "Automação assistida",
    text: "Programe ciclos, reinício da operação, mensagens periódicas e rotinas de produtos sem perder os controles manuais de confirmação.",
  },
];

export const Route = createFileRoute("/live-studio")({
  head: () => ({
    meta: [
      { title: "Live Studio experimental — downloads | Tik Supremo" },
      {
        name: "description",
        content:
          "Baixe o LiveStudio CAM e a extensão LiveWelPro para testar o Estúdio de vídeo, operação de LIVE, Telegram e recursos de proteção.",
      },
      { property: "og:title", content: "Live Studio experimental — LiveWelPro" },
      {
        property: "og:description",
        content: "Downloads e guia do conjunto experimental para operações de LIVE no TikTok Shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveStudioDownloads,
});

function LiveStudioDownloads() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-gradient-supremo flex size-9 items-center justify-center rounded-xl">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">Tik Supremo</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.04] text-xs font-semibold hover:bg-white/[0.08]" asChild>
            <Link to="/dashboard">
              Ir para o Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1.5 size-3.5" /> Voltar ao site
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 md:pt-20 md:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-amber-400/30 bg-amber-400/10 text-amber-200">
              <TriangleAlert className="mr-1 size-3.5" /> Experimento em desenvolvimento
            </Badge>
            <h1 className="text-4xl leading-[1.04] font-bold md:text-6xl">
              Sua operação de LIVE em um{" "}
              <span className="text-gradient-supremo">estúdio integrado</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              LiveStudio CAM e LiveWelPro trabalham juntos para reunir vídeo, áudio, produtos,
              automações, Telegram e proteção operacional em uma única experiência para TikTok
              Shop LIVE.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <a href="#downloads">
                  <Download /> Ir para downloads
                </a>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <a href="#recursos">
                  Ver todos os recursos <Layers3 />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-5 pb-14">
          <div className="surface-card border-amber-300/20 bg-amber-300/[0.04] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                <TriangleAlert className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Ainda temos coisas para melhorar</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Esta distribuição é experimental. A interface, a compatibilidade e as automações
                  continuam em evolução, e mudanças do próprio TikTok podem exigir novos ajustes.
                  Faça primeiro uma LIVE de prática, mantenha supervisão humana e confirme no TikTok
                  as ações importantes, produtos, preços, pedidos e GMV.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="downloads" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-14">
          <div className="max-w-2xl">
            <span className="font-mono text-xs tracking-widest text-cyan uppercase">Downloads</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Baixe os dois componentes</h2>
            <p className="mt-3 text-muted-foreground">
              Para a experiência completa, instale o aplicativo da câmera e carregue a extensão no Chrome.
            </p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {downloads.map((item) => (
              <article key={item.name} className="surface-card interactive-card flex flex-col p-6 md:p-8">
                <div className="flex items-start justify-between gap-5">
                  <span className="bg-accent/70 flex size-12 items-center justify-center rounded-2xl">
                    <item.icon className="size-6 text-primary" />
                  </span>
                  <Badge variant="outline">v{item.version}</Badge>
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{item.name}</h3>
                <p className="mt-1 font-mono text-xs text-cyan">{item.platform}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <Button variant="hero" size="lg" className="mt-7 w-full" asChild>
                  <a href={item.href}>
                    <Download /> {item.action}
                  </a>
                </Button>
                <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
                  {item.file}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="recursos" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-14">
          <span className="font-mono text-xs tracking-widest text-cyan uppercase">O que está incluído</span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Recursos para operar com mais controle</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.title} className="surface-card p-6">
                <span className="bg-accent/70 flex size-10 items-center justify-center rounded-xl">
                  <item.icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 lg:grid-cols-[1fr_0.8fr]">
          <article className="surface-card p-7 md:p-9">
            <div className="flex items-center gap-3">
              <PackageCheck className="size-5 text-primary" />
              <h2 className="text-2xl font-bold">Instalação rápida</h2>
            </div>
            <ol className="mt-7 space-y-5">
              {[
                "Baixe e execute o LiveStudio CAM no Windows.",
                "Baixe o ZIP da LiveWelPro e extraia todo o conteúdo para uma pasta permanente.",
                "No Chrome, abra Extensões, ative o Modo do desenvolvedor e use Carregar sem compactação.",
                "Selecione a pasta extraída, abra a dashboard da LiveWelPro e faça uma transmissão de prática.",
                "No ambiente da LIVE, confirme a câmera, o microfone virtual, os produtos e os alertas antes de transmitir publicamente.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="surface-card glow-primary p-7 md:p-9">
            <Radio className="size-6 text-cyan" />
            <h2 className="mt-5 text-2xl font-bold">Antes de entrar ao vivo</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[
                "Teste câmera, áudio e transições em uma LIVE de prática.",
                "Revise token e chat do Telegram antes de ativar alertas.",
                "Confirme preços, estoque e produto fixado diretamente no TikTok.",
                "Mantenha uma forma manual de operar caso a página do TikTok mude.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border bg-black/10 p-3">
                <Camera className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] text-muted-foreground">Câmera</span>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-3">
                <BellRing className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] text-muted-foreground">Alertas</span>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-3">
                <ShieldCheck className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] text-muted-foreground">Proteção</span>
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer className="relative z-10 mt-12 border-t border-border px-5 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <span>Tik Supremo + LiveWelPro — ferramentas experimentais para operações de LIVE.</span>
          <span>Teste, acompanhe e melhore com a gente.</span>
        </div>
      </footer>
    </div>
  );
}
