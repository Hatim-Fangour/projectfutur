'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'

export default function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return

    // Replace the current locale prefix in the pathname
    let newPath = pathname
    for (const loc of routing.locales) {
      if (pathname === `/${loc}`) {
        newPath = `/${newLocale}`
        break
      }
      if (pathname.startsWith(`/${loc}/`)) {
        newPath = `/${newLocale}/${pathname.slice(loc.length + 2)}`
        break
      }
    }

    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? 'font-bold' : ''}
            aria-current={locale === loc ? 'true' : undefined}
          >
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
