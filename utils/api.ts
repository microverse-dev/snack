import {Alchemy, Network, NftContractOwner} from 'alchemy-sdk';

export function generateClient(
  apiKey: string,
  network: Network = Network.ETH_MAINNET
): Alchemy {
  return new Alchemy({
    apiKey,
    network,
  });
}

export async function getCollectionInfo(
  client: Alchemy,
  contractAddress: string
) {
  const res = await client.nft.getContractMetadata(contractAddress);

  return res;
}

export async function getNftsForCollection(
  apiKey: string,
  contractAddress: string,
  prevToken?: string,
  prevData = []
): Promise<any> {
  let result = prevData;
  const searchParams = new URLSearchParams();
  searchParams.append('contractAddress', contractAddress);
  searchParams.append('withMetadata', 'true');

  if (prevToken != null) {
    searchParams.append('startToken', prevToken);
  }

  // TODO: can switch to other blockchains
  const res = await fetch(
    `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTsForCollection?${searchParams.toString()}`
  );

  const {nfts, nextToken} = await res.json();

  result = result.concat(nfts);

  if (nextToken == null) {
    return result;
  }

  return await getNftsForCollection(apiKey, contractAddress, nextToken, result);
}

export async function getOwnerForCollection(
  client: Alchemy,
  contractAddress: string
) {
  const {owners} = await client.nft.getOwnersForContract(contractAddress, {
    withTokenBalances: true,
  });

  return owners;
}

export async function combine(owners: NftContractOwner[], result: any[]) {
  const combined = [];

  for (const nft of result) {
    const holders = [];

    for (const owner of owners) {
      for (const tokenBalance of owner.tokenBalances) {
        if (tokenBalance.tokenId === nft.id.tokenId) {
          holders.push({
            owner: owner.ownerAddress,
            balance: tokenBalance.balance,
          });
        }
      }
    }

    combined.push({
      ...nft,
      owners: holders,
    });
  }

  return combined;
}

export async function groupBy(trait: string, combined: any[]) {
  return combined.reduce((acc, nft) => {
    const attribute = nft.metadata.attributes.find(
      (a: any) => a.trait_type === trait
    );
    const key = attribute?.value ?? 'Unknown';

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(nft);

    return acc;
  }, {});
}
