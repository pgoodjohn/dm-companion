import { createRootRoute, Outlet, useRouter, Link } from '@tanstack/react-router'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const Route = createRootRoute({
    component: () => (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="container">
                    <Outlet />
                </main>
            </SidebarProvider>
        </>
    ),
})
