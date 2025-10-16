import { Controller, Post, Body } from '@nestjs/common';
import { InMemoryAdminRepository } from '../../../infrastructure/repositories/in-memory/InMemoryAdminRepository';
import { AuthenticateDirector } from '../../../application/use-cases/AuthenticateDirector';
import { BankDirector } from '../../../domain/entities/BankDirector';

@Controller('admin')
export class AdminController {
  private adminRepo = new InMemoryAdminRepository();
  private authUseCase = new AuthenticateDirector(this.adminRepo);

  @Post('register')
  async register(@Body() body: { id: string; email: string; password: string; firstName: string; lastName: string }) {
    const director = new BankDirector({
      id: body.id,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
    });
    await this.authUseCase.register(director);
    return { ok: true };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const d = await this.authUseCase.execute(body.email, body.password);
    if (!d) return { ok: false };
    return { ok: true, director: { id: d.id, email: d.email, firstName: d.firstName, lastName: d.lastName } };
  }
}
