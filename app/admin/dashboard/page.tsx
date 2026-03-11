"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Image as ImageIcon, Settings, LogOut, Plus, Trash2, Save, Monitor, RefreshCcw, Mail } from "lucide-react";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("products");

    if (status === "loading") return <div className="h-screen flex items-center justify-center font-light tracking-widest">LOADING...</div>;

    if (!session || (session.user as any)?.role !== 'ADMIN') {
        redirect("/auth/signin");
    }

    return (
        <div className="flex h-screen bg-[#fafafa] text-[#1a1a1a]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-[#eee] p-8 flex flex-col shadow-sm">
                <div className="mb-12">
                    <h1 className="text-xl font-medium tracking-[0.2em] uppercase border-b border-black pb-4">SEAURA</h1>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest">MANAGEMENT CONSOLE</p>
                </div>

                <nav className="flex-1 space-y-4">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${activeTab === "products" ? "bg-black text-white shadow-lg translate-x-1" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                        <ShoppingBag size={18} />
                        <span className="text-sm font-medium tracking-wide">Product Inventory</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("cms")}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${activeTab === "cms" ? "bg-black text-white shadow-lg translate-x-1" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                        <ImageIcon size={18} />
                        <span className="text-sm font-medium tracking-wide">Live Editor</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("newsletter")}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${activeTab === "newsletter" ? "bg-black text-white shadow-lg translate-x-1" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                        <Mail size={18} />
                        <span className="text-sm font-medium tracking-wide">Newsletter</span>
                    </button>

                    <div className="pt-8 opacity-50">
                        <p className="text-[9px] font-bold tracking-widest uppercase mb-4 px-5">System</p>
                        <Link
                            href="/"
                            target="_blank"
                            className="w-full flex items-center gap-4 px-5 py-3 hover:text-black transition text-gray-400"
                        >
                            <Monitor size={18} />
                            <span className="text-sm font-medium">View Storefront</span>
                        </Link>
                    </div>
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="mt-auto flex items-center gap-4 text-red-500 px-5 py-4 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Log out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-light tracking-tight">
                            {activeTab === 'products' ? 'Collection' : activeTab === 'cms' ? 'Experience' : 'Audience'}
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm">Managing the brand's digital presence</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">
                            {(session.user?.email?.[0] || 'A').toUpperCase()}
                        </div>
                        <div className="text-xs uppercase tracking-tighter pr-4 font-bold">{(session.user as any)?.role}</div>
                    </div>
                </header>

                <section className="animate-in fade-in duration-500">
                    {activeTab === "products" && <ProductManager />}
                    {activeTab === "cms" && <CMSManager />}
                    {activeTab === "newsletter" && <NewsletterManager />}
                </section>
            </main>
        </div>
    );
}

function ProductManager() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", image_url: "", description: "", category_id: "" });

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: '{ products { id name price image_url category_id } categories { id name } }'
            })
        });
        const data = await res.json();
        setProducts(data.data?.products || []);
        setCategories(data.data?.categories || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `mutation($id: ID!) { deleteProduct(id: $id) }`,
                variables: { id }
            })
        });
        fetchData();
    };

    const handleProductImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setNewProduct(prev => ({ ...prev, image_url: base64String }));
        };
        reader.readAsDataURL(file);
    };

    const [isSavingProduct, setIsSavingProduct] = useState(false);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProduct(true);
        try {
            const res = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `mutation($name: String!, $price: Float!, $image_url: String, $description: String, $category_id: ID) {
                        createProduct(name: $name, price: $price, image_url: $image_url, description: $description, category_id: $category_id) { id }
                    }`,
                    variables: {
                        name: newProduct.name,
                        price: parseFloat(newProduct.price),
                        image_url: newProduct.image_url,
                        description: newProduct.description,
                        category_id: newProduct.category_id || null
                    }
                })
            });
            const data = await res.json();
            if (data.errors) {
                console.error("GraphQL Error:", data.errors);
                alert("Erreur lors de la sauvegarde: " + data.errors[0].message);
            } else {
                setIsAdding(false);
                setNewProduct({ name: "", price: "", image_url: "", description: "", category_id: "" });
                fetchData();
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Erreur réseau lors de la sauvegarde.");
        } finally {
            setIsSavingProduct(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-gray-300" />
                        <h3 className="text-xl font-light">Inventory</h3>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                    >
                        <Plus size={16} /> New Item
                    </button>
                </div>

                <div className="p-2">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="px-10 py-6">Reference</th>
                                <th className="px-6 py-6">Designation</th>
                                <th className="px-6 py-6">Category</th>
                                <th className="px-6 py-6">Price</th>
                                <th className="px-10 py-6 text-right">Options</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-300 animate-pulse">Syncing data...</td></tr>
                            ) : products.map((p: any) => (
                                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden group-hover:shadow-md transition-shadow">
                                                {p.image_url ? <img src={p.image_url} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px]">NO IMG</div>}
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400">#{p.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-medium text-sm tracking-tight">{p.name}</td>
                                    <td className="px-6 py-6 text-xs text-gray-400 uppercase tracking-widest font-bold">
                                        {categories.find(c => c.id === p.category_id)?.name || "—"}
                                    </td>
                                    <td className="px-6 py-6 text-sm text-gray-500">€{p.price}</td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 hover:bg-white rounded-full transition-shadow border border-transparent hover:border-gray-200">
                                                <Settings size={14} className="text-gray-400" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-3 hover:bg-red-50 rounded-full transition-colors border border-transparent text-red-300 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-12">
                            <h3 className="text-3xl font-light mb-8">Nouveau Produit</h3>
                            <form onSubmit={handleAddProduct} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Désignation</label>
                                        <input
                                            required
                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-black transition-all"
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Prix (€)</label>
                                        <input
                                            required type="number" step="0.01"
                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-black transition-all"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Catégorie</label>
                                    <select
                                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-black transition-all"
                                        value={newProduct.category_id}
                                        onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Image du Produit</label>
                                    <div className="relative group overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white transition-all">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={e => e.target.files?.[0] && handleProductImageUpload(e.target.files[0])}
                                        />
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-50">
                                                    {newProduct.image_url ? (
                                                        <img src={newProduct.image_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Plus size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-black uppercase tracking-widest">
                                                        {newProduct.image_url ? "Changer l'image" : "Choisir une image"}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400">PNG, JPG ou Base64</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-black/5 rounded-full text-[8px] font-black tracking-widest uppercase">Parcourir</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-black transition-all"
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 h-14 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingProduct}
                                        className={`flex-1 h-14 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-black/10 ${isSavingProduct ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:scale-105'}`}
                                    >
                                        {isSavingProduct ? <RefreshCcw size={14} className="animate-spin mx-auto" /> : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CMSManager() {
    const [content, setContent] = useState<any[]>([]);
    const [stagedChanges, setStagedChanges] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [previewKey, setPreviewKey] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCMS = () => {
        setLoading(true);
        fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{ homeContent { key value type section } }' })
        })
            .then(res => res.json())
            .then(data => {
                const results = data.data?.homeContent || [];
                setContent(results);
                // Initialize staged changes with current values
                const initial: any = {};
                results.forEach((item: any) => {
                    initial[item.key] = { value: item.value, type: item.type, section: item.section };
                });
                setStagedChanges(initial);
                setLoading(false);
            });
    };

    useEffect(() => { fetchCMS(); }, []);

    const handleInputChange = (key: string, value: string) => {
        setStagedChanges(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    const handleImageUpload = (key: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setStagedChanges(prev => ({
                ...prev,
                [key]: { ...prev[key], value: base64String }
            }));
        };
        reader.readAsDataURL(file);
    };

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            for (const key of Object.keys(stagedChanges)) {
                const item = stagedChanges[key];
                // Only update if it exists in original content and is modified, 
                // but for simplicity we'll just push all staged changes
                await fetch('/api/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `mutation($key: String!, $value: String!, $type: String!, $section: String) { 
              updateHomeContent(key: $key, value: $value, type: $type, section: $section) { key }
            }`,
                        variables: {
                            key,
                            value: item.value,
                            type: item.type,
                            section: item.section
                        }
                    })
                });
            }
            setPreviewKey(prev => prev + 1);
            alert("Contenu publié avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la publication.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-300 font-light tracking-[0.3em] uppercase">Initialisation de l'éditeur...</div>;

    const sections = Array.from(new Set(content.map(i => i.section))).sort((a, b) => {
        const order = ['branding', 'hero', 'categories', 'newsletter'];
        const idxA = order.indexOf(a || '');
        const idxB = order.indexOf(b || '');
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return (a || '').localeCompare(b || '');
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-240px)]">
            {/* CMS Sidebar / Form Control */}
            <div className="lg:col-span-6 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-light tracking-tight">Configuration Visuelle</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live Content Management</p>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${isSaving ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-black text-white hover:scale-105 active:scale-95 shadow-xl shadow-black/10'}`}
                    >
                        {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'En cours...' : 'Publier'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
                    {sections.map(section => (
                        <div key={section} className="space-y-6">
                            <h4 className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase pb-4 border-b border-gray-50">{section || 'Général'}</h4>
                            <div className="space-y-8">
                                {content.filter(i => i.section === section).map(item => (
                                    <div key={item.key} className="group flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{item.key.replace(/_/g, ' ')}</label>
                                            <span className="text-[8px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100 uppercase tracking-tighter">{item.type}</span>
                                        </div>

                                        {item.type === 'IMAGE' ? (
                                            <div className="space-y-4">
                                                <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-100 group-hover:border-black/10 transition-colors flex items-center justify-center">
                                                    <img
                                                        src={stagedChanges[item.key]?.value}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="relative z-10 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-3">
                                                        <ImageIcon size={14} className="text-gray-400" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(item.key, e.target.files[0])}
                                                            className="text-[10px] text-gray-500 font-medium w-full file:hidden cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={stagedChanges[item.key]?.value}
                                                    onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                    className="w-full text-[9px] font-mono text-gray-300 bg-transparent border-none outline-none truncate"
                                                    placeholder="Lien ou Base64"
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                rows={2}
                                                className="w-full bg-gray-50/50 rounded-2xl p-5 text-sm font-medium border border-transparent focus:border-black focus:bg-white transition-all outline-none resize-none"
                                                value={stagedChanges[item.key]?.value}
                                                onChange={(e) => handleInputChange(item.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Preview (Editorial Device) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="flex-1 bg-[#121212] rounded-[3.5rem] p-6 relative shadow-2xl overflow-hidden group">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl px-8 py-3 rounded-full border border-white/10 shadow-3xl z-20 flex items-center gap-6">
                        <Monitor size={16} className="text-white/40" />
                        <span className="text-[11px] font-black tracking-[0.4em] text-white/60 uppercase">Visionneuse Interactive</span>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500/50" />
                            <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                            <div className="h-2 w-2 rounded-full bg-green-500/50" />
                        </div>
                    </div>

                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden shadow-inner relative mt-6">
                        <iframe
                            key={previewKey}
                            src="/"
                            className="w-full h-full border-none transform transition-transform duration-1000"
                            style={{ height: 'calc(100% + 1px)' }}
                        />
                        {/* Overlay to block interaction in preview */}
                        <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-12 right-12 z-20 animate-pulse">
                        <div className="bg-green-500/20 text-green-400 text-[9px] font-black tracking-[0.2em] px-4 py-2 rounded-full border border-green-500/30 uppercase">
                            En Direct
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-blue-50 rounded-2xl">
                            <RefreshCcw size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h5 className="text-sm font-bold tracking-tight">Mise à jour en temps réel</h5>
                            <p className="text-xs text-gray-400 mt-1">Les changements publiés sont visibles instantanément sur le site.</p>
                        </div>
                    </div>
                    <Link href="/" target="_blank" className="px-6 py-3 border border-gray-100 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all group items-center flex gap-2">
                        Ouvrir le Site <Plus size={12} className="group-hover:rotate-45 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function NewsletterManager() {
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = () => {
        setLoading(true);
        fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{ newsletter { id email created_at } }' })
        })
            .then(res => res.json())
            .then(data => {
                setEmails(data.data?.newsletter || []);
                setLoading(false);
            });
    };

    useEffect(() => { fetchEmails(); }, []);

    if (loading) return <div className="p-20 text-center text-gray-400 font-light tracking-[0.2em] uppercase">Chargement de la liste...</div>;

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
                <div>
                    <h3 className="text-xl font-light tracking-tight">Liste des Abonnés</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{emails.length} contacts capturés</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Email</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Date Inscription</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-black/20 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {emails.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <span className="text-sm font-medium text-gray-600">{entry.email}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">
                                        {new Date(parseInt(entry.created_at || Date.now().toString())).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {emails.length === 0 && (
                    <div className="p-20 text-center text-gray-300 font-light italic">
                        Aucun e-mail capturé pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}
