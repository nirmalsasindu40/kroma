import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'kroma_cart';

function loadInitialCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;

      // Custom-designed items always become their own line —
      // two different designs on the same product must not merge.
      if (product.customDesign) {
        const uniqueId = `${product.id}-custom-${Date.now()}`;
        return [
          ...state,
          { ...product, id: uniqueId, baseProductId: product.id, quantity: 1 },
        ];
      }

      const existing = state.find((item) => item.id === product.id);
      if (existing) {
        return state.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { ...product, quantity: 1 }];
    }

    case 'REMOVE_ITEM': {
      return state.filter((item) => item.id !== action.payload.id);
    }

    case 'INCREASE_QTY': {
      return state.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    }

    case 'DECREASE_QTY': {
      return state
        .map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    }

    case 'CLEAR_CART': {
      return [];
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  const addToCart = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const increaseQty = (id) => dispatch({ type: 'INCREASE_QTY', payload: { id } });
  const decreaseQty = (id) => dispatch({ type: 'DECREASE_QTY', payload: { id } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
