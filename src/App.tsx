import { useAuth } from "./features/auth/model/useAuth";
import { ChatPage } from "./pages/ChatPage/ChatPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";

function App() {
  const { credentials, login, logout } = useAuth();

  if (!credentials) return <LoginPage onLogin={login} />;
  return <ChatPage credentials={credentials} onLogout={logout} />;
}

export default App;
