import { flatten } from 'lodash';
import { log } from '../logger';
import VolunteerModel, { Volunteer, Reference } from '../../models/Volunteer';
import UserService from '../../services/UserService';
import { REFERENCE_STATUS } from '../../constants';

interface UnsentReference {
  reference: Reference;
  volunteer: Volunteer;
}

export default async (): Promise<void> => {
  const volunteers = (await VolunteerModel.find({
    'references.status': REFERENCE_STATUS.UNSENT
  })
    .lean()
    .exec()) as Volunteer[];

  const unsent: UnsentReference[] = flatten(
    volunteers.map(vol => {
      return vol.references
        .filter(ref => ref.status === REFERENCE_STATUS.UNSENT)
        .map(ref => ({
          reference: ref,
          volunteer: vol
        }));
    })
  );

  if (unsent.length === 0) return log('No references to email');

  for (const u of unsent) {
    try {
      await UserService.notifyReference({
        reference: u.reference,
        volunteer: u.volunteer
      });
    } catch (error) {
      log(`Error notifying reference ${u.reference._id}: ${error}`);
    }
  }

  return log(`Emailed ${unsent.length} references`);
};
