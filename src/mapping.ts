import {
    AddressFrozen,
    AddressUnfrozen,
    SupplyControllerSet,
    AssetProtectionRoleSet,
    FrozenAddressWiped,
    Transfer as TransferEvent
} from './types/PAX/Pax'
import {Factory} from "./types/Factory/Factory"
import {Supply, Token, TokenUser, Transaction, User} from './types/schema'
import {Address, BigInt} from '@graphprotocol/graph-ts'
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
    if (event.params.newSupplyController.toHexString() == event.params.oldSupplyController.toHexString()) return

    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    changeTokenUserRole(event.params.oldSupplyController, event.params.newSupplyController, tokenSymbol, TokenUserRoleField.isSupplyController)

    //Change SupplyController on Supply entity
    let supply = Supply.load(tokenSymbol)
    if (supply != null) {
        supply.controllers = []
        let supplyControllerUsers = supply.controllers
        supplyControllerUsers.push(event.params.newSupplyController.toHexString())
        supply.controllers = supplyControllerUsers

        supply.save()
    }
}

export function handleSetAssetProtectionRole(event: AssetProtectionRoleSet): void {
    if (event.params.newAssetProtectionRole.toHexString() == event.params.oldAssetProtectionRole.toHexString()) return

    contract = Factory.bind(event.address)
    let tokenSymbol = contract.symbol()

    changeTokenUserRole(event.params.oldAssetProtectionRole, event.params.newAssetProtectionRole, tokenSymbol, TokenUserRoleField.isAssetProtector)
}


export function handleAddressUnfreeze(event: AddressUnfrozen): void {

}

export function handleAddressFreeze(event: AddressFrozen): void {

}

export function handleWipeFrozenAddress(event: FrozenAddressWiped): void {

}

function changeTokenUserRole(oldAddress: Address, newAddress: Address, tokenSymbol: string, roleField: TokenUserRoleField): void {
    //Remove SupplyController role from old user
    let oldTokenUser = TokenUser.load(getTokenUserId(tokenSymbol, oldAddress))
    if (oldTokenUser != null) {
        oldTokenUser[roleField.toString()] = false
        oldTokenUser.save()
    }

    //Add SupplyController role to new user
    let newToken = getTokenInitial(tokenSymbol)
    let newUser = getUser(newAddress)
    let newTokenUser = getTokenUserInitial(newToken, newUser)

    newTokenUser[roleField.toString()] = true
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

    switch (ADDRESS_ZERO) {
        case event.params.to.toHexString(): {
            trx.transactionType = TransactionType.Burn.toString()
            break
        }
        case event.params.from.toHexString(): {
            trx.transactionType = TransactionType.Mint.toString()
            break
        }
        default: {
            trx.transactionType = TransactionType.Transfer.toString()
            break
        }
    }

    trx.save()

    return trx
}

function getSupply(trx: Transaction, token: Token): Supply {
    let supply = Supply.load(token.id)
    if (supply == null) {
        supply = new Supply(token.id)
        supply.token = token.id
        supply.total = BI_ZERO
        supply.minted = BI_ZERO
        supply.burned = BI_ZERO
        supply.frozen = BI_ZERO

        supply.controllers = []
        let supplyControllerUsers = supply.controllers
        supplyControllerUsers.push(getUser(contract.supplyController()).id)
        supply.controllers = supplyControllerUsers
    }

    switch (trx.transactionType) {
        case TransactionType.Mint.toString(): {
            supply.minted.plus(trx.amount)
            supply.total.plus(trx.amount)
            break
        }
        case TransactionType.Burn.toString(): {
            supply.burned.plus(trx.amount)
            supply.total.minus(trx.amount)
            break
        }
    }

    supply.save()

    return supply
}

function getTokenUser(token: Token, user: User, addrType: AddressType, amount: BigInt): TokenUser {
    let tokenUser = getTokenUserInitial(token, user)
    tokenUser.transferCount.plus(BI_ONE)
    switch (addrType) {
        case AddressType.From: {
            tokenUser.outTransferCount.plus(BI_ONE)
            tokenUser.totalOutcome.plus(amount)
            tokenUser.balance.minus(amount)
            break
        }
        case AddressType.To: {
            tokenUser.inTransferCount.plus(BI_ONE)
            tokenUser.totalIncome.plus(amount)
            tokenUser.balance.plus(amount)
            break
        }
        default: {
            break
        }
    }

    tokenUser.save()

    return tokenUser
}

function getTokenUserInitial(token: Token, user: User): TokenUser {
    let tokenUserId = getTokenUserId(token.id, user.address)
    let tokenUser = TokenUser.load(tokenUserId)
    if (tokenUser == null) {
        tokenUser = new TokenUser(tokenUserId)
        tokenUser.token = token.id
        tokenUser.user = user.id
        tokenUser.isFrozenBalance = false
        tokenUser.isSupplyController = contract.supplyController().toHexString() == user.address.toHexString()
        tokenUser.isAssetProtector = contract.assetProtectionRole().toHexString() == user.address.toHexString()
        tokenUser.transferCount = BI_ZERO
        tokenUser.inTransferCount = BI_ZERO
        tokenUser.outTransferCount = BI_ZERO
        tokenUser.balance = BI_ZERO
        tokenUser.totalIncome = BI_ZERO
        tokenUser.totalOutcome = BI_ZERO
        tokenUser.save()
    }

    return tokenUser
}

function getToken(event: TransferEvent): Token {
    let tokenSymbol = contract.symbol()

    let token = getTokenInitial(tokenSymbol)
    token.transfersCount.plus(BI_ONE)

    if (event.params.from.toHexString() != ADDRESS_ZERO) {
        token.holdersCount.plus(getNewHolderNumber(tokenSymbol, event.params.from))
    }
    if (event.params.to.toHexString() != ADDRESS_ZERO && event.params.to.toHexString() != event.params.from.toHexString()) {
        token.holdersCount.plus(getNewHolderNumber(tokenSymbol, event.params.to))
    }

    token.save()

    return token
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

    return token
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

    return newHoldersNumber
}

function getTokenUserId(tokenSymbol: string, userAddr: Address): string {
    return tokenSymbol.concat('-').concat(userAddr.toHexString())
}

function isUserHadToken(tokenSymbol: string, userAddr: Address): boolean {
    return TokenUser.load(getTokenUserId(tokenSymbol, userAddr)) != null
}

