import { Routes, Route } from "react-router-dom";
import { Create } from "./Create.jsx";
import Navbar from ".//Navbar.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Blog from "./Blog.jsx";
import HomeWrapper from './HomeWrapper.jsx'
function Authen() {
  return (
    <Create >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </Create >
  );
}

export default Authen;
