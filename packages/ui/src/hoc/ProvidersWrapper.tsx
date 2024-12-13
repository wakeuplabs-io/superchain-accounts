import { MockAuthProvider } from "@/contexts/MockAuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

interface ProvidersWrapperProps {
  children: React.ReactNode;
}

export default function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return <MockAuthProvider><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></MockAuthProvider>;
}
