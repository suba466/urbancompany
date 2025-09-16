import {useAuth} from './CreateAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
const Prod=()=>{
    const {addToCart}=useAuth();
    const navigate=useNavigate();
    const items=[
        {name:"T-Shirt", price:500},{name:"Shoes", price:1200},{name:"Bag",price:800},];
    return(
        <div>
            <h2>Products</h2>
            {items.map((item)=>(
                <div key={item.name}>
                    <p>{item.name}- ₹{item.price}</p>
                    <button onClick={()=>addToCart(item)}>Add to Cart</button></div>
            ))}
            <br />
            <Button onClick={()=>navigate("/cart")}>Go to cart</Button>
        </div>
    )
};
export default Prod;