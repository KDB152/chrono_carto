'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { validateForm, forgotPasswordSchema } from '@/lib/validations';
import { ForgotPasswordData } from '@/types/auth';

const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, forgotPasswordSchema);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.forgotPassword(formData.email);
      console.log('Forgot password response:', response);
      
      if (response && response.success) {
        setIsEmailSent(true);
        addToast({
          type: 'success',
          title: 'Email envoyé',
          message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
          duration: 7000,
        });
      } else {
        // Handle server-side validation errors
        if (response?.errors) {
          setErrors(response.errors as unknown as Record<string, string>);
        } else {
          addToast({
            type: 'error',
            title: 'Erreur',
            message: response?.message || 'Une erreur est survenue lors de l\'envoi de l\'email.',
          });
        }
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data
      });
      
      // Extraire le message d'erreur du backend
      // NestJS retourne { message: "...", statusCode: 404, error: "..." }
      const errorMessage = error?.message || 
                          error?.data?.message || 
                          'Impossible de se connecter au serveur. Veuillez réessayer.';
      
      addToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage,
      });
      
      // Si c'est une erreur liée à l'email, l'afficher aussi dans le champ
      if (errorMessage.includes('aucun compte') || 
          errorMessage.includes('adresse e-mail') || 
          errorMessage.includes('compte lié') ||
          errorMessage.includes("n'est associée")) {
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.forgotPassword(formData.email);
      if (response.success) {
        addToast({
          type: 'success',
          title: 'Email renvoyé',
          message: 'Un nouvel email de réinitialisation a été envoyé.',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Impossible de renvoyer l\'email.';
      addToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full max-w-md mx-auto" variant="elevated">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Email envoyé !
          </CardTitle>
          <CardDescription>
            Vérifiez votre boîte de réception
          </CardDescription>
        </CardHeader>

        <CardBody className="text-center space-y-6">

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleResendEmail}
              isLoading={isLoading}
              leftIcon={!isLoading && <Send size={20} />}
            >
              {isLoading ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => router.push('/login')}
              leftIcon={<ArrowLeft size={20} />}
            >
              Retour à la connexion
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Le lien de réinitialisation expire dans 1 heure pour des raisons de sécurité.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="elevated">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gradient">
          Mot de passe oublié
        </CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Adresse email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            leftIcon={<Mail size={20} />}
            placeholder="votre@email.com"
            helperText="Nous vous enverrons un lien pour réinitialiser votre mot de passe"
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={!isLoading && <Send size={20} />}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour à la connexion
          </Link>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note de sécurité :</strong> Le lien de réinitialisation sera valide pendant 1 heure uniquement.
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ForgotPasswordForm;

