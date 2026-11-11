"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  createCategory,
  createGroup,
  deleteCategory,
  deleteGroup,
  updateCategory,
  updateGroup,
} from "@/actions/cards";
import type { CategorySection as CategorySectionData } from "@/lib/library-view";
import { Link } from "@/i18n/navigation";
import { CategorySection } from "./category-section";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { EmptyState } from "./empty-state";
import { primaryButtonClass, secondaryButtonClass } from "./library-styles";
import { NameDialog } from "./name-dialog";

type LibraryDialog =
  | { type: "create-category" }
  | { type: "rename-category"; id: string; title: string }
  | { type: "delete-category"; id: string; title: string; groupCount: number; cardCount: number }
  | { type: "create-group"; categoryId: string }
  | { type: "rename-group"; id: string; title: string }
  | { type: "delete-group"; id: string; title: string; cardCount: number }
  | null;

export function LibraryHome({ sections }: { sections: CategorySectionData[] }) {
  const t = useTranslations("library");
  const [dialog, setDialog] = useState<LibraryDialog>(null);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl">{t("title")}</h1>
          <p className="mt-3 text-muted">{t("lead")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => setDialog({ type: "create-category" })}
          >
            {t("createCategory")}
          </button>
          <Link href="/cards/all" prefetch={false} className={secondaryButtonClass}>
            {t("allCards")}
          </Link>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => setDialog({ type: "create-category" })}
              >
                {t("createCategory")}
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {sections.map((section) => (
            <CategorySection
              key={section.id}
              section={section}
              onRename={() => setDialog({ type: "rename-category", id: section.id, title: section.title })}
              onDelete={() =>
                setDialog({
                  type: "delete-category",
                  id: section.id,
                  title: section.title,
                  groupCount: section.groupCount,
                  cardCount: section.cardCount,
                })
              }
              onCreateGroup={() => setDialog({ type: "create-group", categoryId: section.id })}
              onRenameGroup={(id, title) => setDialog({ type: "rename-group", id, title })}
              onDeleteGroup={(id, title, cardCount) =>
                setDialog({ type: "delete-group", id, title, cardCount })
              }
            />
          ))}
        </div>
      )}

      {dialog?.type === "create-category" ? (
        <NameDialog title={t("nameCategoryTitle")} action={createCategory} onClose={() => setDialog(null)} />
      ) : null}
      {dialog?.type === "rename-category" ? (
        <NameDialog
          title={t("renameCategoryTitle")}
          action={updateCategory}
          hidden={{ categoryId: dialog.id }}
          initialValue={dialog.title}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "create-group" ? (
        <NameDialog
          title={t("nameGroupTitle")}
          action={createGroup}
          hidden={{ categoryId: dialog.categoryId }}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "rename-group" ? (
        <NameDialog
          title={t("renameGroupTitle")}
          action={updateGroup}
          hidden={{ groupId: dialog.id }}
          initialValue={dialog.title}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "delete-category" ? (
        <ConfirmDeleteDialog
          title={t("deleteCategoryTitle")}
          body={
            dialog.groupCount === 0
              ? t("deleteEmptyCategory", { title: dialog.title })
              : t("deleteCategoryCascade", {
                  title: dialog.title,
                  groups: dialog.groupCount,
                  cards: dialog.cardCount,
                })
          }
          action={deleteCategory}
          hidden={{ categoryId: dialog.id }}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "delete-group" ? (
        <ConfirmDeleteDialog
          title={t("deleteGroupTitle")}
          body={
            dialog.cardCount === 0
              ? t("deleteEmptyGroup", { title: dialog.title })
              : t("deleteGroupCascade", { title: dialog.title, cards: dialog.cardCount })
          }
          action={deleteGroup}
          hidden={{ groupId: dialog.id }}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}
