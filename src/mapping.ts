import {
    AddressFrozen,
    AddressUnfrozen,
    SupplyControllerSet,
    AssetProtectionRoleSet,
    Transfer as TransferEvent,
    PaxFactory as Factory
} from './types/PaxFactory/PaxFactory'
import {Supply, Token, TokenUser, Transaction, User} from './types/schema'
import {Address, BigInt, Bytes} from '@graphprotocol/graph-ts'
import {ADDRESS_ZERO, AddressType, BI_ONE, BI_ZERO, getUser, TokenUserRoleField, TransactionType} from './helper'

let contract: Factory

export function handleTransfer(event: TransferEvent): void {

    contract = Factory.bind(event.address)

    //Get User Addresses
    let fromUser = getUser(event.params.from)
    let toUser = getUser(event.params.to)

    //Get Token
    let token = getToken(event)

    //Get TokenUser records
    let fromTokenUser = getTokenUser(token, fromUser, AddressType.From, event.params.value)
    let toTokenUser = getTokenUser(token, toUser, AddressType.To, event.params.value)


    //Create Transaction
    let trx = getTransaction(event, token, fromUser, toUser)

    //Create Supply
    let supply = getSupply(trx, token)
}

export function handleSetSupplyController(event: SupplyControllerSet): void {
    if (event.params.newSupplyController == event.params.oldSupplyController) return

    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    changeTokenUserRole(event.params.oldSupplyController, event.params.newSupplyController, tokenSymbol, TokenUserRoleField.isSupplyController)

    //Change SupplyController on Supply entity
    let supply = getSupplyInitial(tokenSymbol)

    supply.controllers = []
    let supplyControllerUsers = supply.controllers
    supplyControllerUsers.push(event.params.newSupplyController.toHexString())
    supply.controllers = supplyControllerUsers

    supply.save()
}

export function handleSetAssetProtectionRole(event: AssetProtectionRoleSet): void {
    if (event.params.newAssetProtectionRole == event.params.oldAssetProtectionRole) return

    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    changeTokenUserRole(event.params.oldAssetProtectionRole, event.params.newAssetProtectionRole, tokenSymbol, TokenUserRoleField.isAssetProtector)
}

export function handleAddressUnfreeze(event: AddressUnfrozen): void {
    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    let tokenUser = TokenUser.load(getTokenUserId(tokenSymbol, event.params.addr))
    if (tokenUser != null) {
        tokenUser.isFrozenBalance = false
        tokenUser.save()

        //Change Supply frozen balance
        let supply = getSupplyInitial(tokenSymbol)
        supply.frozen.minus(tokenUser.balance)
        supply.save()
    }
}

export function handleAddressFreeze(event: AddressFrozen): void {
    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    let token = getTokenInitial(tokenSymbol)
    let user = getUser(event.params.addr)
    let tokenUser = getTokenUserInitial(token, user)

    tokenUser.isFrozenBalance = true
    tokenUser.save()

    //Change Supply frozen balance
    let supply = getSupplyInitial(token.symbol)
    supply.frozen.plus(tokenUser.balance)
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
    let supply = getSupplyInitial(token.symbol)

    if (trx.transactionType == TransactionType.Mint) {
        supply.minted.plus(trx.amount)
        supply.total.plus(trx.amount)
    } else if (trx.transactionType == TransactionType.Burn) {
        supply.burned.plus(trx.amount)
        supply.total.minus(trx.amount)
    }

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

function getTokenUser(token: Token, user: User, addrType: string, amount: BigInt): TokenUser {
    let tokenUser = getTokenUserInitial(token, user)
    tokenUser.transferCount.plus(BI_ONE)

    if (addrType == AddressType.From) {
        tokenUser.outTransferCount.plus(BI_ONE)
        tokenUser.totalOutcome.plus(amount)
        tokenUser.balance.minus(amount)
    } else if (addrType == AddressType.To) {
        tokenUser.inTransferCount.plus(BI_ONE)
        tokenUser.totalIncome.plus(amount)
        tokenUser.balance.plus(amount)
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
        let supplyControllerResult = contract.try_supplyController()
        tokenUser.isSupplyController = !supplyControllerResult.reverted && supplyControllerResult.value == user.address
        let assetProtectorResult = contract.try_assetProtectionRole()
        tokenUser.isAssetProtector = !assetProtectorResult.reverted && assetProtectorResult.value == user.address
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

function getToken(event: TransferEvent): Token {
    let tokenSymbol = contract.symbol()

    let token = getTokenInitial(tokenSymbol)
    token.transfersCount.plus(BI_ONE)

    if (event.params.from != ADDRESS_ZERO) {
        token.holdersCount.plus(getNewHolderNumber(tokenSymbol, event.params.from))
    }
    if (event.params.to != ADDRESS_ZERO && event.params.to != event.params.from) {
        token.holdersCount.plus(getNewHolderNumber(tokenSymbol, event.params.to))
    }

    token.save()

    return token as Token
}

function getTokenInitial(tokenSymbol: string): Token {
    let token = Token.load(tokenSymbol)
    if (token == null) {
        token = new Token(tokenSymbol)
        token.symbol = tokenSymbol
        token.name = contract.name()
        token.transfersCount = BI_ZERO
        token.holdersCount = BI_ZERO
        token.save()
    }

    return token as Token
}

function getNewHolderNumber(tokenSymbol: string, userAddr: Address): BigInt {
    let newHoldersNumber = BI_ZERO

    let userHadToken = isUserHadToken(tokenSymbol, userAddr)
    let balance = contract.balanceOf(userAddr)

    if (BI_ZERO.equals(balance) && userHadToken) {
        newHoldersNumber.minus(BI_ONE)
    } else if (BI_ZERO.notEqual(balance) && !userHadToken) {
        newHoldersNumber.plus(BI_ONE)
    }

    return newHoldersNumber as BigInt
}

function getTokenUserId(tokenSymbol: string, userAddr: Bytes): string {
    return tokenSymbol.concat('-').concat(userAddr.toHexString())
}

function isUserHadToken(tokenSymbol: string, userAddr: Address): boolean {
    return TokenUser.load(getTokenUserId(tokenSymbol, userAddr)) != null
}

