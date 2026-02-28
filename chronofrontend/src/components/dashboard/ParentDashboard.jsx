import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Trophy,
  Clock,
  Target,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export function ParentDashboard() {
  const [parentData, setParentData] = useState({
    name: 'Marie Dupont',
    children: [
      {
        id: 1,
        name: 'Jean Dupont',
        class: 'Terminale S',
        progress: 68,
        averageScore: 85,
        lastActivity: '2025-03-12',
        upcomingDeadlines: 2,
        recentScores: [88, 92, 76, 85, 90]
      },
      {
        id: 2,
        name: 'Sophie Dupont',
        class: '1ere ES',
        progress: 72,
        averageScore: 78,
        lastActivity: '2025-03-11',
        upcomingDeadlines: 1,
        recentScores: [82, 75, 88, 79, 85]
      }
    ]
  });

  const [selectedChild, setSelectedChild] = useState(parentData.children[0]);

  const StatCard = ({ title, value, icon: Icon, description, color = "primary", alert = false }) => (
    <Card className={alert ? "border-orange-200 bg-orange-50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${alert ? 'text-orange-500' : `text-${color}`}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${alert ? 'text-orange-600' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );

  const ChildCard = ({ child, isSelected, onClick }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{child.name}</CardTitle>
            <CardDescription>{child.class}</CardDescription>
          </div>
          <Badge variant={child.progress >= 70 ? "default" : "secondary"}>
            {child.progress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={child.progress} className="w-full" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Moyenne: {child.averageScore}%</span>
            <span className="text-muted-foreground">
              {child.upcomingDeadlines} échéance{child.upcomingDeadlines > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-4 p-3 rounded-lg border">
      <div className={`w-2 h-2 rounded-full ${
        activity.type === 'quiz' ? 'bg-blue-500' : 
        activity.type === 'course' ? 'bg-green-500' : 'bg-orange-500'
      }`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {activity.time}
      </div>
    </div>
  );

  const recentActivities = [
    {
      type: 'quiz',
      title: 'Quiz Histoire complété',
      description: 'Révolution française - Score: 88/100',
      time: 'il y a 2h'
    },
    {
      type: 'course',
      title: 'Cours consulté',
      description: 'Géographie - Les espaces urbains',
      time: 'il y a 5h'
    },
    {
      type: 'deadline',
      title: 'Échéance approche',
      description: 'Quiz Géographie dans 2 jours',
      time: 'Rappel'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bonjour, {parentData.name}</h1>
          <p className="text-muted-foreground">
            Suivez les progrès de vos enfants
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contacter le professeur
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Planning
          </Button>
        </div>
      </div>

      {/* Children Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mes enfants</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {parentData.children.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              isSelected={selectedChild.id === child.id}
              onClick={() => setSelectedChild(child)}
            />
          ))}
        </div>
      </div>

      {/* Selected Child Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Tableau de bord - {selectedChild.name}</h2>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Progression globale"
            value={`${selectedChild.progress}%`}
            icon={Target}
            description="des cours complétés"
            color="green-500"
          />
          <StatCard
            title="Moyenne générale"
            value={`${selectedChild.averageScore}%`}
            icon={Trophy}
            description="score moyen aux évaluations"
            color="blue-500"
          />
          <StatCard
            title="Dernière activité"
            value="Hier"
            icon={Clock}
            description={`Le ${new Date(selectedChild.lastActivity).toLocaleDateString('fr-FR')}`}
            color="purple-500"
          />
          <StatCard
            title="Échéances"
            value={selectedChild.upcomingDeadlines}
            icon={AlertCircle}
            description="à venir cette semaine"
            color="orange-500"
            alert={selectedChild.upcomingDeadlines > 0}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="progress">Progression</TabsTrigger>
            <TabsTrigger value="grades">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Progression par matière</CardTitle>
                  <CardDescription>
                    Avancement dans chaque discipline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Histoire</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Géographie</span>
                        <span className="text-sm text-muted-foreground">60%</span>
                      </div>
                      <Progress value={60} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">EMC</span>
                        <span className="text-sm text-muted-foreground">90%</span>
                      </div>
                      <Progress value={90} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>
                    Les dernières actions de {selectedChild.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Échéances à venir</CardTitle>
                <CardDescription>
                  Quiz et devoirs à rendre prochainement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Quiz Géographie</p>
                        <p className="text-sm text-muted-foreground">Les espaces urbains</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Dans 2 jours
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Devoir Histoire</p>
                        <p className="text-sm text-muted-foreground">Analyse de document</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Dans 5 jours
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des progrès</CardTitle>
                <CardDescription>
                  Suivi détaillé de la progression de {selectedChild.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Graphiques de progression à implémenter...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Historique des notes</CardTitle>
                <CardDescription>
                  Toutes les évaluations de {selectedChild.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tableau des notes à implémenter...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Journal d'activité</CardTitle>
                <CardDescription>
                  Historique complet des activités de {selectedChild.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Journal d'activité détaillé à implémenter...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
