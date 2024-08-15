import { z } from 'zod'

export const Band = z.object({
  name: z.string(),
  recordLabel: z.string().optional(),
})

export const MusicFestival = z.object({
  name: z.string().optional(),
  bands: z.array(Band),
})

export const MusicFestivals = z.array(MusicFestival)

export type BandType = z.infer<typeof Band>
export type MusicFestivalType = z.infer<typeof MusicFestival>
export type MusicFestivalsType = z.infer<typeof MusicFestivals>
