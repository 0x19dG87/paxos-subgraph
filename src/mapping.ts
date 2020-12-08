import {
    Transfer,
    SupplyControllerSet,
    AddressFrozen,
    AddressUnfrozen,
    SupplyIncreased,
    SupplyDecreased
} from './types/PAX/Pax'
import {Token, User, TokenUser, Supply, Transaction} from './types/schema'
import { Bytes, BigDecimal } from '@graphprotocol/graph-ts'

export function handleTransfer(event: Transfer): void {

    let userFrom = User.load(event.params.from.toHex())

    if (userFrom == null) {
        userFrom = new User(event.params.from.toHex(), event.params.from.toHex());
    }
    userFrom.balance = userFrom.balance - event.params.value
    userFrom.transactionCount = userFrom.transactionCount + 1
    userFrom.save()

    event.block
}

export function handleSetSupplyController(event: SupplyControllerSet): void {

}

export function handleSupplyDecrease(event: SupplyDecreased): void {

}

export function handleSupplyIncrease(event: SupplyIncreased): void {

}

export function handleAddressUnfreeze(event: AddressUnfrozen): void {

}

export function handleAddressFreeze(event: AddressFrozen): void {

}

function newUser(id: string, address: Bytes): User {
    let user = new User(id);
    user.address = address
    user.transactionCount = 0
    return user
}
