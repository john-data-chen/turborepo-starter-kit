import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BoardOverview } from "@/components/kanban/BoardOverview"

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "kanban" })

  return {
    title: t("title"),
    description: t("description")
  }
}

export default function BoardPage() {
  return <BoardOverview />
}
