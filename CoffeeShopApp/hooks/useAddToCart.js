import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

export default function useAddToCart(product) {
  // console.log('Toi day roi nef');
  // console.log(product);
  const dispatch = useDispatch();

  return (quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
  };
}
