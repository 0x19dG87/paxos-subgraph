import {User} from './types/schema'
import {Address, ByteArray, BigInt, crypto} from '@graphprotocol/graph-ts'

export let ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')
export let BI_ZERO = BigInt.fromI32(0)
export let BI_ONE = BigInt.fromI32(1)

export function getUser(address: Address): User {
    let user = User.load(address.toHexString())
    if (user == null) {
        user = new User(address.toHexString())
        user.address = address
        user.save()
    }
    return user as User
}

export function generateId(val: string): string {
    return crypto.keccak256(ByteArray.fromUTF8(val ? val : '' + new Date().getTime().toString())).toHexString()
}

export class AddressType {
    static From: string = 'From'
    static To: string = 'To'
}

export class TransactionType {
    static Mint: string = 'Mint'
    static Burn: string = 'Burn'
    static Transfer: string = 'Transfer'
}

export class TokenUserRoleField {
    static isSupplyController: string  = 'isSupplyController'
    static isAssetProtector: string = 'isAssetProtector'
}
