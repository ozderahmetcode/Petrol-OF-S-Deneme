import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // Mock user DB
    const users = [
      { id: '1', username: 'admin', password: 'password', role: 'ADMIN' },
      { id: '2', username: 'kasiyer1', password: 'password', role: 'CASHIER' }
    ];

    const user = users.find(u => u.username === username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }
}
