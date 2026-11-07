"use client";

import Link from "next/link";
import { Camera, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useStore } from "@/components/providers/store-provider";

export function SiteFooter() {
  const { t, tf } = useLanguage();
  const { settings, categories } = useStore();

  return (
    <footer
      id="contact"
      className="border-t border-border bg-secondary text-secondary-foreground"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl font-bold">{settings.storeName}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              href="#"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Globe className="size-4" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Camera className="size-4" />
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider">
            {t("footer.shop")}
          </p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link href="/produits" className="hover:text-foreground">
                {t("nav.products")}
              </Link>
            </li>
            <li>
              <Link href="/accueil#about" className="hover:text-foreground">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link href="/?promo=1" className="hover:text-foreground">
                {t("products.promo")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider">
            {t("nav.categories")}
          </p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/produits?categorie=${c.slug}`}
                  className="hover:text-foreground"
                >
                  {tf(c.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider">
            {t("nav.contact")}
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0" />
              <a
                href={`tel:${settings.phone}`}
                className="hover:text-foreground"
              >
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0" />
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-foreground"
              >
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {settings.storeName}.{" "}
            {t("footer.rights")}
          </p>
          <p>{settings.address}</p>
        </div>
      </div>
    </footer>
  );
}
