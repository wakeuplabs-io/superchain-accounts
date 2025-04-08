import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./context/AuthContext";
import { RouterProvider } from "./hoc/RouterProvider";


function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <RouterProvider />
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;
