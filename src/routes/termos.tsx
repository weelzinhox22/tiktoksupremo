import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/termos")({
  component: TermosComponent,
});

function TermosComponent() {
  const lastUpdated = "01 de Agosto de 2026";

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
                Termos de Uso
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Última atualização: {lastUpdated}
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card/50 border border-border/60 backdrop-blur-md rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              1. Aceitação dos Termos
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ao acessar ou utilizar a plataforma <strong>Tik Supremo</strong>, você concorda expressamente em cumprir e estar vinculado a estes Termos de Uso. Caso não concorde com qualquer disposição aqui estabelecida, você não deverá utilizar a plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              2. Descrição dos Serviços
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O <strong>Tik Supremo</strong> é uma plataforma de inteligência artificial desenvolvida para auxiliar criadores de conteúdo, afiliados e vendedores do TikTok Shop a criar, otimizar e remodelar roteiros e conteúdos em vídeo focados em alta conversão.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              3. Uso da Conta e Segurança
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você é responsável por manter a confidencialidade das credenciais de sua conta e por todas as atividades que ocorrerem sob ela. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              4. Integração com APIs e Plataformas de Terceiros
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A plataforma pode integrar serviços e APIs de terceiros (como TikTok API, Google Gemini, OpenAI, Groq, Supabase). O uso de tais integrações está sujeito aos termos e condições dos respectivos provedores. Não nos responsabilizamos por indisponibilidades ou alterações nos serviços dessas ferramentas de terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              5. Propriedade Intelectual e Conteúdo Gerado
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todos os roteiros, textos e copys gerados através da sua conta na plataforma são de sua inteira propriedade. O Tik Supremo não reivindica direitos autorais sobre os roteiros produzidos por você na ferramenta. O software, marca e design da plataforma são de propriedade exclusiva do Tik Supremo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              6. Conduta do Usuário
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              É proibido utilizar a plataforma para gerar conteúdo ilegal, difamatório, enganoso, que viole direitos de propriedade intelectual de terceiros ou que infrinja as diretrizes de comunidade do TikTok.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              7. Limitação de Responsabilidade
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Tik Supremo fornece ferramentas de auxílio criativo. Não garantimos volumes específicos de vendas, engajamento ou viralização de vídeos, uma vez que tais resultados dependem da execução do usuário e dos algoritmos de terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              8. Modificações dos Termos
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. Alterações significativas serão notificadas através da plataforma ou por e-mail.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border/40">
            <h2 className="text-lg font-semibold text-foreground">Dúvidas ou Suporte?</h2>
            <p className="text-sm text-muted-foreground">
              Entre em contato conosco através do e-mail de suporte: <span className="text-primary font-medium">suporte@tiksupremo.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
