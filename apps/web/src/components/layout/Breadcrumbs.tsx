'use client'

import React from 'react'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'

export function Breadcrumbs() {
  const { items, rootLink } = useBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.length === 1 ? (
          <BreadcrumbItem>
            <BreadcrumbLink href={items[0].link}>{items[0].title}</BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <>
            {/* Mobile view */}
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbLink href={rootLink}>
                <BreadcrumbEllipsis />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="md:hidden" />
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbLink href={items[items.length - 1].link}>{items[items.length - 1].title}</BreadcrumbLink>
            </BreadcrumbItem>

            {/* Desktop view */}
            {items.map((item, index) => (
              <React.Fragment key={item.link}>
                <BreadcrumbItem className="hidden md:inline-flex">
                  <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
                {index < items.length - 1 && <BreadcrumbSeparator className="hidden md:inline-flex" />}
              </React.Fragment>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
