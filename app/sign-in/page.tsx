"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
 
  const [email,setEmail] = useState("");
      const [password, setPasword] = useState("");
  
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(false);
  
      const router = useRouter();
  
      async function handleSubmit(e: React.FormEvent) {
          e.preventDefault();
          setLoading(true);
          setError("");
  
          try {
              const result = await signIn.email({
                email,
                password,
              });
  
              if (result.error) {
                setError(result.error.message ?? "failed to sign in");
              } else {
                router.push("/dashboard")
              }
          }catch (err) {
              setError("An error occurred while creating your account. Please try again.");
          } finally {
              setLoading(false);
          }
      }
 
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email and password to log in
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                email
                </Label>
              <Input
                id="email"
                type="email"
                placeholder="Maria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                password
                </Label>
              <Input 
                id="password" 
                type="password" 
                minLength={8} 
                value={password}
                onChange={(e) => setPasword(e.target.value)} 
                required
                className="border-gray-300 focus:border-primary focus:ring-primary" 
             />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
            >
                {loading ? "Signing you in..." : "Sign In" }
            </Button>
            <p className="text-center text-sm text-gray-600">
              Do not have an account?{" "}
              <Link 
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign Up
             </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
