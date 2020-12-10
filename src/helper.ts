import {User} from './types/schema'
import {Address, ByteArray, BigInt, crypto} from '@graphprotocol/graph-ts'
import {PaxFactory} from "./types/PaxFactory/PaxFactory";

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

export class ContractInfo {
    name: string
    symbol: string

    static build(contract: PaxFactory): ContractInfo {
        let contractInfo = new ContractInfo()

        let tokenName = contract.try_name()
        contractInfo.name = !tokenName.reverted ? tokenName.value : contractInfoByContractAddress.get(contract._address).name
        let tokenSymbol = contract.try_symbol()
        contractInfo.symbol = !tokenSymbol.reverted ? tokenSymbol.value : contractInfoByContractAddress.get(contract._address).symbol

        return contractInfo;
    }
}

let contractInfoByContractAddress = new Map<Address, ContractInfo>()
contractInfoByContractAddress.set(Address.fromString('0x8E870D67F660D95d5be530380D0eC0bd388289E1'), {name: 'Paxos Standard', symbol: 'PAX'})
contractInfoByContractAddress.set(Address.fromString('0x45804880de22913dafe09f4980848ece6ecbaf78'), {name: 'Paxos Gold', symbol: 'PAXG'})
contractInfoByContractAddress.set(Address.fromString('0x4fabb145d64652a948d72533023f6e7a623c7c53'), {name: 'Binance USD', symbol: 'BUSD'})