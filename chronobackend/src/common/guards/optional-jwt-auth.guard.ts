import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Toujours autoriser en mode développement
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      request.user = {
        id: 1,
        role: 'admin',
        email: 'admin@test.com'
      };
      return true;
    }

    // En production, vérifier le token JWT
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }

    try {
      // TODO: Implémenter la vérification JWT en production
      request.user = {
        id: 1,
        role: 'admin',
        email: 'admin@test.com'
      };
      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
