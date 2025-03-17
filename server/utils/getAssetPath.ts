import path from 'path';

const getAssetPath = (fileName: string) => {
  return path.resolve(__dirname, `../assets/${fileName}`);
};

export default getAssetPath;
