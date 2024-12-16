export const getGoogleDriveDirectLink = (url: string) => {
  const fileIdMatch = url.match(/\/d\/(.*?)\//);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  return url;
};
