import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from './register-user.dto';

@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post()
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    let role = 'user';

    if (registerUserDto.role === 'admin') {
      role = 'admin';
    }

    const user = new this.userModel({
      email: registerUserDto.email,
      password: registerUserDto.password,
      displayName: registerUserDto.displayName,
      role,
    });
    user.generateToken();

    return await user.save();
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async login(@Req() req: Request) {
    return req.user;
  }

  @Delete()
  async logout(@Req() req: Request) {
    const headerValue = req.get('Authorization');

    if (!headerValue) {
      return;
    }

    const [, token] = headerValue.split(' ');

    if (!token) {
      return;
    }

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return;
    }

    user.generateToken();
    await user.save();

    return;
  }
}
