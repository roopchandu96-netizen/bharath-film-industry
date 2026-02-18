
import { ProducerTier } from './types';

export const TIERS = [
  { name: ProducerTier.SUPPORTER, min: 100000, max: 1000000, perk: 'Digital Producer Badge & Premiere Voting' },
  { name: ProducerTier.ASSOCIATE, min: 1000001, max: 5000000, perk: 'Associate Credit & On-Set Hospitality' },
  { name: ProducerTier.CO_PRODUCER, min: 5000001, max: 50000000, perk: 'Co-Producer Poster Billing & Global Premiere' },
  { name: ProducerTier.EXECUTIVE, min: 50000001, max: 1000000000, perk: 'Executive Title & Profit Participation' }
];

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
