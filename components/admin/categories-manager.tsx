"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";
import { useStore } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";
import { ImageUploader } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/server/category-validation";
type FormState = {
  nameFr: string;
  nameAr: string;
  slug: string;
  image: string;
};

export function CategoriesManager() {
  const { t, tf } = useLanguage();
  const { categories, products, addCategory, updateCategory, deleteCategory } =
    useStore();

  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({
    nameFr: "",
    nameAr: "",
    slug: "",
    image: "",
  });

  const count = (id: string) =>
    products.filter((p) => p.categoryId === id).length;

  const openNew = () => {
    setEditing(null);
    setForm({ nameFr: "", nameAr: "", slug: "", image: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      nameFr: c.name.fr,
      nameAr: c.name.ar,
      slug: c.slug,
      image: c.image,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameFr.trim()) {
      toast.error(t("checkout.required"));
      return;
    }
    if (!form.image) {
      toast.error("L’image est requise.");
      return;
    }
    form.nameFr
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const payload = {
      name: {
        fr: form.nameFr.trim(),
        ar: form.nameAr.trim() || form.nameFr.trim(),
      },
      slug: form.slug.trim() || form.nameFr.trim(),
      image: editing?.image ?? "/products/showroom.png",
    };
    setSaving(true);
    try {
      if (editing) await updateCategory(editing.id, payload);
      else await addCategory(payload);
      toast.success(t("admin.settings.saved"));
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la catégorie.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (c: Category) => {
    if (count(c.id) > 0) {
      toast.error(t("admin.cats.hasProducts"));
      return;
    }
    if (window.confirm(t("admin.cats.deleteConfirm"))) {
      void deleteCategory(c.id).then(
        () => toast.success(t("admin.products.delete")),
        (error: unknown) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible de supprimer la catégorie.",
          ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {t("admin.cats.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.cats.subtitle")}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          {t("admin.cats.add")}
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
          >
            <div>
              <p className="font-medium text-foreground">{tf(c.name)}</p>
              <p className="text-sm text-muted-foreground">
                {count(c.id)} {t("admin.categories.products")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(c)}
                aria-label={t("admin.products.edit")}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(c)}
                aria-label={t("admin.products.delete")}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? t("admin.categories.edit") : t("admin.categories.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cnameFr">{t("admin.form.nameFr")}</Label>
              <Input
                id="cnameFr"
                value={form.nameFr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameFr: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnameAr">{t("admin.form.nameAr")}</Label>
              <Input
                id="cnameAr"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameAr: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cslug">{t("admin.categories.slug")}</Label>
              <Input
                id="cslug"
                dir="ltr"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder={
                  slugify(form.nameFr) || t("admin.categories.slugPlaceholder")
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.categories.slugHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.categories.image")}</Label>
              <ImageUploader
                value={form.image ? [form.image] : []}
                onChange={(images) =>
                  setForm((f) => ({ ...f, image: images[0] ?? "" }))
                }
                onUploadingChange={setUploading}
                max={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.form.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>{t('admin.form.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
