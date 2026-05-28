import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../database/data-source.js';
import { User } from './user.entity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const SALT_ROUNDS = 10;

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(data: { name: string; email: string; password: string }) {
    const existing = await this.userRepo.findOneBy({ email: data.email });
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    const token = this.generateToken(user);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findOneBy({ email: data.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
  }
}
