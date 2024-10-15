import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import mongoose, { Model } from 'mongoose';
import { CreateAlbumDto } from './create-album.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  async getAll(@Query('artist') artist: string) {
    if (artist && !mongoose.isValidObjectId(artist)) {
      throw new NotFoundException(`Invalid artist ID!`);
    }

    return this.albumModel.find(artist ? { artist } : {});
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException(`Invalid album ID!`);
    }

    return this.albumModel.findById(id).populate('artist', '_id name');
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './public/images' }))
  async create(
    @Body() album: CreateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!mongoose.isValidObjectId(album.artist)) {
      throw new NotFoundException('Invalid artist ID!');
    }

    return this.albumModel.create({
      artist: album.artist,
      name: album.name,
      releaseDate: album.releaseDate,
      image: file ? `/images/${file.filename}` : null,
      isPublished: false,
    });
  }

  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException(`Invalid album ID!`);
    }

    const deletedAlbum = this.albumModel.findByIdAndDelete(id);

    if (!deletedAlbum) {
      throw new NotFoundException(`Album not found!`);
    }

    return { message: 'Album was deleted successfully!' };
  }
}
