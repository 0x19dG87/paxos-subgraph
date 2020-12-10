# Paxos Ecosystem Subgraph

The subgraph exposes a GraphQL endpoint to query the events and entities within Smart Contracts ecosystem $PAX, $PAXG, $BUSD 3 in 1
- transaction data
- token information per user
- supply information
- minted, burned, frozen amount
- different aggregated information
- etc

Stablecoins
----
- Paxos Standard (PAX) - USD Stablecoin *0x8e870d67f660d95d5be530380d0ec0bd388289e1*
<br/>Paxos Standard is regulated crypto asset fully collateralized 1:1 by the U.S. dollar, approved and regulated by the NYDFS.
https://github.com/paxosglobal/pax-contracts

- PAX Gold (PAXG) - Tokenized Gold *0x45804880de22913dafe09f4980848ece6ecbaf78*
<br/>PAX Gold (PAXG) tokens each represent one fine troy ounce of an LBMA-certified, London Good Delivery physical gold bar, secured in Brink’s vaults.
https://github.com/paxosglobal/paxos-gold-contract

- Binance USD (BUSD) - USD Stablecoin *0x4fabb145d64652a948d72533023f6e7a623c7c53*
<br/>Binance USD(BUSD) is an ERC20 token that is Centrally Minted and Burned by Paxos, representing the trusted party backing the token with USD.
https://github.com/paxosglobal/busd-contract

Queries
----
Below are several examples of different queries that can be used locally or in The Graph Explorer playground. There are many other ways filtering, sorting, subquerying information. Just check [The Graph Documentation](https://thegraph.com/docs/graphql-api)

### Entities 

**User**
<br/>Contains all users interacting with Paxos powered tokens (PAX, BUSD, PAXG) and their inbound and outbound transactions

**Token**
<br/>Contains data of one of the Paxos powered tokens. Here you can find some aggregated information about transactions and holders per each token.

**TokenUser**
<br/>Contains information about each User per Token: balance, tokens flow (inbound, outbound), etc

**Supply**
<br/>Contains supply information for each Token. You can find here what is the total supply for the particular token, how many tokens are minted, burned and frozen presently.

**Transaction**
<br/>Every transaction of Paxos powered token is stored here.

### Examples

```
{
  supply(id: "PAX") {
    controllers(first: 10) {
      address
    }
    minted
    burned
    frozen
    total
  }
}
```
```
{
  tokenUsers(where: {token: "PAX", isSupplyController: true}) {
    user {
      address
    }
    isFrozenBalance
    isAssetProtector
    isSupplyController
    transferCount
    inTransferCount
    outTransferCount
    balance
    totalIncome
    totalOutcome
  }
}
```
```
{
  transactions(first: 10, orderBy: timestamp, orderDirection: desc, where: {transactionType: Burn}) {
    block
    timestamp
    id
    fromAddr {
      id
    }
    amount
  }
}
```
```
{
  token(id: "PAX") {
    name
    transfersCount
    holdersCount
    transactions(skip: 10, first: 10, where: {block_gt: 6800000}) {
      id
      block
      timestamp
      fromAddr {
        id
      }
      toAddr {
        id
      }
      amount
    }
  }
}
```
```
{
  users(first: 10) {
    address
    outTransactions(orderBy: timestamp, orderDirection: desc, first: 10, where: {transactionType: Transfer}) {
      id
      block
      timestamp
      toAddr {
        id
      }
      amount
    }
  }
}

```
### Request Example
```
curl \
-X POST \
-H "Content-Type: application/json" \
--data '{ "query": "{ tokenUsers(where: {isSupplyController: true}){user {address} balance totalIncome totalOutcome}}" }' \
https://api.thegraph.com/subgraphs/name/0x19dg87/paxos-powered-tokens
```

Todos
----

License
----
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)