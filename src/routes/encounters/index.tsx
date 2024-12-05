import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Encounters from '../../Encounters'
import RouteContainer from '@/components/route-container'

export const Route = createFileRoute('/encounters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RouteContainer>
      <Encounters />
    </RouteContainer>
  )
}
