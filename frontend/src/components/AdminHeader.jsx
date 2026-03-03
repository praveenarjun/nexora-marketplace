import { Zap, Database, Share2, ShieldCheck, Activity } from 'lucide-react';

export default function AdminHeader({ title, subtitle, activeTab }) {
    return (
        <div className="mb-8">
            {/* System Status Ribbon */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-full px-4 py-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Redis Cache: Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-full px-4 py-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">RabbitMQ: Event Stream Ready</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-full px-4 py-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Resilience: Circuit Breakers Up</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-full px-4 py-1.5">
                    <Database className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Sync: Neon Postgres Linked</span>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <a
                        href="/admin/orders"
                        className={`${activeTab === 'orders' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-black uppercase tracking-widest text-[10px] transition-all`}
                    >
                        Orders Fulfillment
                    </a>
                    <a
                        href="/admin/products"
                        className={`${activeTab === 'products' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-black uppercase tracking-widest text-[10px] transition-all`}
                    >
                        Product Catalog
                    </a>
                    <a
                        href="/admin/inventory"
                        className={`${activeTab === 'inventory' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-black uppercase tracking-widest text-[10px] transition-all`}
                    >
                        Inventory Levels
                    </a>
                </nav>
            </div>

            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black leading-[1.1] text-gray-900 sm:truncate flex items-center font-serif italic tracking-tighter">
                        <Activity className="w-8 h-8 mr-4 text-primary-600 not-italic hover:scale-110 transition-transform cursor-pointer" />
                        {title}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 max-w-2xl">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
}
