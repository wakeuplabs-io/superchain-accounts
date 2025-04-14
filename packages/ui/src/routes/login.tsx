import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import optimismLogo from "@/assets/logos/optimism-logo.svg";
import wakeUpPowered from "@/assets/logos/wakeup-powered.svg";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const search = useSearch({
    strict: false,
  });

  const doLogin = async () => {
    try {
      setIsLoading(true);
      await login();
      router.history.push(search.redirect ?? "/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen sm:flex sm:items-center sm:justify-center sm:p-4">
      <Card
        className={cn(
          "w-full h-screen relative", //mobile
          "sm:w-[80%] sm:h-auto sm:mx-auto sm:absolute sm:top-[100px]", //tablet
          "lg:min-w-[50%] lg:max-w-[1000px]" // desktop
        )}
      >
        <CardHeader className="text-center">
          <img
            src={optimismLogo}
            className="w-[150px] self-center mt-10 mb-12"
          />
          <CardTitle className="text-3xl font-bold">
            Welcome to Superchain!
          </CardTitle>
          <CardDescription className="text-2xl text-inherit font-light !mt-4">
            Connect to create your Smart Accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-7">
          <Button
            className="w-full max-w-xs py-10 text-2xl font-bold"
            size="lg"
            variant="dark"
            onClick={doLogin}
            loading={isLoading}
          >
            Connect Wallet
          </Button>
        </CardContent>
        <CardFooter className="w-full absolute bottom-0 justify-center sm:relative sm:pt-10">
          <img src={wakeUpPowered} />
        </CardFooter>
      </Card>
    </div>
  );
}
