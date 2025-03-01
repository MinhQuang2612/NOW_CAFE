import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

export default function useAddToCart(product) {
  const dispatch = useDispatch();

  return (quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
  };
}
