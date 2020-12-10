import {User} from './types/schema'
import {Address, ByteArray, BigInt crypto} from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const BI_ZERO = BigInt.fromI32(0)
export const BI_ONE = BigInt.fromI32(1)

export function getUser(address: Address): User {
    let user = User.load(address.toHexString())
    if (user == null) {
        user = new User(address.toHexString())
        user.address = address
        user.save()
    }
    return user
}

export function generateId(val: string): string {
    return crypto.keccak256(ByteArray.fromUTF8(val ? val : '' + new Date().getTime().toString())).toHexString()
}

export enum AddressType {
    From,
    To
}

export enum TransactionType {
    Mint,
    Burn,
    Transfer
}

export enum TokenUserRoleField {
    isSupplyController,
    isAssetProtector
}
