import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { Button } from "@/components";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/contexts/MockAuthContext";

import optimismLogo from "@/assets/logos/optimism-logo.svg";
import wakeUpPowered from "@/assets/logos/wakeup-powered.svg";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const {login} = useMockAuth();
  const router = useRouter();
  const search = useSearch({
    strict: false,
  });

  // console.log(search["redirect"]);
  const doLogin = () => {
    login();
    router.history.push(search.redirect ?? "/");
  };

  return (
    <Card className="w-[50%] max-w-[1000px] mx-auto absolute top-[100px]">
      <CardHeader className="text-center">
        <img src={optimismLogo} className="w-[150px] self-center mt-10 mb-12"/>
        <CardTitle className="text-4xl font-bold">Welcome to Superchain!</CardTitle>
        <CardDescription className="text-2xl text-inherit font-light !mt-4">Connect to create your Smart Accounts.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-7">
        <Button className="w-full max-w-xs py-10 text-2xl font-bold" size="lg">
          Connect Wallet
        </Button>
      </CardContent>
      <CardFooter className="justify-center pt-10">
        <img src={wakeUpPowered}/>
      </CardFooter>
    </Card>
    
  );
}
