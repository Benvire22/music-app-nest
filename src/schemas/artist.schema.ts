import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  photo: string;

  @Prop({ required: true })
  isPublished: boolean;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
