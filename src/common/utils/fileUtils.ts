export const extractFilenameAndExtension = (fullFilename: string) => {
  const lastDotIndex = fullFilename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return { baseName: fullFilename, extension: '' };
  }
  const baseName = fullFilename.slice(0, lastDotIndex);
  const extension = fullFilename.slice(lastDotIndex + 1);
  return { baseName, extension };
};
