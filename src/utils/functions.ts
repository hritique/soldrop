import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

export const getConnection = (endpoint: Cluster) => {
  switch (endpoint) {
    case 'mainnet-beta':
      return new Connection(
        `https://solana--mainnet.datahub.figment.io/apikey/${process.env.REACT_APP_FIGMENT_DATAHUB_API_KEY}`
      );

    case 'devnet':
      return new Connection(
        `https://solana--devnet.datahub.figment.io/apikey/${process.env.REACT_APP_FIGMENT_DATAHUB_API_KEY}`
      );

    case 'testnet':
      return new Connection(clusterApiUrl('testnet'));

    default:
      return new Connection(clusterApiUrl());
  }
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

export const wait = async (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

export const addDecimalNumberStrings = (
  strings: string[],
  decimals: number = 9
) => {
  return strings.reduce((prev, curr) => {
    return Number((prev + Number(curr)).toFixed(decimals));
  }, 0);
};

export const batchRequests = async <T, Y>(
  iterator: Array<T>,
  batchVolume: number,
  waitTime: number,
  asyncFunction: (arg: T, index: number) => Promise<Y>
) => {
  let responses: Array<Y | undefined> = [];
  for (let i = 0; i < iterator.length; i += batchVolume) {
    responses.push(
      ...(
        await Promise.allSettled(
          iterator.slice(i, i + batchVolume).map((a) => asyncFunction(a, i))
        )
      ).map((p) => {
        return p.status === 'fulfilled' ? p.value : undefined;
      })
    );
    await wait(waitTime);
  }

  return responses;
};
