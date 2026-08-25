import ProductCard from './ProductCard';

const featuredProducts = [
  {
    id: 1,
    name: 'Classic Crew T-Shirt',
    category: 'T-Shirts',
    price: 18.99,
    image: '',
    tag: 'Bestseller',
  },
  {
    id: 2,
    name: 'Full-Wrap Ceramic Mug',
    category: 'Mugs',
    price: 14.5,
    image: '',
    tag: '',
  },
  {
    id: 3,
    name: 'Slim Phone Case',
    category: 'Phone Cases',
    price: 16.0,
    image: '',
    tag: 'New',
  },
  {
    id: 4,
    name: 'Pullover Hoodie',
    category: 'Hoodies',
    price: 34.99,
    image: '',
    tag: '',
  },
];

export default function FeaturedProducts({ onAddToCart }) {
  return (
    <section className="section" id="featured">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Bestsellers</p>
            <h2>Popular customizations</h2>
          </div>
          <a href="#" className="view-all">
            View all products
          </a>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}