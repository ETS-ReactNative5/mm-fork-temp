import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Engine from '../../../core/Engine';

// eslint-disable-next-line
const DisplayAddress = ({ transport }) => {
	const { KeyringController } = Engine.context;
	const [accounts, setAccounts] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (transport) {
			KeyringController.connectLedgerHardware(transport).then((accounts) => {
				setAccounts(accounts);
			});
		}
	}, [KeyringController, transport]);

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
				</>
			)}
		</View>
	);
};

export default DisplayAddress;
