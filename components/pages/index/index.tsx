import {NextPage} from 'next';
import {
  Modal,
  Input,
  Button,
  Text,
  Loading,
  Table,
  Image,
  Grid,
  Container,
  Link,
} from '@nextui-org/react';
import {useHooks} from './hooks';

export const Index: NextPage = () => {
  const {
    nfts,
    alchemyAPIKey,
    contractInfo,
    selectedType,
    visible,
    status,
    closeHandler,
    handleChangeAPIKey,
    handleChangeContractAddress,
    handleSelectTrait,
  } = useHooks();

  if (status === 'initial') {
    return (
      <div>
        <Modal
          preventClose
          blur
          aria-labelledby="modal-title"
          open={visible}
          onClose={closeHandler}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              Welcome to snack 🍟
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Input
              clearable
              bordered
              fullWidth
              label="Contract Address"
              size="lg"
              placeholder="0x..."
              required
              initialValue={alchemyAPIKey}
              onChange={handleChangeContractAddress}
            />
            <Input
              clearable
              bordered
              fullWidth
              label="Alchemy API Key"
              size="lg"
              type="password"
              placeholder="Key"
              required
              initialValue={alchemyAPIKey}
              onChange={handleChangeAPIKey}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button auto onPress={closeHandler} disabled={alchemyAPIKey === ''}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  if (status === 'loading' || contractInfo == null) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Loading type="points" size="xl" />
      </div>
    );
  }

  return (
    <Container>
      <Table
        aria-label="Example table with static content"
        css={{
          height: 'auto',
          minWidth: '100%',
        }}
      >
        <Table.Header>
          <Table.Column>NAME</Table.Column>
          <Table.Column>ICON</Table.Column>
          <Table.Column>TYPE</Table.Column>
          <Table.Column>ADDRESS</Table.Column>
          <Table.Column>URL</Table.Column>
          <Table.Column>Floor</Table.Column>
        </Table.Header>
        <Table.Body>
          <Table.Row key="1">
            <Table.Cell>
              {contractInfo.name}({contractInfo.symbol})
            </Table.Cell>
            <Table.Cell>
              <Image
                src={`${contractInfo.openSea?.imageUrl}`}
                alt=""
                width={50}
                height={50}
                objectFit="cover"
              />
            </Table.Cell>
            <Table.Cell>{contractInfo.tokenType}</Table.Cell>
            <Table.Cell>
              <Link
                href={`https://etherscan.io/address/${contractInfo.address}`}
                isExternal
              >
                {contractInfo.address}
              </Link>
            </Table.Cell>
            <Table.Cell>
              <Link href={contractInfo.openSea?.externalUrl} isExternal>
                {contractInfo.openSea?.externalUrl}
              </Link>
            </Table.Cell>
            <Table.Cell>{contractInfo.openSea?.floorPrice}ETH</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {nfts?.length === 0 || nfts == null ? (
        <Grid.Container>
          <Grid xs={4}></Grid>
          <Grid xs={4}>
            <Loading />
          </Grid>
          <Grid xs={4}></Grid>
        </Grid.Container>
      ) : (
        <div>
          <Text size="$2xl">Attributes</Text>
          <Grid.Container gap={2} justify="center">
            {nfts[0].metadata?.attributes?.map((attr: any) => (
              <Grid xs key={attr.trait_type}>
                <Button
                  disabled={selectedType !== ''}
                  bordered
                  color="gradient"
                  size="lg"
                  data-type={attr.trait_type}
                  onClick={handleSelectTrait}
                >
                  {attr.trait_type}
                </Button>
              </Grid>
            ))}
          </Grid.Container>
        </div>
      )}
    </Container>
  );
};
