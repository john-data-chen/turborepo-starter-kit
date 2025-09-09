import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { UserNav } from './UserNav'

export default function Header() {
  return (
    <header className="flex h-auto shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 p-2 md:h-16 md:flex-nowrap md:px-4 transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="order-last w-full flex-grow md:order-none md:w-auto">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <UserNav />
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
