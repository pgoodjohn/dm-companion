import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const menuItems = [
    { label: "Characters", url: "/characters" },
    { label: "Encounters", url: "/encounters" },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup />
                <SidebarGroupLabel>DM Companion</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url}>
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <TanStackRouterDevtools />
            </SidebarFooter>
        </Sidebar>
    )
}
