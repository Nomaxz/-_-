import { germanDetails } from './germany';
import { italianDetails } from './italy';
import { canadianDetails } from './canada';
import { americanDetails } from './usa';
import { norwegianDetails } from './norway';
import type { SchoolDetail } from './types';

export const additionalSchoolDetails: Record<string, SchoolDetail> = {
  ...germanDetails,
  ...italianDetails,
  ...canadianDetails,
  ...americanDetails,
  ...norwegianDetails,
};
