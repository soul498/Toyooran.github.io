import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { NotFoundPage } from './NotFoundPage';
import { ProductCatalogSection } from './ProductCatalogSection';
import { findProduct, publicProductPath, SEO_REDIRECTS } from '../seo/resolveSeo';
import { Product, ProductCategory } from '../types';
import { ProductDetail } from './product/ProductDetail';
import { HomeProductBands } from './spotlight/ProductSpotlight';

import { CATALOG_CATEGORY_IDS as CATEGORY_IDS } from '../lib/catalogPath';

/**
 * One route (/products/:productId?) serves the hub, every category and every product, so switching
 * category keeps the same catalog instance: no lazy-chunk fallback flash, no remount of the chips.
 */
export const ProductPage: React.FC<{ onRequestQuoteForProduct?: (product: Product) => void }> = ({ onRequestQuoteForProduct }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, articles, catalogReady } = useData();

  const retiredCategory = productId ? SEO_REDIRECTS[`/products/${productId}`] : undefined;
  if (retiredCategory) return <Navigate to={retiredCategory} replace />;

  if (!productId || CATEGORY_IDS.includes(productId as ProductCategory)) {
    const category = (productId as ProductCategory | undefined) || 'all';
    return (
      <>
        {category === 'all' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12"><HomeProductBands /></div>
        ) : null}
        <ProductCatalogSection
          products={products}
          selectedCategory={category}
          onSelectCategory={(cat) => navigate(cat === 'all' ? '/products' : `/products/${cat}`)}
          onSelectProduct={(product) => navigate(publicProductPath(product))}
          onRequestQuoteForProduct={onRequestQuoteForProduct || (() => navigate('/contact'))}
        />
      </>
    );
  }

  const requested = decodeURIComponent(productId || "");
  const product = findProduct(requested, products);

  if (!product) {
    if (!catalogReady) {
      return <div className="pt-32 min-h-screen bg-slate-50" aria-busy="true" />;
    }
    return <NotFoundPage />;
  }

  const canonical = publicProductPath(product);
  if (canonical !== `/products/${requested}`) return <Navigate to={canonical} replace />;

  return <ProductDetail product={product} products={products} articles={articles} />;
};
