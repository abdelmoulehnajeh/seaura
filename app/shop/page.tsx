"use client";

import { useState, useEffect, Suspense } from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, ShoppingBag, ArrowLeft, Plus, ChevronRight, Search, User, ArrowUp } from "lucide-react";

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-light tracking-[0.4em] uppercase">Chargement de la boutique...</div>}>
            <Shop />
        </Suspense>
    );
}
function Shop() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [cart, setCart] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');

    useEffect(() => {
        const fetchShopData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: '{ products { id name price image_url description category_id } categories { id name } }'
                    })
                });
                const data = await res.json();
                if (data.data) {
                    setProducts(data.data.products || []);
                    setCategories([{ id: "ALL", name: "TOUT" }, ...data.data.categories || []]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    useEffect(() => {
        if (categoryQuery && categories.length > 0) {
            const found = categories.find(c =>
                c.id === categoryQuery ||
                c.name.toLowerCase() === categoryQuery.toLowerCase()
            );
            if (found) setActiveFilter(found.id);
        }
    }, [categoryQuery, categories]);

    const filteredProducts = activeFilter === "ALL"
        ? products
        : products.filter(p => p.category_id?.toString() === activeFilter);

    const addToCart = (product: any) => {
        setCart(prev => [...prev, product]);
        setIsCartOpen(true);
    };
    const [count, setCount] = useState(1);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeProduct, setActiveProduct] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
            setShowScrollTop(window.scrollY > 500);
            // Simple logic for sticky bar: show if scrolled past hero
            if (window.scrollY > 400 && products.length > 0) {
                setActiveProduct(products[0]);
            } else {
                setActiveProduct(null);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [products]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className={styles.shopContainer}>
            {/* Elegant Announcement Bar */}
            <div className={styles.announcementBar}>
                Complimentary Worldwide Shipping on all orders above 200€
            </div>

            {/* Minimal Artist Nav Over Hero */}
            <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ""}`}>
                <Link href="/" className={styles.navLogo}>SEAURA</Link>
                
                <div className={styles.navIcons}>
                    <button className={styles.navIcon} aria-label="Search"><Search size={24} /></button>
                    <Link href="/auth/signin" className={styles.navIcon} aria-label="Account"><User size={24} /></Link>
                    <div className="relative cursor-pointer group hover:scale-110 transition-transform" onClick={() => setIsCartOpen(true)}>
                        <ShoppingBag size={26} className={styles.navIcon} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-black/10">
                                {cart.length}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* Cinematic Hero */}
            <section className={styles.shopHero}>
                <Image 
                    src="/images/hero.png" 
                    alt="Boutique Hero" 
                    fill 
                    className={styles.heroImg}
                    priority
                />
                <div className={styles.heroContent}>
                    <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000">Exclusives</h1>
                    <div className={styles.breadcrumbs}>Boutique / Collection 2026</div>
                </div>
            </section>

            {/* Featured Product 1 */}
            {products.length > 0 && (
                <section className={styles.featuredProduct}>
                    <div className={styles.productDisplay}>
                        <div className={styles.mainImageWrapper}>
                            <Image 
                                src={products[0].image_url || "/images/clothing.png"} 
                                alt={products[0].name} 
                                fill 
                                className={styles.featuredImg}
                                sizes="(max-width: 1200px) 100vw, 55vw"
                                priority
                            />
                        </div>
                    </div>

                    <div className={styles.productDetails}>
                        <span className={styles.detailCategory}>BOUTIQUE / ARTISAN MASTERPIECE</span>
                        <h2 className={styles.detailTitle}>{products[0].name}</h2>
                        <div className={styles.detailPrice}>{products[0].price} €</div>
                        
                        <p className={styles.priceDescription}>
                            {products[0].description || "An artisan masterpiece blending timeless elegance with exceptional Tunisian materials. Every stitch tells a story of heritage reimagined for the modern silhouette."}
                        </p>

                        <div className={styles.optionSection}>
                            <span className={styles.optionLabel}>Size Selection</span>
                            <div className={styles.optionGrid}>
                                <button className={`${styles.optionBtn} ${styles.optionBtnActive}`}>S</button>
                                <button className={styles.optionBtn}>M</button>
                                <button className={styles.optionBtn}>L</button>
                                <button className={styles.optionBtn}>XL</button>
                            </div>
                        </div>

                        <div className={styles.actionRow}>
                            <div className={styles.qtySelector}>
                                <button className={styles.qtyBtn} onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                                <span className="font-bold text-lg">{count}</span>
                                <button className={styles.qtyBtn} onClick={() => setCount(count + 1)}>+</button>
                            </div>
                            <button className={styles.buyBtn} onClick={() => addToCart(products[0])}>Add to Collection</button>
                        </div>

                        <ul className={styles.featureList}>
                            <li className={styles.featureItem}><Plus size={14} /> 100% Organic Mediterranean Cotton</li>
                            <li className={styles.featureItem}><Plus size={14} /> Hand-finished details by local artisans</li>
                            <li className={styles.featureItem}><Plus size={14} /> Sustainable & Ethically Sourced</li>
                        </ul>
                    </div>
                </section>
            )}

            {/* Editorial Portrait Break */}
            <section className={styles.portraitSection}>
                <Image 
                    src="/images/hero.png" 
                    alt="Editorial Portrait" 
                    fill 
                    className={styles.portraitImg}
                    sizes="100vw"
                />
            </section>

            {/* Featured Product 2 */}
            {products.length > 1 && (
                <section className={styles.featuredProduct}>
                    <div className={styles.productDisplay}>
                        <div className={styles.mainImageWrapper}>
                            <Image 
                                src={products[1].image_url || "/images/clothing.png"} 
                                alt={products[1].name} 
                                fill 
                                className={styles.featuredImg}
                                sizes="(max-width: 1200px) 100vw, 55vw"
                            />
                        </div>
                    </div>

                    <div className={styles.productDetails}>
                        <span className={styles.detailCategory}>ÉDITION LIMITÉE / 2026</span>
                        <h2 className={styles.detailTitle}>{products[1].name}</h2>
                        <div className={styles.detailPrice}>{products[1].price} €</div>
                        
                        <p className={styles.priceDescription}>
                            {products[1].description || "The perfect balance between tradition and modern utility. A limited edition release focused on durability and sophisticated comfort."}
                        </p>

                        <div className={styles.actionRow}>
                            <button className={`${styles.buyBtn} ${styles.discoverBtn}`} onClick={() => addToCart(products[1])}>
                                Discover Details
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Sticky Floating Bar */}
            <div className={`${styles.stickyBarContainer} ${activeProduct ? styles.stickyBarVisible : ""}`}>
                <div className={styles.stickyInfo}>
                    <div className={styles.stickyThumb}>
                        <Image src={activeProduct?.image_url || "/images/clothing.png"} alt="Product Preview" fill className="object-cover" />
                    </div>
                    <div className={styles.stickyText}>
                        <h4>{activeProduct?.name}</h4>
                        <p>Currently Available • Ready to ship</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className={styles.stickyPrice}>{activeProduct?.price} €</span>
                    <button className={styles.stickyBtn} onClick={() => addToCart(activeProduct)}>Quick Add</button>
                </div>
            </div>

            {/* Atmospheric Banner */}
            <section className={styles.atmosphericBanner}>
                <Image 
                    src="/images/hero.png" 
                    alt="Lifestyle Banner" 
                    fill 
                    className="object-cover"
                />
                <div className={styles.bannerOverlay}>
                    <div className={styles.bannerIndicator}>SEAURA</div>
                </div>
            </section>

            {/* Collection Grid */}
            <section className={styles.relatedSection}>
                <div className={styles.sectionTitleBlock}>
                    <span className={styles.sectionTag}>THE COMPLETE LINEUP</span>
                    <h2 className={styles.sectionTitle}>Elevate Your Style</h2>
                </div>

                <div className={styles.productGrid}>
                    {products.map((p: any) => (
                        <Link key={p.id} href={`/product/${p.id}`} className={styles.productCard}>
                            <div className={styles.gridImageWrapper}>
                                <div className={styles.onSale}>NEW</div>
                                <Image
                                    src={p.image_url || "/images/clothing.png"}
                                    alt={p.name}
                                    fill
                                    className={styles.gridImg}
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                            <div className={styles.gridInfo}>
                                <span className={styles.gridCat}>
                                    {categories.find(c => c.id === p.category_id?.toString())?.name || "BOUTIQUE"}
                                </span>
                                <h3 className={styles.gridName}>{p.name}</h3>
                                <div className={styles.gridPrice}>{p.price} €</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Final Info Section */}
            <section className={styles.infoSection}>
                <div className={styles.infoDescription}>
                    At SEAURA, we believe in beauty without compromise. 
                    Every piece in our collection is the result of meticulous craftsmanship, 
                    designed to last and enhance your daily life with subtle, refined elegance. 
                    Rediscover the essentials through our artisanal creations.
                </div>
                <div className={styles.decorativeImageWrapper}>
                    <Image 
                        src="/images/clothing.png" 
                        alt="Craftsmanship" 
                        fill 
                        className="object-cover"
                    />
                </div>
            </section>

            {/* Elevated Dark Footer */}
            <footer className={styles.footerMain}>
                <div className={styles.footerPattern} />
                <div className={styles.footerContent} style={{position: 'relative', zIndex: 10}}>
                    <div>
                        <h2 className={styles.newsletterTitle}>Newsletter.</h2>
                        <div className={styles.newsletterInputWrapper}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className={styles.newsletterInput}
                            />
                            <button className={styles.newsletterBtn} aria-label="Subscribe"><ChevronRight size={35} /></button>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-[10px] tracking-[0.5em] uppercase opacity-30 mb-10 font-black">Company</h3>
                        <ul className={styles.footerLinks}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/shop">Collections</Link></li>
                            <li><Link href="/">Our Journal</Link></li>
                            <li><Link href="/">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] tracking-[0.5em] uppercase opacity-30 mb-10 font-black">Categories</h3>
                        <ul className={styles.footerLinks}>
                            {categories.filter(c => c.id !== 'ALL').slice(0, 4).map((cat: any) => (
                                <li key={cat.id}><Link href={`/shop?category=${cat.name.toLowerCase()}`}>{cat.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] tracking-[0.5em] uppercase opacity-30 mb-10 font-black">Follow Us</h3>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="text-[11px] tracking-widest hover:opacity-100 transition opacity-40 font-bold">INSTAGRAM</a>
                            <a href="#" className="text-[11px] tracking-widest hover:opacity-100 transition opacity-40 font-bold">FACEBOOK</a>
                            <a href="#" className="text-[11px] tracking-widest hover:opacity-100 transition opacity-40 font-bold">PINTEREST</a>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom} style={{position: 'relative', zIndex: 10}}>
                    <p>© 2026 S E A U R A — Digital Boutique / Artisanal Heritage.</p>
                    <div className="flex gap-10 opacity-60">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
            {/* Cart Side Drawer */}
            <div className={`${styles.cartOverlay} ${isCartOpen ? styles.cartOverlayVisible : ""}`} onClick={() => setIsCartOpen(false)} />
            <div className={`${styles.cartDrawer} ${isCartOpen ? styles.cartDrawerOpen : ""}`}>
                <div className={styles.cartHeader}>
                    <h3>Your Bag</h3>
                    <button className={styles.closeCart} onClick={() => setIsCartOpen(false)}>Close —</button>
                </div>

                <div className={styles.cartItems}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>Your collection is empty.</div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className={styles.cartItem}>
                                <div className={styles.cartItemThumb}>
                                    <Image src={item.image_url || "/images/clothing.png"} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className={styles.cartItemInfo}>
                                    <h4>{item.name}</h4>
                                    <p>Tunisian Heritage Edition</p>
                                    <div className={styles.cartItemPrice}>{item.price} €</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className={styles.cartFooter}>
                        <div className={styles.cartTotal}>
                            <span>Subtotal</span>
                            <span>{cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)} €</span>
                        </div>
                        <button className={styles.checkoutBtn}>Finalize Collection</button>
                    </div>
                )}
            </div>

            {/* Scroll to Top Button */}
            <button 
                className={`${styles.scrollTop} ${showScrollTop ? styles.scrollTopVisible : ""}`} 
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} />
            </button>
        </div>
    );
}
