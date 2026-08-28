import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  BellRing,
  Bot,
  Camera,
  CheckCircle2,
  Cpu,
  Download,
  Flame,
  Layers3,
  Lock,
  MessageSquare,
  Mic,
  MonitorPlay,
  Music2,
  PackageCheck,
  Radio,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Smartphone,
  Sparkles,
  Terminal,
  TriangleAlert,
  Tv,
  Video,
  Volume2,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const downloads = [
  {
    icon: Camera,
    name: "LiveStudio CAM",
    version: "1.35.1",
    platform: "Windows · 96,9 MB",
    file: "LiveStudioCAM-1.35.1.exe",
    href: "/downloads/LiveStudioCAM-1.35.1.exe",
    description:
      "Aplicativo nativo para Windows com motor OBS Direto (GPU) ou câmera interna, suporte a perfil PC fraco, playlist inteligente de vídeos/áudios, inteligência artificial (Groq/Gemini), servidor local na porta 18765 e controle remoto por celular.",
    action: "Baixar LiveStudio CAM v1.35.1",
    badge: "Executável Windows",
    badgeColor: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
  {
    icon: Layers3,
    name: "Extensão LiveWelPro (LiveOS PRO)",
    version: "1.50.1",
    platform: "Chrome / Brave / Edge · Pacote ZIP (559 KB)",
    file: "LiveOS-PRO-extensao-fixed-1.50.1.zip",
    href: "/downloads/LiveOS-PRO-extensao-fixed-1.50.1.zip",
    description:
      "Extensão completa com painel lateral instantâneo (sem abrir aba extra), dashboard em tempo real (GMV, pedidos, fila), câmera virtual 720p/540p, automação de comentários corrigida, respostas automáticas, watchdog e controle remoto móvel.",
    action: "Baixar Extensão v1.50.1",
    badge: "Extensão Chrome (ZIP)",
    badgeColor: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
];

const extensionFeatures = [
  {
    icon: Sliders,
    title: "Painel lateral instantâneo",
    description: "Abre direto no side panel do navegador ao clicar no ícone, sem poluir sua área de trabalho nem abrir abas extras.",
  },
  {
    icon: ShoppingBag,
    title: "Dashboard completa da LIVE",
    description: "Monitore GMV, quantidade de pedidos, meta de faturamento, fila de produtos, item fixado, timer regressivo, status operacional e histórico.",
  },
  {
    icon: Video,
    title: "Câmera virtual no navegador",
    description: "Perfis integrados de 720×1280 a 30 FPS (alta definição vertical) e modo especial PC Fraco em 540×960 a 30 FPS.",
  },
  {
    icon: Activity,
    title: "Telemetria & Medidor de FPS",
    description: "Métricas contínuas de taxa de quadros (FPS), detecção de dropped frames e contador de reinicializações da câmera.",
  },
  {
    icon: Tv,
    title: "Ponte com LiveStudioCAM / OBS",
    description: "Telemetria em tempo real, troca rápida de cenas, gravação de destaques com 1 clique e reinício suave da câmera.",
  },
  {
    icon: MessageSquare,
    title: "Automação de comentários corrigida",
    description: "Fluxo aperfeiçoado que preenche o campo, dispara e confirma o envio dos comentários diretamente no chat da LIVE sem falhas.",
  },
  {
    icon: Zap,
    title: "Respostas automáticas por categoria",
    description: "Respostas contextuais automáticas separadas em 3 categorias inteligentes: Dúvida sobre Compra, Dúvida Geral e Interação.",
  },
  {
    icon: RefreshCcw,
    title: "Comentários periódicos programados",
    description: "Envio de mensagens promocionais e avisos em intervalos inteligentes e seguros para manter o público engajado.",
  },
  {
    icon: Sparkles,
    title: "Destaque automático de vendas",
    description: "Gera clipes de melhores momentos e aciona destaques visuais automaticamente no momento exato em que uma venda é registrada.",
  },
  {
    icon: ShieldCheck,
    title: "Watchdog com Auto-Recovery",
    description: "Sentinela em segundo plano que detecta congelamento de stream e reinicia a câmera automaticamente sem derrubar a live.",
  },
  {
    icon: Cpu,
    title: "Automação leve & segura",
    description: "Arquitetura orientada a eventos com filas limitadas, pausas inteligentes e proteção anti-bloqueio para operação contínua.",
  },
  {
    icon: Smartphone,
    title: "Controle móvel & Telegram",
    description: "Painel completo de configuração do Telegram com alertas e suporte a controle remoto pelo celular via painel do app.",
  },
];

const studioCamFeatures = [
  {
    icon: Camera,
    title: "Câmera Virtual OBS 720×1280 & 540×960",
    description: "Gera dispositivo virtual em formato vertical 9:16 nativo para lives a 30 FPS, com perfil otimizado para máquinas fracas.",
  },
  {
    icon: Zap,
    title: "Motor OBS Direto com Aceleração GPU",
    description: "Processamento gráfico via hardware com fallback automático para câmera interna de alta compatibilidade.",
  },
  {
    icon: MonitorPlay,
    title: "Playlist inteligente de vídeos",
    description: "Execução contínua em loop, modo aleatório (shuffle), botões de avançar/retroceder e transições suaves com fade.",
  },
  {
    icon: Layers3,
    title: "Overlays de banners e imagens",
    description: "Sobreposição de artes, avisos e selos com controle de escala, posicionamento na tela e transparência ajustável.",
  },
  {
    icon: Music2,
    title: "Áudio contínuo & Monitor independente",
    description: "Trilhas de fundo com playlists, loops segmentados, mixagem de volume, pausas e monitoramento sonoro local separado.",
  },
  {
    icon: Mic,
    title: "Roteamento para microfone virtual",
    description: "Captura e direciona o fluxo de áudio limpo para o dispositivo de entrada de microfone virtual do sistema.",
  },
  {
    icon: Tv,
    title: "Integração total com OBS",
    description: "Troca remota de cenas, acionamento do buffer de replay para destaques, leitura de telemetria e reboot de câmera.",
  },
  {
    icon: Bot,
    title: "IA Integrada (Groq / Gemini)",
    description: "Geração de textos promocionais, copies de produtos e respostas rápidas para dúvidas com inteligência artificial.",
  },
  {
    icon: Activity,
    title: "Timer de ofertas & Clonagem de LIVE",
    description: "Cronômetro visual de escassez e detector inteligente de vídeo no navegador para clonagem e espelhamento de transmissões.",
  },
  {
    icon: Smartphone,
    title: "Painel móvel com PIN (Porta 18765)",
    description: "Servidor local pronto na porta 18765 escutando em 0.0.0.0, permitindo controle completo pelo celular na mesma rede com PIN seguro.",
  },
];

const telegramCommandGroups = [
  {
    title: "Consultas & Diagnóstico",
    icon: Terminal,
    color: "text-cyan",
    commands: [
      { cmd: "/ajuda", desc: "Lista completa de comandos e instruções de uso" },
      { cmd: "/resumo", desc: "Resumo executivo do status e métricas da LIVE" },
      { cmd: "/status", desc: "Verifica conexão, câmera, áudio e automações" },
      { cmd: "/produto", desc: "Exibe o produto atualmente fixado na transmissão" },
      { cmd: "/produtos", desc: "Lista os produtos cadastrados e posições na fila" },
      { cmd: "/buscarproduto <nome>", desc: "Busca um item específico pelo nome" },
      { cmd: "/faltameta", desc: "Calcula o saldo restante para bater a meta de GMV" },
      { cmd: "/audio", desc: "Informa o estado, volume e faixa do áudio de fundo" },
      { cmd: "/seguranca", desc: "Diagnóstico de segurança, violações e bloqueios" },
      { cmd: "/ciclo", desc: "Status do ciclo operacional e tempo decorrido" },
      { cmd: "/diagnostico", desc: "Relatório de desempenho e telemetria detalhada" },
      { cmd: "/historico", desc: "Histórico das últimas ações e eventos registrados" },
    ],
  },
  {
    title: "Produtos & Reprodução",
    icon: MonitorPlay,
    color: "text-purple-400",
    commands: [
      { cmd: "/pin <nº ou nome>", desc: "Fixa um produto na live (Ex: /pin 2 ou /pin Camiseta)" },
      { cmd: "/proximo", desc: "Avança para o próximo vídeo da playlist" },
      { cmd: "/anterior", desc: "Volta para o vídeo anterior da playlist" },
      { cmd: "/play", desc: "Inicia a reprodução de vídeo e áudio" },
      { cmd: "/pausa", desc: "Pausa temporariamente a transmissão" },
      { cmd: "/timer", desc: "Informa ou aciona o timer regressivo de oferta" },
      { cmd: "/cenas", desc: "Lista todas as cenas configuradas no OBS" },
      { cmd: "/cena <nº ou nome>", desc: "Alterna a cena ativa (Ex: /cena 2 ou /cena Oferta)" },
      { cmd: "/destaque", desc: "Salva os últimos segundos no replay buffer" },
      { cmd: "/camera", desc: "Verifica ou reinicializa a câmera virtual" },
      { cmd: "/telemetria", desc: "Exibe FPS atual, dropped frames e uso de hardware" },
      { cmd: "/perfil <720 | fraco>", desc: "Alterna resolução entre 720p e perfil PC Fraco (540p)" },
    ],
  },
  {
    title: "Vendas & Metas Financeiras",
    icon: ShoppingBag,
    color: "text-emerald-400",
    commands: [
      { cmd: "/meta <valor>", desc: "Define a meta financeira da LIVE (Ex: /meta 5000)" },
      { cmd: "/venda <valor>", desc: "Registra uma venda manual (Ex: /venda 79,90)" },
      { cmd: "/vendas", desc: "Exibe extrato de faturamento e quantidade de pedidos" },
      { cmd: "/desfazervenda", desc: "Cancela e reverte a última venda registrada" },
      { cmd: "/removervenda <ID>", desc: "Exclui um registro específico de venda pelo ID" },
    ],
  },
  {
    title: "Interação & Automação",
    icon: MessageSquare,
    color: "text-amber-400",
    commands: [
      { cmd: "/comentario <texto>", desc: "Envia um comentário imediato no chat da live" },
      { cmd: "/auto <on | off>", desc: "Liga ou desliga a automação geral de comentários" },
      { cmd: "/respostas <on | off>", desc: "Liga ou desliga as respostas automáticas a dúvidas" },
      { cmd: "/bloquear <@usuario>", desc: "Adiciona usuário à lista de bloqueio/moderação" },
      { cmd: "/alertas", desc: "Mostra o estado atual das notificações do bot" },
      { cmd: "/alertas vendas <on | off>", desc: "Notificações instantâneas de novas vendas" },
      { cmd: "/alertas manuais <on | off>", desc: "Notificações de comandos manuais" },
      { cmd: "/alertas seguranca <on | off>", desc: "Notificações de riscos e avisos operacionais" },
    ],
  },
  {
    title: "Ações Críticas Protegidas (Exigem Confirmação)",
    icon: AlertOctagon,
    color: "text-rose-400",
    commands: [
      { cmd: "/limparfila", desc: "Limpa a fila de produtos cadastrados (Requer confirmação)" },
      { cmd: "/zerargmv", desc: "Zera o contador de GMV e pedidos da live (Requer confirmação)" },
      { cmd: "/ciclo agora", desc: "Força o reinício do ciclo operacional imediatamente" },
      { cmd: "/confirmar", desc: "Autoriza a execução da última ação crítica solicitada" },
      { cmd: "/cancelar", desc: "Aborta a ação crítica pendente de confirmação" },
      { cmd: "/panic", desc: "Interrupção de emergência: desliga automações e congela o fluxo" },
    ],
  },
];

export const Route = createFileRoute("/live-studio")({
  head: () => ({
    meta: [
      { title: "Live Studio — LiveStudio CAM 1.35.1 & LiveWelPro 1.50.1 | Tik Supremo" },
      {
        name: "description",
        content:
          "Baixe o LiveStudio CAM v1.35.1 e a extensão LiveWelPro v1.50.1 para TikTok Shop LIVE. Câmera virtual 720p/540p, automação de comentários, dashboard GMV e bot Telegram.",
      },
      { property: "og:title", content: "Live Studio — Downloads & Guia Completo" },
      {
        property: "og:description",
        content: "Conjunto integrado de software de câmera virtual e extensão com automação e bot Telegram para transmissões no TikTok Shop.",
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
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="bg-gradient-supremo flex size-9 items-center justify-center rounded-xl">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">Tik Supremo</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.04] text-xs font-semibold hover:bg-white/[0.08]" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-1.5 size-3.5" /> Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                <Sparkles className="mr-1 size-3.5" /> Atualização: Extensão v1.50.1 + App v1.35.1
              </Badge>
              <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-200">
                <TriangleAlert className="mr-1 size-3.5" /> Distribuição Experimental
              </Badge>
            </div>
            <h1 className="text-4xl leading-[1.08] font-bold md:text-6xl">
              Sua operação de LIVE em um{" "}
              <span className="text-gradient-supremo">estúdio integrado</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              O <strong>LiveStudio CAM 1.35.1</strong> e a extensão <strong>LiveWelPro 1.50.1</strong> unem
              câmera virtual para navegador, automação de comentários, respostas inteligentes, dashboard de GMV,
              watchdog anti-congelamento, controle via Telegram e painel remoto pelo celular.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <a href="#downloads">
                  <Download /> Baixar atualizações
                </a>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <a href="#extensao-novidades">
                  Recursos da Extensão <Layers3 />
                </a>
              </Button>
              <Button variant="outline" size="xl" className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08]" asChild>
                <a href="#telegram-comandos">
                  Comandos Telegram <Bot />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* EXPERIMENTAL NOTICE */}
        <section className="mx-auto w-full max-w-5xl px-5 pb-12">
          <div className="surface-card border-amber-300/20 bg-amber-300/[0.04] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                <TriangleAlert className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Boas práticas & supervisão operacional</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Esta suíte é contínua e orientada a performance. Antes de iniciar sua transmissão pública,
                  faça sempre uma <strong>LIVE de teste/prática</strong> no TikTok, verifique a conexão com o Telegram,
                  confirme a câmera e microfone virtuais e monitore métricas de vendas e preços diretamente no painel oficial do TikTok Shop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DOWNLOADS SECTION */}
        <section id="downloads" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-12">
          <div className="max-w-2xl">
            <span className="font-mono text-xs tracking-widest text-cyan uppercase">Pacotes para Download</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Baixe os componentes atualizados</h2>
            <p className="mt-3 text-muted-foreground">
              Faça o download do aplicativo executável para Windows e do arquivo compactado da extensão para o Chrome.
            </p>
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {downloads.map((item) => (
              <article key={item.name} className="surface-card interactive-card flex flex-col p-6 md:p-8">
                <div className="flex items-start justify-between gap-5">
                  <span className="bg-accent/70 flex size-12 items-center justify-center rounded-2xl">
                    <item.icon className="size-6 text-primary" />
                  </span>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge className={item.badgeColor}>{item.badge}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">v{item.version}</span>
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{item.name}</h3>
                <p className="mt-1 font-mono text-xs text-cyan">{item.platform}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <Button variant="hero" size="lg" className="mt-7 w-full shadow-lg" asChild>
                  <a href={item.href} download>
                    <Download className="mr-2 size-4" /> {item.action}
                  </a>
                </Button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[11px] text-muted-foreground">
                  <span>Arquivo:</span>
                  <span className="text-foreground/80 font-medium">{item.file}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* NOVIDADES DA EXTENSÃO LIVEWELPRO 1.50.1 */}
        <section id="extensao-novidades" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-xs tracking-widest text-cyan uppercase">Extensão v1.50.1</span>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Novidades da Extensão LiveWelPro</h2>
              <p className="mt-2 text-muted-foreground">
                Painel lateral moderno, automações corrigidas, proteção sentinela e dashboard em tempo real.
              </p>
            </div>
            <Badge className="w-fit border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              LiveOS-PRO-extensao-fixed-1.50.1
            </Badge>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {extensionFeatures.map((item) => (
              <article key={item.title} className="surface-card hover:border-cyan-500/30 transition-all p-5">
                <span className="bg-cyan-500/10 text-cyan-400 flex size-10 items-center justify-center rounded-xl">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* RECURSOS DO LIVESTUDIOCAM 1.35.1 */}
        <section id="livestudio-cam" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-xs tracking-widest text-purple-400 uppercase">Software Windows v1.35.1</span>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Recursos do LiveStudio CAM</h2>
              <p className="mt-2 text-muted-foreground">
                Motor OBS Direto com suporte a GPU, playlist multimídia, servidor local com PIN e inteligência artificial.
              </p>
            </div>
            <Badge className="w-fit border-purple-500/30 bg-purple-500/10 text-purple-300">
              LiveStudioCAM-1.35.1.exe
            </Badge>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studioCamFeatures.map((item) => (
              <article key={item.title} className="surface-card hover:border-purple-500/30 transition-all p-5">
                <span className="bg-purple-500/10 text-purple-400 flex size-10 items-center justify-center rounded-xl">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* GUIA DE COMANDOS TELEGRAM */}
        <section id="telegram-comandos" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-14">
          <div className="max-w-3xl">
            <span className="font-mono text-xs tracking-widest text-cyan uppercase">Controle Remoto</span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Comandos do Bot no Telegram</h2>
            <p className="mt-2 text-muted-foreground">
              Opere sua live à distância diretamente pelo celular com o bot integrado. Monitore vendas, altere produtos, controle cenas e responda o público.
            </p>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {telegramCommandGroups.map((group) => (
              <article
                key={group.title}
                className="surface-card flex flex-col p-6 border-white/[0.08]"
              >
                <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                  <span className="bg-white/[0.06] flex size-9 items-center justify-center rounded-lg">
                    <group.icon className={`size-5 ${group.color}`} />
                  </span>
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                </div>

                <div className="mt-4 divide-y divide-white/[0.04] space-y-2.5">
                  {group.commands.map((cmdItem) => (
                    <div key={cmdItem.cmd} className="pt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                      <code className="w-fit rounded bg-black/40 px-2 py-0.5 font-mono text-xs font-semibold text-cyan border border-white/5">
                        {cmdItem.cmd}
                      </code>
                      <span className="text-xs text-muted-foreground text-left sm:text-right">
                        {cmdItem.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* INSTALAÇÃO & CHECKLIST */}
        <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-card p-7 md:p-9">
            <div className="flex items-center gap-3">
              <PackageCheck className="size-5 text-primary" />
              <h2 className="text-2xl font-bold">Guia de Instalação Passo a Passo</h2>
            </div>
            <ol className="mt-7 space-y-5">
              {[
                {
                  title: "Instale o LiveStudio CAM",
                  text: "Execute o arquivo LiveStudioCAM-1.35.1.exe no seu Windows para iniciar o motor de câmera e servidor local (porta 18765).",
                },
                {
                  title: "Descompacte a Extensão",
                  text: "Baixe o arquivo LiveOS-PRO-extensao-fixed-1.50.1.zip e extraia todos os arquivos em uma pasta definitiva no seu computador.",
                },
                {
                  title: "Carregue no Chrome / Navegador",
                  text: "Acesse chrome://extensions no navegador, ative o 'Modo do desenvolvedor' e clique em 'Carregar sem compactação' selecionando a pasta da extensão.",
                },
                {
                  title: "Abra o Painel Lateral",
                  text: "Fixe a extensão na barra de ferramentas do Chrome e clique no ícone para abrir instantaneamente a barra lateral (Side Panel).",
                },
                {
                  title: "Configure o Telegram & Câmera",
                  text: "Insira seu Token do Bot do Telegram e vincule a câmera virtual na sua transmissão do TikTok Studio ou navegador.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="surface-card glow-primary p-7 md:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="size-6 text-cyan" />
                <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px]">
                  Checklist Pré-Live
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-bold">Antes de entrar ao vivo</h2>
              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-muted-foreground">
                {[
                  "Realize um teste prático de áudio e transições de cena.",
                  "Confira a resolução selecionada (720×1280 ou PC Fraco 540×960).",
                  "Teste um comando no Telegram para verificar a resposta do bot.",
                  "Confirme os preços e estoque diretamente na sacola do TikTok.",
                  "Verifique se o Watchdog está ativo para proteção contra congelamentos.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border bg-black/20 p-3">
                <Camera className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] font-medium text-muted-foreground">Câmera 30 FPS</span>
              </div>
              <div className="rounded-xl border border-border bg-black/20 p-3">
                <BellRing className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] font-medium text-muted-foreground">Alertas Telegram</span>
              </div>
              <div className="rounded-xl border border-border bg-black/20 p-3">
                <ShieldCheck className="mx-auto size-4 text-primary" />
                <span className="mt-2 block text-[11px] font-medium text-muted-foreground">Watchdog Ativo</span>
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer className="relative z-10 mt-12 border-t border-border px-5 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <span>Tik Supremo + LiveWelPro (LiveOS PRO) — Ferramentas integradas para operações de LIVE no TikTok Shop.</span>
          <span className="font-mono text-xs">v1.50.1 / v1.35.1</span>
        </div>
      </footer>
    </div>
  );
}
