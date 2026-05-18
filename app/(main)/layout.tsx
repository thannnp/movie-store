"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { observer } from "mobx-react-lite"
import { LogOut, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/providers/StoreProvider"

function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const authStore = useAuthStore()

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      authStore.checkAuth()
    }
  }, [authStore])

  const handleLogout = async () => {
    await authStore.logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-muted/40">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Film className="size-5 text-primary" />
          <span className="font-semibold">MovieStore</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            Movies
          </div>
        </nav>
    
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6">
          {/* Mobile title */}
          <div className="flex items-center gap-2 md:hidden">
            <Film className="size-5 text-primary" />
            <span className="font-semibold">MovieStore</span>
          </div>
          {/* Breadcrumb / page title on desktop */}
          <div className="hidden md:block text-sm text-muted-foreground">
            Dashboard
          </div>
          {/* User info */}
          <div className="flex items-center gap-3">
            {authStore.role && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {authStore.role}
              </span>
            )}
            {authStore.email && (
              <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[160px]">
                {authStore.email}
              </span>
            )}
            {/* Mobile logout */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
      </div>
    </div>
  )
}

export default observer(MainLayout)
