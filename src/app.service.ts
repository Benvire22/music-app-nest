import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Enter /artists, /albums or /tracks in address line';
  }
}
