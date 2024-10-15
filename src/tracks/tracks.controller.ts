import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Track, TrackDocument } from '../schemas/tracks.schema';
import { CreateTrackDto } from './create-track.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private readonly trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  async getAll(@Query('album') album: string) {
    if (album && !mongoose.isValidObjectId(album)) {
      throw new NotFoundException(`Invalid album ID!`);
    }

    return this.trackModel.find(album ? { album } : {}).sort({ number: 1 });
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  async create(@Body() track: CreateTrackDto) {
    if (!mongoose.isValidObjectId(track.album)) {
      throw new NotFoundException(`Invalid album ID!`);
    }

    return this.trackModel.create({
      album: track.album,
      name: track.name,
      length: track.length,
      number: track.number,
      isPublished: false,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException(`Invalid track ID!`);
    }

    const deletedTrack = await this.trackModel.findByIdAndDelete(id);

    if (!deletedTrack) {
      throw new NotFoundException(`Track not found!`);
    }

    return { message: 'Track was deleted successfully!' };
  }
}
