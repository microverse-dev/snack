import type {FormElement} from '@nextui-org/react';
import {
  combine,
  generateClient,
  getCollectionInfo,
  getNftsForCollection,
  getOwnerForCollection,
  groupBy,
} from '@utils/api';
import type {Alchemy, NftContract} from 'alchemy-sdk';
import {useEffect, useMemo, useReducer, useState} from 'react';

export function useHooks() {
  const [alchemyAPIKey, setAlchemyAPIKey] = useState('');
  //'4lzFSt3hSevkG2fXEaHnrmPCAP7nUYlj'
  const [contractAddress, setContractAddress] = useState('');
  //'0x0BdA9d7185A9885eCb1770d4793389bE5DA2e576'
  const [visible, setVisible] = useState(true);
  const [loading, toggle] = useReducer(s => !s, false);
  const [client, setClient] = useState<Alchemy>();
  const [contractInfo, setContractInfo] = useState<NftContract>();
  const [nfts, setnfts] = useState<any[]>();
  const [selectedType, setType] = useState('');
  const [submited, submit] = useReducer(() => true, false);
  const handler = () => setVisible(true);
  const closeHandler = () => {
    submit();
    setVisible(false);
  };

  const handleChangeAPIKey = (e: React.ChangeEvent<FormElement>) => {
    setAlchemyAPIKey(e.target.value);
  };

  const handleChangeContractAddress = (e: React.ChangeEvent<FormElement>) => {
    setContractAddress(e.target.value);
  };

  const exportCSV = async (type: string) => {
    if (client == null || contractAddress == null) return;

    const owners = await getOwnerForCollection(client, contractAddress);
    const result = nfts;

    if (result == null) {
      alert('No NFTs found.');
      return;
    }

    const combined = await combine(owners, result);
    const grouped = await groupBy(type, combined);

    // all holders export
    const allHolders = owners.map(owner => {
      const {ownerAddress, tokenBalances} = owner;
      const balance = tokenBalances.reduce((acc, cur) => acc + cur.balance, 0);

      return `${ownerAddress},${balance}`;
    });

    const element = document.createElement('a');
    element.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
      allHolders.join('\n')
    )}`;
    element.setAttribute('download', 'all-holders.csv');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // grouped export
    for await (const key of Object.keys(grouped)) {
      const groupedBalance = grouped[key].reduce((acc: any, cur: any) => {
        if (cur.owners.length === 0) return;

        const {owners} = cur;

        for (const owner of owners) {
          const {owner: ownerAddress, balance} = owner;

          acc[ownerAddress] = acc[ownerAddress]
            ? acc[ownerAddress] + balance
            : balance;
        }

        return acc;
      }, {});

      const records = Object.keys(groupedBalance).map(
        o => `${o},${groupedBalance[o]}`
      );

      const element = document.createElement('a');
      element.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
        records.join('\n')
      )}`;
      element.setAttribute('download', `${key}-holders.csv`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleSelectTrait = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const type = (e.target as HTMLButtonElement).dataset.type as string;
    setType(type);
    await exportCSV(type);
  };

  const status = useMemo(() => {
    if (!submited) {
      return 'initial';
    }

    if (loading || client == null) {
      return 'loading';
    }

    return 'success';
  }, [client, loading, submited]);

  useEffect(() => {
    setClient(generateClient(alchemyAPIKey));
  }, [alchemyAPIKey]);

  useEffect(() => {
    if (client == null || contractAddress === '' || alchemyAPIKey === '') {
      return;
    }

    toggle();

    getCollectionInfo(client, contractAddress)
      .then(setContractInfo)
      .finally(toggle);

    getNftsForCollection(alchemyAPIKey, contractAddress).then(setnfts);
  }, [alchemyAPIKey, client, contractAddress]);

  return {
    nfts,
    contractInfo,
    alchemyAPIKey,
    contractAddress,
    visible,
    selectedType,
    handler,
    status,
    closeHandler,
    exportCSV,
    handleChangeAPIKey,
    handleChangeContractAddress,
    handleSelectTrait,
  };
}
