import { ethereum } from "@graphprotocol/graph-ts";
import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts/index";

export class Factory extends ethereum.SmartContract {
    static bind(address: Address): Factory {
        return new Factory(null, address);
    }

    name(): string {
        let result = super.call("name", "name():(string)", []);

        return result[0].toString();
    }

    try_name(): ethereum.CallResult<string> {
        let result = super.tryCall("name", "name():(string)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toString());
    }

    approve(_spender: Address, _value: BigInt): boolean {
        let result = super.call("approve", "approve(address,uint256):(bool)", [
            ethereum.Value.fromAddress(_spender),
            ethereum.Value.fromUnsignedBigInt(_value)
        ]);

        return result[0].toBoolean();
    }

    try_approve(_spender: Address, _value: BigInt): ethereum.CallResult<boolean> {
        let result = super.tryCall("approve", "approve(address,uint256):(bool)", [
            ethereum.Value.fromAddress(_spender),
            ethereum.Value.fromUnsignedBigInt(_value)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    assetProtectionRole(): Address {
        let result = super.call(
            "assetProtectionRole",
            "assetProtectionRole():(address)",
            []
        );

        return result[0].toAddress();
    }

    try_assetProtectionRole(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            "assetProtectionRole",
            "assetProtectionRole():(address)",
            []
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toAddress());
    }

    totalSupply(): BigInt {
        let result = super.call("totalSupply", "totalSupply():(uint256)", []);

        return result[0].toBigInt();
    }

    try_totalSupply(): ethereum.CallResult<BigInt> {
        let result = super.tryCall("totalSupply", "totalSupply():(uint256)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBigInt());
    }

    betaDelegatedTransferBatch(
        r: Array<Bytes>,
        s: Array<Bytes>,
        v: Array<i32>,
        to: Array<Address>,
        value: Array<BigInt>,
        fee: Array<BigInt>,
        seq: Array<BigInt>,
        deadline: Array<BigInt>
    ): boolean {
        let result = super.call(
            "betaDelegatedTransferBatch",
            "betaDelegatedTransferBatch(bytes32[],bytes32[],uint8[],address[],uint256[],uint256[],uint256[],uint256[]):(bool)",
            [
                ethereum.Value.fromFixedBytesArray(r),
                ethereum.Value.fromFixedBytesArray(s),
                ethereum.Value.fromI32Array(v),
                ethereum.Value.fromAddressArray(to),
                ethereum.Value.fromUnsignedBigIntArray(value),
                ethereum.Value.fromUnsignedBigIntArray(fee),
                ethereum.Value.fromUnsignedBigIntArray(seq),
                ethereum.Value.fromUnsignedBigIntArray(deadline)
            ]
        );

        return result[0].toBoolean();
    }

    try_betaDelegatedTransferBatch(
        r: Array<Bytes>,
        s: Array<Bytes>,
        v: Array<i32>,
        to: Array<Address>,
        value: Array<BigInt>,
        fee: Array<BigInt>,
        seq: Array<BigInt>,
        deadline: Array<BigInt>
    ): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "betaDelegatedTransferBatch",
            "betaDelegatedTransferBatch(bytes32[],bytes32[],uint8[],address[],uint256[],uint256[],uint256[],uint256[]):(bool)",
            [
                ethereum.Value.fromFixedBytesArray(r),
                ethereum.Value.fromFixedBytesArray(s),
                ethereum.Value.fromI32Array(v),
                ethereum.Value.fromAddressArray(to),
                ethereum.Value.fromUnsignedBigIntArray(value),
                ethereum.Value.fromUnsignedBigIntArray(fee),
                ethereum.Value.fromUnsignedBigIntArray(seq),
                ethereum.Value.fromUnsignedBigIntArray(deadline)
            ]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    betaDelegatedTransfer(
        sig: Bytes,
        to: Address,
        value: BigInt,
        fee: BigInt,
        seq: BigInt,
        deadline: BigInt
    ): boolean {
        let result = super.call(
            "betaDelegatedTransfer",
            "betaDelegatedTransfer(bytes,address,uint256,uint256,uint256,uint256):(bool)",
            [
                ethereum.Value.fromBytes(sig),
                ethereum.Value.fromAddress(to),
                ethereum.Value.fromUnsignedBigInt(value),
                ethereum.Value.fromUnsignedBigInt(fee),
                ethereum.Value.fromUnsignedBigInt(seq),
                ethereum.Value.fromUnsignedBigInt(deadline)
            ]
        );

        return result[0].toBoolean();
    }

    try_betaDelegatedTransfer(
        sig: Bytes,
        to: Address,
        value: BigInt,
        fee: BigInt,
        seq: BigInt,
        deadline: BigInt
    ): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "betaDelegatedTransfer",
            "betaDelegatedTransfer(bytes,address,uint256,uint256,uint256,uint256):(bool)",
            [
                ethereum.Value.fromBytes(sig),
                ethereum.Value.fromAddress(to),
                ethereum.Value.fromUnsignedBigInt(value),
                ethereum.Value.fromUnsignedBigInt(fee),
                ethereum.Value.fromUnsignedBigInt(seq),
                ethereum.Value.fromUnsignedBigInt(deadline)
            ]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    transferFrom(_from: Address, _to: Address, _value: BigInt): boolean {
        let result = super.call(
            "transferFrom",
            "transferFrom(address,address,uint256):(bool)",
            [
                ethereum.Value.fromAddress(_from),
                ethereum.Value.fromAddress(_to),
                ethereum.Value.fromUnsignedBigInt(_value)
            ]
        );

        return result[0].toBoolean();
    }

    try_transferFrom(
        _from: Address,
        _to: Address,
        _value: BigInt
    ): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "transferFrom",
            "transferFrom(address,address,uint256):(bool)",
            [
                ethereum.Value.fromAddress(_from),
                ethereum.Value.fromAddress(_to),
                ethereum.Value.fromUnsignedBigInt(_value)
            ]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    decimals(): i32 {
        let result = super.call("decimals", "decimals():(uint8)", []);

        return result[0].toI32();
    }

    try_decimals(): ethereum.CallResult<i32> {
        let result = super.tryCall("decimals", "decimals():(uint8)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toI32());
    }

    paused(): boolean {
        let result = super.call("paused", "paused():(bool)", []);

        return result[0].toBoolean();
    }

    try_paused(): ethereum.CallResult<boolean> {
        let result = super.tryCall("paused", "paused():(bool)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    balanceOf(_addr: Address): BigInt {
        let result = super.call("balanceOf", "balanceOf(address):(uint256)", [
            ethereum.Value.fromAddress(_addr)
        ]);

        return result[0].toBigInt();
    }

    try_balanceOf(_addr: Address): ethereum.CallResult<BigInt> {
        let result = super.tryCall("balanceOf", "balanceOf(address):(uint256)", [
            ethereum.Value.fromAddress(_addr)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBigInt());
    }

    nextSeqOf(target: Address): BigInt {
        let result = super.call("nextSeqOf", "nextSeqOf(address):(uint256)", [
            ethereum.Value.fromAddress(target)
        ]);

        return result[0].toBigInt();
    }

    try_nextSeqOf(target: Address): ethereum.CallResult<BigInt> {
        let result = super.tryCall("nextSeqOf", "nextSeqOf(address):(uint256)", [
            ethereum.Value.fromAddress(target)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBigInt());
    }

    owner(): Address {
        let result = super.call("owner", "owner():(address)", []);

        return result[0].toAddress();
    }

    try_owner(): ethereum.CallResult<Address> {
        let result = super.tryCall("owner", "owner():(address)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toAddress());
    }

    symbol(): string {
        let result = super.call("symbol", "symbol():(string)", []);

        return result[0].toString();
    }

    try_symbol(): ethereum.CallResult<string> {
        let result = super.tryCall("symbol", "symbol():(string)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toString());
    }

    decreaseSupply(_value: BigInt): boolean {
        let result = super.call(
            "decreaseSupply",
            "decreaseSupply(uint256):(bool)",
            [ethereum.Value.fromUnsignedBigInt(_value)]
        );

        return result[0].toBoolean();
    }

    try_decreaseSupply(_value: BigInt): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "decreaseSupply",
            "decreaseSupply(uint256):(bool)",
            [ethereum.Value.fromUnsignedBigInt(_value)]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    isWhitelistedBetaDelegate(_addr: Address): boolean {
        let result = super.call(
            "isWhitelistedBetaDelegate",
            "isWhitelistedBetaDelegate(address):(bool)",
            [ethereum.Value.fromAddress(_addr)]
        );

        return result[0].toBoolean();
    }

    try_isWhitelistedBetaDelegate(_addr: Address): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "isWhitelistedBetaDelegate",
            "isWhitelistedBetaDelegate(address):(bool)",
            [ethereum.Value.fromAddress(_addr)]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    transfer(_to: Address, _value: BigInt): boolean {
        let result = super.call("transfer", "transfer(address,uint256):(bool)", [
            ethereum.Value.fromAddress(_to),
            ethereum.Value.fromUnsignedBigInt(_value)
        ]);

        return result[0].toBoolean();
    }

    try_transfer(_to: Address, _value: BigInt): ethereum.CallResult<boolean> {
        let result = super.tryCall("transfer", "transfer(address,uint256):(bool)", [
            ethereum.Value.fromAddress(_to),
            ethereum.Value.fromUnsignedBigInt(_value)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    increaseSupply(_value: BigInt): boolean {
        let result = super.call(
            "increaseSupply",
            "increaseSupply(uint256):(bool)",
            [ethereum.Value.fromUnsignedBigInt(_value)]
        );

        return result[0].toBoolean();
    }

    try_increaseSupply(_value: BigInt): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            "increaseSupply",
            "increaseSupply(uint256):(bool)",
            [ethereum.Value.fromUnsignedBigInt(_value)]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    betaDelegateWhitelister(): Address {
        let result = super.call(
            "betaDelegateWhitelister",
            "betaDelegateWhitelister():(address)",
            []
        );

        return result[0].toAddress();
    }

    try_betaDelegateWhitelister(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            "betaDelegateWhitelister",
            "betaDelegateWhitelister():(address)",
            []
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toAddress());
    }

    proposedOwner(): Address {
        let result = super.call("proposedOwner", "proposedOwner():(address)", []);

        return result[0].toAddress();
    }

    try_proposedOwner(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            "proposedOwner",
            "proposedOwner():(address)",
            []
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toAddress());
    }

    allowance(_owner: Address, _spender: Address): BigInt {
        let result = super.call(
            "allowance",
            "allowance(address,address):(uint256)",
            [ethereum.Value.fromAddress(_owner), ethereum.Value.fromAddress(_spender)]
        );

        return result[0].toBigInt();
    }

    try_allowance(
        _owner: Address,
        _spender: Address
    ): ethereum.CallResult<BigInt> {
        let result = super.tryCall(
            "allowance",
            "allowance(address,address):(uint256)",
            [ethereum.Value.fromAddress(_owner), ethereum.Value.fromAddress(_spender)]
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBigInt());
    }

    EIP712_DOMAIN_HASH(): Bytes {
        let result = super.call(
            "EIP712_DOMAIN_HASH",
            "EIP712_DOMAIN_HASH():(bytes32)",
            []
        );

        return result[0].toBytes();
    }

    try_EIP712_DOMAIN_HASH(): ethereum.CallResult<Bytes> {
        let result = super.tryCall(
            "EIP712_DOMAIN_HASH",
            "EIP712_DOMAIN_HASH():(bytes32)",
            []
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBytes());
    }

    isFrozen(_addr: Address): boolean {
        let result = super.call("isFrozen", "isFrozen(address):(bool)", [
            ethereum.Value.fromAddress(_addr)
        ]);

        return result[0].toBoolean();
    }

    try_isFrozen(_addr: Address): ethereum.CallResult<boolean> {
        let result = super.tryCall("isFrozen", "isFrozen(address):(bool)", [
            ethereum.Value.fromAddress(_addr)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toBoolean());
    }

    supplyController(): Address {
        let result = super.call(
            "supplyController",
            "supplyController():(address)",
            []
        );

        return result[0].toAddress();
    }

    try_supplyController(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            "supplyController",
            "supplyController():(address)",
            []
        );
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toAddress());
    }
}