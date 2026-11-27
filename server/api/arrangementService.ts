import ArrangementRepository, {
  Arrangement,
} from './arrangementRepository';

const arrangementRepository =
  new ArrangementRepository();

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

const updateArrangement = async (
  arrangement: Arrangement,
) => {
  return arrangementRepository.updateArrangement(
    arrangement,
  );
};

const getArrangementsByUserId = async (
  userId: string,
) => {
  return arrangementRepository.getArrangementsByUserId(
    userId,
  );
};

export default {
  getArrangement,
  createArrangement,
  updateArrangement,
  getArrangementsByUserId,
};