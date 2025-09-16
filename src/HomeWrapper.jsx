import { useAuth } from "./Create.jsx";
import Home3 from "./Home3.jsx";
import Home4 from "./Home4.jsx";
function HomeWrapper() {
  const { showHome3 } = useAuth();
  return showHome3 ? <Home3 /> : <Home4 />;
}
export default HomeWrapper;
