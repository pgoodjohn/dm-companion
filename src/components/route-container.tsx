import { SidebarTrigger } from "@/components/ui/sidebar"
import React from "react"
import { useRouter, Link } from '@tanstack/react-router'

interface RouteContainerProps {
    children: React.ReactNode
}


const RouteContainer: React.FC<RouteContainerProps> = ({ children }) => {
    return (
        <div>
            <div className='flex w-100 border-b p-2 items-center'>
                <SidebarTrigger />
                <Breadcrumbs />
            </div>
            <div className="container p-4">
                {children}
            </div>
        </div>
    )
}

const Breadcrumbs = () => {
    const router = useRouter()
    const { state } = router

    const breadcrumbs = state.matches.map((match, index) => {
        const routeId = match.routeId
        const isLast = index === state.matches.length - 1

        if (routeId === '__root__') {
            return <></>
        }


        return (
            <span key={routeId}>
                {!isLast ? (
                    <>
                        <Link to={routeId}>{routeId}</Link>
                        {' / '}
                    </>
                ) : (
                    <span>{routeId.replace(/^\/+|\/+$/g, '')}</span>
                )}
            </span>
        )
    })

    return <div>{breadcrumbs}</div>
}

export default RouteContainer