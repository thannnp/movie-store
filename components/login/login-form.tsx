"use client"

import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { observer } from "mobx-react-lite"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginInput } from "@/schemas/auth.schema"
import { useAuthStore } from "@/providers/StoreProvider"

export const LoginForm = observer(function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const authStore = useAuthStore()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginInput) => {
    const success = await authStore.login(data.email, data.password)
    if (success) {
      router.push("/movies")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your MovieStore account
                </p>
              </div>

              {authStore.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {authStore.error}
                </div>
              )}

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="manager@example.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" className="w-full" disabled={authStore.isLoading}>
                  {authStore.isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <div className="flex flex-col gap-2">
                <p className="text-center text-xs text-muted-foreground">
                  Quick login as:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Manager", email: "manager@example.com" },
                    { label: "Team Leader", email: "teamleader@example.com" },
                    { label: "Floor Staff", email: "floorstaff@example.com" },
                  ].map((account) => (
                    <Button
                      key={account.email}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={authStore.isLoading}
                      onClick={() => {
                        form.setValue("email", account.email)
                        form.setValue("password", "password123")
                      }}
                    >
                      {account.label}
                    </Button>
                  ))}
                </div>
              </div>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-8">
                <h2 className="text-3xl font-bold mb-2">MovieStore</h2>
                <p className="text-muted-foreground">
                  Manage your movie collection with ease
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
