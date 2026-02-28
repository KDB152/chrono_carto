'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, UserPlus, Users } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';
import { validateForm, registerSchema, validatePasswordMatch } from '@/lib/validations';
import { RegisterData } from '@/types/auth';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, registerSchema);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check password match
    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Les mots de passe ne correspondent pas',
      }));
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.register(formData);
      
      if (response.success) {
        addToast({
          type: 'success',
          title: 'Inscription réussie',
          message: 'Votre compte a été créé avec succès. Vérifiez votre email pour activer votre compte.',
          duration: 7000,
        });
        
        // Redirect to login page
        router.push('/login?message=registration-success');
      } else {
        // Handle server-side validation errors
        if (response.errors) {
          setErrors(response.errors as unknown as Record<string, string>);
        } else {
        addToast({
          type: 'error',
          title: 'Erreur d\'inscription',
          message: response.message || 'Impossible de créer votre compte. Veuillez réessayer.',
        });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: 'Impossible de se connecter. Vérifiez votre connexion internet.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" variant="elevated">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gradient">
          Inscription
        </CardTitle>
        <CardDescription>
          Créez votre compte Chrono-Carto
        </CardDescription>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de compte <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${formData.role === 'student' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">Élève</span>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={formData.role === 'parent'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${formData.role === 'parent' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium">Parent</span>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              leftIcon={<User size={20} />}
              placeholder="Prénom"
              required
              fullWidth
            />

            <Input
              label="Nom"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              leftIcon={<User size={20} />}
              placeholder="Nom"
              required
              fullWidth
            />
          </div>

          <Input
            label="Adresse email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            leftIcon={<Mail size={20} />}
            placeholder="votre@email.com"
            required
            fullWidth
          />

          <Input
            label="Téléphone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            leftIcon={<Phone size={20} />}
            placeholder="06 12 34 56 78"
            required
            fullWidth
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            leftIcon={<Lock size={20} />}
            placeholder="Mot de passe"
            helperText="Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
            required
            fullWidth
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            leftIcon={<Lock size={20} />}
            placeholder="Confirmer le mot de passe"
            required
            fullWidth
          />

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="text-sm text-gray-600">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  politique de confidentialité
                </Link>
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="mt-2 text-sm text-red-600">{errors.acceptTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={!isLoading && <UserPlus size={20} />}
          >
            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default RegisterForm;



