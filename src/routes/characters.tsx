import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Characters from '@/Characters'
import RouteContainer from '@/components/route-container'

export const Route = createFileRoute('/characters')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RouteContainer>
    <Characters />
  </RouteContainer>
}
