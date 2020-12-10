import {
    AddressFrozen,
    AddressUnfrozen,
    SupplyControllerSet,
    AssetProtectionRoleSet,
    Transfer as TransferEvent,
    PaxFactory as Factory
} from './types/PaxFactory/PaxFactory'
import {Supply, Token, TokenUser, Transaction, User} from './types/schema'
import {Address, BigInt, Bytes, ethereum} from '@graphprotocol/graph-ts'
import {
    ADDRESS_ZERO,
    AddressType,
    BI_ONE,
    BI_ZERO,
    ContractInfo,
    getUser,
    TokenUserRoleField,
    TransactionType
} from './helper'

let contract: Factory
let contractInfo: ContractInfo

export function handleTransfer(event: TransferEvent): void {
    initContract(event)

    //Get User Addresses
    let fromUser = getUser(event.params.from)
    let toUser = getUser(event.params.to)

    //Get Token
    let token = getToken(contractInfo.symbol, event)

    //Get TokenUser records
    let fromTokenUser = getTokenUser(token, fromUser, AddressType.From, event)
    let toTokenUser = getTokenUser(token, toUser, AddressType.To, event)


    //Create Transaction
    let trx = getTransaction(event, token, fromUser, toUser)

    //Create Supply
    let supply = getSupply(trx, token)
}

export function handleSetSupplyController(event: SupplyControllerSet): void {
    if (event.params.newSupplyController == event.params.oldSupplyController) return
    initContract(event)

    changeTokenUserRole(event.params.oldSupplyController, event.params.newSupplyController, contractInfo.symbol, TokenUserRoleField.isSupplyController)

    //Change SupplyController on Supply entity
    let supply = getSupplyInitial(contractInfo.symbol)

    supply.controllers = []
    let supplyControllerUsers = supply.controllers
    supplyControllerUsers.push(event.params.newSupplyController.toHexString())
    supply.controllers = supplyControllerUsers

    supply.save()
}

export function handleSetAssetProtectionRole(event: AssetProtectionRoleSet): void {
    if (event.params.newAssetProtectionRole == event.params.oldAssetProtectionRole) return
    initContract(event)

    changeTokenUserRole(event.params.oldAssetProtectionRole, event.params.newAssetProtectionRole, contractInfo.symbol, TokenUserRoleField.isAssetProtector)
}

export function handleAddressUnfreeze(event: AddressUnfrozen): void {
    initContract(event)

    let tokenUser = TokenUser.load(getTokenUserId(contractInfo.symbol, event.params.addr))
    if (tokenUser != null) {
        tokenUser.isFrozenBalance = false
        tokenUser.save()

        //Change Supply frozen balance
        let supply = getSupplyInitial(contractInfo.symbol)
        supply.frozen.minus(tokenUser.balance)
        supply.save()
    }
}

export function handleAddressFreeze(event: AddressFrozen): void {
    initContract(event)

    let token = getTokenInitial(contractInfo.symbol)
    let user = getUser(event.params.addr)
    let tokenUser = getTokenUserInitial(token, user)

    tokenUser.isFrozenBalance = true
    tokenUser.save()

    //Change Supply frozen balance
    let supply = getSupplyInitial(token.symbol)
    supply.frozen = supply.frozen.plus(tokenUser.balance)
    supply.save()
}

function changeTokenUserRole(oldAddress: Address, newAddress: Address, tokenSymbol: string, roleField: string): void {
    //Remove SupplyController role from old user
    let oldTokenUser = TokenUser.load(getTokenUserId(tokenSymbol, oldAddress))
    if (oldTokenUser != null) {
        if (roleField == TokenUserRoleField.isAssetProtector) {
            oldTokenUser.isAssetProtector = false;
        } else if (roleField == TokenUserRoleField.isSupplyController) {
            oldTokenUser.isSupplyController = false;
        }
        oldTokenUser.save()
    }

    //Add SupplyController role to new user
    let newToken = getTokenInitial(tokenSymbol)
    let newUser = getUser(newAddress)
    let newTokenUser = getTokenUserInitial(newToken, newUser)

    if (roleField == TokenUserRoleField.isAssetProtector) {
        newTokenUser.isAssetProtector = true;
    } else if (roleField == TokenUserRoleField.isSupplyController) {
        newTokenUser.isSupplyController = true;
    }

    newTokenUser.save()
}

function getTransaction(event: TransferEvent, token: Token, fromUser: User, toUser: User): Transaction {
    let trx = new Transaction(event.transaction.hash.toHex())
    trx.block = event.block.number
    trx.timestamp = event.block.timestamp
    trx.amount = event.params.value
    trx.fromAddr = fromUser.id
    trx.toAddr = toUser.id
    trx.token = token.id

    if (ADDRESS_ZERO == event.params.to) {
        trx.transactionType = TransactionType.Burn
    } else if (ADDRESS_ZERO == event.params.from) {
        trx.transactionType = TransactionType.Mint
    } else {
        trx.transactionType = TransactionType.Transfer
    }

    trx.save()

    return trx as Transaction
}

function getSupply(trx: Transaction, token: Token): Supply {
    let supply = getSupplyInitial(token.id)

    if (trx.transactionType == TransactionType.Mint) {
        supply.minted = supply.minted.plus(trx.amount)
        supply.total = supply.total.plus(trx.amount)
    } else if (trx.transactionType == TransactionType.Burn) {
        supply.burned = supply.burned.plus(trx.amount)
        supply.total = supply.total.minus(trx.amount)
    }
    supply.changedTimestamp = trx.transactionType == TransactionType.Mint || trx.transactionType == TransactionType.Burn ? trx.timestamp : null

    supply.save()

    return supply as Supply
}

function getSupplyInitial(tokenSymbol: string): Supply {
    let supply = Supply.load(tokenSymbol)
    if (supply == null) {
        supply = new Supply(tokenSymbol)
        supply.token = tokenSymbol
        supply.total = BI_ZERO
        supply.minted = BI_ZERO
        supply.burned = BI_ZERO
        supply.frozen = BI_ZERO

        supply.controllers = []
        let supplyControllerUsers = supply.controllers

        let supplyControllerResult = contract.try_supplyController()
        if (!supplyControllerResult.reverted) {
            supplyControllerUsers.push(getUser(supplyControllerResult.value).id)
        }
        supply.controllers = supplyControllerUsers

        supply.save()
    }

    return supply as Supply
}

function getTokenUser(token: Token, user: User, addrType: string, event: TransferEvent): TokenUser {
    let tokenUser = getTokenUserInitial(token, user)
    tokenUser.transferCount = tokenUser.transferCount.plus(BI_ONE)
    tokenUser.lastTransferTimestamp = event.block.timestamp

    if (addrType == AddressType.From) {
        tokenUser.outTransferCount = tokenUser.outTransferCount.plus(BI_ONE)
        tokenUser.totalOutcome = tokenUser.totalOutcome.plus(event.params.value)
        tokenUser.balance = tokenUser.balance.minus(event.params.value)
    } else if (addrType == AddressType.To) {
        tokenUser.inTransferCount = tokenUser.inTransferCount.plus(BI_ONE)
        tokenUser.totalIncome = tokenUser.totalIncome.plus(event.params.value)
        tokenUser.balance = tokenUser.balance.plus(event.params.value)
    }

    tokenUser.save()

    return tokenUser as TokenUser
}

function getTokenUserInitial(token: Token, user: User): TokenUser {
    let tokenUserId = getTokenUserId(token.id, user.address)
    let tokenUser = TokenUser.load(tokenUserId)
    if (tokenUser == null) {
        tokenUser = new TokenUser(tokenUserId)
        tokenUser.token = token.id
        tokenUser.user = user.id
        tokenUser.isFrozenBalance = false
        tokenUser.isSupplyController = false
        tokenUser.isAssetProtector = false
        tokenUser.transferCount = BI_ZERO
        tokenUser.inTransferCount = BI_ZERO
        tokenUser.outTransferCount = BI_ZERO
        tokenUser.balance = BI_ZERO
        tokenUser.totalIncome = BI_ZERO
        tokenUser.totalOutcome = BI_ZERO
        tokenUser.save()
    }

    return tokenUser as TokenUser
}

function getToken(tokenSymbol: string, event: TransferEvent): Token {
    let token = getTokenInitial(tokenSymbol)
    token.transfersCount = token.transfersCount.plus(BI_ONE)

    if (event.params.from != ADDRESS_ZERO) {
        token.holdersCount = token.holdersCount.plus(getNewHolderNumber(token.id, event.params.from, event.params.value.neg()))
    }
    if (event.params.to != ADDRESS_ZERO && event.params.to != event.params.from) {
        token.holdersCount = token.holdersCount.plus(getNewHolderNumber(token.id, event.params.to, event.params.value))
    }
    token.save()

    return token as Token
}

function getTokenInitial(tokenSymbol: string): Token {
    let token = Token.load(tokenSymbol)
    if (token == null) {
        token = new Token(tokenSymbol)
        token.symbol = tokenSymbol
        token.transfersCount = BI_ZERO
        token.holdersCount = BI_ZERO
    }
    token.name = contractInfo.name
    token.save()

    return token as Token
}

function getNewHolderNumber(tokenSymbol: string, userAddr: Address, amount: BigInt): BigInt {
    let newHoldersNumber = BI_ZERO

    let tokenUser = TokenUser.load(getTokenUserId(tokenSymbol, userAddr))
    let newBalance = isTokenUserExist(tokenUser) ? tokenUser.balance : BI_ZERO
    newBalance = newBalance.plus(amount)

    if (isTokenUserExist(tokenUser) && newBalance.le(BI_ZERO)) {
        newHoldersNumber = newHoldersNumber.minus(BI_ONE)
    } else if (!isTokenUserExist(tokenUser) && newBalance.gt(BI_ZERO)) {
        newHoldersNumber = newHoldersNumber.plus(BI_ONE)
    }

    return newHoldersNumber as BigInt
}

function getTokenUserId(tokenSymbol: string, userAddr: Bytes): string {
    return tokenSymbol.concat('-').concat(userAddr.toHexString())
}

function isTokenUserExist(tokenUser: TokenUser|null): boolean {
    return tokenUser != null
}

function initContract(event: ethereum.Event): void {
    contract = Factory.bind(event.address)
    contractInfo = ContractInfo.build(contract);
}

