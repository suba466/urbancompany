import {useAuth} from './CreateAuth.jsx';
const Cart=()=>{
    const {cart, removeFromCart}=useAuth();
    if (cart.length===0) return <p>Cart is empty!!</p>;
    return(
        <div>
            <h2>Your Cart</h2>
            {cart.map((item)=>(
                <div key={item.name}>
                    <p>{item.name} - ₹{item.price}</p>
                    <button onClick={()=>removeFromCart(item.name)}>Remove</button>
                </div>
            ))}
            <p>Total: ₹{cart.reduce((sum,i)=>sum+i.price,0)}</p>
        </div>
    )
}

export default Cart;
