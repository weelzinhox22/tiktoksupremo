import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listProductLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Biblioteca de produtos — Tik Supremo" }] }),
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
    `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const allProducts = query.data ?? [];
  const totalPhotos = allProducts.reduce((sum, item) => sum + item.image_paths.length, 0);
  const totalUses = allProducts.reduce((sum, item) => sum + item.usage_count, 0);
  const categories = new Set(allProducts.map((item) => item.category).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Catálogo reutilizável
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Biblioteca de produtos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Reaproveite dados, fotos e análises em novos roteiros sem preencher tudo outra vez.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/projects/new">
            <Plus />
            Usar em novo roteiro
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <ProductMetric label="Produtos salvos" value={allProducts.length} />
        <ProductMetric label="Fotos organizadas" value={totalPhotos} />
        <ProductMetric label={`${categories} categorias`} value={totalUses} suffix=" usos" />
      </section>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto ou categoria..."
          className="pl-10"
        />
      </div>

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : products.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="bento-card interactive-card group overflow-hidden">
              <div className="aspect-[16/9] bg-secondary/30">
                {product.previewUrl ? (
                  <img
                    src={product.previewUrl}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.035]"
                  />

                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Package className="size-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <Badge variant="outline">{product.usage_count} uso(s)</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-secondary px-2 py-1">
                    {product.category || "Sem categoria"}
                  </span>
                  {product.price !== null && (
                    <span className="rounded-md bg-secondary px-2 py-1">
                      R$ {Number(product.price).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="rounded-md bg-secondary px-2 py-1">
                    {product.image_paths.length} foto(s)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(product.id)}
                  >
                    <Trash2 />
                    Remover
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/projects/new">
                      Selecionar <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-card flex flex-col items-center p-14 text-center">
          <Package className="size-9 text-primary" />
          <h2 className="mt-3 font-semibold">
            {search ? "Nenhum produto encontrado" : "Sua biblioteca está vazia"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Ao criar um roteiro, mantenha “Salvar na biblioteca” marcado.
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
    <div className="bento-card p-4">
      <p className="text-2xl font-semibold text-primary">
        {value.toLocaleString("pt-BR")}
        <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
