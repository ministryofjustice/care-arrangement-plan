import ArrangementRepository, {
  Arrangement,
} from './arrangementRepository';

const arrangementRepository = new ArrangementRepository();

const getArrangement = async (
  userId: string,
  arrangementId: string,
) => {
  return arrangementRepository.getArrangement(
    userId,
    arrangementId,
  );
};

const createArrangement = async (
  arrangement: Arrangement,
) => {
  return arrangementRepository.createArrangement(
    arrangement,
  );
};

export default {
  getArrangement,
  createArrangement,
};