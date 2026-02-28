import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Settings, 
  Plus,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalContent: 0,
    totalQuizzes: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    // Simuler le chargement des statistiques
    setStats({
      totalUsers: 45,
      totalStudents: 32,
      totalParents: 13,
      totalContent: 28,
      totalQuizzes: 15,
      pendingApprovals: 3
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="flex items-center p-6">
        <Icon className="h-8 w-8 text-primary mr-4" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Gérez votre plateforme Chrono Carto
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          description="utilisateurs actifs"
          trend="+12% ce mois"
        />
        <StatCard
          title="Étudiants"
          value={stats.totalStudents}
          icon={Users}
          description="étudiants inscrits"
          trend="+8% ce mois"
        />
        <StatCard
          title="Contenus"
          value={stats.totalContent}
          icon={BookOpen}
          description="cours et ressources"
          trend="+5 cette semaine"
        />
        <StatCard
          title="Quiz"
          value={stats.totalQuizzes}
          icon={FileText}
          description="quiz disponibles"
          trend="+2 cette semaine"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="content">Contenus</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Ajouter du contenu"
              description="Créer un nouveau cours ou ressource"
              icon={Plus}
              onClick={() => console.log('Ajouter contenu')}
            />
            <QuickAction
              title="Gérer les utilisateurs"
              description="Approuver ou modifier les comptes"
              icon={Users}
              onClick={() => console.log('Gérer utilisateurs')}
            />
            <QuickAction
              title="Créer un quiz"
              description="Ajouter un nouveau quiz interactif"
              icon={FileText}
              onClick={() => console.log('Créer quiz')}
            />
            <QuickAction
              title="Messages"
              description="Consulter les messages des étudiants"
              icon={MessageSquare}
              onClick={() => console.log('Messages')}
            />
            <QuickAction
              title="Planifier"
              description="Gérer le calendrier des cours"
              icon={Calendar}
              onClick={() => console.log('Planifier')}
            />
            <QuickAction
              title="Rapports"
              description="Voir les statistiques détaillées"
              icon={TrendingUp}
              onClick={() => console.log('Rapports')}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Les dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau étudiant inscrit</p>
                    <p className="text-xs text-muted-foreground">Marie Dupont - il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau contenu ajouté</p>
                    <p className="text-xs text-muted-foreground">Cours sur la Révolution française - il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Quiz complété</p>
                    <p className="text-xs text-muted-foreground">Pierre Martin - Quiz Histoire - il y a 6 heures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérer les comptes étudiants et parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des utilisateurs à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du contenu</CardTitle>
              <CardDescription>
                Gérer les cours, ressources et quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion du contenu à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques</CardTitle>
              <CardDescription>
                Statistiques détaillées de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface d'analytiques à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
