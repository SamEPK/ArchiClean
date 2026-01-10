'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Landmark, 
  TrendingUp, 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  HelpCircle,
  UserPlus
} from 'lucide-react';

export default function HomeContent() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const features = [
    {
      icon: Landmark,
      title: 'Comptes Bancaires',
      description: 'Gérez vos comptes en toute simplicité avec nos outils sécurisés.',
    },
    {
      icon: TrendingUp,
      title: 'Investissement',
      description: 'Des solutions d\'épargne performantes adaptées à votre profil.',
    },
    {
      icon: Home,
      title: 'Crédit Immobilier',
      description: 'Réalisez vos projets avec nos taux compétitifs.',
    },
    {
      icon: ShieldCheck,
      title: 'Assurances',
      description: 'Protégez ce qui compte pour vous et vos proches.',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Bar for Professional look */}
      <div className="bg-primary-800 text-white py-2 text-sm">
        <div className="container-bank flex justify-between items-center">
          <span>Espace Particuliers</span>
          <div className="space-x-4 flex items-center">
            <Link href={`/${locale}/register`} className="hover:text-primary-200 flex items-center gap-1">
              <UserPlus size={14} /> Devenir client
            </Link>
            <a href="#" className="hover:text-primary-200 flex items-center gap-1">
              <Phone size={14} /> Contact et agences
            </a>
            <a href="#" className="hover:text-primary-200 flex items-center gap-1">
               <HelpCircle size={14} /> Aide et urgence
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 relative overflow-hidden">
        <div className="container-bank py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold font-display text-primary-900 mb-6 leading-tight"
            >
              Constructeur d'avenir,<br/>
              <span className="text-secondary-600">Partenaire de confiance.</span>
            </motion.h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              La Banque AVENIR vous accompagne dans tous les moments de votre vie avec expertise et proximité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Link href={`/${locale}/register`} className="btn-bank-primary text-center">
                 Ouvrir un compte
               </Link>
               <Link href={`/${locale}/login`} className="btn-bank-secondary text-center">
                 Accéder à mes comptes
               </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
               <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-secondary-600"/> Ouverture express</span>
               <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-secondary-600"/> 100% Mobile & Agence</span>
               <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-secondary-600"/> Conseillers experts</span>
            </div>
          </div>
          
          <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl border-4 border-white">
            <img 
              src="https://loremflickr.com/1200/800/skyscraper,office?random=1"
              alt="Banque Avenir Agency"
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
             <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-wider mb-1">Depuis 1990</p>
                <p className="text-2xl font-display font-bold">Banque AVENIR</p>
             </div>
          </div>
        </div>
      </section>

      {/* Quick Access / Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-bank">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Vos besoins au quotidien
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-bank bg-white hover:border-primary-500 group cursor-pointer h-full flex flex-col items-start p-8">
                <div className="w-12 h-12 rounded-full bg-primary-50 text-2xl flex items-center justify-center mb-6 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-auto pt-6 text-primary-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  En savoir plus <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News / Institutional Section */}
      <section className="py-16 bg-white border-t border-gray-200">
          <div className="container-bank">
             <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-primary-900 rounded-xl p-8 md:p-12 text-white relative overflow-hidden h-full flex flex-col justify-center">
                   <div className="absolute inset-0 z-0">
                      <img src="https://loremflickr.com/800/600/energy,house?random=2" alt="Bureau durable" className="w-full h-full object-cover opacity-20" />
                   </div>
                   <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">Prêt Éco-Rénovation</h3>
                      <p className="text-primary-100 mb-8 text-lg">
                        Financez vos travaux d'économie d'énergie jusqu'à 50 000€ à taux 0%. 
                        Engagez-vous pour un habitat durable.
                      </p>
                      <button className="bg-white text-primary-900 px-6 py-3 rounded font-bold hover:bg-gray-100 transition-colors">
                        Simuler mon prêt
                      </button>
                   </div>
                </div>

                <div className="flex flex-col justify-center">
                   <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <TrendingUp className="text-primary-700" /> Actualités
                   </h3>
                   <div className="space-y-6">
                      {[
                        {
                          category: "Institutionnel",
                          title: "Les résultats annuels du groupe Banque AVENIR",
                          date: "10 Janvier 2026",
                          image: "https://loremflickr.com/400/400/meeting,business?random=3"
                        },
                        {
                          category: "Innovation",
                          title: "Lancement de notre nouvelle application mobile",
                          date: "5 Janvier 2026",
                          image: "https://loremflickr.com/400/400/smartphone,app?random=4"
                        },
                        {
                          category: "RSE",
                          title: "La Banque AVENIR soutient les jeunes entrepreneurs",
                          date: "28 Décembre 2025",
                          image: "https://loremflickr.com/400/400/startup,team?random=5"
                        }
                      ].map((news, i) => (
                        <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                           <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                             <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-primary-600 mb-1 uppercase tracking-wide">{news.category}</div>
                              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary-700 leading-tight">{news.title}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                {news.date}
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
      </section>

      {/* Footer Minimalist */}
      <footer className="bg-gray-100 border-t border-gray-200 py-12 text-sm text-gray-600">
         <div className="container-bank grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
               <h5 className="font-bold text-gray-900 mb-4 uppercase">À propos</h5>
               <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Qui sommes-nous ?</a></li>
                  <li><a href="#" className="hover:underline">Carrières</a></li>
                  <li><a href="#" className="hover:underline">Presse</a></li>
               </ul>
            </div>
            <div>
               <h5 className="font-bold text-gray-900 mb-4 uppercase">Sécurité</h5>
               <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Sécurité des comptes</a></li>
                  <li><a href="#" className="hover:underline">Fraude et prévention</a></li>
                  <li><a href="#" className="hover:underline">Données personnelles</a></li>
               </ul>
            </div>
             <div>
               <h5 className="font-bold text-gray-900 mb-4 uppercase">Tarifs</h5>
               <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Particuliers</a></li>
                  <li><a href="#" className="hover:underline">Professionnels</a></li>
                  <li><a href="#" className="hover:underline">Entreprises</a></li>
               </ul>
            </div>
            <div>
               <h5 className="font-bold text-gray-900 mb-4 uppercase">Aide</h5>
               <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">FAQ</a></li>
                  <li><a href="#" className="hover:underline">Contact</a></li>
                  <li><a href="#" className="hover:underline">Accessibilité</a></li>
               </ul>
            </div>
         </div>
         <div className="container-bank pt-8 border-t border-gray-200 text-center">
            <p>&copy; 2026 Banque AVENIR. Tous droits réservés.</p>
         </div>
      </footer>
    </main>
  );
}
