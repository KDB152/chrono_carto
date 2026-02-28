import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Video, 
  MessageSquare, 
  Trophy,
  Clock,
  Target,
  Calendar,
  Download,
  Play
} from 'lucide-react';

export function StudentDashboard() {
  const [studentData, setStudentData] = useState({
    name: 'Jean Dupont',
    class: 'Terminale S',
    progress: 68,
    completedQuizzes: 12,
    totalQuizzes: 18,
    averageScore: 85,
    nextDeadline: 'Quiz Histoire - 15 Mars',
    recentActivities: []
  });

  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Histoire - La Révolution française',
      progress: 75,
      type: 'course',
      lastAccessed: '2025-03-10',
      duration: '45 min'
    },
    {
      id: 2,
      title: 'Géographie - Les espaces urbains',
      progress: 60,
      type: 'course',
      lastAccessed: '2025-03-08',
      duration: '30 min'
    },
    {
      id: 3,
      title: 'EMC - Citoyenneté et démocratie',
      progress: 90,
      type: 'course',
      lastAccessed: '2025-03-12',
      duration: '25 min'
    }
  ]);

  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Quiz - Révolution française',
      subject: 'Histoire',
      score: 88,
      maxScore: 100,
      completed: true,
      date: '2025-03-10'
    },
    {
      id: 2,
      title: 'Quiz - Géographie urbaine',
      subject: 'Géographie',
      score: null,
      maxScore: 100,
      completed: false,
      deadline: '2025-03-15'
    }
  ]);

  const StatCard = ({ title, value, icon: Icon, description, color = "primary" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const CourseCard = ({ course }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration}
            </CardDescription>
          </div>
          <Badge variant="secondary">{course.progress}%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={course.progress} className="w-full" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Dernière consultation: {new Date(course.lastAccessed).toLocaleDateString('fr-FR')}
            </span>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Continuer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuizCard = ({ quiz }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription>{quiz.subject}</CardDescription>
          </div>
          {quiz.completed ? (
            <Badge variant="default" className="bg-green-500">
              {quiz.score}/{quiz.maxScore}
            </Badge>
          ) : (
            <Badge variant="outline">À faire</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          {quiz.completed ? (
            <span className="text-sm text-muted-foreground">
              Complété le {new Date(quiz.date).toLocaleDateString('fr-FR')}
            </span>
          ) : (
            <span className="text-sm text-orange-600">
              Échéance: {new Date(quiz.deadline).toLocaleDateString('fr-FR')}
            </span>
          )}
          <Button size="sm" variant={quiz.completed ? "outline" : "default"}>
            {quiz.completed ? "Revoir" : "Commencer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bonjour, {studentData.name}</h1>
          <p className="text-muted-foreground">
            {studentData.class} • Continuez votre apprentissage
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Planning
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Progression globale"
          value={`${studentData.progress}%`}
          icon={Target}
          description="de vos cours complétés"
          color="green-500"
        />
        <StatCard
          title="Quiz complétés"
          value={`${studentData.completedQuizzes}/${studentData.totalQuizzes}`}
          icon={FileText}
          description="quiz terminés"
          color="blue-500"
        />
        <StatCard
          title="Moyenne générale"
          value={`${studentData.averageScore}%`}
          icon={Trophy}
          description="score moyen aux quiz"
          color="yellow-500"
        />
        <StatCard
          title="Prochaine échéance"
          value="3 jours"
          icon={Clock}
          description={studentData.nextDeadline}
          color="orange-500"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Mes Cours</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="progress">Progression</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cours en cours</h2>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Tous les cours
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quiz et évaluations</h2>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Historique
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ressources pédagogiques</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Téléchargements
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Fiches de révision</h3>
                  <p className="text-sm text-muted-foreground">15 fiches disponibles</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Video className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Capsules vidéo</h3>
                  <p className="text-sm text-muted-foreground">8 vidéos à regarder</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <BookOpen className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Devoirs corrigés</h3>
                  <p className="text-sm text-muted-foreground">12 corrections disponibles</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Votre progression</CardTitle>
              <CardDescription>
                Suivez vos progrès dans chaque matière
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
