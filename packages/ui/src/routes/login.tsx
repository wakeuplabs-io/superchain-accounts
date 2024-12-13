import { useMockAuth } from "@/contexts/MockAuthContext";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";

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

  return <div>
    Hello "/login/"!<br/>
    <button onClick={doLogin}>Login</button>
  </div>;
}
