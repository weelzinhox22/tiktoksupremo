import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Clapperboard,
  Wand2,
  Zap,
  Tag,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listProductLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Biblioteca de Produtos — Tik Supremo" }] }),
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await getSupabaseBrowserClient().from("product_library").delete().eq("id", id);
      if (result.error) throw new Error("Não foi possível remover o produto da biblioteca.");
    },
    onSuccess: async () => {
      toast.success("Produto removido da biblioteca. Os projetos existentes foram preservados.");
      await queryClient.invalidateQueries({ queryKey: ["product-library"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const products = (query.data ?? []).filter((item) =>
    `${item.name} ${item.category} ${item.description} ${(item.benefits || []).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const allProducts = query.data ?? [];
  const totalPhotos = allProducts.reduce((sum, item) => sum + item.image_paths.length, 0);
  const totalUses = allProducts.reduce((sum, item) => sum + item.usage_count, 0);
  const categories = new Set(allProducts.map((item) => item.category).filter(Boolean)).size;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <Badge className="border-primary/20 bg-primary/10 text-primary font-bold px-3 py-1 text-xs">
            <ShoppingBag className="mr-1.5 size-3.5" /> Catálogo Persistente
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-white">
            Biblioteca de Produtos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
            Reaproveite dados técnicos, fotos, dores, benefícios e análises em novos roteiros, ganchos e lives sem precisar digitar tudo de novo.
          </p>
        </div>

        <Button variant="hero" size="lg" className="shadow-lg font-bold gap-1.5" asChild>
          <Link to="/projects/new">
            <Plus className="size-4" />
            Adicionar / Usar em Novo Roteiro
          </Link>
        </Button>
      </header>

      {/* Metrics Row */}
      <section className="grid gap-3 sm:grid-cols-3">
        <ProductMetric label="Produtos salvos" value={allProducts.length} />
        <ProductMetric label="Fotos em alta resolução" value={totalPhotos} />
        <ProductMetric label={`${categories} categorias ativas`} value={totalUses} suffix=" usos em roteiros" />
      </section>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto por nome, benefício ou categoria..."
          className="pl-10 h-10 border-white/10 bg-[#11131a] text-xs text-white"
        />
      </div>

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : products.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="bento-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e1017] shadow-xl hover:border-primary/40 transition-all"
            >
              <div>
                {/* Image Preview */}
                <div className="aspect-[16/9] bg-black/40 overflow-hidden relative">
                  {product.previewUrl ? (
                    <img
                      src={product.previewUrl}
                      alt={product.name}
                      crossOrigin="anonymous"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-slate-600">
                      <Package className="size-10" />
                    </div>
                  )}

                  {product.category && (
                    <Badge className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-white">
                      {product.category}
                    </Badge>
                  )}

                  <Badge className="absolute top-2.5 right-2.5 bg-primary/90 text-black font-bold text-[10px]">
                    {product.usage_count} roteiro(s)
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                      {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                      {product.description || "Sem descrição informada."}
                    </p>
                  </div>

                  {/* Badges / Price */}
                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                    {product.price !== null && (
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold text-[11px]">
                        R$ {Number(product.price).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                    <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-slate-400 text-[11px]">
                      {product.image_paths.length} foto(s)
                    </span>
                  </div>

                  {product.benefits && product.benefits.length > 0 && (
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-[11px] text-slate-400 line-clamp-2">
                      <strong className="text-slate-300">Benefícios:</strong> {product.benefits.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-primary text-black flex-1 shadow"
                    asChild
                  >
                    <Link
                      to="/projects/new"
                      search={{
                        productName: product.name,
                        description: product.description,
                        benefits: product.benefits?.join(", ") || "",
                      }}
                    >
                      <Clapperboard className="size-3.5 mr-1" /> Criar Roteiro
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-white/10 bg-white/[0.02] hover:bg-white/[0.08]"
                    asChild
                  >
                    <Link
                      to="/copy-modeler"
                      search={{
                        text: `${product.name}: ${product.benefits?.join(", ") || product.description}`,
                      }}
                    >
                      <Wand2 className="size-3.5 mr-1 text-cyan-400" /> Modelar
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] text-red-400/80 hover:text-red-300 hover:bg-red-500/10"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(product.id)}
                  >
                    <Trash2 className="size-3 mr-1" /> Excluir
                  </Button>

                  <Link
                    to="/projects/new"
                    search={{ productName: product.name }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5"
                  >
                    Usar direto <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-card flex flex-col items-center p-14 text-center rounded-2xl border border-white/10 bg-[#0e1017]">
          <Package className="size-10 text-primary" />
          <h2 className="mt-3 text-base font-bold text-white">
            {search ? "Nenhum produto encontrado" : "Sua biblioteca de produtos está vazia"}
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            Ao criar um roteiro, marque a opção "Salvar na biblioteca" para guardar o produto aqui.
          </p>
        </div>
      )}
    </div>
  );
}

function ProductMetric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="bento-card p-4 rounded-2xl border border-white/10 bg-[#0e1017]">
      <p className="text-2xl font-black text-primary">
        {value.toLocaleString("pt-BR")}
        <span className="text-xs font-semibold text-slate-400">{suffix}</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
