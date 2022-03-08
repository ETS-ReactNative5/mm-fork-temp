import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import AppEth from '@ledgerhq/hw-app-eth';
import Engine from '../../../core/Engine';

const delay = (ms) => new Promise((success) => setTimeout(success, ms));

// eslint-disable-next-line
const DisplayAddress = ({ transport }) => {
	const { PreferencesController } = Engine.context;
	const [addresses, setAddresses] = useState([]);
	const [error, setError] = useState(null);

	const fetchAddress = useCallback(
		async (verify) => {
			try {
				const eth = new AppEth(transport);
				const { address: address1 } = await eth.getAddress("44'/60'/0'/0/0", verify);
				const { address: address2 } = await eth.getAddress("44'/60'/1'/0/0", verify);
				const { address: address3 } = await eth.getAddress("44'/60'/2'/0/0", verify);
				PreferencesController.updateIdentities([address1, address2, address3]);
				PreferencesController.setAccountLabel(address1, 'Ledger');
				PreferencesController.setAccountLabel(address2, 'Ledger');
				PreferencesController.setAccountLabel(address3, 'Ledger');

				setAddresses([address1, address2, address3]);
			} catch (error) {
				// in this case, user is likely not on Ethereum app
				setError(error);
			}
		},
		[transport]
	);

	useEffect(() => {
		const run = async () => {
			await fetchAddress(false);
			await delay(500);
		};

		run();
	}, [fetchAddress]);

	return (
		<View>
			{!addresses.length ? (
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
					{addresses.map((address, index) => (
						<Text>
							{index}. {address}
						</Text>
					))}
				</>
			)}
		</View>
	);
};

export default DisplayAddress;
