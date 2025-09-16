import img3 from './assets/food8.jpg'
import { useAuth } from "./Create.jsx";
function Blog() {
  const { accessBlog } = useAuth();
  if (!accessBlog) return null;
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome to the Blog Page!!</h2>
      <p>This is private content visible only after clicking "Read More" on Home.</p>
      <img src={img3} alt="" />
    </div>
  );
}

export default Blog;
