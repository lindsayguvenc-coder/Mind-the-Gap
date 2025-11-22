import { z } from "zod";

export const statisticSchema = z.object({
  value: z.string(),
  detail: z.string(),
  year: z.string().optional(),
  source: z.string().optional(),
});

export const allStatsSchema = z.object({
  paygap: statisticSchema,
  leadership: statisticSchema,
  maternal: statisticSchema,
  healthcare: statisticSchema,
  workforce: statisticSchema,
  lastUpdated: z.string(),
});

export type Statistic = z.infer<typeof statisticSchema>;
export type AllStats = z.infer<typeof allStatsSchema>;

export type CountryCode = 'global' | 'us' | 'uk' | 'canada' | 'france' | 'germany' | 'japan' | 'australia' | 'india' | 'brazil' | 'mexico' | 'south-africa' | 'sweden' | 'norway';
export type StatType = 'paygap' | 'leadership' | 'maternal' | 'healthcare' | 'workforce';
