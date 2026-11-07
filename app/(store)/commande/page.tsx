"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useStore } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Errors = Partial<
  Record<"fullName" | "phone1" | "phone2" | "address", string>
>;

export default function CheckoutPage() {
  const { t, tf, price } = useLanguage();
  const { products, addOrder, settings } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("produit");
  const quantity = Math.max(1, Number(searchParams.get("quantite") || 1));
  const product = products.find(
    (item) => item.id === productId && item.isActive,
  );
  const unitPrice = product ? (product.promoPrice ?? product.price) : 0;
  const total = unitPrice * quantity;

  const [form, setForm] = useState({
    fullName: "",
    phone1: "",
    phone2: "",
    address: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(
    () =>
      product ? `${quantity} × ${tf(product.name)} — ${price(total)}` : "",
    [product, quantity, tf, total, price],
  );
  const contactMessage = () =>
    `Bonjour Espace Baya, je souhaite commander : ${summary}. Nom : ${form.fullName}. Téléphone : ${form.phone1}${form.phone2 ? ` / ${form.phone2}` : ""}. Adresse : ${form.address}.`;

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-bold">
          {t("checkout.noProduct")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t("checkout.chooseProduct")}
        </p>
        <Link
          href="/produits"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("product.back")}
        </Link>
      </div>
    );
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: e.target.value }));
  const validate = () => {
    const next: Errors = {};
    if (!form.fullName.trim()) next.fullName = t("checkout.required");
    if (!form.phone1.trim()) next.phone1 = t("checkout.required");
    else if (
      !/^[0-9\s+().-]{8,40}$/.test(form.phone1.trim()) ||
      form.phone1.replace(/\D/g, "").length < 8 ||
      form.phone1.replace(/\D/g, "").length > 15
    )
      next.phone1 = t("checkout.phoneInvalid");
    if (
      form.phone2.trim() &&
      (!/^[0-9\s+().-]{8,40}$/.test(form.phone2.trim()) ||
        form.phone2.replace(/\D/g, "").length < 8 ||
        form.phone2.replace(/\D/g, "").length > 15)
    )
      next.phone2 = t("checkout.phoneInvalid");
    if (!form.address.trim()) next.address = t("checkout.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await addOrder({
        customer: {
          fullName: form.fullName.trim(),
          phone1: form.phone1.trim(),
          phone2: form.phone2.trim() || undefined,
          address: form.address.trim(),
        },
        items: [
          {
            productId: product.id,
            name: product.name,
            price: unitPrice,
            image: product.images[0],
            quantity,
          },
        ],
        total,
      });
      window.sessionStorage.setItem("baya-last-order", JSON.stringify(order));
      router.push("/commande/confirmee");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la commande.",
      );
      setSubmitting(false);
    }
  };

  const phone = (settings.whatsapp || settings.phone).replace(/\s/g, "");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/produits/${product.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("product.back")}
      </Link>
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground sm:text-4xl">
        {t("checkout.title")}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid gap-10 lg:grid-cols-[1fr_380px]"
        noValidate
      >
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-serif text-lg font-bold">{t("checkout.info")}</h2>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("checkout.fullName")} *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder={t("checkout.placeholderName")}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone1">{t("checkout.phone1")} *</Label>
                <Input
                  id="phone1"
                  type="tel"
                  value={form.phone1}
                  onChange={set("phone1")}
                  placeholder={t("checkout.placeholderPhone")}
                  aria-invalid={!!errors.phone1}
                />
                {errors.phone1 && (
                  <p className="text-sm text-destructive">{errors.phone1}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">{t("checkout.phone2")}</Label>
                <Input
                  id="phone2"
                  type="tel"
                  value={form.phone2}
                  onChange={set("phone2")}
                  placeholder={t("checkout.placeholderPhone")}
                  aria-invalid={!!errors.phone2}
                />
                {errors.phone2 && (
                  <p className="text-sm text-destructive">{errors.phone2}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("checkout.address")} *</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={set("address")}
                placeholder={t("checkout.placeholderAddress")}
                rows={3}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full"
            disabled={submitting}
          >
            {t("checkout.submit")}
          </Button>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-green-600"
              onClick={() =>
                window.open(
                  `https://wa.me/${phone}?text=${encodeURIComponent(contactMessage())}`,
                  "_blank",
                )
              }
            >
              <Send className="me-2 size-4" />
              {t("checkout.whatsapp")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
              onClick={() => {
                window.location.href = `tel:${phone}`;
              }}
            >
              <Phone className="me-2 size-4" />
              {t("checkout.call")}
            </Button>
          </div>
        </div>
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-bold">
              {t("checkout.summary")}
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={tf(product.name)}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {tf(product.name)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {quantity} × {price(unitPrice)}
                </p>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("cart.total")}</span>
              <span className="font-serif text-xl font-bold">
                {price(total)}
              </span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
