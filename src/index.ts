import { UserBalance } from "../generated/schema";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AssetStaked, AssetUnstaked } from "../generated/VaultToken/VaultToken";

export function getUserAssetBalanceId(userAddress: Address): Bytes {
	return Bytes.fromHexString(userAddress.toHex());
}

function initUserBalance(userAddress: Address): UserBalance {
	const userAssetBalanceId = getUserAssetBalanceId(userAddress);
	let userBalance = new UserBalance(userAssetBalanceId);
	userBalance.balance = BigInt.fromI32(0);
	userBalance.updatedAt = BigInt.fromI32(0);
	return userBalance;
}

function updateUserBalance(userAddress: Address, amount: BigInt, block: ethereum.Block, isStake: boolean): UserBalance {
	const userAssetBalanceId = getUserAssetBalanceId(userAddress);
	let userBalance = UserBalance.load(userAssetBalanceId);

	if (userBalance === null) {
		userBalance = initUserBalance(userAddress);
	}

	if (isStake) {
		userBalance.balance = userBalance.balance.plus(amount);
	} else {
		userBalance.balance = userBalance.balance.minus(amount);
	}
	userBalance.updatedAt = block.timestamp;
	userBalance.save();
	return userBalance;
}

export function stake(stakeEvent: AssetStaked): void {
	const userAddress = stakeEvent.params.staker;
	const amount = stakeEvent.params.amount;
	const asset = stakeEvent.params.asset;
	if (asset.toHexString().toLowerCase() == "0x388C818CA8B9251b393131C08a736A67ccB19297".toLowerCase()) {	// change this to track the asset you want
		updateUserBalance(userAddress, amount, stakeEvent.block, true);
	}
}

export function unstake(unstakeEvent: AssetUnstaked): void {
	const userAddress = unstakeEvent.params.staker;
	const amount = unstakeEvent.params.amount;
	const asset = unstakeEvent.params.asset;
	if (asset.toHexString().toLowerCase() == "0x388C818CA8B9251b393131C08a736A67ccB19297".toLowerCase()) {	// change this to track the asset you want
		updateUserBalance(userAddress, amount, unstakeEvent.block, false);
	}
}