import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadeComponent,
});

function PrivacidadeComponent() {
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
                Política de Privacidade
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
              <Lock className="w-5 h-5 text-primary" />
              1. Informações que Coletamos
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coletamos informações necessárias para a prestação dos nossos serviços, incluindo:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              <li><strong>Dados de Cadastro:</strong> Nome, endereço de e-mail e senha criptografada.</li>
              <li><strong>Dados de Integração:</strong> Tokens de autorização pública quando você conecta sua conta ou consulta dados do TikTok.</li>
              <li><strong>Conteúdo Gerado:</strong> Roteiros, transcrições e projetos salvos em seu painel.</li>
              <li><strong>Dados de Uso:</strong> Informações de acesso, registros de data/hora e preferências de configuração.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              2. Como Utilizamos Seus Dados
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              <li>Fornecer, personalizar e aprimorar as funcionalidades da plataforma Tik Supremo.</li>
              <li>Processar transcrições de áudio e geração de roteiros através de modelos de inteligência artificial.</li>
              <li>Garantir a segurança da sua conta e prevenir fraudes.</li>
              <li>Enviar comunicações de serviço, atualizações e suporte técnico.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              3. Compartilhamento de Dados com Terceiros
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Não vendemos seus dados pessoais. Compartilhamos informações apenas com provedores de infraestrutura essenciais para a operação da ferramenta:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              <li><strong>Provedores de Nuvem e Banco de Dados:</strong> Supabase (armazenamento seguro de dados).</li>
              <li><strong>Modelos de Inteligência Artificial:</strong> Google Gemini e Groq (para processar transcrições e gerar roteiros de IA).</li>
              <li><strong>APIs Oficiais:</strong> TikTok API (para dados públicos de integração quando solicitado pelo usuário).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              4. Armazenamento e Segurança dos Dados
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais de segurança, incluindo criptografia SSL/TLS em trânsito e controle de acesso estrito aos bancos de dados, para proteger seus dados contra acessos não autorizados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              5. Seus Direitos (LGPD)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              <li>Acessar e confirmar a existência de tratamento de seus dados.</li>
              <li>Solicitar a correção de dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão definitiva dos seus dados da nossa base de dados a qualquer momento.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              6. Alterações nesta Política
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. A versão mais recente estará sempre disponível nesta página com a data da última modificação.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border/40">
            <h2 className="text-lg font-semibold text-foreground">Encarregado de Proteção de Dados</h2>
            <p className="text-sm text-muted-foreground">
              Para exercer seus direitos de privacidade ou esclarecer dúvidas, entre em contato pelo e-mail: <span className="text-primary font-medium">privacidade@tiksupremo.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
