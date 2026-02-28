import React from 'react';
import { ArrowLeft, BookOpen, Shield, Users, FileText, AlertTriangle, Scale } from 'lucide-react';

const ConditionsUtilisation = () => {
  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 safe-top safe-bottom">
      {/* Header avec retour */}
      <div className="relative z-10 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <a 
            href="/register" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'inscription
          </a>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Conditions d'utilisation</h1>
            <p className="text-blue-200">Plateforme pédagogique Chrono_Carto</p>
            <p className="text-sm text-white/60 mt-2">Dernière mise à jour : Août 2025</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            
            {/* Section 1 - Acceptation des conditions */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Scale className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">1. Acceptation des conditions</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  En accédant et en utilisant la plateforme Chrono_Carto, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
                <p>
                  Chrono_Carto est une plateforme pédagogique destinée aux élèves préparant le baccalauréat français en Histoire-Géographie et à leurs parents.
                </p>
              </div>
            </div>

            {/* Section 2 - Description du service */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">2. Description du service</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Chrono_Carto propose :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accès à des supports de cours, fiches de synthèse et devoirs corrigés</li>
                  <li>Capsules vidéos pédagogiques</li>
                  <li>Quiz interactifs avec correction automatique</li>
                  <li>Ressources pour la préparation au baccalauréat (Grand Oral, Parcoursup, EMC)</li>
                  <li>Messagerie interne avec les enseignants</li>
                  <li>Tableau de bord personnalisé pour le suivi des progrès</li>
                </ul>
              </div>
            </div>

            {/* Section 3 - Comptes utilisateurs */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">3. Comptes utilisateurs</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <h3 className="text-lg font-semibold text-amber-300">3.1 Création de compte</h3>
                <p>
                  Pour accéder à la plateforme, vous devez créer un compte en fournissant des informations exactes et complètes. Vous vous engagez à maintenir ces informations à jour.
                </p>
                
                <h3 className="text-lg font-semibold text-amber-300">3.2 Responsabilité du compte</h3>
                <p>
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités qui se déroulent sous votre compte. Vous devez nous notifier immédiatement de toute utilisation non autorisée.
                </p>
                
                <h3 className="text-lg font-semibold text-amber-300">3.3 Types de comptes</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Comptes élèves :</strong> Accès aux contenus pédagogiques et outils d'apprentissage</li>
                  <li><strong>Comptes parents :</strong> Suivi des progrès de leur enfant et communication avec les enseignants</li>
                </ul>
              </div>
            </div>

            {/* Section 4 - Utilisation acceptable */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">4. Utilisation acceptable</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Vous vous engagez à :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Utiliser la plateforme uniquement à des fins pédagogiques</li>
                  <li>Respecter les droits d'auteur et la propriété intellectuelle</li>
                  <li>Ne pas partager vos identifiants avec des tiers</li>
                  <li>Maintenir un comportement respectueux envers les autres utilisateurs</li>
                  <li>Ne pas tenter de compromettre la sécurité de la plateforme</li>
                </ul>
                
                <p className="mt-4">Il est strictement interdit de :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Distribuer ou revendre le contenu de la plateforme</li>
                  <li>Utiliser des scripts automatisés pour accéder aux contenus</li>
                  <li>Publier du contenu inapproprié ou offensant</li>
                  <li>Perturber le fonctionnement normal de la plateforme</li>
                </ul>
              </div>
            </div>

            {/* Section 5 - Propriété intellectuelle */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">5. Propriété intellectuelle</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Tous les contenus présents sur Chrono_Carto (cours, fiches, vidéos, quiz) sont protégés par le droit d'auteur et appartiennent à leurs créateurs respectifs.
                </p>
                <p>
                  L'accès aux contenus vous est accordé uniquement pour votre usage personnel et pédagogique. Toute reproduction, distribution ou utilisation commerciale est strictement interdite sans autorisation préalable.
                </p>
              </div>
            </div>

            {/* Section 6 - Limitation de responsabilité */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">6. Limitation de responsabilité</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Chrono_Carto s'efforce de fournir un service de qualité mais ne peut garantir :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La disponibilité continue du service</li>
                  <li>L'absence d'erreurs dans les contenus</li>
                  <li>La réussite aux examens basée uniquement sur l'utilisation de la plateforme</li>
                </ul>
                <p>
                  Notre responsabilité est limitée à la fourniture d'un accès aux ressources pédagogiques. Les résultats scolaires dépendent de nombreux facteurs individuels.
                </p>
              </div>
            </div>

            {/* Section 7 - Modification des conditions */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">7. Modification des conditions</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications seront notifiées aux utilisateurs et prendront effet après un délai de 30 jours.
                </p>
                <p>
                  L'utilisation continue de la plateforme après notification des modifications constitue votre acceptation des nouvelles conditions.
                </p>
              </div>
            </div>

            {/* Section 8 - Résiliation */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">8. Résiliation</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Vous pouvez résilier votre compte à tout moment en nous contactant. Nous pouvons également suspendre ou résilier votre accès en cas de violation de ces conditions.
                </p>
                <p>
                  En cas de résiliation, votre accès aux contenus sera immédiatement suspendu, mais vos données personnelles seront conservées selon notre politique de confidentialité.
                </p>
              </div>
            </div>

            {/* Section 9 - Contact */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">9. Contact</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via la messagerie interne de la plateforme ou par email.
                </p>
                <p className="text-sm text-white/70">
                  Chrono_Carto - Plateforme pédagogique d'Histoire-Géographie
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                J'accepte les conditions
              </a>
              <a 
                href="/politique-confidentialite"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Voir la politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
      </div>
    </div>
  );
};

export default ConditionsUtilisation;

