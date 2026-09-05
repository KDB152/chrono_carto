import React from 'react';
import { ArrowLeft, BookOpen, Shield, Lock, Eye, Database, UserCheck, Mail, Trash2 } from 'lucide-react';

const PolitiqueConfidentialite = () => {
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
            <h1 className="text-4xl font-bold text-white mb-2">Politique de confidentialité</h1>
            <p className="text-blue-200">Protection de vos données personnelles</p>
            <p className="text-sm text-white/60 mt-2">Conforme au RGPD - Dernière mise à jour : Août 2025</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            
            {/* Section 1 - Collecte des données */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">1. Données collectées</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <h3 className="text-lg font-semibold text-amber-300">1.1 Données d'inscription</h3>
                <p>Lors de votre inscription, nous collectons :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Prénom et nom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Type d'utilisateur (élève ou parent)</li>
                  <li>Mot de passe (stocké de manière sécurisée et cryptée)</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-amber-300">1.2 Données d'utilisation</h3>
                <p>Pendant votre utilisation de la plateforme :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Progression dans les cours et quiz</li>
                  <li>Historique de connexion</li>
                  <li>Messages échangés via la messagerie interne</li>
                  <li>Préférences et paramètres du compte</li>
                </ul>
              </div>
            </div>

            {/* Section 2 - Utilisation des données */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">2. Utilisation des données</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Vos données personnelles sont utilisées pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Fournir l'accès aux contenus pédagogiques</li>
                  <li>Personnaliser votre expérience d'apprentissage</li>
                  <li>Suivre vos progrès et générer des rapports pour les parents</li>
                  <li>Communiquer avec vous concernant votre utilisation de la plateforme</li>
                  <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                </ul>
                
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 mt-4">
                  <p className="text-amber-200 font-medium">
                    🔒 Engagement : Nous ne vendons jamais vos données personnelles à des tiers et ne les utilisons qu'à des fins pédagogiques.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 - Partage des données */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <UserCheck className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">3. Partage des données</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <h3 className="text-lg font-semibold text-amber-300">3.1 Partage autorisé</h3>
                <p>Vos données peuvent être partagées uniquement :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Entre élèves et leurs parents (pour le suivi des progrès)</li>
                  <li>Avec les enseignants de la plateforme (dans le cadre pédagogique)</li>
                  <li>Avec nos prestataires techniques (sous contrat de confidentialité)</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-amber-300">3.2 Obligations légales</h3>
                <p>
                  Nous pouvons divulguer vos informations si requis par la loi ou pour protéger nos droits, votre sécurité ou celle d'autrui.
                </p>
              </div>
            </div>

            {/* Section 4 - Sécurité */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">4. Sécurité des données</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Nous mettons en place des mesures de sécurité appropriées :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cryptage des mots de passe et données sensibles</li>
                  <li>Connexions sécurisées (HTTPS)</li>
                  <li>Sauvegardes régulières</li>
                  <li>Accès restreint aux données par le personnel autorisé</li>
                  <li>Surveillance des accès et détection des intrusions</li>
                </ul>
                
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mt-4">
                  <p className="text-blue-200">
                    <Shield className="w-5 h-5 inline mr-2" />
                    Nos serveurs sont hébergés en France et respectent les standards européens de protection des données.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 - Vos droits RGPD */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <UserCheck className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">5. Vos droits (RGPD)</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-semibold text-amber-300 mb-2">Droit d'accès</h4>
                    <p className="text-sm">Consulter les données que nous détenons sur vous</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-semibold text-amber-300 mb-2">Droit de rectification</h4>
                    <p className="text-sm">Corriger ou mettre à jour vos informations</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-semibold text-amber-300 mb-2">Droit à l'effacement</h4>
                    <p className="text-sm">Demander la suppression de vos données</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-semibold text-amber-300 mb-2">Droit à la portabilité</h4>
                    <p className="text-sm">Récupérer vos données dans un format lisible</p>
                  </div>
                </div>
                
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous via la messagerie interne ou par email. Nous répondrons dans un délai maximum de 30 jours.
                </p>
              </div>
            </div>

            {/* Section 6 - Conservation des données */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">6. Conservation des données</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Nous conservons vos données :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Données de compte :</strong> Pendant toute la durée d'utilisation + 3 ans après résiliation</li>
                  <li><strong>Données de progression :</strong> Jusqu'à la fin de la scolarité + 1 an</li>
                  <li><strong>Messages :</strong> 2 ans maximum</li>
                  <li><strong>Logs de connexion :</strong> 12 mois maximum</li>
                </ul>
                
                <p>
                  Passé ces délais, vos données sont automatiquement supprimées de nos systèmes, sauf obligation légale contraire.
                </p>
              </div>
            </div>

            {/* Section 7 - Cookies */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">7. Cookies et technologies similaires</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>Nous utilisons des cookies pour :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintenir votre session de connexion</li>
                  <li>Mémoriser vos préférences</li>
                  <li>Améliorer les performances de la plateforme</li>
                  <li>Analyser l'utilisation anonymisée du site</li>
                </ul>
                
                <p>
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur. Cependant, certains cookies sont nécessaires au fonctionnement de la plateforme.
                </p>
              </div>
            </div>

            {/* Section 8 - Mineurs */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <UserCheck className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">8. Protection des mineurs</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Chrono_Carto est destinée aux élèves de lycée, dont beaucoup sont mineurs. Nous accordons une attention particulière à la protection de leurs données :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Les comptes d'élèves mineurs sont liés aux comptes parents</li>
                  <li>Les parents ont accès aux données de progression de leur enfant</li>
                  <li>Aucune donnée n'est utilisée à des fins commerciales ou publicitaires</li>
                  <li>Les communications sont limitées au cadre pédagogique</li>
                </ul>
              </div>
            </div>

            {/* Section 9 - Contact DPO */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">9. Contact et réclamations</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Utiliser la messagerie interne de la plateforme</li>
                  <li>Nous contacter par email</li>
                  <li>Nous écrire par courrier postal</li>
                </ul>
                
                <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mt-4">
                  <p className="text-emerald-200">
                    <UserCheck className="w-5 h-5 inline mr-2" />
                    En cas de litige, vous avez également le droit de déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
                  </p>
                </div>
              </div>
            </div>

            {/* Section 10 - Modifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-amber-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">10. Modifications de la politique</h2>
              </div>
              <div className="text-white/90 space-y-4">
                <p>
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront notifiées aux utilisateurs par email ou via la plateforme.
                </p>
                <p>
                  Les modifications prendront effet 30 jours après leur notification. L'utilisation continue de la plateforme après ce délai constitue votre acceptation des nouvelles conditions.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                J'accepte la politique
              </a>
              <a 
                href="/conditions-utilisation"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Voir les conditions d'utilisation
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

export default PolitiqueConfidentialite;

