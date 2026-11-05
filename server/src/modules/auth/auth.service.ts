import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { hashPassword, verifyPassword } from '../../utils/password';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.name);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account was registered using Google Sign-In. Please sign in with Google.',
      );
    }

    const isMatch = await verifyPassword(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.name);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async googleAuth(dto: GoogleAuthDto) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    let payload: {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    // Dev mock login bypass for development without GCP credentials
    if (
      dto.idToken === 'dev-mock-token' &&
      process.env.NODE_ENV !== 'production' &&
      dto.email
    ) {
      payload = {
        sub: `dev-google-${dto.email.toLowerCase()}`,
        email: dto.email.toLowerCase(),
        name: dto.name || dto.email.split('@')[0],
        picture: dto.avatarUrl,
        email_verified: true,
      };
    } else {
      const client = new OAuth2Client(googleClientId);
      try {
        const ticket = await client.verifyIdToken({
          idToken: dto.idToken,
          audience: googleClientId || undefined,
        });
        const googlePayload = ticket.getPayload();
        if (!googlePayload || !googlePayload.email) {
          throw new UnauthorizedException('Invalid Google token payload');
        }
        payload = {
          sub: googlePayload.sub,
          email: googlePayload.email,
          name: googlePayload.name,
          picture: googlePayload.picture,
          email_verified: googlePayload.email_verified,
        };
      } catch (err: any) {
        // Fallback: verify via Google tokeninfo endpoint
        try {
          const res = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.idToken)}`,
          );
          if (!res.ok) {
            throw new Error('Google tokeninfo endpoint returned an error');
          }
          const data = (await res.json()) as any;
          if (!data.email) {
            throw new Error('Google token contains no email');
          }
          payload = {
            sub: data.sub,
            email: data.email,
            name: data.name,
            picture: data.picture,
            email_verified:
              data.email_verified === 'true' || data.email_verified === true,
          };
        } catch {
          throw new UnauthorizedException(
            'Failed to verify Google ID token: ' +
              (err.message || 'Invalid token'),
          );
        }
      }
    }

    if (!payload.email) {
      throw new BadRequestException('Google account must provide an email');
    }

    const email = payload.email.toLowerCase();

    // Check if user exists by email or googleId
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId: payload.sub }],
      },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || payload.sub,
          avatarUrl: user.avatarUrl || payload.picture,
          isEmailVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          name: payload.name || email.split('@')[0],
          googleId: payload.sub,
          avatarUrl: payload.picture,
          isEmailVerified: true,
          passwordHash: null,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.name);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const refreshSecret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'bharatbill_jwt_refresh_secret_super_secure_key_67890',
      );

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      // Verify stored refresh token hash or match
      const isTokenValid = await verifyPassword(user.refreshToken, refreshToken);
      if (!isTokenValid) {
        // Reuse detection: Invalidate existing token
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
        throw new UnauthorizedException('Refresh token reuse detected. Please log in again.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.name);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Successfully logged out' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
        memberships: {
          where: { isActive: true },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                legalName: true,
                gstin: true,
                type: true,
                state: true,
                stateCode: true,
                logo: true,
                financialYearStart: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, name: string) {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'bharatbill_jwt_access_secret_super_secure_key_12345',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'bharatbill_jwt_refresh_secret_super_secure_key_67890',
    );
    const accessExpiry = this.configService.get<string>('ACCESS_TOKEN_EXPIRY', '15m');
    const refreshExpiry = this.configService.get<string>('REFRESH_TOKEN_EXPIRY', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, name },
        { secret: accessSecret, expiresIn: accessExpiry as any },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, name },
        { secret: refreshSecret, expiresIn: refreshExpiry as any },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await hashPassword(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}

