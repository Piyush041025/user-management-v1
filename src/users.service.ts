import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  private users: User[];

  constructor() {
    try {
      const dataBuffer = fs.readFileSync('user.json');
      const dataJson = dataBuffer.toString();
      this.users = JSON.parse(dataJson);
    } catch (err) {
      this.users = [];
      console.error('Error loading initial user data:', err);
    }
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...createUserDto,
    };
    this.users.push(user);
    this.saveToFile();
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
    };
    this.saveToFile();
    return this.users[userIndex];
  }

  remove(id: string): { message: string, statusCode: number } {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
    this.saveToFile();
    return { message: 'Successfully deleted', statusCode: 200 };
  }

  private saveToFile(): void {
    fs.writeFileSync('user.json', JSON.stringify(this.users, null, 2));
  }
}
