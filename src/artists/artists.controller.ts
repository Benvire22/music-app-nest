import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException(`Invalid artist ID!`);
    }

    const artist = await this.artistModel.findById(id);

    if (!artist) {
      return new NotFoundException(`Artist not found!`);
    }

    return artist;
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', { dest: './public/images' }))
  async create(
    @Body() artist: CreateArtistDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.artistModel.create({
        name: artist.name,
        description: artist.description,
        photo: file ? `images/${file.filename}` : null,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException(`Invalid artist ID!`);
    }

    const deletedArtist = await this.artistModel.findByIdAndDelete(id);

    if (!deletedArtist) {
      throw new NotFoundException(`Artist not found!`);
    }

    return { message: 'Artist was deleted successfully!' };
  }
}
