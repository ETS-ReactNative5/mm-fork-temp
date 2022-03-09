import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Engine from '../../../core/Engine';

// eslint-disable-next-line
const DisplayAddress = ({ transport }) => {
	const { KeyringController, AccountTrackerController } = Engine.context;
	const [accounts, setAccounts] = useState([]);
	const [trackedAccounts, setTrackedAccounts] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (transport) {
			KeyringController.connectLedgerHardware(transport).then((accounts) => {
				setAccounts(accounts);
			});
		}
	}, [KeyringController, transport]);

	useEffect(() => {
		const unTrackedAccounts = [];

		accounts.forEach((account) => !trackedAccounts[account.address] && unTrackedAccounts.push(account.address));

		if (unTrackedAccounts.length > 0) {
			AccountTrackerController.syncWithAddresses(unTrackedAccounts).then((_trackedAccounts) => {
				setTrackedAccounts(Object.assign({}, trackedAccounts, _trackedAccounts));
			});
		}
	}, [AccountTrackerController, accounts, trackedAccounts]);

	const onUnlock = async () => {
		console.log('onUnlock', trackedAccounts);
		for (let i = 0; i < Object.keys(trackedAccounts).length; i++) {
			console.log('WE ARE HERE');
			const newState = await KeyringController.unlockLedgerHardwareWalletAccount(i);
			console.log('keyring state', newState);
		}
	};

	return (
		<View>
			{!accounts.length ? (
				<>
					<Text>Loading your Ethereum address...</Text>
					{error ? (
						<Text>
							A problem occurred, make sure to open the Ethereum application on your Ledger Nano X. (
							{String((error && error.message) || error)})
						</Text>
					) : null}
				</>
			) : (
				<>
					<Text>Ledger Live Ethereum Account 1</Text>
					{accounts.map((account, index) => (
						<Text key={`LedgerAccount-${index}`}>
							{index}.{account.address}
						</Text>
					))}
					<TouchableOpacity onPress={onUnlock}>
						<Text>Unlock</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
};

export default DisplayAddress;
