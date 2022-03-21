import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Engine from '../../../core/Engine';

// eslint-disable-next-line
const DisplayAddress = ({ transport }) => {
	const { KeyringController, AccountTrackerController } = Engine.context;
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (transport) {
			// Display the default account on the UI
			KeyringController.connectLedgerHardware(transport).then((accounts) => {
				setDefaultAccount(accounts[0]);
			});
		}
	}, [KeyringController, transport]);

	useEffect(() => {
		AccountTrackerController.syncWithAddresses([defaultAccount]);
	}, [AccountTrackerController, defaultAccount]);

	const onUnlock = async () => {
		console.log('onUnlock', defaultAccount);
		const newState = await KeyringController.unlockLedgerDefaultAccount();
		console.log('keyring state', JSON.stringify(newState, null, 4));
	};

	return (
		<View>
			{!defaultAccount ? (
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
					<Text>{defaultAccount.address}</Text>
					<TouchableOpacity onPress={onUnlock}>
						<Text>Unlock</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
};

export default DisplayAddress;
