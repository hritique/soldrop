import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

export const getConnection = (endpoint: Cluster) => {
  return new Connection(clusterApiUrl(endpoint));
};

export const getExplorerLink = (id: string, entity: string = 'tx') => {
  return `https://explorer.solana.com/${entity}/${id}?cluster=${process.env.REACT_APP_SOLANA_CLUSTER}`;
};

export const downloadFile = async (data: string, fileName: string) => {
  const aTag = document.createElement('a');
  aTag.style.display = 'none';
  document.body.appendChild(aTag);
  const blob = new Blob([data], { type: 'octet/stream' });
  const downloadUrl = window.URL.createObjectURL(blob);
  aTag.href = downloadUrl;
  aTag.download = fileName;
  aTag.click();
  window.URL.revokeObjectURL(downloadUrl);
  aTag.remove();
};

export const addDecimalNumberStrings = (
  strings: string[],
  decimals: number = 9
) => {
  return strings.reduce((prev, curr) => {
    return Number((prev + Number(curr)).toFixed(decimals));
  }, 0);
};
