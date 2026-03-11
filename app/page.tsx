"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowUp } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cmsContent, setCmsContent] = useState<any>({});

  const [modalEmail, setModalEmail] = useState("");
  const [inlineEmail, setInlineEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultImages = [
    "/images/hero.png",
    "/images/clothing.png",
    "/images/bags.png",
    "/images/shoes.png"
  ];

  const [heroImages, setHeroImages] = useState(defaultImages);

  const handleSubscribe = async (email: string, isModal: boolean) => {
    if (!email || !email.includes('@')) {
      alert("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation($email: String!) { subscribeNewsletter(email: $email) }`,
          variables: { email }
        })
      });
      const data = await res.json();
      if (data.data?.subscribeNewsletter) {
        alert("Merci pour votre inscription !");
        if (isModal) setIsModalOpen(false);
        setModalEmail("");
        setInlineEmail("");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Fetch CMS Content
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ homeContent { key value type } }' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.homeContent) {
          const contentMap = data.data.homeContent.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setCmsContent(contentMap);

          // Update hero images from CMS if present
          const cmsImages = [];
          if (contentMap.hero_image_1) cmsImages.push(contentMap.hero_image_1);
          if (contentMap.hero_image_2) cmsImages.push(contentMap.hero_image_2);
          if (cmsImages.length > 0) setHeroImages(cmsImages);
        }
      });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeydown);

    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeydown);
      clearInterval(timer);
    };
  }, [heroImages.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`${styles.main} ${isSearchOpen || isModalOpen ? styles.noScroll : ""}`}>
      {/* Header */}
      <header className={`${styles.header} ${isScrolled || isSearchOpen ? styles.headerScrolled : ""}`}>
        <div className={styles.headerLayout}>
          <div className={styles.headerLeft}>
            <button className={styles.menuButton} onClick={() => setIsMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className={styles.logo}>
              {cmsContent.brand_logo || "S E A U R A"}
            </div>
            {/* <Link href="/shop" className="hidden lg:block ml-10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-all">BOUTIQUE</Link> */}
          </div>

          <div className={`${styles.headerCenter} ${isSearchOpen ? styles.searchActive : ""}`}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchPill} onClick={() => setIsSearchOpen(true)}>
                <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="RECHERCHE"
                  className={styles.searchInput}
                  autoFocus={isSearchOpen}
                />
              </div>
              {isSearchOpen && (
                <button className={styles.cancelButton} onClick={() => setIsSearchOpen(false)}>
                  Annuler
                </button>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <Link href={session ? ((session.user as any).role === 'ADMIN' ? "/admin/dashboard" : "/dashboard") : "/auth/signin"} className={styles.iconButton}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 00-16 0" />
              </svg>
              <span className={styles.iconText}>{session ? "Mon Compte" : "Connexion"}</span>
            </Link>
          </div>
        </div>

        {/* Search Modal Content */}
        {isSearchOpen && (
          <div className={styles.searchModalContent}>
            <div className={styles.searchInner}>
              <h4 className={styles.trendingTitle}>RECHERCHES TENDANCES</h4>
              <div className={styles.tagCloud}>
                {['sacs', 'chaussures', 'bijoux', 'vêtements', 'nouvelle collection', 'bijoux en acier', 'sacs à main'].map(tag => (
                  <span key={tag} className={styles.searchTag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hamburger Menu Overlay */}
      <div className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuVisible : ""}`}>
        <div className={styles.menuDrawer}>
          <button className={styles.closeButton} onClick={() => setIsMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <nav className={styles.menuNav}>
            <ul>
              <li><Link href="/shop" onClick={() => setIsMenuOpen(false)}>BOUTIQUE</Link></li>
              <li><a href="#">NEW IN</a></li>
              <li><a href="#">SACS</a></li>
              <li><a href="#">VÊTEMENTS</a></li>
              <li><a href="#">BIJOUX</a></li>
              <li><a href="#">CHAUSSURES</a></li>
              <li><a href="#">VALISES</a></li>
              <li><a href="#">ACCESSOIRES</a></li>
            </ul>
          </nav>
        </div>
        <div className={styles.menuBackdrop} onClick={() => setIsMenuOpen(false)}></div>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          {heroImages.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt={`Collection ${idx + 1}`}
              fill
              priority={idx === 0}
              className={`${styles.heroImage} ${idx === currentHeroIndex ? styles.active : ""}`}
            />
          ))}
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{cmsContent.hero_title || "NEW IN"}</h1>
            <a href="#" className={styles.heroLink}>{cmsContent.hero_link_text || "Plus d'informations"}</a>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className={styles.categoryGrid}>
        <Link href="/shop?category=sacs" className={styles.categoryCard}>
          <Image src={cmsContent.cat1_image || "/images/bags.png"} alt="Sacs" fill className={styles.catImg} />
          <div className={styles.cardContent}>
            <h2 className={styles.hollowTitle}>{cmsContent.cat1_title || "Sacs"}</h2>
            <h3 className={styles.solidTitle}>{cmsContent.cat1_title?.toLowerCase() || "sacs"}</h3>
            <span className={styles.cardLink}>Plus d&apos;informations</span>
          </div>
        </Link>
        <Link href="/shop?category=vêtements" className={styles.categoryCard}>
          <Image src={cmsContent.cat2_image || "/images/clothing.png"} alt="Vêtements" fill className={styles.catImg} />
          <div className={styles.cardContent}>
            <h2 className={styles.hollowTitle}>{cmsContent.cat2_title || "Vêtements"}</h2>
            <h3 className={styles.solidTitle}>{cmsContent.cat2_title?.toLowerCase() || "vêtements"}</h3>
            <span className={styles.cardLink}>Plus d&apos;informations</span>
          </div>
        </Link>
        <Link href="/shop?category=bijoux" className={styles.categoryCard}>
          <Image src={cmsContent.cat3_image || "/images/jewelry.png"} alt="Bijoux" fill className={styles.catImg} />
          <div className={styles.cardContent}>
            <h2 className={styles.hollowTitle}>{cmsContent.cat3_title || "Bijoux"}</h2>
            <h3 className={styles.solidTitle}>{cmsContent.cat3_title?.toLowerCase() || "bijoux"}</h3>
            <span className={styles.cardLink}>Plus d&apos;informations</span>
          </div>
        </Link>
        <Link href="/shop?category=chaussures" className={styles.categoryCard}>
          <Image src={cmsContent.cat4_image || "/images/shoes.png"} alt="Chaussures" fill className={styles.catImg} />
          <div className={styles.cardContent}>
            <h2 className={styles.hollowTitle}>{cmsContent.cat4_title || "Chaussures"}</h2>
            <h3 className={styles.solidTitle}>{cmsContent.cat4_title?.toLowerCase() || "chaussures"}</h3>
            <span className={styles.cardLink}>Plus d&apos;informations</span>
          </div>
        </Link>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>{cmsContent.newsletter_title || "Abonnez-vous à notre newsletter"}</h2>
          <form className={styles.newsletterForm} onSubmit={(e) => { e.preventDefault(); handleSubscribe(inlineEmail, false); }}>
            <input
              type="email"
              placeholder="E-mail"
              className={styles.newsletterInput}
              value={inlineEmail}
              onChange={(e) => setInlineEmail(e.target.value)}
            />
            <div className={styles.checkboxWrapper}>
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">Je déclare avoir lu et compris la <a>Politique de confidentialité</a>.</label>
            </div>
            <button className={styles.newsletterSubmit} disabled={isSubmitting}>
              {isSubmitting ? "ENVOI..." : "INSCRIVEZ-VOUS"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h3>Obtenir de l&apos;aide</h3>
            <ul>
              <li><a href="#">Commandes</a></li>
              <li><a href="#">Livraisons</a></li>
              <li><a href="#">Retours</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h3>Entreprise</h3>
            <ul>
              <li><a href="#">À propos</a></li>
              <li><a href="#">Carrières</a></li>
              <li><a href="#">Boutiques</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h3>Politiques</h3>
            <ul>
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Mentions légales</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.socialRow}>
          <div className={styles.socialIcons}>
            <div className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </div>
            <div className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </div>
            <div className={styles.socialIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </div>
            <div className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 15.02V8.48L15.45 11.75l-5.7 3.27z" /></svg>
            </div>
            <div className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-7.1 17.1c.1-.1.3-.1.4-.2l1.2-4.5c.1-.2.1-.5.1-.7v-.1a2.8 2.8 0 014.2-2.5 2.8 2.8 0 011.6 3v.1l-1.3 5.4c0 .3.2.5.5.5a10 10 0 0010-10c0-5.5-4.5-10-10-10z" /></svg>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 SEAURA</p>
        </div>
      </footer>

      {/* Main Newsletter Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.modalBody}>
              <div className={styles.modalVisual}>
                <Image src={heroImages[1]} alt="Join Seaura" fill className="object-cover" />
              </div>

              <div className={styles.modalText}>
                <span className={styles.modalSubtitle}>Collection Exclusive</span>
                <h2 className={styles.modalTitle}>Rejoindre l'Expérience</h2>
                <p className={styles.modalDesc}>Inscrivez-vous pour recevoir nos dernières actualités et offres exclusives directement dans votre boîte mail.</p>

                <div className={styles.modalInputWrapper}>
                  <input
                    type="email"
                    placeholder="VOTRE E-MAIL"
                    className={styles.modalInput}
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubscribe(modalEmail, true)}
                  />
                  <button className={styles.modalSubmit} onClick={() => handleSubscribe(modalEmail, true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <p className={styles.modalLegal}>
                  En vous inscrivant, vous acceptez notre <a href="#">Politique de Confidentialité</a>.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        className={`${styles.scrollTop} ${showScrollTop ? styles.scrollTopVisible : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </main>
  );
}
