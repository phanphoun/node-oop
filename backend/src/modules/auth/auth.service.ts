import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../database/data-source.js';
import { User } from './user.entity.js';
import { UserRole } from '../../constants/roles.enum.js';
import { env } from '../../config/env.config.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { UnauthorizedError } from '../../core/errors/unauthorized.error.js';

const SALT_ROUNDS = 10;

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    address?: string;
  }) {
    const existing = await this.userRepo.findOneBy({ email: data.email });
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.Buyer,
      phone: data.phone || null,
      address: data.address || null,
    });

    await this.userRepo.save(user);

    const token = this.generateToken(user);

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findOneBy({ email: data.email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.status) {
      throw new UnauthorizedError('Account is suspended');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.toPublicUser(user);
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string | null; address?: string | null },
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.name !== undefined) {
      user.name = data.name;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone;
    }
    if (data.address !== undefined) {
      user.address = data.address;
    }

    await this.userRepo.save(user);
    return this.toPublicUser(user);
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' },
    );
  }
}
